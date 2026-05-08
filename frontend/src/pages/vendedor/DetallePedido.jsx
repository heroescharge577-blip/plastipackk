// frontend/src/pages/vendedor/DetallePedido.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

export default function DetallePedido() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/pedidos/${id}`,
        {
          withCredentials: true,
        }
      );
      setPedido(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar pedido:", err);
      setError("No se pudo cargar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (
    itemId,
    estado
  ) => {

    try {

      await axios.put(
        `${API_URL}/api/pedidos/${pedido._id}/items/${itemId}/estado`,
        { estado },
        {
          withCredentials: true,
        }
      );

      cargarPedido();

    } catch (err) {

      console.error(err);

    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando pedido...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
        <p>{error || 'Pedido no encontrado'}</p>
      </div>
    );
  }

  return (
    <>

      <div className="glass">

        <div className="flex-between">

          <div>

            <h1>
              {pedido.numero}
            </h1>

            <p className="muted">

              {pedido.cliente?.nombre}
              {" · "}
              {pedido.destino}

            </p>

          </div>

          <span
            className={`badge ${pedido.estadoGeneral}`}
          >
            {pedido.estadoGeneral.replace(
              "_",
              " "
            )}
          </span>

        </div>

      </div>

      <div className="glass">

        <h2>Etapas de producción</h2>

        {pedido.items?.map((it) => (

          <div key={it._id} style={{ marginBottom: '20px', padding: '15px', borderLeft: '4px solid #3498db' }}>

            <h4>{it.referencia?.sku} - {it.referencia?.nombre}</h4>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>

              {['extrusion', 'impresion', 'sellado'].map((etapa) => (

                <div

                  key={etapa}

                  style={{

                    padding: '10px 15px',

                    borderRadius: '4px',

                    background: it.etapas?.[etapa]?.completada ? '#2ecc71' : it.etapaActual === etapa ? '#f39c12' : '#ecf0f1',

                    color: it.etapas?.[etapa]?.completada || it.etapaActual === etapa ? '#fff' : '#555',

                    fontWeight: 'bold',

                    cursor: 'pointer',

                  }}

                >

                  {etapa.charAt(0).toUpperCase() + etapa.slice(1)}

                  {it.etapas?.[etapa]?.completada && ' ✓'}

                </div>

              ))}

            </div>

            <p style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>

              Etapa actual: <strong>{it.etapaActual}</strong>

            </p>

          </div>

        ))}

      </div>

      <div className="glass">

        <h2>Referencias</h2>

        <div className="table-wrap">

          <table>

            <thead>

              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Producido</th>
                <th>Valor unit.</th>
                <th>Estado</th>

                {(user?.rol === "jefe" ||
                  user?.rol === "admin") && (
                  <th>Acción</th>
                )}

              </tr>

            </thead>

            <tbody>

              {pedido.items?.map((it) => (

                <tr key={it._id}>

                  <td>

                    <strong>
                      {it.referencia?.sku}
                    </strong>

                  </td>

                  <td>
                    {it.referencia?.nombre}
                  </td>

                  <td>
                    {it.cantidad}
                  </td>

                  <td>
                    {it.producido || 0}
                  </td>

                  <td>

                    $
                    {it.valorUnitario.toLocaleString(
                      "es-CO"
                    )}

                  </td>

                  <td>

                    <span
                      className={`badge ${it.estado}`}
                    >
                      {it.estado.replace(
                        "_",
                        " "
                      )}
                    </span>

                  </td>

                  {(user?.rol === "jefe" ||
                    user?.rol === "admin") && (

                    <td>

                      <select
                        value={it.estado}
                        onChange={(e) =>
                          cambiarEstado(
                            it._id,
                            e.target.value
                          )
                        }
                      >

                        <option value="en_espera">
                          En espera
                        </option>

                        <option value="en_produccion">
                          En producción
                        </option>

                        <option value="completado">
                          Completado
                        </option>

                        <option value="entregado">
                          Entregado
                        </option>

                      </select>

                    </td>

                  )}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <p
          className="mt-12"
          style={{
            textAlign: "right",
          }}
        >

          Total: $

          {(pedido.total || 0).toLocaleString(
            "es-CO"
          )}

        </p>

      </div>

      {pedido.notas && (

        <div className="glass">

          <h3>Notas</h3>

          <p>
            {pedido.notas}
          </p>

        </div>

      )}

    </>
  );
}