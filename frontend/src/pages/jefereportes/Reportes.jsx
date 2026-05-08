import { useEffect, useState } from "react";
import axios from "axios";

export default function Reportes() {
  const API = import.meta.env.VITE_API_URL;

  const [data, setData] = useState({
    totales: { turnos: 0, producido: 0, desperdicio: 0 },
    porSelladora: [],
    filasOperarios: [],
    ultimosLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar fechas con valores por defecto (últimos 7 días)
  const getDefaultDates = () => {
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    
    return {
      desde: hace7Dias.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0]
    };
  };

  const [desde, setDesde] = useState(getDefaultDates().desde);
  const [hasta, setHasta] = useState(getDefaultDates().hasta);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API}/api/reportes`, {
        params: {
          desde: desde || undefined,
          hasta: hasta || undefined,
        },
        withCredentials: true,
      });

      setData(res.data);
    } catch (error) {
      console.error("Error cargando reportes:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "No se pudieron cargar los reportes"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass">
        <h2>Cargando...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={cargarReportes}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="glass">
        <h1>Reportes de producción</h1>

        <div className="row cols-3">
          <div className="field">
            <label>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              onClick={cargarReportes}
              className="btn btn-primary btn-block"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <div className="glass">
        <h2>Totales</h2>

        <div className="stats">
          <div className="stat">
            <div className="lbl">Turnos</div>
            <div className="val">{data.totales?.turnos || 0}</div>
          </div>

          <div className="stat">
            <div className="lbl">Producción</div>
            <div className="val neon">{data.totales?.producido || 0}</div>
          </div>

          <div className="stat">
            <div className="lbl">Desperdicio</div>
            <div className="val">{data.totales?.desperdicio || 0}</div>
          </div>
        </div>
      </div>

      <div className="glass">
        <h2>Por selladora</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Selladora</th>
                <th>Turnos</th>
                <th>Producción</th>
                <th>Desperdicio</th>
              </tr>
            </thead>
            <tbody>
              {data.porSelladora?.map((s) => (
                <tr key={s._id}>
                  <td>Selladora {s._id}</td>
                  <td>{s.turnos}</td>
                  <td>{s.producido}</td>
                  <td>{s.desperdicio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass">
        <h2>Por operario</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Operario</th>
                <th>Turnos</th>
                <th>Producción</th>
                <th>Desperdicio</th>
              </tr>
            </thead>
            <tbody>
              {data.filasOperarios?.map((o) => (
                <tr key={o._id}>
                  <td>{o.nombre}</td>
                  <td>{o.turnos}</td>
                  <td>{o.producido}</td>
                  <td>{o.desperdicio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass">
        <h2>Últimos turnos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Operario</th>
                <th>Sell.</th>
                <th>Pedido</th>
                <th>SKU</th>
                <th>Rollo</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimosLogs?.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.horaInicio).toLocaleString("es-CO")}</td>
                  <td>{l.operario?.nombre}</td>
                  <td>{l.selladora}</td>
                  <td>{l.orden?.numero}</td>
                  <td>{l.referencia?.sku}</td>
                  <td>{l.numeroRollo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
