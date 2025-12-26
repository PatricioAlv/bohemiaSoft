const VentaRepository = require('../repositories/VentaRepository');
const PagoRepository = require('../repositories/PagoRepository');
const LiquidacionRepository = require('../repositories/LiquidacionRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class DashboardService {
  constructor() {
    this.ventaRepo = new VentaRepository();
    this.pagoRepo = new PagoRepository();
    this.liquidacionRepo = new LiquidacionRepository();
    this.usuarioRepo = new UsuarioRepository();
  }

  /**
   * DASHBOARD GENERAL
   * Métricas consolidadas de todo el negocio
   */
  async obtenerDashboardGeneral(fechaInicio, fechaFin) {
    try {
      // Ventas del período
      const ventas = await this.ventaRepo.findByRangoFechas(fechaInicio, fechaFin);
      
      const totalVendido = ventas.reduce((sum, v) => sum + v.total_bruto, 0);
      const cantidadVentas = ventas.length;

      // Pagos del período
      const pagos = await this.pagoRepo.findByRangoFechas(fechaInicio, fechaFin);
      const totalCobrado = pagos.reduce((sum, p) => sum + p.monto, 0);

      // Ventas pendientes
      const ventasPendientes = await this.ventaRepo.findPendientes();
      const totalPendiente = ventasPendientes.reduce((sum, v) => sum + v.total_bruto, 0);

      // Liquidaciones pendientes
      const liquidacionesPendientes = await this.liquidacionRepo.findPendientes();
      const totalPorAcreditar = liquidacionesPendientes.reduce((sum, l) => sum + l.monto_neto, 0);

      return {
        periodo: { inicio: fechaInicio, fin: fechaFin },
        ventas: {
          total: totalVendido,
          cantidad: cantidadVentas,
          promedio: cantidadVentas > 0 ? totalVendido / cantidadVentas : 0,
        },
        cobros: {
          total: totalCobrado,
          cantidad: pagos.length,
        },
        pendiente: {
          total: totalPendiente,
          cantidad: ventasPendientes.length,
        },
        por_acreditar: {
          total: totalPorAcreditar,
          cantidad: liquidacionesPendientes.length,
        },
      };
    } catch (error) {
      throw new Error(`Error en dashboard general: ${error.message}`);
    }
  }

  /**
   * DASHBOARD POR PROPIETARIO
   * Toda la información de un propietario específico
   */
  async obtenerDashboardPropietario(propietarioId, fechaInicio, fechaFin) {
    try {
      // Validar propietario
      const propietario = await this.usuarioRepo.findById(propietarioId);
      if (!propietario) {
        throw new Error('Propietario no encontrado');
      }

      // Total vendido
      const totalVendido = await this.ventaRepo.calcularTotalPorPropietario(
        propietarioId,
        fechaInicio,
        fechaFin
      );

      // Total cobrado
      const totalCobrado = await this.pagoRepo.calcularTotalPorPropietario(
        propietarioId,
        fechaInicio,
        fechaFin
      );

      // Saldo pendiente de cobro
      const saldoPendiente = totalVendido - totalCobrado;

      // Pagos próximos a acreditarse (tarjetas)
      const liquidacionesPendientes = await this.liquidacionRepo.findByPropietario(
        propietarioId,
        'pendiente'
      );

      let totalPorAcreditar = 0;
      const proximasAcreditaciones = [];

      liquidacionesPendientes.forEach(liq => {
        liq.propietarios.forEach(prop => {
          if (prop.propietario_id === propietarioId) {
            totalPorAcreditar += prop.monto_neto;
            proximasAcreditaciones.push({
              liquidacion_id: liq.id,
              venta_id: liq.venta_id,
              fecha_estimada: liq.fecha_estimada_acreditacion,
              monto_bruto: prop.monto_bruto,
              comision: prop.comision,
              monto_neto: prop.monto_neto,
            });
          }
        });
      });

      // Ordenar por fecha
      proximasAcreditaciones.sort((a, b) => 
        new Date(a.fecha_estimada) - new Date(b.fecha_estimada)
      );

      return {
        propietario: {
          id: propietario.id,
          nombre: propietario.nombre,
        },
        periodo: { inicio: fechaInicio, fin: fechaFin },
        vendido: totalVendido,
        cobrado: totalCobrado,
        pendiente_cobro: saldoPendiente,
        por_acreditar: {
          total: totalPorAcreditar,
          cantidad: proximasAcreditaciones.length,
          detalle: proximasAcreditaciones,
        },
      };
    } catch (error) {
      throw new Error(`Error en dashboard propietario: ${error.message}`);
    }
  }

  /**
   * DASHBOARD DE TARJETAS
   * Información sobre comisiones y acreditaciones
   */
  async obtenerDashboardTarjetas(fechaInicio, fechaFin) {
    try {
      const liquidaciones = await this.liquidacionRepo.findAll();
      
      // Filtrar por período
      const liquidacionesPeriodo = liquidaciones.filter(liq => {
        const fecha = new Date(liq.fecha_venta);
        return fecha >= fechaInicio && fecha <= fechaFin;
      });

      // Totales
      const totalBruto = liquidacionesPeriodo.reduce((sum, l) => sum + l.monto_bruto, 0);
      const totalComisiones = liquidacionesPeriodo.reduce((sum, l) => sum + l.comision, 0);
      const totalNeto = liquidacionesPeriodo.reduce((sum, l) => sum + l.monto_neto, 0);

      // Pendientes de acreditación
      const pendientes = liquidacionesPeriodo.filter(l => l.estado === 'pendiente');
      const totalPendiente = pendientes.reduce((sum, l) => sum + l.monto_neto, 0);

      // Acreditadas
      const acreditadas = liquidacionesPeriodo.filter(l => l.estado === 'acreditado');
      const totalAcreditado = acreditadas.reduce((sum, l) => sum + l.monto_neto, 0);

      // Próximas acreditaciones (ordenadas por fecha)
      const proximasAcreditaciones = pendientes
        .sort((a, b) => new Date(a.fecha_estimada_acreditacion) - new Date(b.fecha_estimada_acreditacion))
        .slice(0, 10)
        .map(liq => ({
          id: liq.id,
          venta_id: liq.venta_id,
          fecha_estimada: liq.fecha_estimada_acreditacion,
          monto_neto: liq.monto_neto,
          dias_restantes: this.calcularDiasRestantes(liq.fecha_estimada_acreditacion),
        }));

      return {
        periodo: { inicio: fechaInicio, fin: fechaFin },
        resumen: {
          total_bruto: totalBruto,
          total_comisiones: totalComisiones,
          total_neto: totalNeto,
          porcentaje_comision: totalBruto > 0 ? (totalComisiones / totalBruto) * 100 : 0,
        },
        pendientes: {
          total: totalPendiente,
          cantidad: pendientes.length,
        },
        acreditadas: {
          total: totalAcreditado,
          cantidad: acreditadas.length,
        },
        proximas_acreditaciones: proximasAcreditaciones,
      };
    } catch (error) {
      throw new Error(`Error en dashboard tarjetas: ${error.message}`);
    }
  }

  /**
   * Calcular días restantes hasta una fecha
   */
  calcularDiasRestantes(fecha) {
    const hoy = new Date();
    const fechaObjetivo = new Date(fecha);
    const diferencia = fechaObjetivo - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtener resumen del día actual
   */
  async obtenerResumenHoy() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      return await this.obtenerDashboardGeneral(hoy, manana);
    } catch (error) {
      throw new Error(`Error en resumen de hoy: ${error.message}`);
    }
  }

  /**
   * Obtener resumen del mes actual
   */
  async obtenerResumenMes() {
    try {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      return await this.obtenerDashboardGeneral(inicioMes, finMes);
    } catch (error) {
      throw new Error(`Error en resumen del mes: ${error.message}`);
    }
  }
}

module.exports = DashboardService;
