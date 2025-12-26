import { useState, useEffect } from 'react';
import api from '../../services/api';
import './FormVenta.css';

function FormVenta({ onClose, onSuccess }) {
  const [productos, setProductos] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosVenta, setProductosVenta] = useState([{ producto_id: '', cantidad: 1 }]);
  const [medio_pago_id, setMedioPagoId] = useState('');
  const [cliente_id, setClienteId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodRes, mediosRes, clientesRes] = await Promise.all([
        api.get('/productos'),
        api.get('/medios-pago'),
        api.get('/clientes')
      ]);
      
      setProductos(prodRes.data.data || prodRes.data);
      setMediosPago(mediosRes.data.data || mediosRes.data);
      setClientes(clientesRes.data.data || clientesRes.data);
      
      const medios = mediosRes.data.data || mediosRes.data;
      if (medios.length > 0) {
        setMedioPagoId(medios[0].id);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const agregarProducto = () => {
    setProductosVenta([...productosVenta, { producto_id: '', cantidad: 1 }]);
  };

  const eliminarProducto = (index) => {
    setProductosVenta(productosVenta.filter((_, i) => i !== index));
  };

  const cambiarProducto = (index, field, value) => {
    const nuevos = [...productosVenta];
    nuevos[index][field] = value;
    setProductosVenta(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const venta = {
        productos: productosVenta.map(p => ({
          producto_id: p.producto_id,
          cantidad: parseInt(p.cantidad)
        })),
        medio_pago_id,
        cliente_id: cliente_id || null
      };

      await api.post('/ventas', venta);
      alert('Venta registrada exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar venta: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva Venta</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Productos</h3>
            {productosVenta.map((item, index) => (
              <div key={index} className="producto-row">
                <div className="form-group flex-1">
                  <select
                    value={item.producto_id}
                    onChange={(e) => cambiarProducto(index, 'producto_id', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} - ${p.precio_venta.toLocaleString()} (Stock: {p.stock_actual})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ width: '120px' }}>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => cambiarProducto(index, 'cantidad', e.target.value)}
                    placeholder="Cant."
                    required
                  />
                </div>

                {productosVenta.length > 1 && (
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => eliminarProducto(index)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="btn-add" onClick={agregarProducto}>
              + Agregar Producto
            </button>
          </div>

          <div className="form-section">
            <h3>Detalles de Pago</h3>
            
            <div className="form-group">
              <label>Medio de Pago *</label>
              <select value={medio_pago_id} onChange={(e) => setMedioPagoId(e.target.value)} required>
                {mediosPago.map(mp => (
                  <option key={mp.id} value={mp.id}>
                    {mp.tipo} {mp.tarjeta ? `- ${mp.tarjeta}` : ''} 
                    {mp.plan_cuotas > 1 ? ` (${mp.plan_cuotas} cuotas)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cliente (Opcional)</label>
              <select value={cliente_id} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Sin cliente / Venta directa</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormVenta;
