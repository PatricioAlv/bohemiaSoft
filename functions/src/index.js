const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initializeFirebase } = require('./config/firebase');
const { errorHandler } = require('./middleware/errorHandler');

// Inicializar Firebase
initializeFirebase();

// Crear app Express
const app = express();

// Middlewares - CORS configurado para Cloud Functions
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/ventas', require('./routes/ventaRoutes'));
app.use('/api/pagos', require('./routes/pagoRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/medios-pago', require('./routes/medioPagoRoutes'));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'BohemiaSoft API - Sistema de Gestión Comercial',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      clientes: '/api/clientes',
      ventas: '/api/ventas',
      pagos: '/api/pagos',
      dashboard: '/api/dashboard',
      usuarios: '/api/usuarios',
      mediosPago: '/api/medios-pago',
    },
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Exportar la función para Firebase Cloud Functions
exports.api = functions.https.onRequest(app);
