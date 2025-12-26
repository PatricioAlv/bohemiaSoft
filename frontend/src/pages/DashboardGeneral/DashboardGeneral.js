import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import Card from '../../components/Card/Card';
import StatCard from '../../components/StatCard/StatCard';
import { formatearMoneda, formatearFecha } from '../../utils/formatters';
import './DashboardGeneral.css';

function DashboardGeneral() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('hoy');

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      let resultado;

      if (periodo === 'hoy') {
        resultado = await dashboardService.getHoy();
      } else if (periodo === 'mes') {
        resultado = await dashboardService.getMes();
      }

      setData(resultado);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (!data) {
    return <div className="error">No se pudieron cargar los datos</div>;
  }

  return (
    <div className="dashboard-general">
      <div className="dashboard-header">
        <h1>Dashboard General</h1>
        <div className="periodo-selector">
          <button
            className={periodo === 'hoy' ? 'active' : ''}
            onClick={() => setPeriodo('hoy')}
          >
            Hoy
          </button>
          <button
            className={periodo === 'mes' ? 'active' : ''}
            onClick={() => setPeriodo('mes')}
          >
            Este Mes
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Vendido"
          value={data.ventas.total}
          subtitle={`${data.ventas.cantidad} ventas`}
          icon="💰"
          color="blue"
        />
        <StatCard
          title="Total Cobrado"
          value={data.cobros.total}
          subtitle={`${data.cobros.cantidad} pagos`}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Pendiente de Cobro"
          value={data.pendiente.total}
          subtitle={`${data.pendiente.cantidad} ventas`}
          icon="⏳"
          color="orange"
        />
        <StatCard
          title="Por Acreditar (Tarjetas)"
          value={data.por_acreditar.total}
          subtitle={`${data.por_acreditar.cantidad} liquidaciones`}
          icon="💳"
          color="red"
        />
      </div>

      <div className="dashboard-grid">
        <Card title="Resumen de Ventas">
          <div className="metric-row">
            <span className="metric-label">Promedio por venta:</span>
            <span className="metric-value">
              {formatearMoneda(data.ventas.promedio)}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Cantidad de ventas:</span>
            <span className="metric-value">{data.ventas.cantidad}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Total vendido:</span>
            <span className="metric-value total">
              {formatearMoneda(data.ventas.total)}
            </span>
          </div>
        </Card>

        <Card title="Estado de Cobros">
          <div className="metric-row">
            <span className="metric-label">Total cobrado:</span>
            <span className="metric-value success">
              {formatearMoneda(data.cobros.total)}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Pendiente de cobro:</span>
            <span className="metric-value warning">
              {formatearMoneda(data.pendiente.total)}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Por acreditar:</span>
            <span className="metric-value info">
              {formatearMoneda(data.por_acreditar.total)}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardGeneral;
