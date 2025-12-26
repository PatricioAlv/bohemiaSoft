import { useState, useEffect } from 'react';
import api from '../../services/api';
import './FormPago.css';

function FormPago({ onClose, onSuccess }) {
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [formData, setFormData] = useState({
    cliente_id: '',
    monto: '',
    tipo_imputacion: 'automatica'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data.data || response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const cargarVentas = async (clienteId) => {
    try {
      const response = await api.get(`/ventas/cliente/${clienteId}/pendientes`);
      setVentas(response.data.data || response.data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setVentas([]);
    }
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setFormData(prev => ({ ...prev, cliente_id: clienteId }));
    if (clienteId) {
      cargarVentas(clienteId);
    } else {
      setVentas([]);
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
      await api.post('/pagos', {
        cliente_id: formData.cliente_id,
        monto: parseFloat(formData.monto),
        tipo_imputacion: formData.tipo_imputacion
      });

      alert('Pago registrado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar pago: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const saldoCliente = clientes.find(c => c.id === formData.cliente_id)?.saldo_total || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registrar Pago</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cliente *</label>
            <select
              name="cliente_id"
              value={formData.cliente_id}
              onChange={handleClienteChange}
              required
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} - Saldo: ${c.saldo_total?.toLocaleString() || 0}
                </option>
              ))}
            </select>
          </div>

          {formData.cliente_id && (
            <div className="info-box">
              <p><strong>Saldo Actual:</strong> ${saldoCliente.toLocaleString()}</p>
              <p><strong>Ventas Pendientes:</strong> {ventas.length}</p>
            </div>
          )}

          <div className="form-group">
            <label>Monto a Pagar *</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Imputación</label>
            <select
              name="tipo_imputacion"
              value={formData.tipo_imputacion}
              onChange={handleChange}
            >
              <option value="automatica">Automática (más antiguas primero)</option>
              <option value="manual">Manual (seleccionar ventas)</option>
            </select>
          </div>

          {formData.tipo_imputacion === 'manual' && ventas.length > 0 && (
            <div className="ventas-list">
              <h4>Ventas Pendientes:</h4>
              {ventas.map(venta => (
                <div key={venta.id} className="venta-item">
                  <span>Venta #{venta.numero || venta.id.substring(0, 8)}</span>
                  <span>${venta.saldo_pendiente.toLocaleString()}</span>
                </div>
              ))}
              <p className="hint">Nota: La imputación manual se implementará próximamente</p>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormPago;
