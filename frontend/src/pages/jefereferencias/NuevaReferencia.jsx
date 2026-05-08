import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NuevaReferencia() {

  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [tipos, setTipos] = useState([]);
  const [destinos, setDestinos] = useState([]);

  const [form, setForm] = useState({

    sku: "",
    nombre: "",
    tipo: "",
    materiaPrima: "",
    destino: "",

    ancho_cm: "",
    alto_cm: "",
    largo_m: "",

    calibre_mic: "",
    fuelle_cm: "",

    lleva_impresion: false,
    logo: "",
    colores: 0,

    impresionRefilado: false,
    sellado: true,

    pesoUnitario_g: "",
    stockDisponible: "",
    stockMinimo: "",
    notas: ""

  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {

    try {

      const res = await axios.get(
        `${API}/api/referencias/nueva`,
        {
          withCredentials: true,
        }
      );

      setTipos(res.data.tipos || []);
      setDestinos(res.data.destinos || []);

    } catch (error) {

      console.error(error);

    }
  };

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        `${API}/api/referencias`,
        form,
        {
          withCredentials: true,
        }
      );

      navigate("/referencias");

    } catch (err) {

      alert(
        err.response?.data?.error ||
        "Error al guardar referencia"
      );

    }
  };

  return (

    <div className="glass">

      <h1>Nueva referencia</h1>

      <form onSubmit={handleSubmit}>

        <div className="field">

          <label>SKU</label>

          <input
            name="sku"
            placeholder="SKU"
            onChange={handleChange}
            required
          />

        </div>

        <div className="field">

          <label>Nombre</label>

          <input
            name="nombre"
            placeholder="Nombre"
            onChange={handleChange}
            required
          />

        </div>

        <div className="field">

          <label>Tipo</label>

          <select
            name="tipo"
            onChange={handleChange}
            required
          >

            <option value="">
              Seleccione
            </option>

            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}

          </select>

        </div>

        <div className="field">

          <label>Materia prima</label>

          <input
            name="materiaPrima"
            placeholder="Materia prima"
            onChange={handleChange}
          />

        </div>

        <div className="field">

          <label>Destino</label>

          <select
            name="destino"
            onChange={handleChange}
          >

            <option value="">
              Seleccione
            </option>

            {destinos.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}

          </select>

        </div>

        <div className="field">

          <label>Stock disponible</label>

          <input
            name="stockDisponible"
            type="number"
            min="0"
            value={form.stockDisponible}
            onChange={handleChange}
          />

        </div>

        <div className="field">

          <label>Stock mínimo</label>

          <input
            name="stockMinimo"
            type="number"
            min="0"
            value={form.stockMinimo}
            onChange={handleChange}
          />

        </div>

        <button className="btn btn-primary">
          Guardar referencia
        </button>

      </form>

    </div>
  );
}