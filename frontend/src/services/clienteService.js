import api from './api';

export const clienteService = {
  // Obtener todos los clientes
  getAll: async (params = {}) => {
    const response = await api.get('/clientes', { params });
    console.log('Response clientes:', response.data);
    return response.data.data || response.data || [];
  },

  // Obtener un cliente
  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data.data || response.data;
  },

  // Crear cliente
  create: async (cliente) => {
    const response = await api.post('/clientes', cliente);
    return response.data.data || response.data;
  },

  // Actualizar cliente
  update: async (id, cliente) => {
    const response = await api.put(`/clientes/${id}`, cliente);
    return response.data.data;
  },

  // Buscar por nombre
  buscar: async (nombre) => {
    const response = await api.get('/clientes/buscar', { params: { nombre } });
    return response.data.data;
  },

  // Obtener clientes con saldo
  getConSaldo: async () => {
    const response = await api.get('/clientes', { params: { conSaldo: true } });
    return response.data.data;
  },
};
