const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

// Rutas de pagos
router.post('/', pagoController.registrarPago);
router.get('/cliente/:clienteId', pagoController.obtenerPagosCliente);
router.get('/propietario/:propietarioId/resumen', pagoController.obtenerResumenPropietario);

module.exports = router;
