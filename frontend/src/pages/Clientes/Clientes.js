import { useState, useEffect } from 'react';
import { clienteService } from '../../services/clienteService';
import Card from '../../components/Card/Card';
import FormCliente from '../../components/FormCliente/FormCliente';
import './Clientes.css';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      console.log('Cargando clientes...');
      const data = await clienteService.getAll();
      console.log('Clientes cargados:', data);
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando clientes...</div>;
  }

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Nuevo Cliente</button>
      </div>

      {mostrarForm && (
        <FormCliente
          onClose={() => setMostrarForm(false)}
          onSuccess={cargarClientes}
        />
      )}

      <Card title="Lista de Clientes">
        {clientes.length === 0 ? (
          <div className="empty-state">
            <p>No hay clientes registrados</p>
            <p className="hint">Agrega clientes desde la consola de Firebase</p>
          </div>
        ) : (
          <div className="clientes-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.telefono || '-'}</td>
                    <td>{cliente.email || '-'}</td>
                    <td className={cliente.saldo_total > 0 ? 'saldo-deuda' : ''}>
                      ${cliente.saldo_total?.toLocaleString() || 0}
                    </td>
                    <td>
                      <span className={`badge ${cliente.activo ? 'activo' : 'inactivo'}`}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Clientes;
