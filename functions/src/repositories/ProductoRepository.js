const BaseRepository = require('./BaseRepository');
const COLLECTIONS = require('../config/collections');
const { getIncrement } = require('../config/firebase');

class ProductoRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.PRODUCTOS);
  }

  /**
   * Buscar productos por propietario
   */
  async findByPropietario(propietarioId) {
    try {
      const snapshot = await this.collection
        .where('propietario_id', '==', propietarioId)
        .where('activo', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  }

  /**
   * Buscar productos por categoría
   */
  async findByCategoria(categoria) {
    try {
      const snapshot = await this.collection
        .where('categoria', '==', categoria)
        .where('activo', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar por categoría: ${error.message}`);
    }
  }

  /**
   * Buscar productos con stock bajo
   */
  async findConStockBajo(minimo = 5) {
    try {
      const snapshot = await this.collection
        .where('stock_actual', '<=', minimo)
        .where('activo', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar stock bajo: ${error.message}`);
    }
  }

  /**
   * Descontar stock
   */
  async descontarStock(productoId, cantidad) {
    try {
      const producto = await this.findById(productoId);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (producto.stock_actual < cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.stock_actual}`);
      }

      await this.collection.doc(productoId).update({
        stock_actual: getIncrement(-cantidad),
        updatedAt: new Date(),
      });

      return await this.findById(productoId);
    } catch (error) {
      throw new Error(`Error al descontar stock: ${error.message}`);
    }
  }

  /**
   * Incrementar stock
   */
  async incrementarStock(productoId, cantidad) {
    try {
      await this.collection.doc(productoId).update({
        stock_actual: getIncrement(cantidad),
        updatedAt: new Date(),
      });

      return await this.findById(productoId);
    } catch (error) {
      throw new Error(`Error al incrementar stock: ${error.message}`);
    }
  }
}

module.exports = ProductoRepository;
