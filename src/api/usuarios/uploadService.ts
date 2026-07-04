import api from "../axios";

export const uploadImagenUsuario = async (archivo: Blob, nombre = "foto.jpg"): Promise<string> => {
  const formData = new FormData();
  formData.append("imagen", archivo, nombre);
  const { data } = await api.post<{ url: string }>("/api/uploads/imagen", formData, {
    headers: { "Content-Type": undefined },
  });
  return data.url;
};
