/**
 * Modelo de Producto
 */
class Producto {
  constructor(data) {
    this.id = data.id || null;
    this.nombre = data.nombre;
    this.categoria = data.categoria; // hombre | mujer | accesorio
    this.propietario_id = data.propietario_id;
    this.precio_venta = data.precio_venta;
    this.precio_costo = data.precio_costo || 0;
    this.stock_actual = data.stock_actual || 0;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static validate(data) {
    const errors = [];

    if (!data.nombre || data.nombre.trim() === '') {
      errors.push('El nombre es obligatorio');
    }

    if (!['hombre', 'mujer', 'accesorio'].includes(data.categoria)) {
      errors.push('Categoría inválida. Debe ser: hombre, mujer o accesorio');
    }

    if (!data.propietario_id) {
      errors.push('El propietario es obligatorio');
    }

    if (!data.precio_venta || data.precio_venta <= 0) {
      errors.push('El precio de venta debe ser mayor a 0');
    }

    if (data.stock_actual < 0) {
      errors.push('El stock no puede ser negativo');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      nombre: this.nombre,
      categoria: this.categoria,
      propietario_id: this.propietario_id,
      precio_venta: parseFloat(this.precio_venta),
      precio_costo: parseFloat(this.precio_costo),
      stock_actual: parseInt(this.stock_actual),
      activo: this.activo,
      updatedAt: new Date(),
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new Producto({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }
}

module.exports = Producto;
