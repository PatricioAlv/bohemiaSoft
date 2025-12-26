import api from './api';

export const productoService = {
  // Obtener todos los productos
  getAll: async (params = {}) => {
    const response = await api.get('/productos', { params });
    console.log('Response productos:', response.data);
    console.log('response.data.data:', response.data.data);
    console.log('response.data:', response.data);
    const result = response.data.data || response.data || [];
    console.log('Result final:', result);
    return result;
  },

  // Obtener un producto
  getById: async (id) => {
    const response = await api.get(`/productos/${id}`);
    return response.data.data || response.data;
  },

  // Crear producto
  create: async (producto) => {
    const response = await api.post('/productos', producto);
    return response.data.data || response.data;
  },

  // Actualizar producto
  update: async (id, producto) => {
    const response = await api.put(`/productos/${id}`, producto);
    return response.data.data;
  },

  // Eliminar producto
  delete: async (id) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  },

  // Obtener por categoría
  getByCategoria: async (categoria) => {
    const response = await api.get('/productos', { params: { categoria } });
    return response.data.data;
  },

  // Obtener por propietario
  getByPropietario: async (propietarioId) => {
    const response = await api.get('/productos', { params: { propietario_id: propietarioId } });
    return response.data.data;
  },
};
