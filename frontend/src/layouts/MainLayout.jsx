// frontend/src/layouts/MainLayout.jsx

import { Link, Outlet, useLocation } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function MainLayout({ user }) {

  const location = useLocation();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
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

  const path = location.pathname;

  return (
    <div>

      {/* =======================================
          TOPBAR
      ======================================= */}
      {user && (
        <header className="topbar">

          {/* LOGO */}
          <Link to="/" className="brand">
            <span className="brand-mark"></span>

            <span>Plastipack</span>
          </Link>

          {/* =======================================
              NAV
          ======================================= */}
          <nav>

            {/* =======================================
                VENDEDOR
            ======================================= */}
            {user.rol === "vendedor" && (
              <>
                <Link
                  to="/pedidos"
                  className={
                    path.startsWith("/pedidos")
                      ? "active"
                      : ""
                  }
                >
                  Pedidos
                </Link>

                <Link
                  to="/pedidos/nuevo"
                  className={
                    path === "/pedidos/nuevo"
                      ? "active"
                      : ""
                  }
                >
                  Nuevo
                </Link>
              </>
            )}

            {/* =======================================
                JEFE / ADMIN
            ======================================= */}
            {(user.rol === "jefe" ||
              user.rol === "admin") && (
              <>
                <Link
                  to="/dashboard"
                  className={
                    path === "/dashboard"
                      ? "active"
                      : ""
                  }
                >
                  Inicio
                </Link>

                <Link
                  to="/referencias"
                  className={
                    path.startsWith("/referencias")
                      ? "active"
                      : ""
                  }
                >
                  Referencias
                </Link>

                <Link
                  to="/ordenes"
                  className={
                    path === "/ordenes"
                      ? "active"
                      : ""
                  }
                >
                  Órdenes
                </Link>

                <Link
                  to="/reportes"
                  className={
                    path === "/reportes"
                      ? "active"
                      : ""
                  }
                >
                  Reportes
                </Link>

                <Link
                  to="/admin/usuarios"
                  className={
                    path === "/admin/usuarios"
                      ? "active"
                      : ""
                  }
                >
                  Usuarios
                </Link>
              </>
            )}

            {/* =======================================
                OPERARIO
            ======================================= */}
            {user.rol === "operario" && (
              <Link
                to="/operario"
                className={
                  path === "/operario"
                    ? "active"
                    : ""
                }
              >
                Mi producción
              </Link>
            )}

          </nav>

          {/* =======================================
              USER CHIP
          ======================================= */}
          <div className="user-chip">

            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.nombre}
              />
            )}

            <span>
              {user.nombre.split(" ")[0]} ·{" "}
              {user.rol}
            </span>
          </div>

          {/* =======================================
              LOGOUT
          ======================================= */}
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              padding: "8px 12px",
              fontSize: ".8rem",
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            Salir
          </button>

        </header>
      )}

      {/* =======================================
          MAIN
      ======================================= */}
      <main className="shell">
        <Outlet />
      </main>

    </div>
  );
}