const API_BASE = import.meta.env.VITE_API_URL as string;

const isLocalApiOrigin = () => {
  if (!API_BASE || typeof window === "undefined") return false;
  try {
    const apiUrl = new URL(API_BASE);
    return apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

// `usuario_imagen` se guarda como ruta relativa servida por el backend
// (ej. "/uploads/usuarios/xxx.jpg"). En desarrollo se sirve mediante el
// proxy de Vite para evitar el bloqueo `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`
// provocado por las cabeceras de Helmet al cargar imágenes cross-origin.
export const resolveUsuarioImagenUrl = (imagen: string | null | undefined): string | null => {
  if (!imagen || imagen === "default.png") return null;
  if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
  if (import.meta.env.DEV && imagen.startsWith("/uploads/") && isLocalApiOrigin()) return imagen;
  return `${API_BASE}${imagen}`;
};
