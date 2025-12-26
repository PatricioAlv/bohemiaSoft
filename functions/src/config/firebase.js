const admin = require('firebase-admin');

// Inicializar Firebase Admin
const initializeFirebase = () => {
  try {
    // Si ya está inicializado, retornar la app existente
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // En Cloud Functions, las credenciales se cargan automáticamente
    // No se necesita configuración manual
    admin.initializeApp();

    console.log('✅ Firebase Admin inicializado correctamente');
    return admin.app();
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    throw error;
  }
};

// Obtener instancia de Firestore
const getFirestore = () => {
  return admin.firestore();
};

// Obtener ServerTimestamp
const getTimestamp = () => {
  return admin.firestore.FieldValue.serverTimestamp();
};

// Obtener Increment
const getIncrement = (value) => {
  return admin.firestore.FieldValue.increment(value);
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getTimestamp,
  getIncrement,
  admin,
};
