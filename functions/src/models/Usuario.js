/**
 * Modelo de Usuario/Propietario
 */
class Usuario {
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre;
    this.rol = data.rol || 'propietario'; // propietario | admin | vendedor
    this.activo = data.activo !== undefined ? data.activo : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Validar datos
  static validate(data) {
    const errors = [];

    if (!data.nombre || data.nombre.trim() === '') {
      errors.push('El nombre es obligatorio');
    }

    if (data.rol && !['propietario', 'admin', 'vendedor'].includes(data.rol)) {
      errors.push('Rol inválido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Convertir a formato Firestore
  toFirestore() {
    return {
      nombre: this.nombre,
      rol: this.rol,
      activo: this.activo,
      updatedAt: new Date(),
    };
  }

  // Crear desde documento Firestore
  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new Usuario({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }
}

module.exports = Usuario;
