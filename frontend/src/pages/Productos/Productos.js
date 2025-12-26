import { useState, useEffect } from 'react';
import { productoService } from '../../services/productoService';
import Card from '../../components/Card/Card';
import FormProducto from '../../components/FormProducto/FormProducto';
import './Productos.css';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productoService.getAll();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="productos-page">
      <div className="page-header">
        <h1>Productos</h1>
        <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Nuevo Producto</button>
      </div>

      {mostrarForm && (
        <FormProducto
          onClose={() => setMostrarForm(false)}
          onSuccess={cargarProductos}
        />
      )}

      <Card title="Lista de Productos">
        {productos.length === 0 ? (
          <div className="empty-state">
            <p>No hay productos registrados</p>
            <p className="hint">Agrega productos desde la consola de Firebase o usando la API</p>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => (
              <div key={producto.id} className="producto-card">
                <h3>{producto.nombre}</h3>
                <p className="categoria">{producto.categoria}</p>
                <div className="producto-info">
                  <p><strong>Precio:</strong> ${producto.precio_venta.toLocaleString()}</p>
                  <p><strong>Stock:</strong> {producto.stock_actual}</p>
                  <p className={`estado ${producto.activo ? 'activo' : 'inactivo'}`}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Productos;
