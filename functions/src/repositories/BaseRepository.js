const { getFirestore } = require('../config/firebase');
const COLLECTIONS = require('../config/collections');

/**
 * Repositorio base con operaciones CRUD genéricas
 */
class BaseRepository {
  constructor(collectionName) {
    this.db = getFirestore();
    this.collection = this.db.collection(collectionName);
  }

  /**
   * Crear un documento
   */
  async create(data) {
    try {
      data.createdAt = new Date();
      data.updatedAt = new Date();
      
      const docRef = await this.collection.add(data);
      const doc = await docRef.get();
      
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      throw new Error(`Error al crear documento: ${error.message}`);
    }
  }

  /**
   * Obtener un documento por ID
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      throw new Error(`Error al obtener documento: ${error.message}`);
    }
  }

  /**
   * Obtener todos los documentos
   */
  async findAll(filters = {}) {
    try {
      let query = this.collection;

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(key, '==', value);
        }
      });

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al obtener documentos: ${error.message}`);
    }
  }

  /**
   * Actualizar un documento
   */
  async update(id, data) {
    try {
      data.updatedAt = new Date();
      
      await this.collection.doc(id).update(data);
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }
  }

  /**
   * Eliminar un documento (soft delete)
   */
  async delete(id) {
    try {
      await this.collection.doc(id).update({
        activo: false,
        updatedAt: new Date(),
      });
      
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  /**
   * Eliminar permanentemente
   */
  async hardDelete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar permanentemente: ${error.message}`);
    }
  }

  /**
   * Obtener documentos con paginación
   */
  async findWithPagination(limit = 20, lastDoc = null, filters = {}) {
    try {
      let query = this.collection;

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(key, '==', value);
        }
      });

      // Ordenar y limitar
      query = query.orderBy('createdAt', 'desc').limit(limit);

      // Si hay un último documento, iniciar desde ahí
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        docs,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limit,
      };
    } catch (error) {
      throw new Error(`Error en paginación: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;
