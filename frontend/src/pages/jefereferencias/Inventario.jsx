import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function InventarioReferencias() {
  const API = import.meta.env.VITE_API_URL;
  const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarReferencias();
  }, []);

  const cargarReferencias = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/referencias/stock`, {
        withCredentials: true,
      });
      setReferencias(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  const vender = async (id, sku) => {
    const cantidad = Number(
      window.prompt(`Cantidad a vender de ${sku}:`, "1")
    );

    if (!cantidad || cantidad <= 0) {
      return;
    }

    try {
      await axios.post(
        `${API}/api/referencias/${id}/vender`,
        { cantidad },
        {
          withCredentials: true,
        }
      );
      cargarReferencias();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "No se pudo procesar la venta";
      alert(message);
    }
  };

  const ajustarStock = async (id, sku, currentDisponible, currentMinimo) => {
    const stockDisponible = Number(
      window.prompt(
        `Stock disponible para ${sku}:`,
        currentDisponible
      )
    );
    if (isNaN(stockDisponible) || stockDisponible < 0) {
      return;
    }

    const stockMinimo = Number(
      window.prompt(
        `Stock mínimo para ${sku}:`,
        currentMinimo
      )
    );
    if (isNaN(stockMinimo) || stockMinimo < 0) {
      return;
    }

    try {
      await axios.put(
        `${API}/api/referencias/${id}/stock`,
        { stockDisponible, stockMinimo },
        {
          withCredentials: true,
        }
      );
      cargarReferencias();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "No se pudo actualizar el stock";
      alert(message);
    }
  };

  const lowStockItems = referencias.filter((r) => r.lowStock);

  return (
    <div>
      <div className="glass">
        <div className="flex-between">
          <div>
            <h1>Inventario</h1>
            <p className="muted">
              Venta directa desde almacén y stock disponible
            </p>
            <p className="muted" style={{ marginTop: '8px' }}>
              Total referencias: {referencias.length} · Referencias con stock bajo: {lowStockItems.length}
            </p>
          </div>

          <Link to="/referencias" className="btn btn-secondary">
            Volver a referencias
          </Link>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="glass" style={{ borderColor: '#d35400' }}>
          <h2>Alerta de stock bajo</h2>
          <p>
            Existen {lowStockItems.length} referencias con stock igual o inferior al mínimo.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th>Stock mínimo</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((r) => (
                  <tr key={r._id}>
                    <td><strong>{r.sku}</strong></td>
                    <td>{r.nombre}</td>
                    <td>{r.stockDisponible ?? 0}</td>
                    <td>{r.stockMinimo ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="glass">
        {loading ? (
          <p>Cargando inventario...</p>
        ) : error ? (
          <p style={{ color: '#e74c3c' }}>{error}</p>
        ) : referencias.length === 0 ? (
          <p>No hay referencias en inventario.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Destino</th>
                  <th>Stock</th>
                  <th>Stock mínimo</th>
                  <th>Vender</th>
                </tr>
              </thead>
              <tbody>
                {referencias.map((r) => (
                  <tr key={r._id}>
                    <td><strong>{r.sku}</strong></td>
                    <td>{r.nombre}</td>
                    <td>{r.destino}</td>
                    <td>
                      {r.stockDisponible ?? 0}
                      {r.stockDisponible <= (r.stockMinimo ?? 0) ? (
                        <span style={{ marginLeft: 8, color: '#d35400' }}>
                          (bajo)
                        </span>
                      ) : null}
                    </td>
                    <td>{r.stockMinimo ?? 0}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ marginRight: '8px' }}
                        onClick={() => ajustarStock(r._id, r.sku, r.stockDisponible ?? 0, r.stockMinimo ?? 0)}
                      >
                        Ajustar
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => vender(r._id, r.sku)}
                      >
                        Vender
                      </button>
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
