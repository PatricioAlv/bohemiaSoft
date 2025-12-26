/**
 * Modelo de Venta
 */
class Venta {
  constructor(data) {
    this.id = data.id || null;
    this.fecha = data.fecha || new Date();
    this.cliente_id = data.cliente_id || null;
    this.total_bruto = data.total_bruto || 0;
    this.medio_pago_id = data.medio_pago_id;
    this.estado = data.estado || 'pendiente'; // pagada | parcial | pendiente
    this.observaciones = data.observaciones || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.medio_pago_id) {
      errors.push('El medio de pago es obligatorio');
    }

    if (!['pagada', 'parcial', 'pendiente'].includes(data.estado)) {
      errors.push('Estado inválido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      fecha: this.fecha,
      cliente_id: this.cliente_id,
      total_bruto: parseFloat(this.total_bruto),
      medio_pago_id: this.medio_pago_id,
      estado: this.estado,
      observaciones: this.observaciones,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new Venta({
      id: doc.id,
      ...data,
      fecha: data.fecha?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }
}

/**
 * Modelo de Detalle de Venta (Subcolección)
 */
class DetalleVenta {
  constructor(data) {
    this.id = data.id || null;
    this.venta_id = data.venta_id;
    this.producto_id = data.producto_id;
    this.cantidad = data.cantidad;
    this.precio_unitario = data.precio_unitario;
    this.subtotal = data.subtotal;
    this.propietario_id = data.propietario_id;
    this.producto_nombre = data.producto_nombre || ''; // Denormalizado para consultas
    this.createdAt = data.createdAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.producto_id) {
      errors.push('El producto es obligatorio');
    }

    if (!data.cantidad || data.cantidad <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }

    if (!data.precio_unitario || data.precio_unitario <= 0) {
      errors.push('El precio debe ser mayor a 0');
    }

    if (!data.propietario_id) {
      errors.push('El propietario es obligatorio');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      venta_id: this.venta_id,
      producto_id: this.producto_id,
      cantidad: parseInt(this.cantidad),
      precio_unitario: parseFloat(this.precio_unitario),
      subtotal: parseFloat(this.subtotal),
      propietario_id: this.propietario_id,
      producto_nombre: this.producto_nombre,
      createdAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new DetalleVenta({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    });
  }
}

module.exports = {
  Venta,
  DetalleVenta,
};
