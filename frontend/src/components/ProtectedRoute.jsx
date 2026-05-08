// frontend/src/components/ProtectedRoute.jsx

// frontend/src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, roles, loading, children }) {

  // ⏳ Esperando respuesta del backend
  if (loading) {
    return <p>Cargando...</p>;
  }

  // ❌ No autenticado
  if (!user) {
    return <Navigate to="/" />;
  }

  // ⚠️ Sin rol asignado
  if (user.rol === "pendiente") {
    return <h2>Cuenta pendiente de rol</h2>;
  }

  // 🚫 Sin permisos
  if (roles && !roles.includes(user.rol) && user.rol !== "admin") {
    return <h2>Acceso denegado</h2>;
  }

  // ✅ Acceso permitido
  return children;
}