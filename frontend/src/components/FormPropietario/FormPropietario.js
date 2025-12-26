import { useState } from 'react';
import api from '../../services/api';
import './FormPropietario.css';

function FormPropietario({ onClose, onSuccess, propietario = null }) {
  const [formData, setFormData] = useState({
    nombre: propietario?.nombre || '',
    rol: 'propietario'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (propietario) {
        await api.put(`/usuarios/${propietario.id}`, formData);
        alert('Propietario actualizado exitosamente');
      } else {
        await api.post('/usuarios', formData);
        alert('Propietario creado exitosamente');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar propietario: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{propietario ? 'Editar Propietario' : 'Nuevo Propietario'}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Propietario *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez - Ropa Hombre"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormPropietario;
