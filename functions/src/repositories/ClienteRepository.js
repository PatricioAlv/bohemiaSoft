const BaseRepository = require('./BaseRepository');
const COLLECTIONS = require('../config/collections');
const { getIncrement } = require('../config/firebase');

class ClienteRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CLIENTES);
  }

  /**
   * Buscar clientes con saldo pendiente
   */
  async findConSaldo() {
    try {
      const snapshot = await this.collection
        .where('saldo_total', '>', 0)
        .where('activo', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error al buscar clientes con saldo: ${error.message}`);
    }
  }

  /**
   * Buscar por nombre (búsqueda parcial)
   */
  async searchByNombre(nombre) {
    try {
      const snapshot = await this.collection
        .where('activo', '==', true)
        .get();

      const nombreLower = nombre.toLowerCase();
      
      return snapshot.docs
        .filter(doc => doc.data().nombre.toLowerCase().includes(nombreLower))
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
    } catch (error) {
      throw new Error(`Error al buscar por nombre: ${error.message}`);
    }
  }

  /**
   * Incrementar saldo
   */
  async incrementarSaldo(clienteId, monto) {
    try {
      await this.collection.doc(clienteId).update({
        saldo_total: getIncrement(monto),
        updatedAt: new Date(),
      });

      return await this.findById(clienteId);
    } catch (error) {
      throw new Error(`Error al incrementar saldo: ${error.message}`);
    }
  }

  /**
   * Decrementar saldo
   */
  async decrementarSaldo(clienteId, monto) {
    try {
      const cliente = await this.findById(clienteId);
      
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      if (cliente.saldo_total < monto) {
        throw new Error(`Saldo insuficiente. Disponible: ${cliente.saldo_total}`);
      }

      await this.collection.doc(clienteId).update({
        saldo_total: getIncrement(-monto),
        updatedAt: new Date(),
      });

      return await this.findById(clienteId);
    } catch (error) {
      throw new Error(`Error al decrementar saldo: ${error.message}`);
    }
  }
}

module.exports = ClienteRepository;
