import { useState } from 'react';
import FormVenta from '../../components/FormVenta/FormVenta';
import './Ventas.css';

function Ventas() {
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleSuccess = () => {
    // Aquí se podría recargar la lista de ventas
    console.log('Venta registrada exitosamente');
  };

  return (
    <div className="ventas-page">
      <div className="page-header">
        <h1>Ventas</h1>
        <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Nueva Venta</button>
      </div>

      {mostrarForm && (
        <FormVenta
          onClose={() => setMostrarForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="empty-state">
        <h2>Registro de Ventas</h2>
        <p>Haz clic en "+ Nueva Venta" para registrar una venta</p>
        <p className="hint">Las ventas se registrarán y podrás ver el historial próximamente</p>
      </div>
    </div>
  );
}

export default Ventas;
