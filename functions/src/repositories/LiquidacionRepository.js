const BaseRepository = require('./BaseRepository');
const COLLECTIONS = require('../config/collections');
const { getFirestore } = require('../config/firebase');

class LiquidacionRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.LIQUIDACIONES);
    this.db = getFirestore();
  }

  /**
   * Crear liquidación con distribución por propietarios
   */
  async createConPropietarios(liquidacionData, propietarios) {
    const batch = this.db.batch();
    
    try {
      // Crear liquidación
      const liquidacionRef = this.collection.doc();
      liquidacionData.createdAt = new Date();
      liquidacionData.updatedAt = new Date();
      batch.set(liquidacionRef, liquidacionData);

      // Crear distribución por propietarios
      propietarios.forEach(prop => {
        const propRef = liquidacionRef.collection(COLLECTIONS.LIQUIDACION_PROPIETARIO).doc();
        prop.liquidacion_id = liquidacionRef.id;
        prop.createdAt = new Date();
        batch.set(propRef, prop);
      });

      await batch.commit();

      return await this.findByIdConPropietarios(liquidacionRef.id);
    } catch (error) {
      throw new Error(`Error al crear liquidación: ${error.message}`);
    }
  }

  /**
   * Obtener liquidación con distribución por propietarios
   */
  async findByIdConPropietarios(liquidacionId) {
    try {
      const liquidacionDoc = await this.collection.doc(liquidacionId).get();
      
      if (!liquidacionDoc.exists) {
        return null;
      }

      const propietariosSnapshot = await this.collection
        .doc(liquidacionId)
        .collection(COLLECTIONS.LIQUIDACION_PROPIETARIO)
        .get();

      const propietarios = propietariosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        id: liquidacionDoc.id,
        ...liquidacionDoc.data(),
        propietarios,
      };
    } catch (error) {
      throw new Error(`Error al obtener liquidación: ${error.message}`);
    }
  }

  /**
   * Buscar liquidaciones pendientes
   */
  async findPendientes() {
    try {
      const snapshot = await this.collection
        .where('estado', '==', 'pendiente')
        .orderBy('fecha_estimada_acreditacion', 'asc')
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
   * Buscar liquidaciones por propietario
   */
  async findByPropietario(propietarioId, estado = null) {
    try {
      const liquidaciones = [];
      
      // Obtener todas las liquidaciones
      let query = this.collection;
      if (estado) {
        query = query.where('estado', '==', estado);
      }
      
      const snapshot = await query.get();

      // Filtrar por propietario en la subcolección
      for (const doc of snapshot.docs) {
        const propSnapshot = await this.collection
          .doc(doc.id)
          .collection(COLLECTIONS.LIQUIDACION_PROPIETARIO)
          .where('propietario_id', '==', propietarioId)
          .get();

        if (!propSnapshot.empty) {
          const propietarios = propSnapshot.docs.map(propDoc => ({
            id: propDoc.id,
            ...propDoc.data(),
          }));

          liquidaciones.push({
            id: doc.id,
            ...doc.data(),
            propietarios,
          });
        }
      }

      return liquidaciones;
    } catch (error) {
      throw new Error(`Error al buscar por propietario: ${error.message}`);
    }
  }

  /**
   * Marcar como acreditada
   */
  async marcarAcreditada(liquidacionId) {
    try {
      await this.collection.doc(liquidacionId).update({
        estado: 'acreditado',
        fecha_acreditacion_real: new Date(),
        updatedAt: new Date(),
      });

      return await this.findById(liquidacionId);
    } catch (error) {
      throw new Error(`Error al marcar acreditada: ${error.message}`);
    }
  }

  /**
   * Calcular total pendiente por propietario
   */
  async calcularPendientePorPropietario(propietarioId) {
    try {
      const liquidaciones = await this.findByPropietario(propietarioId, 'pendiente');
      
      let total = 0;
      liquidaciones.forEach(liq => {
        liq.propietarios.forEach(prop => {
          if (prop.propietario_id === propietarioId) {
            total += prop.monto_neto;
          }
        });
      });

      return total;
    } catch (error) {
      throw new Error(`Error al calcular pendiente: ${error.message}`);
    }
  }
}

module.exports = LiquidacionRepository;
