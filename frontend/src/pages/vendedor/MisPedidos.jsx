// frontend/src/pages/vendedor/MisPedidos.jsx

import { Link } from "react-router-dom";

export default function MisPedidos({ pedidos = [], user }) {

  return (
    <>
      <div className="glass">

        <div className="flex-between">

          <div>
            <h1>Pedidos</h1>

            <p
              className="muted"
              style={{ margin: 0 }}
            >
              {user?.rol === "vendedor"
                ? "Tus pedidos"
                : "Todos los pedidos"}
            </p>
          </div>

          {user?.rol === "vendedor" && (
            <Link
              to="/pedidos/nuevo"
              className="btn btn-primary"
            >
              + Nuevo pedido
            </Link>
          )}

        </div>

      </div>

      <div className="glass">

        {pedidos.length === 0 ? (

          <p className="muted">
            Aún no hay pedidos.
          </p>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>N°</th>
                  <th>Cliente</th>
                  <th>Items</th>

                  <th style={{ textAlign: "right" }}>
                    Total
                  </th>

                  <th>Entrega</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {pedidos.map((p) => (

                  <tr key={p._id}>

                    <td>
                      <strong>
                        {p.numero}
                      </strong>
                    </td>

                    <td>
                      {p.cliente?.nombre}
                    </td>

                    <td>
                      {p.items?.length} ref.
                    </td>

                    <td
                      style={{
                        textAlign: "right"
                      }}
                    >
                      $
                      {(p.total || 0).toLocaleString(
                        "es-CO"
                      )}
                    </td>

                    <td>
                      {new Date(
                        p.fechaEntrega
                      ).toLocaleDateString("es-CO")}
                    </td>

                    <td>

                      <span
                        className={`badge ${p.estadoGeneral}`}
                      >
                        {p.estadoGeneral.replace(
                          "_",
                          " "
                        )}
                      </span>

                    </td>

                    <td>

                      <Link
                        to={`/pedidos/${p._id}`}
                      >
                        Ver →
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>
    </>
  );
}