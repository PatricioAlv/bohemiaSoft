const BaseRepository = require('./BaseRepository');
const COLLECTIONS = require('../config/collections');
const { getFirestore } = require('../config/firebase');

class VentaRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.VENTAS);
    this.db = getFirestore();
  }

  /**
   * Crear venta con detalles (transacción)
   */
  async createConDetalles(ventaData, detalles) {
    const batch = this.db.batch();
    
    try {
      // Crear venta
      const ventaRef = this.collection.doc();
      ventaData.createdAt = new Date();
      ventaData.updatedAt = new Date();
      batch.set(ventaRef, ventaData);

      // Crear detalles
      detalles.forEach(detalle => {
        const detalleRef = ventaRef.collection(COLLECTIONS.DETALLE_VENTA).doc();
        detalle.venta_id = ventaRef.id;
        detalle.createdAt = new Date();
        batch.set(detalleRef, detalle);
      });

      await batch.commit();

      // Obtener venta creada con detalles
      return await this.findByIdConDetalles(ventaRef.id);
    } catch (error) {
      throw new Error(`Error al crear venta con detalles: ${error.message}`);
    }
  }

  /**
   * Obtener venta con detalles
   */
  async findByIdConDetalles(ventaId) {
    try {
      const ventaDoc = await this.collection.doc(ventaId).get();
      
      if (!ventaDoc.exists) {
        return null;
      }

      const detallesSnapshot = await this.collection
        .doc(ventaId)
        .collection(COLLECTIONS.DETALLE_VENTA)
        .get();

      const detalles = detallesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        id: ventaDoc.id,
        ...ventaDoc.data(),
        detalles,
      };
    } catch (error) {
      throw new Error(`Error al obtener venta con detalles: ${error.message}`);
    }
  }

  /**
   * Buscar ventas por rango de fechas
   */
  async findByRangoFechas(fechaInicio, fechaFin) {
    try {
      const snapshot = await this.collection
        .where('fecha', '>=', fechaInicio)
        .where('fecha', '<=', fechaFin)
        .orderBy('fecha', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar por rango: ${error.message}`);
    }
  }

  /**
   * Buscar ventas por cliente
   */
  async findByCliente(clienteId) {
    try {
      const snapshot = await this.collection
        .where('cliente_id', '==', clienteId)
        .orderBy('fecha', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar por cliente: ${error.message}`);
    }
  }

  /**
   * Buscar ventas pendientes de pago
   */
  async findPendientes() {
    try {
      const snapshot = await this.collection
        .where('estado', 'in', ['pendiente', 'parcial'])
        .orderBy('fecha', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar pendientes: ${error.message}`);
    }
  }

  /**
   * Obtener detalles por propietario
   */
  async findDetallesByPropietario(ventaId, propietarioId) {
    try {
      const snapshot = await this.collection
        .doc(ventaId)
        .collection(COLLECTIONS.DETALLE_VENTA)
        .where('propietario_id', '==', propietarioId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al obtener detalles: ${error.message}`);
    }
  }

  /**
   * Calcular total vendido por propietario en un rango
   */
  async calcularTotalPorPropietario(propietarioId, fechaInicio, fechaFin) {
    try {
      const ventas = await this.findByRangoFechas(fechaInicio, fechaFin);
      let total = 0;

      for (const venta of ventas) {
        const detalles = await this.findDetallesByPropietario(venta.id, propietarioId);
        total += detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
      }

      return total;
    } catch (error) {
      throw new Error(`Error al calcular total: ${error.message}`);
    }
  }
}

module.exports = VentaRepository;
