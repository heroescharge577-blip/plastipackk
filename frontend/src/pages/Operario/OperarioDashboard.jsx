// frontend/src/pages/operario/OperarioDashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function OperarioDashboard() {

  const [selladora, setSelladora] = useState(1);

  const [itemsDisponibles, setItemsDisponibles] = useState([]);

  const [misLogs, setMisLogs] = useState([]);

  const [formData, setFormData] = useState({
    ordenId: "",
    itemId: "",
    referencia: "",
    numeroRollo: "",
    horaInicio: "",
    horaFin: "",
    cantidadProducida: "",
    desperdicio: 0,
    observaciones: "",
  });

  useEffect(() => {

    cargarDashboard();

    setHorasDefault();

  }, [selladora]);

  const cargarDashboard = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/api/production?selladora=${selladora}`,
        {
          withCredentials: true,
        }
      );

      setItemsDisponibles(
        res.data.itemsDisponibles
      );

      setMisLogs(
        res.data.misLogs
      );

    } catch (error) {

      console.error(error);

    }
  };

  const setHorasDefault = () => {

    const ahora = new Date();

    const antes = new Date(
      ahora.getTime() - 60 * 60 * 1000
    );

    const fmt = (d) => {

      const pad = (n) =>
        String(n).padStart(2, "0");

      return (
        d.getFullYear() +
        "-" +
        pad(d.getMonth() + 1) +
        "-" +
        pad(d.getDate()) +
        "T" +
        pad(d.getHours()) +
        ":" +
        pad(d.getMinutes())
      );
    };

    setFormData((prev) => ({
      ...prev,
      horaInicio: fmt(antes),
      horaFin: fmt(ahora),
    }));
  };

  const seleccionarItem = (item) => {

    setFormData((prev) => ({
      ...prev,
      ordenId: item.ordenId,
      itemId: item.itemId,
      referencia: `${item.referencia.sku} (${item.ordenNumero})`,
    }));
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const registrarTurno = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        `${API_URL}/api/production/turno`,
        {
          selladora,
          ordenId: formData.ordenId,
          itemId: formData.itemId,
          numeroRollo: formData.numeroRollo,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          cantidadProducida:
            formData.cantidadProducida,
          desperdicio:
            formData.desperdicio,
          observaciones:
            formData.observaciones,
        },
        {
          withCredentials: true,
        }
      );

      alert("Turno registrado");

      cargarDashboard();

      setFormData({
        ...formData,
        numeroRollo: "",
        cantidadProducida: "",
        desperdicio: 0,
        observaciones: "",
      });

    } catch (error) {

      console.error(error);

      alert("Error registrando turno");

    }
  };

  return (

    <div>

      {/* SELLADORAS */}
      <div className="glass">

        <h1>Mi producción</h1>

        <div className="machines">

          {[1, 2, 3, 4, 5].map((n) => (

            <button
              key={n}
              onClick={() =>
                setSelladora(n)
              }
              className={
                selladora === n
                  ? "machine active"
                  : "machine"
              }
            >
              Selladora {n}
            </button>

          ))}

        </div>

      </div>

      {/* ITEMS */}
      <div className="glass">

        <h2>Planilla del día</h2>

        {itemsDisponibles.length === 0 ? (

          <p>
            No hay referencias en producción
          </p>

        ) : (

          itemsDisponibles.map((it) => {

            const pct = Math.min(
              100,
              Math.round(
                (it.producido / it.cantidad) * 100
              )
            );

            return (

              <div
                key={it.itemId}
                className="item-card"
                onClick={() =>
                  seleccionarItem(it)
                }
              >

                <div>

                  <div className="sku">

                    {it.referencia.sku}
                    {" · "}
                    {it.ordenNumero}

                  </div>

                  <div className="nombre">
                    {it.referencia.nombre}
                  </div>

                  <div className="meta">

                    {it.producido}
                    {" / "}
                    {it.cantidad}
                    {" ud"}

                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['extrusion', 'impresion', 'sellado'].map((etapa) => (
                      <span
                        key={etapa}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '3px',
                          fontSize: '0.75em',
                          fontWeight: 'bold',
                          background: it.etapas?.[etapa]?.completada ? '#2ecc71' : it.etapaActual === etapa ? '#f39c12' : '#ddd',
                          color: it.etapas?.[etapa]?.completada || it.etapaActual === etapa ? '#fff' : '#666',
                        }}
                      >
                        {etapa.slice(0,3).toUpperCase()} {it.etapas?.[etapa]?.completada && '✓'}
                      </span>
                    ))}
                  </div>

                  <div className="progress">

                    <div
                      style={{
                        width: `${pct}%`,
                      }}
                    ></div>

                  </div>

                </div>

              </div>

            );
          })

        )}

      </div>

      {/* FORMULARIO */}
      <div className="glass">

        <h2>Registrar turno</h2>

        <form onSubmit={registrarTurno}>

          <div className="field">

            <label>
              Referencia seleccionada
            </label>

            <input
              value={formData.referencia}
              readOnly
            />

          </div>

          <div className="field">

            <label>
              Número de rollo
            </label>

            <input
              name="numeroRollo"
              value={formData.numeroRollo}
              onChange={handleChange}
              required
            />

          </div>

          <div className="row cols-2">

            <div className="field">

              <label>
                Hora inicio
              </label>

              <input
                type="datetime-local"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                required
              />

            </div>

            <div className="field">

              <label>
                Hora fin
              </label>

              <input
                type="datetime-local"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          <div className="row cols-2">

            <div className="field">

              <label>
                Cantidad producida
              </label>

              <input
                type="number"
                name="cantidadProducida"
                value={formData.cantidadProducida}
                onChange={handleChange}
                required
              />

            </div>

            <div className="field">

              <label>
                Desperdicio (kg)
              </label>

              <input
                type="number"
                step="0.01"
                name="desperdicio"
                value={formData.desperdicio}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="field">

            <label>
              Observaciones
            </label>

            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
            />

          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Guardar turno
          </button>

        </form>

      </div>

      {/* LOGS */}
      <div className="glass">

        <h2>
          Mis registros de hoy
        </h2>

        <table>

          <thead>

            <tr>
              <th>Hora</th>
              <th>Selladora</th>
              <th>Pedido</th>
              <th>SKU</th>
              <th>Rollo</th>
              <th>Producción</th>
            </tr>

          </thead>

          <tbody>

            {misLogs.map((log) => (

              <tr key={log._id}>

                <td>

                  {new Date(
                    log.horaInicio
                  ).toLocaleTimeString()}

                </td>

                <td>
                  {log.selladora}
                </td>

                <td>
                  {log.orden?.numero}
                </td>

                <td>
                  {log.referencia?.sku}
                </td>

                <td>
                  {log.numeroRollo}
                </td>

                <td>
                  {log.cantidadProducida}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}