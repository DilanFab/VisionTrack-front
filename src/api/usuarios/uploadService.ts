import api from "../axios";

export const uploadImagenUsuario = async (archivo: Blob, nombre = "foto.jpg"): Promise<string> => {
  const formData = new FormData();
  formData.append("imagen", archivo, nombre);
  const { data } = await api.post<{ url: string }>("/api/uploads/imagen", formData, {
    headers: { "Content-Type": undefined },
  });
  return data.url;
};

// Guarda la foto directamente en VisionTrack-front/public/pacientes (servida
// por el propio frontend), a diferencia de uploadImagenUsuario que la guarda
// en el backend.
export const uploadImagenPaciente = async (archivo: Blob, nombre = "foto.jpg"): Promise<string> => {
  const formData = new FormData();
  formData.append("imagen", archivo, nombre);
  const { data } = await api.post<{ url: string }>("/api/uploads/imagen-paciente", formData, {
    headers: { "Content-Type": undefined },
  });
  return data.url;
};
