import { useState, useEffect } from 'react';
import api, { usuariosAPI, mediosPagoAPI } from '../../services/api';
import Card from '../../components/Card/Card';
import FormPropietario from '../../components/FormPropietario/FormPropietario';
import FormMedioPago from '../../components/FormMedioPago/FormMedioPago';
import './Settings.css';

function Settings() {
  const [activeTab, setActiveTab] = useState('propietarios');
  const [propietarios, setPropietarios] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormProp, setMostrarFormProp] = useState(false);
  const [mostrarFormMP, setMostrarFormMP] = useState(false);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [propRes, mpRes] = await Promise.all([
        usuariosAPI.propietarios(),
        mediosPagoAPI.listar()
      ]);
      setPropietarios(propRes.data.data || propRes.data);
      setMediosPago(mpRes.data.data || mpRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProp = (prop) => {
    setEditando(prop);
    setMostrarFormProp(true);
  };

  const handleEditMP = (mp) => {
    setEditando(mp);
    setMostrarFormMP(true);
  };

  const handleCloseForm = () => {
    setMostrarFormProp(false);
    setMostrarFormMP(false);
    setEditando(null);
  };

  if (loading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>⚙️ Configuración</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'propietarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('propietarios')}
        >
          👥 Propietarios
        </button>
        <button
          className={`tab ${activeTab === 'medios-pago' ? 'active' : ''}`}
          onClick={() => setActiveTab('medios-pago')}
        >
          💳 Medios de Pago
        </button>
      </div>

      {activeTab === 'propietarios' && (
        <div className="tab-content">
          <Card
            title="Propietarios del Negocio"
            action={
              <button className="btn-primary" onClick={() => setMostrarFormProp(true)}>
                + Nuevo Propietario
              </button>
            }
          >
            {propietarios.length === 0 ? (
              <div className="empty-state">
                <p>No hay propietarios registrados</p>
                <p className="hint">Agrega los propietarios del negocio</p>
              </div>
            ) : (
              <div className="config-list">
                {propietarios.map((prop) => (
                  <div key={prop.id} className="config-item">
                    <div className="item-info">
                      <h3>{prop.nombre}</h3>
                      <span className={`badge ${prop.activo ? 'activo' : 'inactivo'}`}>
                        {prop.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => handleEditProp(prop)}>
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'medios-pago' && (
        <div className="tab-content">
          <Card
            title="Medios de Pago y Configuración"
            action={
              <button className="btn-primary" onClick={() => setMostrarFormMP(true)}>
                + Nuevo Medio de Pago
              </button>
            }
          >
            {mediosPago.length === 0 ? (
              <div className="empty-state">
                <p>No hay medios de pago configurados</p>
                <p className="hint">Agrega los medios de pago disponibles (efectivo, tarjetas, etc.)</p>
              </div>
            ) : (
              <div className="config-list">
                {mediosPago.map((mp) => (
                  <div key={mp.id} className="config-item">
                    <div className="item-info">
                      <h3>
                        {mp.tipo.toUpperCase()}
                        {mp.tarjeta && ` - ${mp.tarjeta}`}
                        {mp.plan_cuotas > 1 && ` (${mp.plan_cuotas} cuotas)`}
                      </h3>
                      <div className="item-details">
                        <span>📅 {mp.dias_acreditacion} días acreditación</span>
                        <span>💰 {mp.comision_porcentaje}% comisión</span>
                        <span className={`badge ${mp.activo ? 'activo' : 'inactivo'}`}>
                          {mp.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => handleEditMP(mp)}>
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {mostrarFormProp && (
        <FormPropietario
          onClose={handleCloseForm}
          onSuccess={() => {
            cargarDatos();
            handleCloseForm();
          }}
          propietario={editando}
        />
      )}

      {mostrarFormMP && (
        <FormMedioPago
          onClose={handleCloseForm}
          onSuccess={() => {
            cargarDatos();
            handleCloseForm();
          }}
          medioPago={editando}
        />
      )}
    </div>
  );
}

export default Settings;
