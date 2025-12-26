const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Rutas de ventas
router.post('/', ventaController.registrarVenta);
router.get('/', ventaController.obtenerVentas);
router.get('/:id', ventaController.obtenerVenta);
router.get('/propietario/:propietarioId/resumen', ventaController.obtenerResumenPropietario);

module.exports = router;
