import api from './api';

export const pagoService = {
  // Registrar pago
  registrar: async (pago) => {
    const response = await api.post('/pagos', pago);
    return response.data.data;
  },

  // Obtener pagos de un cliente
  getByCliente: async (clienteId) => {
    const response = await api.get(`/pagos/cliente/${clienteId}`);
    return response.data.data;
  },

  // Obtener resumen por propietario
  getResumenPropietario: async (propietarioId, fechaInicio, fechaFin) => {
    const response = await api.get(`/pagos/propietario/${propietarioId}/resumen`, {
      params: { fechaInicio, fechaFin },
    });
    return response.data.data;
  },
};
