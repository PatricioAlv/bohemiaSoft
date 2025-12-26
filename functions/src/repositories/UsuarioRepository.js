const BaseRepository = require('./BaseRepository');
const COLLECTIONS = require('../config/collections');

class UsuarioRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.USUARIOS);
  }

  /**
   * Buscar propietarios activos
   */
  async findPropietariosActivos() {
    try {
      const snapshot = await this.collection
        .where('rol', '==', 'propietario')
        .where('activo', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar propietarios: ${error.message}`);
    }
  }

  /**
   * Buscar por nombre
   */
  async findByNombre(nombre) {
    try {
      const snapshot = await this.collection
        .where('nombre', '==', nombre)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar por nombre: ${error.message}`);
    }
  }
}

module.exports = UsuarioRepository;
