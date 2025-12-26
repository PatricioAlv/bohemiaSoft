import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import DashboardGeneral from './pages/DashboardGeneral/DashboardGeneral';
import DashboardPropietario from './pages/DashboardPropietario/DashboardPropietario';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardGeneral />} />
            <Route path="/propietarios" element={<DashboardPropietario />} />
            {/* Aquí se agregarían más rutas */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
