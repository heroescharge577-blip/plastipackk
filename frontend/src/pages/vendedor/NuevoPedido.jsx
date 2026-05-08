// frontend/src/pages/vendedor/NuevoPedido.jsx

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function NuevoPedido() {

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [items, setItems] = useState([]);

  const fechaMinima = (() => {

    const d = new Date();

    d.setDate(d.getDate() + 15);

    return d.toISOString().split("T")[0];

  })();

  const [formData, setFormData] = useState({

    clienteNombre: "",
    clienteContacto: "",
    destino: "externo",
    fechaEntrega: fechaMinima,
    notas: "",

  });

  useEffect(() => {

    const buscar = async () => {

      if (busqueda.trim().length < 2) {
        setResultados([]);
        return;
      }

      try {

        const res = await axios.get(
          `${API_URL}/api/referencias?q=${busqueda}`,
          {
            withCredentials: true,
          }
        );

        setResultados(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(buscar, 300);

    return () => clearTimeout(timer);

  }, [busqueda]);

  const agregarItem = (ref) => {

    const existe = items.find(
      (i) => i.referencia === ref._id
    );

    if (existe) return;

    setItems([

      ...items,

      {
        referencia: ref._id,
        sku: ref.sku,
        nombre: ref.nombre,
        cantidad: 1000,
        valorUnitario: 0,
        stockDisponible: ref.stockDisponible || 0,
      },

    ]);
  };

  const eliminarItem = (id) => {

    setItems(
      items.filter(
        (i) => i.referencia !== id
      )
    );
  };

  const actualizarItem = (id, campo, valor) => {

    setItems(

      items.map((i) =>
        i.referencia === id
          ? { ...i, [campo]: valor }
          : i
      )

    );
  };

  const crearPedido = async (e) => {

    e.preventDefault();

    try {

      await axios.post(

        `${API_URL}/api/pedidos`,

        {
          ...formData,
          items,
        },

        {
          withCredentials: true,
        }

      );

      alert("Pedido creado correctamente");

    } catch (err) {

      console.error(err);

      const message = err.response?.data?.message || "Error creando pedido";
      if (err.response?.data?.faltantes) {
        const detalles = err.response.data.faltantes
          .map((f) => `${f.referencia}: ${f.cantidadSolicitada} > ${f.stockDisponible}`)
          .join('\n');
        alert(`${message}\n\n${detalles}`);
      } else {
        alert(message);
      }
    }
  };

  return (

    <div className="glass">

      <h1>Nuevo pedido</h1>

      <p className="muted">
        El pedido pasa automáticamente a producción.
      </p>

      <form onSubmit={crearPedido}>

        <div className="row cols-2">

          <div className="field">

            <label>Cliente</label>

            <input
              value={formData.clienteNombre}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  clienteNombre: e.target.value,
                })
              }
              required
            />

          </div>

          <div className="field">

            <label>Contacto</label>

            <input
              value={formData.clienteContacto}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  clienteContacto: e.target.value,
                })
              }
            />

          </div>

        </div>

        <div className="row cols-2">

          <div className="field">

            <label>Destino</label>

            <select
              value={formData.destino}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  destino: e.target.value,
                })
              }
            >

              <option value="externo">
                Cliente externo
              </option>

              <option value="interno">
                Consumo interno
              </option>

            </select>

          </div>

          <div className="field">

            <label>Fecha entrega</label>

            <input
              type="date"
              min={fechaMinima}
              value={formData.fechaEntrega}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fechaEntrega: e.target.value,
                })
              }
            />

          </div>

        </div>

        <div className="field">

          <label>Buscar referencia</label>

          <input
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            placeholder="Buscar SKU..."
          />

          {resultados.length > 0 && (

            <div className="autocomplete-list">

              {resultados.map((r) => (

                <div
                  key={r._id}
                  onClick={() => agregarItem(r)}
                >

                  <strong>{r.sku}</strong>
                  {" · "}
                  {r.nombre}
                  {" — stock: "}
                  {r.stockDisponible ?? 0}

                </div>

              ))}

            </div>

          )}

        </div>

        <div id="items-container">

          {items.map((it) => (

            <div
              className="line-item"
              key={it.referencia}
            >

              <div>

                <strong>{it.sku}</strong>

                <div className="tiny">
                  {it.nombre}
                </div>

                <div className="tiny" style={{ color: '#555' }}>
                  Stock disponible: {it.stockDisponible ?? 0}
                </div>

              </div>

              <input
                type="number"
                min="1"
                value={it.cantidad}
                onChange={(e) =>
                  actualizarItem(
                    it.referencia,
                    "cantidad",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={it.valorUnitario}
                onChange={(e) =>
                  actualizarItem(
                    it.referencia,
                    "valorUnitario",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  eliminarItem(it.referencia)
                }
              >
                ×
              </button>

            </div>

          ))}

        </div>

        <div className="field">

          <label>Notas</label>

          <textarea
            value={formData.notas}
            onChange={(e) =>
              setFormData({
                ...formData,
                notas: e.target.value,
              })
            }
          />

        </div>

        <button className="btn btn-primary btn-block">
          Crear pedido
        </button>

      </form>

    </div>
  );
}