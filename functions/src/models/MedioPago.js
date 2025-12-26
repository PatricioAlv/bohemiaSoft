/**
 * Modelo de Medio de Pago
 */
class MedioPago {
  constructor(data) {
    this.id = data.id || null;
    this.tipo = data.tipo; // efectivo | debito | credito
    this.tarjeta = data.tarjeta || null; // Visa | Master | etc (solo para débito/crédito)
    this.plan_cuotas = data.plan_cuotas || 1;
    this.dias_acreditacion = data.dias_acreditacion || 0;
    this.comision_porcentaje = data.comision_porcentaje || 0;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!['efectivo', 'debito', 'credito'].includes(data.tipo)) {
      errors.push('Tipo inválido. Debe ser: efectivo, debito o credito');
    }

    if ((data.tipo === 'debito' || data.tipo === 'credito') && !data.tarjeta) {
      errors.push('La tarjeta es obligatoria para débito/crédito');
    }

    if (data.comision_porcentaje < 0 || data.comision_porcentaje > 100) {
      errors.push('La comisión debe estar entre 0 y 100');
    }

    if (data.dias_acreditacion < 0) {
      errors.push('Los días de acreditación no pueden ser negativos');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calcular fecha de acreditación
  calcularFechaAcreditacion(fechaVenta = new Date()) {
    const fecha = new Date(fechaVenta);
    fecha.setDate(fecha.getDate() + this.dias_acreditacion);
    return fecha;
  }

  // Calcular comisión sobre un monto
  calcularComision(monto) {
    return (monto * this.comision_porcentaje) / 100;
  }

  // Calcular monto neto (después de comisión)
  calcularMontoNeto(montoBruto) {
    return montoBruto - this.calcularComision(montoBruto);
  }

  toFirestore() {
    return {
      tipo: this.tipo,
      tarjeta: this.tarjeta,
      plan_cuotas: parseInt(this.plan_cuotas),
      dias_acreditacion: parseInt(this.dias_acreditacion),
      comision_porcentaje: parseFloat(this.comision_porcentaje),
      activo: this.activo,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new MedioPago({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }
}

module.exports = MedioPago;
