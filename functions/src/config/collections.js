// Nombres de colecciones Firestore
module.exports = {
  USUARIOS: process.env.COLLECTION_USUARIOS || 'usuarios',
  PRODUCTOS: process.env.COLLECTION_PRODUCTOS || 'productos',
  CLIENTES: process.env.COLLECTION_CLIENTES || 'clientes',
  VENTAS: process.env.COLLECTION_VENTAS || 'ventas',
  MEDIOS_PAGO: process.env.COLLECTION_MEDIOS_PAGO || 'medios_pago',
  PAGOS: process.env.COLLECTION_PAGOS || 'pagos',
  LIQUIDACIONES: process.env.COLLECTION_LIQUIDACIONES || 'liquidaciones',
  
  // Subcolecciones
  DETALLE_VENTA: 'detalles',
  IMPUTACION_PAGO: 'imputaciones',
  LIQUIDACION_PROPIETARIO: 'propietarios',
};
