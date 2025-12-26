const BaseRepository = require('./BaseRepository');
const COLLECTIONS = require('../config/collections');

class MedioPagoRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.MEDIOS_PAGO);
  }

  /**
   * Buscar por tipo
   */
  async findByTipo(tipo) {
    try {
      const snapshot = await this.collection
        .where('tipo', '==', tipo)
        .where('activo', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar por tipo: ${error.message}`);
    }
  }

  /**
   * Buscar efectivo
   */
  async findEfectivo() {
    try {
      const snapshot = await this.collection
        .where('tipo', '==', 'efectivo')
        .where('activo', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      throw new Error(`Error al buscar efectivo: ${error.message}`);
    }
  }

  /**
   * Buscar tarjetas con comisión
   */
  async findConComision() {
    try {
      const snapshot = await this.collection
        .where('comision_porcentaje', '>', 0)
        .where('activo', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar con comisión: ${error.message}`);
    }
  }
}

module.exports = MedioPagoRepository;
