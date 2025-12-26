const PagoRepository = require('../repositories/PagoRepository');
const VentaRepository = require('../repositories/VentaRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const MedioPagoRepository = require('../repositories/MedioPagoRepository');

class PagoService {
  constructor() {
    this.pagoRepo = new PagoRepository();
    this.ventaRepo = new VentaRepository();
    this.clienteRepo = new ClienteRepository();
    this.medioPagoRepo = new MedioPagoRepository();
  }

  /**
   * FLUJO PRINCIPAL: Registrar pago con imputación
   * 
   * Tipos de imputación:
   * 1. MANUAL: El usuario especifica a qué venta/detalle va cada monto
   * 2. AUTOMÁTICA PROPORCIONAL: Se distribuye entre todas las ventas pendientes
   */
  async registrarPago(pagoData) {
    try {
      // 1. VALIDAR CLIENTE
      const cliente = await this.clienteRepo.findById(pagoData.cliente_id);
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      // 2. VALIDAR MEDIO DE PAGO
      const medioPago = await this.medioPagoRepo.findById(pagoData.medio_pago_id);
      if (!medioPago) {
        throw new Error('Medio de pago no encontrado');
      }

      // 3. VALIDAR MONTO
      if (pagoData.monto > cliente.saldo_total) {
        throw new Error(`El monto supera la deuda del cliente. Saldo: ${cliente.saldo_total}`);
      }

      // 4. PROCESAR IMPUTACIONES
      let imputaciones = [];
      
      if (pagoData.imputaciones && pagoData.imputaciones.length > 0) {
        // IMPUTACIÓN MANUAL
        imputaciones = await this.validarImputacionesManuales(pagoData.imputaciones, pagoData.monto);
      } else {
        // IMPUTACIÓN AUTOMÁTICA
        imputaciones = await this.calcularImputacionAutomatica(pagoData.cliente_id, pagoData.monto);
      }

      // 5. CREAR PAGO CON IMPUTACIONES
      const pago = {
        cliente_id: pagoData.cliente_id,
        fecha: new Date(),
        monto: pagoData.monto,
        medio_pago_id: pagoData.medio_pago_id,
        observaciones: pagoData.observaciones || '',
      };

      const pagoCreado = await this.pagoRepo.createConImputaciones(pago, imputaciones);

      // 6. ACTUALIZAR SALDO DEL CLIENTE
      await this.clienteRepo.decrementarSaldo(pagoData.cliente_id, pagoData.monto);

      // 7. ACTUALIZAR ESTADO DE VENTAS
      await this.actualizarEstadoVentas(imputaciones);

      return {
        pago: pagoCreado,
        saldo_anterior: cliente.saldo_total,
        saldo_nuevo: cliente.saldo_total - pagoData.monto,
        imputaciones: imputaciones,
      };
    } catch (error) {
      throw new Error(`Error al registrar pago: ${error.message}`);
    }
  }

  /**
   * Validar imputaciones manuales
   */
  async validarImputacionesManuales(imputaciones, montoPago) {
    try {
      let totalImputado = 0;
      const imputacionesValidadas = [];

      for (const imp of imputaciones) {
        // Validar que el detalle existe
        // (Aquí necesitarías obtener el detalle de venta, simplificado)
        
        totalImputado += imp.monto_imputado;

        imputacionesValidadas.push({
          detalle_venta_id: imp.detalle_venta_id,
          venta_id: imp.venta_id,
          monto_imputado: imp.monto_imputado,
          propietario_id: imp.propietario_id,
        });
      }

      if (totalImputado !== montoPago) {
        throw new Error(`La suma de imputaciones (${totalImputado}) no coincide con el monto del pago (${montoPago})`);
      }

      return imputacionesValidadas;
    } catch (error) {
      throw new Error(`Error en imputaciones: ${error.message}`);
    }
  }

  /**
   * Calcular imputación automática proporcional
   */
  async calcularImputacionAutomatica(clienteId, montoPago) {
    try {
      // Obtener ventas pendientes del cliente
      const ventas = await this.ventaRepo.findByCliente(clienteId);
      const ventasPendientes = ventas.filter(v => v.estado !== 'pagada');

      if (ventasPendientes.length === 0) {
        throw new Error('No hay ventas pendientes para este cliente');
      }

      // Obtener detalles de todas las ventas pendientes
      const detallesPendientes = [];
      
      for (const venta of ventasPendientes) {
        const ventaCompleta = await this.ventaRepo.findByIdConDetalles(venta.id);
        ventaCompleta.detalles.forEach(detalle => {
          detallesPendientes.push({
            ...detalle,
            venta_id: venta.id,
          });
        });
      }

      // Calcular total pendiente
      const totalPendiente = detallesPendientes.reduce((sum, det) => sum + det.subtotal, 0);

      // Distribuir proporcionalmente
      const imputaciones = detallesPendientes.map(detalle => {
        const proporcion = detalle.subtotal / totalPendiente;
        const montoImputado = montoPago * proporcion;

        return {
          detalle_venta_id: detalle.id,
          venta_id: detalle.venta_id,
          monto_imputado: parseFloat(montoImputado.toFixed(2)),
          propietario_id: detalle.propietario_id,
        };
      });

      return imputaciones;
    } catch (error) {
      throw new Error(`Error en imputación automática: ${error.message}`);
    }
  }

  /**
   * Actualizar estado de ventas según lo pagado
   */
  async actualizarEstadoVentas(imputaciones) {
    try {
      // Agrupar imputaciones por venta
      const ventasMap = {};
      
      imputaciones.forEach(imp => {
        if (!ventasMap[imp.venta_id]) {
          ventasMap[imp.venta_id] = 0;
        }
        ventasMap[imp.venta_id] += imp.monto_imputado;
      });

      // Actualizar cada venta
      for (const [ventaId, montoPagado] of Object.entries(ventasMap)) {
        const venta = await this.ventaRepo.findById(ventaId);
        
        if (venta) {
          // Aquí podrías implementar lógica más sofisticada
          // para determinar si está completamente pagada o parcial
          const nuevoEstado = montoPagado >= venta.total_bruto ? 'pagada' : 'parcial';
          
          await this.ventaRepo.update(ventaId, { estado: nuevoEstado });
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado de ventas:', error);
    }
  }

  /**
   * Obtener historial de pagos de un cliente
   */
  async obtenerHistorialCliente(clienteId) {
    try {
      return await this.pagoRepo.findByCliente(clienteId);
    } catch (error) {
      throw new Error(`Error al obtener historial: ${error.message}`);
    }
  }

  /**
   * Obtener resumen de cobros por propietario
   */
  async obtenerResumenPorPropietario(propietarioId, fechaInicio, fechaFin) {
    try {
      const totalCobrado = await this.pagoRepo.calcularTotalPorPropietario(
        propietarioId,
        fechaInicio,
        fechaFin
      );

      return {
        propietario_id: propietarioId,
        periodo: { inicio: fechaInicio, fin: fechaFin },
        total_cobrado: totalCobrado,
      };
    } catch (error) {
      throw new Error(`Error al obtener resumen: ${error.message}`);
    }
  }
}

module.exports = PagoService;
