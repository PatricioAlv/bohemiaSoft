const ProductoService = require('../services/ProductoService');
const { asyncHandler } = require('../middleware/errorHandler');
const ProductoRepository = require('../repositories/ProductoRepository');

const productoService = new ProductoService();
const productoRepo = new ProductoRepository();

/**
 * Crear producto
 * POST /api/productos
 */
const crearProducto = asyncHandler(async (req, res) => {
  const producto = await productoService.crearProducto(req.body);
  
  res.status(201).json({
    success: true,
    data: producto,
  });
});

/**
 * Obtener todos los productos
 * GET /api/productos
 */
const obtenerProductos = asyncHandler(async (req, res) => {
  const { categoria, propietario_id } = req.query;
  
  let productos;
  
  if (categoria) {
    productos = await productoService.obtenerPorCategoria(categoria);
  } else if (propietario_id) {
    productos = await productoService.obtenerPorPropietario(propietario_id);
  } else {
    // Cambiar para obtener todos los productos, no solo activos
    productos = await productoRepo.findAll();
  }
  
  res.json({
    success: true,
    data: productos,
  });
});

/**
 * Obtener un producto
 * GET /api/productos/:id
 */
const obtenerProducto = asyncHandler(async (req, res) => {
  const producto = await productoRepo.findById(req.params.id);
  
  if (!producto) {
    return res.status(404).json({
      success: false,
      error: 'Producto no encontrado',
    });
  }
  
  res.json({
    success: true,
    data: producto,
  });
});

/**
 * Actualizar producto
 * PUT /api/productos/:id
 */
const actualizarProducto = asyncHandler(async (req, res) => {
  const producto = await productoService.actualizarProducto(req.params.id, req.body);
  
  res.json({
    success: true,
    data: producto,
  });
});

/**
 * Eliminar producto (soft delete)
 * DELETE /api/productos/:id
 */
const eliminarProducto = asyncHandler(async (req, res) => {
  await productoRepo.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Producto eliminado correctamente',
  });
});

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
};
