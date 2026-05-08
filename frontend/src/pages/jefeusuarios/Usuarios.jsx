// frontend/src/pages/jefe/Usuarios.jsx

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function Usuarios() {

  const [pendientes, setPendientes] = useState([]);
  const [todos, setTodos] = useState([]);

  const roles = [
    "admin",
    "jefe",
    "vendedor",
    "operario",
  ];

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/api/admin/usuarios`,
        {
          withCredentials: true,
        }
      );

      setPendientes(res.data.pendientes);
      setTodos(res.data.todos);

    } catch (error) {
      console.error(error);
    }
  };

  const cambiarRol = async (id, rol) => {

    try {

      await axios.post(
        `${API_URL}/api/admin/usuarios/${id}/rol`,
        { rol },
        {
          withCredentials: true,
        }
      );

      cargarUsuarios();

    } catch (error) {

      console.error(error);

      alert("Error actualizando rol");
    }
  };

  return (

    <div className="usuarios-page">

      {/* HEADER */}
      <div className="glass">

        <h1>Gestión de usuarios</h1>

        <p className="muted">
          Asigna roles a los nuevos miembros del equipo.
        </p>

      </div>

      {/* PENDIENTES */}
      {pendientes.length > 0 && (

        <div className="glass">

          <h2>
            Cuentas pendientes ({pendientes.length})
          </h2>

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Asignar rol</th>
                </tr>
              </thead>

              <tbody>

                {pendientes.map((u) => (

                  <tr key={u._id}>

                    <td>
                      <strong>{u.nombre}</strong>
                    </td>

                    <td>{u.email}</td>

                    <td>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >

                        <select
                          defaultValue="vendedor"
                          id={`rol-${u._id}`}
                        >
                          <option value="vendedor">
                            Vendedor
                          </option>

                          <option value="operario">
                            Operario
                          </option>

                          <option value="jefe">
                            Jefe
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>

                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            cambiarRol(
                              u._id,
                              document.getElementById(
                                `rol-${u._id}`
                              ).value
                            )
                          }
                        >
                          Asignar
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* TODOS */}
      <div className="glass">

        <h2>
          Todos los usuarios ({todos.length})
        </h2>

        <div className="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol actual</th>
                <th>Cambiar</th>
              </tr>

            </thead>

            <tbody>

              {todos.map((u) => (

                <tr key={u._id}>

                  <td>
                    <strong>{u.nombre}</strong>
                  </td>

                  <td>{u.email}</td>

                  <td>

                    <span
                      className={`badge ${
                        u.rol === "pendiente"
                          ? "en_espera"
                          : "en_produccion"
                      }`}
                    >
                      {u.rol}
                    </span>

                  </td>

                  <td>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >

                      <select
                        defaultValue={u.rol}
                        id={`editrol-${u._id}`}
                      >

                        {roles.map((r) => (

                          <option
                            key={r}
                            value={r}
                          >
                            {r}
                          </option>

                        ))}

                      </select>

                      <button
                        className="btn"
                        onClick={() =>
                          cambiarRol(
                            u._id,
                            document.getElementById(
                              `editrol-${u._id}`
                            ).value
                          )
                        }
                      >
                        OK
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}