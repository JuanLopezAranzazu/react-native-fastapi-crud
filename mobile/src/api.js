// Capa de acceso a la API. Las pantallas nunca llaman a fetch directamente:
// así, si algo cambia (URL, headers, token), lo cambias en un solo lugar.
import { API_URL } from "./config";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (e) {
    // fetch solo falla así cuando no hay conexión con el servidor
    throw new Error("No se pudo conectar con el servidor. Revisa la URL en src/config.js");
  }

  if (res.status === 204) return null; // DELETE no devuelve contenido

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // FastAPI devuelve { detail: "texto" } o { detail: [ {msg: ...}, ... ] } (validación 422)
    let message = "Ocurrió un error inesperado";
    if (typeof data?.detail === "string") message = data.detail;
    else if (Array.isArray(data?.detail)) message = data.detail.map((d) => d.msg).join("\n");
    throw new Error(message);
  }
  return data;
}

export const getUsers = (search = "") =>
  request(`/users?search=${encodeURIComponent(search)}`);

export const createUser = (user) =>
  request("/users", { method: "POST", body: JSON.stringify(user) });

export const updateUser = (id, user) =>
  request(`/users/${id}`, { method: "PUT", body: JSON.stringify(user) });

export const deleteUser = (id) => request(`/users/${id}`, { method: "DELETE" });
