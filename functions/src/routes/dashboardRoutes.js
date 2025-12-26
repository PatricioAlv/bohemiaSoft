const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rutas de dashboard
router.get('/general', dashboardController.obtenerDashboardGeneral);
router.get('/hoy', dashboardController.obtenerResumenHoy);
router.get('/mes', dashboardController.obtenerResumenMes);
router.get('/propietario/:propietarioId', dashboardController.obtenerDashboardPropietario);
router.get('/tarjetas', dashboardController.obtenerDashboardTarjetas);

module.exports = router;
