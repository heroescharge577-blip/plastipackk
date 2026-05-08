// frontend/src/pages/Dashboard.jsx

import { Link } from "react-router-dom";

export default function Dashboard({ user }) {
  return (
    <div>

      {/* HEADER */}
      <div className="glass">
        <div className="flex-between">

          <div>
            <h1>
              Hola, {user.nombre.split(" ")[0]} 👋
            </h1>

            <p
              className="muted"
              style={{ margin: 0 }}
            >
              Panel de Jefe de Producción
            </p>
          </div>

          <Link
            to="/referencias/nueva"
            className="btn btn-primary"
          >
            + Nueva referencia
          </Link>

        </div>
      </div>

      {/* ATAJOS */}
      <div className="glass">

        <h2>Atajos</h2>

        <div className="stats">

          <Link
            to="/ordenes"
            className="stat"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="lbl">
              Órdenes activas
            </div>

            <div className="val neon">
              →
            </div>

            <div className="tiny">
              Ver pedidos en producción
            </div>
          </Link>

          <Link
            to="/referencias"
            className="stat"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="lbl">
              Catálogo
            </div>

            <div className="val neon">
              →
            </div>

            <div className="tiny">
              Gestionar referencias
            </div>
          </Link>

          <Link
            to="/reportes"
            className="stat"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="lbl">
              Producción
            </div>

            <div className="val neon">
              →
            </div>

            <div className="tiny">
              Reportes por turno
            </div>
          </Link>

          <Link
            to="/admin/usuarios"
            className="stat"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="lbl">
              Equipo
            </div>

            <div className="val neon">
              →
            </div>

            <div className="tiny">
              Asignar roles
            </div>
          </Link>

        </div>

      </div>

    </div>
  );
}