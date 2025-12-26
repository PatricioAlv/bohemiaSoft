import { useState, useEffect } from 'react';
import api from '../../services/api';
import './FormProducto.css';

function FormProducto({ onClose, onSuccess }) {
  const [propietarios, setPropietarios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'hombre',
    propietario_id: '',
    precio_venta: '',
    precio_costo: '',
    stock_actual: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const cargarPropietarios = async () => {
    try {
      const response = await api.get('/usuarios/propietarios');
      const props = response.data.data || response.data;
      setPropietarios(props);
      if (props.length > 0) {
        setFormData(prev => ({ ...prev, propietario_id: props[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar propietarios:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/productos', {
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        precio_costo: parseFloat(formData.precio_costo),
        stock_actual: parseInt(formData.stock_actual)
      });

      alert('Producto creado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear producto: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuevo Producto</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoría *</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} required>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="accesorio">Accesorio</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Propietario *</label>
            <select name="propietario_id" value={formData.propietario_id} onChange={handleChange} required>
              {propietarios.length === 0 ? (
                <option value="">No hay propietarios disponibles</option>
              ) : (
                propietarios.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))
              )}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio Venta *</label>
              <input
                type="number"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Precio Costo *</label>
              <input
                type="number"
                name="precio_costo"
                value={formData.precio_costo}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Stock Inicial *</label>
            <input
              type="number"
              name="stock_actual"
              value={formData.stock_actual}
              onChange={handleChange}
              min="0"
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

export default FormProducto;
