const ProductoRepository = require('../repositories/ProductoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class ProductoService {
  constructor() {
    this.productoRepo = new ProductoRepository();
    this.usuarioRepo = new UsuarioRepository();
  }

  /**
   * Crear producto
   */
  async crearProducto(data) {
    try {
      // Validar que el propietario existe
      const propietario = await this.usuarioRepo.findById(data.propietario_id);
      if (!propietario) {
        throw new Error('Propietario no encontrado');
      }

      if (propietario.rol !== 'propietario') {
        throw new Error('El usuario no es un propietario válido');
      }

      return await this.productoRepo.create(data);
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  /**
   * Actualizar producto
   */
  async actualizarProducto(id, data) {
    try {
      const producto = await this.productoRepo.findById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Si cambia el propietario, validar
      if (data.propietario_id && data.propietario_id !== producto.propietario_id) {
        const propietario = await this.usuarioRepo.findById(data.propietario_id);
        if (!propietario || propietario.rol !== 'propietario') {
          throw new Error('Propietario inválido');
        }
      }

      return await this.productoRepo.update(id, data);
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  /**
   * Obtener productos por categoría
   */
  async obtenerPorCategoria(categoria) {
    try {
      return await this.productoRepo.findByCategoria(categoria);
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  /**
   * Obtener productos por propietario
   */
  async obtenerPorPropietario(propietarioId) {
    try {
      return await this.productoRepo.findByPropietario(propietarioId);
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  /**
   * Verificar disponibilidad de stock
   */
  async verificarStock(productoId, cantidadRequerida) {
    try {
      const producto = await this.productoRepo.findById(productoId);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (!producto.activo) {
        throw new Error('Producto no activo');
      }

      return {
        disponible: producto.stock_actual >= cantidadRequerida,
        stock_actual: producto.stock_actual,
        faltante: Math.max(0, cantidadRequerida - producto.stock_actual),
      };
    } catch (error) {
      throw new Error(`Error al verificar stock: ${error.message}`);
    }
  }

  /**
   * Obtener todos los productos activos
   */
  async obtenerActivos() {
    try {
      return await this.productoRepo.findAll({ activo: true });
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }
}

module.exports = ProductoService;
