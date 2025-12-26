/**
 * Modelo de Liquidación (para tarjetas)
 */
class Liquidacion {
  constructor(data) {
    this.id = data.id || null;
    this.venta_id = data.venta_id;
    this.fecha_venta = data.fecha_venta;
    this.fecha_estimada_acreditacion = data.fecha_estimada_acreditacion;
    this.fecha_acreditacion_real = data.fecha_acreditacion_real || null;
    this.monto_bruto = data.monto_bruto;
    this.comision = data.comision;
    this.monto_neto = data.monto_neto;
    this.medio_pago_id = data.medio_pago_id;
    this.estado = data.estado || 'pendiente'; // pendiente | acreditado
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.venta_id) {
      errors.push('La venta es obligatoria');
    }

    if (!data.monto_bruto || data.monto_bruto <= 0) {
      errors.push('El monto bruto debe ser mayor a 0');
    }

    if (!['pendiente', 'acreditado'].includes(data.estado)) {
      errors.push('Estado inválido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      venta_id: this.venta_id,
      fecha_venta: this.fecha_venta,
      fecha_estimada_acreditacion: this.fecha_estimada_acreditacion,
      fecha_acreditacion_real: this.fecha_acreditacion_real,
      monto_bruto: parseFloat(this.monto_bruto),
      comision: parseFloat(this.comision),
      monto_neto: parseFloat(this.monto_neto),
      medio_pago_id: this.medio_pago_id,
      estado: this.estado,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new Liquidacion({
      id: doc.id,
      ...data,
      fecha_venta: data.fecha_venta?.toDate(),
      fecha_estimada_acreditacion: data.fecha_estimada_acreditacion?.toDate(),
      fecha_acreditacion_real: data.fecha_acreditacion_real?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }
}

/**
 * Modelo de Liquidación por Propietario (Subcolección)
 */
class LiquidacionPropietario {
  constructor(data) {
    this.id = data.id || null;
    this.liquidacion_id = data.liquidacion_id;
    this.propietario_id = data.propietario_id;
    this.monto_bruto = data.monto_bruto;
    this.comision = data.comision;
    this.monto_neto = data.monto_neto;
    this.createdAt = data.createdAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.propietario_id) {
      errors.push('El propietario es obligatorio');
    }

    if (!data.monto_neto || data.monto_neto < 0) {
      errors.push('El monto neto debe ser mayor o igual a 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      liquidacion_id: this.liquidacion_id,
      propietario_id: this.propietario_id,
      monto_bruto: parseFloat(this.monto_bruto),
      comision: parseFloat(this.comision),
      monto_neto: parseFloat(this.monto_neto),
      createdAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new LiquidacionPropietario({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    });
  }
}

module.exports = {
  Liquidacion,
  LiquidacionPropietario,
};
