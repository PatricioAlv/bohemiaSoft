const ClienteRepository = require('../repositories/ClienteRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const clienteRepo = new ClienteRepository();

/**
 * Crear cliente
 * POST /api/clientes
 */
const crearCliente = asyncHandler(async (req, res) => {
  const cliente = await clienteRepo.create(req.body);
  
  res.status(201).json({
    success: true,
    data: cliente,
  });
});

/**
 * Obtener todos los clientes
 * GET /api/clientes
 */
const obtenerClientes = asyncHandler(async (req, res) => {
  const { conSaldo } = req.query;
  
  let clientes;
  
  if (conSaldo === 'true') {
    clientes = await clienteRepo.findConSaldo();
  } else {
    // Cambiar para obtener todos los clientes, no solo activos
    clientes = await clienteRepo.findAll();
  }
  
  res.json({
    success: true,
    data: clientes,
  });
});

/**
 * Obtener un cliente
 * GET /api/clientes/:id
 */
const obtenerCliente = asyncHandler(async (req, res) => {
  const cliente = await clienteRepo.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      error: 'Cliente no encontrado',
    });
  }
  
  res.json({
    success: true,
    data: cliente,
  });
});

/**
 * Actualizar cliente
 * PUT /api/clientes/:id
 */
const actualizarCliente = asyncHandler(async (req, res) => {
  const cliente = await clienteRepo.update(req.params.id, req.body);
  
  res.json({
    success: true,
    data: cliente,
  });
});

/**
 * Buscar clientes por nombre
 * GET /api/clientes/buscar?nombre=Juan
 */
const buscarClientes = asyncHandler(async (req, res) => {
  const { nombre } = req.query;
  
  const clientes = await clienteRepo.searchByNombre(nombre);
  
  res.json({
    success: true,
    data: clientes,
  });
});

module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerCliente,
  actualizarCliente,
  buscarClientes,
};
