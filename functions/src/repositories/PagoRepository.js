const BaseRepository = require('./BaseRepository');
const COLLECTIONS = require('../config/collections');
const { getFirestore } = require('../config/firebase');

class PagoRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.PAGOS);
    this.db = getFirestore();
  }

  /**
   * Crear pago con imputaciones (transacción)
   */
  async createConImputaciones(pagoData, imputaciones) {
    const batch = this.db.batch();
    
    try {
      // Crear pago
      const pagoRef = this.collection.doc();
      pagoData.createdAt = new Date();
      pagoData.updatedAt = new Date();
      batch.set(pagoRef, pagoData);

      // Crear imputaciones
      imputaciones.forEach(imputacion => {
        const imputacionRef = pagoRef.collection(COLLECTIONS.IMPUTACION_PAGO).doc();
        imputacion.pago_id = pagoRef.id;
        imputacion.createdAt = new Date();
        batch.set(imputacionRef, imputacion);
      });

      await batch.commit();

      return await this.findByIdConImputaciones(pagoRef.id);
    } catch (error) {
      throw new Error(`Error al crear pago con imputaciones: ${error.message}`);
    }
  }

  /**
   * Obtener pago con imputaciones
   */
  async findByIdConImputaciones(pagoId) {
    try {
      const pagoDoc = await this.collection.doc(pagoId).get();
      
      if (!pagoDoc.exists) {
        return null;
      }

      const imputacionesSnapshot = await this.collection
        .doc(pagoId)
        .collection(COLLECTIONS.IMPUTACION_PAGO)
        .get();

      const imputaciones = imputacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        id: pagoDoc.id,
        ...pagoDoc.data(),
        imputaciones,
      };
    } catch (error) {
      throw new Error(`Error al obtener pago: ${error.message}`);
    }
  }

  /**
   * Buscar pagos por cliente
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
      throw new Error(`Error al buscar pagos: ${error.message}`);
    }
  }

  /**
   * Buscar pagos por rango de fechas
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
   * Calcular total cobrado por propietario
   */
  async calcularTotalPorPropietario(propietarioId, fechaInicio, fechaFin) {
    try {
      const pagos = await this.findByRangoFechas(fechaInicio, fechaFin);
      let total = 0;

      for (const pago of pagos) {
        const imputaciones = await this.findImputacionesByPropietario(pago.id, propietarioId);
        total += imputaciones.reduce((sum, imp) => sum + imp.monto_imputado, 0);
      }

      return total;
    } catch (error) {
      throw new Error(`Error al calcular total: ${error.message}`);
    }
  }

  /**
   * Buscar imputaciones por propietario
   */
  async findImputacionesByPropietario(pagoId, propietarioId) {
    try {
      const snapshot = await this.collection
        .doc(pagoId)
        .collection(COLLECTIONS.IMPUTACION_PAGO)
        .where('propietario_id', '==', propietarioId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar imputaciones: ${error.message}`);
    }
  }
}

module.exports = PagoRepository;
