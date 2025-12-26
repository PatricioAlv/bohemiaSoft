import api from './api';

export const ventaService = {
  // Registrar venta
  registrar: async (venta) => {
    const response = await api.post('/ventas', venta);
    return response.data.data;
  },

  // Obtener venta por ID
  getById: async (id) => {
    const response = await api.get(`/ventas/${id}`);
    return response.data.data;
  },

  // Obtener ventas por período
  getByPeriodo: async (fechaInicio, fechaFin) => {
    const response = await api.get('/ventas', {
      params: { fechaInicio, fechaFin },
    });
    return response.data.data;
  },

  // Obtener resumen por propietario
  getResumenPropietario: async (propietarioId, fechaInicio, fechaFin) => {
    const response = await api.get(`/ventas/propietario/${propietarioId}/resumen`, {
      params: { fechaInicio, fechaFin },
    });
    return response.data.data;
  },
};
