import api from './api';

export const dashboardService = {
  // Dashboard general
  getGeneral: async (fechaInicio, fechaFin) => {
    const response = await api.get('/dashboard/general', {
      params: { fechaInicio, fechaFin },
    });
    return response.data.data;
  },

  // Resumen de hoy
  getHoy: async () => {
    const response = await api.get('/dashboard/hoy');
    return response.data.data;
  },

  // Resumen del mes
  getMes: async () => {
    const response = await api.get('/dashboard/mes');
    return response.data.data;
  },

  // Dashboard por propietario
  getPropietario: async (propietarioId, fechaInicio, fechaFin) => {
    const response = await api.get(`/dashboard/propietario/${propietarioId}`, {
      params: { fechaInicio, fechaFin },
    });
    return response.data.data;
  },

  // Dashboard de tarjetas
  getTarjetas: async (fechaInicio, fechaFin) => {
    const response = await api.get('/dashboard/tarjetas', {
      params: { fechaInicio, fechaFin },
    });
    return response.data.data;
  },
};
