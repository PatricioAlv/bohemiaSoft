import './StatCard.css';
import { formatearMoneda } from '../../utils/formatters';

function StatCard({ title, value, subtitle, icon, color = 'blue' }) {
  const displayValue = typeof value === 'number' && title.toLowerCase().includes('total')
    ? formatearMoneda(value)
    : value;

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-content">
        <div className="stat-card-header">
          {icon && <span className="stat-card-icon">{icon}</span>}
          <span className="stat-card-title">{title}</span>
        </div>
        <div className="stat-card-value">{displayValue}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatCard;
