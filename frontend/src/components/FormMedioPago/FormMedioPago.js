import { useState } from 'react';
import api from '../../services/api';
import './FormMedioPago.css';

function FormMedioPago({ onClose, onSuccess, medioPago = null }) {
  const [formData, setFormData] = useState({
    tipo: medioPago?.tipo || 'efectivo',
    tarjeta: medioPago?.tarjeta || '',
    plan_cuotas: medioPago?.plan_cuotas || 1,
    dias_acreditacion: medioPago?.dias_acreditacion || 0,
    comision_porcentaje: medioPago?.comision_porcentaje || 0
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
      const data = {
        ...formData,
        tarjeta: formData.tipo === 'efectivo' || formData.tipo === 'cuenta_corriente' ? null : formData.tarjeta,
        plan_cuotas: parseInt(formData.plan_cuotas),
        dias_acreditacion: parseInt(formData.dias_acreditacion),
        comision_porcentaje: parseFloat(formData.comision_porcentaje)
      };

      if (medioPago) {
        await api.put(`/medios-pago/${medioPago.id}`, data);
        alert('Medio de pago actualizado exitosamente');
      } else {
        await api.post('/medios-pago', data);
        alert('Medio de pago creado exitosamente');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar medio de pago: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const mostrarCamposTarjeta = formData.tipo === 'debito' || formData.tipo === 'credito';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{medioPago ? 'Editar Medio de Pago' : 'Nuevo Medio de Pago'}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo *</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
              <option value="efectivo">Efectivo</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
              <option value="cuenta_corriente">Cuenta Corriente</option>
            </select>
          </div>

          {mostrarCamposTarjeta && (
            <>
              <div className="form-group">
                <label>Tarjeta *</label>
                <input
                  type="text"
                  name="tarjeta"
                  value={formData.tarjeta}
                  onChange={handleChange}
                  placeholder="Ej: Visa, Mastercard"
                  required={mostrarCamposTarjeta}
                />
              </div>

              <div className="form-group">
                <label>Plan de Cuotas *</label>
                <input
                  type="number"
                  name="plan_cuotas"
                  value={formData.plan_cuotas}
                  onChange={handleChange}
                  min="1"
                  max="24"
                  required
                />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Días Acreditación *</label>
              <input
                type="number"
                name="dias_acreditacion"
                value={formData.dias_acreditacion}
                onChange={handleChange}
                min="0"
                max="365"
                required
              />
              <small>Días hasta que se acredita el dinero</small>
            </div>

            <div className="form-group">
              <label>Comisión (%) *</label>
              <input
                type="number"
                name="comision_porcentaje"
                value={formData.comision_porcentaje}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                required
              />
              <small>Porcentaje de comisión</small>
            </div>
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

export default FormMedioPago;
