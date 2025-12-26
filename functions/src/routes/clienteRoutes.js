const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rutas de clientes
router.post('/', clienteController.crearCliente);
router.get('/', clienteController.obtenerClientes);
router.get('/buscar', clienteController.buscarClientes);
router.get('/:id', clienteController.obtenerCliente);
router.put('/:id', clienteController.actualizarCliente);

module.exports = router;
