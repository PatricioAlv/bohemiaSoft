import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import DashboardGeneral from './pages/DashboardGeneral/DashboardGeneral';
import DashboardPropietario from './pages/DashboardPropietario/DashboardPropietario';
import Productos from './pages/Productos/Productos';
import Clientes from './pages/Clientes/Clientes';
import Ventas from './pages/Ventas/Ventas';
import Pagos from './pages/Pagos/Pagos';
import Settings from './pages/Settings/Settings';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardGeneral />} />
            <Route path="/dashboard" element={<DashboardGeneral />} />
            <Route path="/propietarios" element={<DashboardPropietario />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/configuracion" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
