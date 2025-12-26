const VentaService = require('../services/VentaService');
const { asyncHandler } = require('../middleware/errorHandler');

const ventaService = new VentaService();

/**
 * Registrar una nueva venta
 * POST /api/ventas
 */
const registrarVenta = asyncHandler(async (req, res) => {
  const resultado = await ventaService.registrarVenta(req.body);
  
  res.status(201).json({
    success: true,
    data: resultado,
  });
});

/**
 * Obtener detalle de una venta
 * GET /api/ventas/:id
 */
const obtenerVenta = asyncHandler(async (req, res) => {
  const venta = await ventaService.obtenerDetalle(req.params.id);
  
  if (!venta) {
    return res.status(404).json({
      success: false,
      error: 'Venta no encontrada',
    });
  }
  
  res.json({
    success: true,
    data: venta,
  });
});

/**
 * Obtener ventas por período
 * GET /api/ventas?fechaInicio=2024-01-01&fechaFin=2024-01-31
 */
const obtenerVentas = asyncHandler(async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  const fin = fechaFin ? new Date(fechaFin) : new Date();
  
  const ventas = await ventaService.obtenerPorPeriodo(inicio, fin);
  
  res.json({
    success: true,
    data: ventas,
  });
});

/**
 * Obtener resumen por propietario
 * GET /api/ventas/propietario/:propietarioId/resumen
 */
const obtenerResumenPropietario = asyncHandler(async (req, res) => {
  const { propietarioId } = req.params;
  const { fechaInicio, fechaFin } = req.query;
  
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  const fin = fechaFin ? new Date(fechaFin) : new Date();
  
  const resumen = await ventaService.obtenerResumenPorPropietario(propietarioId, inicio, fin);
  
  res.json({
    success: true,
    data: resumen,
  });
});

module.exports = {
  registrarVenta,
  obtenerVenta,
  obtenerVentas,
  obtenerResumenPropietario,
};
