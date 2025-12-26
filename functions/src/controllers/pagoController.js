const PagoService = require('../services/PagoService');
const { asyncHandler } = require('../middleware/errorHandler');

const pagoService = new PagoService();

/**
 * Registrar un pago
 * POST /api/pagos
 */
const registrarPago = asyncHandler(async (req, res) => {
  const resultado = await pagoService.registrarPago(req.body);
  
  res.status(201).json({
    success: true,
    data: resultado,
  });
});

/**
 * Obtener todos los pagos
 * GET /api/pagos
 */
const obtenerPagos = asyncHandler(async (req, res) => {
  const PagoRepository = require('../repositories/PagoRepository');
  const pagoRepo = new PagoRepository();
  const pagos = await pagoRepo.findAll();
  
  res.json({
    success: true,
    data: pagos,
  });
});

/**
 * Obtener historial de pagos de un cliente
 * GET /api/pagos/cliente/:clienteId
 */
const obtenerPagosCliente = asyncHandler(async (req, res) => {
  const { clienteId } = req.params;
  
  const pagos = await pagoService.obtenerHistorialCliente(clienteId);
  
  res.json({
    success: true,
    data: pagos,
  });
});

/**
 * Obtener resumen de cobros por propietario
 * GET /api/pagos/propietario/:propietarioId/resumen
 */
const obtenerResumenPropietario = asyncHandler(async (req, res) => {
  const { propietarioId } = req.params;
  const { fechaInicio, fechaFin } = req.query;
  
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  const fin = fechaFin ? new Date(fechaFin) : new Date();
  
  const resumen = await pagoService.obtenerResumenPorPropietario(propietarioId, inicio, fin);
  
  res.json({
    success: true,
    data: resumen,
  });
});

module.exports = {
  registrarPago,
  obtenerPagos,
  obtenerPagosCliente,
  obtenerResumenPropietario,
};
