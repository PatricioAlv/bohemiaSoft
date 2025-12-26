const VentaRepository = require('../repositories/VentaRepository');
const ProductoRepository = require('../repositories/ProductoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const MedioPagoRepository = require('../repositories/MedioPagoRepository');
const LiquidacionRepository = require('../repositories/LiquidacionRepository');
const { getFirestore } = require('../config/firebase');

class VentaService {
  constructor() {
    this.ventaRepo = new VentaRepository();
    this.productoRepo = new ProductoRepository();
    this.clienteRepo = new ClienteRepository();
    this.medioPagoRepo = new MedioPagoRepository();
    this.liquidacionRepo = new LiquidacionRepository();
    this.db = getFirestore();
  }

  /**
   * FLUJO PRINCIPAL: Registrar venta completa
   * 
   * Este es el flujo central del sistema:
   * 1. Validar productos y stock
   * 2. Calcular totales por propietario
   * 3. Crear venta con detalles
   * 4. Descontar stock
   * 5. Si es con tarjeta: crear liquidación
   * 6. Si es cuenta corriente: actualizar saldo del cliente
   */
  async registrarVenta(ventaData) {
    const batch = this.db.batch();
    
    try {
      // 1. VALIDAR MEDIO DE PAGO
      const medioPago = await this.medioPagoRepo.findById(ventaData.medio_pago_id);
      if (!medioPago) {
        throw new Error('Medio de pago no encontrado');
      }

      // 2. VALIDAR PRODUCTOS Y STOCK
      const detallesValidados = [];
      let totalVenta = 0;
      const propietariosTotales = {}; // { propietario_id: monto }

      for (const item of ventaData.productos) {
        const producto = await this.productoRepo.findById(item.producto_id);
        
        if (!producto) {
          throw new Error(`Producto ${item.producto_id} no encontrado`);
        }

        if (!producto.activo) {
          throw new Error(`Producto ${producto.nombre} no está activo`);
        }

        if (producto.stock_actual < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock_actual}`);
        }

        const subtotal = producto.precio_venta * item.cantidad;
        totalVenta += subtotal;

        // Acumular por propietario
        if (!propietariosTotales[producto.propietario_id]) {
          propietariosTotales[producto.propietario_id] = 0;
        }
        propietariosTotales[producto.propietario_id] += subtotal;

        detallesValidados.push({
          producto_id: producto.id,
          producto_nombre: producto.nombre,
          cantidad: item.cantidad,
          precio_unitario: producto.precio_venta,
          subtotal,
          propietario_id: producto.propietario_id,
        });
      }

      // 3. VALIDAR CLIENTE (si es cuenta corriente)
      if (ventaData.cliente_id) {
        const cliente = await this.clienteRepo.findById(ventaData.cliente_id);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
      }

      // 4. CREAR VENTA
      const venta = {
        fecha: new Date(),
        cliente_id: ventaData.cliente_id || null,
        total_bruto: totalVenta,
        medio_pago_id: ventaData.medio_pago_id,
        estado: ventaData.cliente_id && medioPago.tipo === 'efectivo' ? 'pendiente' : 'pagada',
        observaciones: ventaData.observaciones || '',
      };

      const ventaCreada = await this.ventaRepo.createConDetalles(venta, detallesValidados);

      // 5. DESCONTAR STOCK
      for (const item of ventaData.productos) {
        await this.productoRepo.descontarStock(item.producto_id, item.cantidad);
      }

      // 6. SI ES TARJETA: CREAR LIQUIDACIÓN
      if (medioPago.tipo === 'credito' || (medioPago.tipo === 'debito' && medioPago.comision_porcentaje > 0)) {
        await this.crearLiquidacion(ventaCreada.id, totalVenta, medioPago, propietariosTotales);
      }

      // 7. SI ES CUENTA CORRIENTE: ACTUALIZAR SALDO
      if (ventaData.cliente_id && venta.estado === 'pendiente') {
        await this.clienteRepo.incrementarSaldo(ventaData.cliente_id, totalVenta);
      }

      return {
        venta: ventaCreada,
        resumen: {
          total: totalVenta,
          propietarios: Object.keys(propietariosTotales).map(id => ({
            propietario_id: id,
            monto: propietariosTotales[id],
          })),
          medio_pago: medioPago,
        },
      };
    } catch (error) {
      throw new Error(`Error al registrar venta: ${error.message}`);
    }
  }

  /**
   * Crear liquidación por tarjeta
   */
  async crearLiquidacion(ventaId, montoBruto, medioPago, propietariosTotales) {
    try {
      const fechaVenta = new Date();
      const fechaAcreditacion = new Date(fechaVenta);
      fechaAcreditacion.setDate(fechaAcreditacion.getDate() + medioPago.dias_acreditacion);

      const comision = (montoBruto * medioPago.comision_porcentaje) / 100;
      const montoNeto = montoBruto - comision;

      // Calcular distribución por propietario
      const propietarios = Object.keys(propietariosTotales).map(propietarioId => {
        const montoBrutoProp = propietariosTotales[propietarioId];
        const comisionProp = (montoBrutoProp * medioPago.comision_porcentaje) / 100;
        const montoNetoProp = montoBrutoProp - comisionProp;

        return {
          propietario_id: propietarioId,
          monto_bruto: montoBrutoProp,
          comision: comisionProp,
          monto_neto: montoNetoProp,
        };
      });

      const liquidacion = {
        venta_id: ventaId,
        fecha_venta: fechaVenta,
        fecha_estimada_acreditacion: fechaAcreditacion,
        monto_bruto: montoBruto,
        comision,
        monto_neto: montoNeto,
        medio_pago_id: medioPago.id,
        estado: 'pendiente',
      };

      return await this.liquidacionRepo.createConPropietarios(liquidacion, propietarios);
    } catch (error) {
      throw new Error(`Error al crear liquidación: ${error.message}`);
    }
  }

  /**
   * Obtener ventas por período
   */
  async obtenerPorPeriodo(fechaInicio, fechaFin) {
    try {
      return await this.ventaRepo.findByRangoFechas(fechaInicio, fechaFin);
    } catch (error) {
      throw new Error(`Error al obtener ventas: ${error.message}`);
    }
  }

  /**
   * Obtener resumen de ventas por propietario
   */
  async obtenerResumenPorPropietario(propietarioId, fechaInicio, fechaFin) {
    try {
      const totalVendido = await this.ventaRepo.calcularTotalPorPropietario(
        propietarioId,
        fechaInicio,
        fechaFin
      );

      return {
        propietario_id: propietarioId,
        periodo: { inicio: fechaInicio, fin: fechaFin },
        total_vendido: totalVendido,
      };
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }

  /**
   * Obtener detalle de una venta
   */
  async obtenerDetalle(ventaId) {
    try {
      return await this.ventaRepo.findByIdConDetalles(ventaId);
    } catch (error) {
      throw new Error(`Error al obtener detalle: ${error.message}`);
    }
  }
}

module.exports = VentaService;
