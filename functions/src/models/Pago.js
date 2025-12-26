/**
 * Modelo de Pago
 */
class Pago {
  constructor(data) {
    this.id = data.id || null;
    this.cliente_id = data.cliente_id;
    this.fecha = data.fecha || new Date();
    this.monto = data.monto;
    this.medio_pago_id = data.medio_pago_id;
    this.observaciones = data.observaciones || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.cliente_id) {
      errors.push('El cliente es obligatorio');
    }

    if (!data.monto || data.monto <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (!data.medio_pago_id) {
      errors.push('El medio de pago es obligatorio');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      cliente_id: this.cliente_id,
      fecha: this.fecha,
      monto: parseFloat(this.monto),
      medio_pago_id: this.medio_pago_id,
      observaciones: this.observaciones,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new Pago({
      id: doc.id,
      ...data,
      fecha: data.fecha?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }
}

/**
 * Modelo de Imputación de Pago (Subcolección)
 */
class ImputacionPago {
  constructor(data) {
    this.id = data.id || null;
    this.pago_id = data.pago_id;
    this.detalle_venta_id = data.detalle_venta_id;
    this.venta_id = data.venta_id; // Denormalizado
    this.monto_imputado = data.monto_imputado;
    this.propietario_id = data.propietario_id;
    this.createdAt = data.createdAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.detalle_venta_id) {
      errors.push('El detalle de venta es obligatorio');
    }

    if (!data.monto_imputado || data.monto_imputado <= 0) {
      errors.push('El monto imputado debe ser mayor a 0');
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
      pago_id: this.pago_id,
      detalle_venta_id: this.detalle_venta_id,
      venta_id: this.venta_id,
      monto_imputado: parseFloat(this.monto_imputado),
      propietario_id: this.propietario_id,
      createdAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new ImputacionPago({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    });
  }
}

module.exports = {
  Pago,
  ImputacionPago,
};
