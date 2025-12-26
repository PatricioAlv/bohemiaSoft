import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import Card from '../../components/Card/Card';
import StatCard from '../../components/StatCard/StatCard';
import { formatearMoneda, formatearFecha } from '../../utils/formatters';
import './DashboardPropietario.css';

function DashboardPropietario() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [propietarioId, setPropietarioId] = useState('');
  const [periodo, setPeriodo] = useState('mes');

  const cargarDatos = async () => {
    if (!propietarioId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Simular fechas según período
      const hoy = new Date();
      let fechaInicio, fechaFin;

      if (periodo === 'mes') {
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      }

      const resultado = await dashboardService.getPropietario(
        propietarioId,
        fechaInicio.toISOString(),
        fechaFin.toISOString()
      );

      setData(resultado);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propietarioId) {
      cargarDatos();
    }
  }, [propietarioId, periodo]);

  return (
    <div className="dashboard-propietario">
      <div className="dashboard-header">
        <h1>Dashboard por Propietario</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="ID del Propietario"
            value={propietarioId}
            onChange={(e) => setPropietarioId(e.target.value)}
            className="propietario-input"
          />
        </div>
      </div>

      {loading && <div className="loading">Cargando...</div>}

      {!loading && data && (
        <>
          <div className="propietario-info">
            <h2>{data.propietario.nombre}</h2>
            <p className="periodo-info">
              Período: {formatearFecha(data.periodo.inicio)} -{' '}
              {formatearFecha(data.periodo.fin)}
            </p>
          </div>

          <div className="stats-grid">
            <StatCard
              title="Total Vendido"
              value={data.vendido}
              icon="💰"
              color="blue"
            />
            <StatCard
              title="Total Cobrado"
              value={data.cobrado}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Pendiente de Cobro"
              value={data.pendiente_cobro}
              icon="⏳"
              color="orange"
            />
            <StatCard
              title="Por Acreditar"
              value={data.por_acreditar.total}
              subtitle={`${data.por_acreditar.cantidad} pendientes`}
              icon="💳"
              color="red"
            />
          </div>

          {data.por_acreditar.detalle.length > 0 && (
            <Card title="Próximas Acreditaciones">
              <div className="acreditaciones-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha Estimada</th>
                      <th>Venta</th>
                      <th>Monto Bruto</th>
                      <th>Comisión</th>
                      <th>Monto Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.por_acreditar.detalle.map((acred, index) => (
                      <tr key={index}>
                        <td>{formatearFecha(acred.fecha_estimada)}</td>
                        <td>{acred.venta_id.substring(0, 8)}...</td>
                        <td>{formatearMoneda(acred.monto_bruto)}</td>
                        <td className="comision">
                          {formatearMoneda(acred.comision)}
                        </td>
                        <td className="monto-neto">
                          {formatearMoneda(acred.monto_neto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPropietario;
