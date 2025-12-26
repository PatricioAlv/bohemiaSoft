import { useState } from 'react';
import FormPago from '../../components/FormPago/FormPago';
import './Pagos.css';

function Pagos() {
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleSuccess = () => {
    console.log('Pago registrado exitosamente');
  };

  return (
    <div className="pagos-page">
      <div className="page-header">
        <h1>Pagos</h1>
        <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Registrar Pago</button>
      </div>

      {mostrarForm && (
        <FormPago
          onClose={() => setMostrarForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="empty-state">
        <h2>Registro de Pagos</h2>
        <p>Haz clic en "+ Registrar Pago" para registrar un pago de cliente</p>
        <p className="hint">Los pagos se aplicarán automáticamente a las ventas pendientes</p>
      </div>
    </div>
  );
}

export default Pagos;
