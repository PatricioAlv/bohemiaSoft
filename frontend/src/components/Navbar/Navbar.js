import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>BohemiaSoft</h1>
        <span className="navbar-subtitle">Gestión Comercial</span>
      </div>
      <ul className="navbar-menu">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/ventas">Ventas</Link></li>
        <li><Link to="/pagos">Pagos</Link></li>
        <li><Link to="/productos">Productos</Link></li>
        <li><Link to="/clientes">Clientes</Link></li>
        <li><Link to="/propietarios">Propietarios</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
