/**
 * Modelo de Cliente
 */
class Cliente {
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre;
    this.telefono = data.telefono || '';
    this.email = data.email || '';
    this.saldo_total = data.saldo_total || 0;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.nombre || data.nombre.trim() === '') {
      errors.push('El nombre es obligatorio');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Email inválido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  toFirestore() {
    return {
      nombre: this.nombre,
      telefono: this.telefono,
      email: this.email,
      saldo_total: parseFloat(this.saldo_total),
      activo: this.activo,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new Cliente({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }
}

module.exports = Cliente;
