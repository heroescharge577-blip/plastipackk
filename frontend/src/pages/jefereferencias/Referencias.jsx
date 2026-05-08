import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Referencias() {

  const API = import.meta.env.VITE_API_URL;

  const [referencias, setReferencias] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    cargarReferencias();
  }, []);

  const cargarReferencias = async () => {

    try {

      const res = await axios.get(
        `${API}/api/referencias?q=${q}`,
        {
          withCredentials: true,
        }
      );

      setReferencias(res.data);

    } catch (err) {

      console.error(err);

    }
  };

  return (

    <div>

      <div className="glass">

        <div className="flex-between">

          <div>

            <h1>Referencias</h1>

            <p className="muted">
              Catálogo de SKU activos
            </p>

          </div>

          <div>
            <Link
              to="/referencias/inventario"
              className="btn btn-secondary"
              style={{ marginRight: '10px' }}
            >
              Inventario
            </Link>
            <Link
              to="/referencias/nueva"
              className="btn btn-primary"
            >
              + Nueva
            </Link>
          </div>

        </div>

        <div className="field mt-12">

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            placeholder="Buscar por SKU, nombre o materia prima..."
          />

          <button
            className="btn mt-12"
            onClick={cargarReferencias}
          >
            Buscar
          </button>

        </div>

      </div>

      <div className="glass">

        {!referencias.length ? (

          <p>No hay referencias.</p>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Materia Prima</th>
                  <th>Destino</th>
                  <th>Stock</th>
                  <th>Impresión</th>
                </tr>

              </thead>

              <tbody>

                {referencias.map((r) => (

                  <tr key={r._id}>

                    <td>
                      <strong>{r.sku}</strong>
                    </td>

                    <td>{r.nombre}</td>

                    <td>{r.tipo}</td>

                    <td>{r.materiaPrima}</td>

                    <td>{r.destino}</td>

                    <td>
                      {r.stockDisponible ?? 0}
                      {r.stockMinimo > 0 ? ` / min ${r.stockMinimo}` : ''}
                      {r.stockDisponible <= (r.stockMinimo ?? 0) ? (
                        <span style={{ marginLeft: 8, color: '#d35400' }}>
                          (bajo)
                        </span>
                      ) : null}
                    </td>

                    <td>

                      {r.impresion?.lleva
                        ? `Sí (${r.impresion.colores} col.)`
                        : "—"}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}