const DashboardService = require('../services/DashboardService');
const { asyncHandler } = require('../middleware/errorHandler');

const dashboardService = new DashboardService();

/**
 * Dashboard general
 * GET /api/dashboard/general
 */
const obtenerDashboardGeneral = asyncHandler(async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  const fin = fechaFin ? new Date(fechaFin) : new Date();
  
  const dashboard = await dashboardService.obtenerDashboardGeneral(inicio, fin);
  
  res.json({
    success: true,
    data: dashboard,
  });
});

/**
 * Dashboard por propietario
 * GET /api/dashboard/propietario/:propietarioId
 */
const obtenerDashboardPropietario = asyncHandler(async (req, res) => {
  const { propietarioId } = req.params;
  const { fechaInicio, fechaFin } = req.query;
  
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  const fin = fechaFin ? new Date(fechaFin) : new Date();
  
  const dashboard = await dashboardService.obtenerDashboardPropietario(propietarioId, inicio, fin);
  
  res.json({
    success: true,
    data: dashboard,
  });
});

/**
 * Dashboard de tarjetas
 * GET /api/dashboard/tarjetas
 */
const obtenerDashboardTarjetas = asyncHandler(async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  const fin = fechaFin ? new Date(fechaFin) : new Date();
  
  const dashboard = await dashboardService.obtenerDashboardTarjetas(inicio, fin);
  
  res.json({
    success: true,
    data: dashboard,
  });
});

/**
 * Resumen del día
 * GET /api/dashboard/hoy
 */
const obtenerResumenHoy = asyncHandler(async (req, res) => {
  const resumen = await dashboardService.obtenerResumenHoy();
  
  res.json({
    success: true,
    data: resumen,
  });
});

/**
 * Resumen del mes
 * GET /api/dashboard/mes
 */
const obtenerResumenMes = asyncHandler(async (req, res) => {
  const resumen = await dashboardService.obtenerResumenMes();
  
  res.json({
    success: true,
    data: resumen,
  });
});

module.exports = {
  obtenerDashboardGeneral,
  obtenerDashboardPropietario,
  obtenerDashboardTarjetas,
  obtenerResumenHoy,
  obtenerResumenMes,
};
