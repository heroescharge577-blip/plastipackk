import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Referencias from './pages/jefereferencias/Referencias.jsx';
import InventarioReferencias from './pages/jefereferencias/Inventario.jsx';
import NuevaReferencia from './pages/jefereferencias/NuevaReferencia.jsx';
import Ordenes from './pages/jefeordenes/ordenes.jsx';
import Reportes from './pages/jefereportes/Reportes.jsx';
import Usuarios from './pages/jefeusuarios/Usuarios.jsx';
import OperarioDashboard from './pages/Operario/OperarioDashboard.jsx';
import MisPedidos from './pages/vendedor/MisPedidos.jsx';
import NuevoPedido from './pages/vendedor/NuevoPedido.jsx';
import DetallePedido from './pages/vendedor/DetallePedido.jsx';

// Componente para proteger rutas privadas
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === 'pendiente') return <Navigate to="/sin-rol" replace />;
  return children;
}

// Componente para usuarios que aún no tienen rol asignado
function PendingRoute({ user }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'pendiente') return <Navigate to="/dashboard" replace />;

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#e67e22' }}>Cuenta en revisión ⏳</h2>
      <p>Hola <strong>{user.nombre}</strong>, tu acceso está pendiente de aprobación por el administrador.</p>
      <button 
        onClick={handleLogout}
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export function App() {
  const { user, loading } = useAuth();
  
  // Obtenemos la URL del backend desde el .env sincronizado
  const apiUrl = import.meta.env.VITE_API_URL;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <h3>Cargando Plastipack...</h3>
      </div>
    );
  }

  return (
    <Routes>
      {/* RUTA DE LOGIN */}
      <Route
        path="/login"
        element={
          !user ? (
            <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
              <h1 style={{ color: '#2c3e50', fontSize: '3rem' }}>PLASTIPACK</h1>
              <p>Sistema de Gestión de Producción</p>
              <br />
              <a
                href={`${apiUrl}/api/auth/google`}
                style={{
                  padding: '12px 24px',
                  background: '#4285F4',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                Iniciar sesión con Google
              </a>
            </div>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* RUTA PARA USUARIOS PENDIENTES */}
      <Route path="/sin-rol" element={<PendingRoute user={user} />} />

      {/* RUTAS PROTEGIDAS BAJO EL LAYOUT PRINCIPAL */}
      <Route element={<MainLayout user={user} />}>
        {/* Redirigir la raíz al Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
        
        {/* VENDEDOR */}
        <Route path="/pedidos" element={<ProtectedRoute user={user}><MisPedidos /></ProtectedRoute>} />
        <Route path="/pedidos/nuevo" element={<ProtectedRoute user={user}><NuevoPedido /></ProtectedRoute>} />
        <Route path="/pedidos/:id" element={<ProtectedRoute user={user}><DetallePedido /></ProtectedRoute>} />
        
        {/* JEFE / PRODUCCIÓN */}
        <Route path="/referencias" element={<ProtectedRoute user={user}><Referencias /></ProtectedRoute>} />
        <Route path="/referencias/inventario" element={<ProtectedRoute user={user}><InventarioReferencias /></ProtectedRoute>} />
        <Route path="/referencias/nueva" element={<ProtectedRoute user={user}><NuevaReferencia /></ProtectedRoute>} />
        <Route path="/ordenes" element={<ProtectedRoute user={user}><Ordenes /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute user={user}><Reportes /></ProtectedRoute>} />
        
        {/* ADMIN */}
        <Route path="/admin/usuarios" element={<ProtectedRoute user={user}><Usuarios /></ProtectedRoute>} />
        
        {/* OPERARIO */}
        <Route path="/operario" element={<ProtectedRoute user={user}><OperarioDashboard /></ProtectedRoute>} />
      </Route>

      {/* CAPTURAR CUALQUIER RUTA NO EXISTENTE */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}