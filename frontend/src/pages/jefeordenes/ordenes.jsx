// frontend/src/pages/jefe/Ordenes.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Ordenes() {

  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    obtenerOrdenes();
  }, []);

  const obtenerOrdenes = async () => {

    try {

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pedidos`,
        {
          withCredentials: true,
        }
      );

      setOrdenes(res.data);

    } catch (error) {

      console.error(error);

    }
  };

  const calcularDias = (fechaEntrega) => {

    const hoy = new Date();

    const entrega = new Date(fechaEntrega);

    return Math.ceil(
      (entrega - hoy) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div>

      <div className="glass">

        <h1>Órdenes activas</h1>

        <p className="muted">
          Pedidos no entregados,
          ordenados por fecha de entrega.
        </p>

      </div>

      <div className="glass">

        {ordenes.length === 0 ? (

          <p className="muted">
            No hay órdenes activas.
          </p>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>N°</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Items</th>
                  <th>Entrega</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {ordenes.map((o) => {

                  const dias = calcularDias(
                    o.fechaEntrega
                  );

                  return (

                    <tr key={o._id}>

                      <td>
                        <strong>{o.numero}</strong>
                      </td>

                      <td>
                        {o.cliente?.nombre}
                      </td>

                      <td>
                        {o.vendedor?.nombre || "—"}
                      </td>

                      <td>
                        {o.items?.length || 0} ref.
                      </td>

                      <td>

                        {new Date(
                          o.fechaEntrega
                        ).toLocaleDateString("es-CO")}

                        <div
                          className={`tiny ${
                            dias < 5
                              ? "badge en_espera"
                              : ""
                          }`}
                          style={{ marginTop: "4px" }}
                        >
                          {dias > 0
                            ? `${dias} días`
                            : "vencida"}
                        </div>

                      </td>

                      <td>

                        <span
                          className={`badge ${o.estadoGeneral}`}
                        >
                          {o.estadoGeneral?.replace(
                            "_",
                            " "
                          )}
                        </span>

                      </td>

                      <td>

                        <Link
                          to={`/pedidos/${o._id}`}
                        >
                          Gestionar →
                        </Link>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}