import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || 'Error en la solicitud';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Agregar endpoints comunes
export const usuariosAPI = {
  listar: () => api.get('/usuarios'),
  propietarios: () => api.get('/usuarios/propietarios'),
};

export const mediosPagoAPI = {
  listar: () => api.get('/medios-pago'),
};

export default api;
