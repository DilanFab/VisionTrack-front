const API_BASE = import.meta.env.VITE_API_URL as string;

// `usuario_imagen` se guarda como una ruta relativa servida por el backend
// (ej. "/uploads/usuarios/xxx.jpg"), así que hay que anteponerle la URL de
// la API para poder cargarla desde el frontend.
export const resolveUsuarioImagenUrl = (imagen: string | null | undefined): string | null => {
  if (!imagen || imagen === "default.png") return null;
  if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
  return `${API_BASE}${imagen}`;
};
