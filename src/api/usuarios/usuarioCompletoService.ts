import api from "../axios";
import type { UsuarioCompleto, UsuarioCompletoPayload } from "../../types/usuarios/UsuarioCompleto";

const BASE_URL = "/api/usuarios-completos";

export const getUsuariosCompletos = async (): Promise<UsuarioCompleto[]> => {
  const { data } = await api.get<UsuarioCompleto[]>(BASE_URL);
  return data;
};

export const createUsuarioCompleto = async (
  payload: UsuarioCompletoPayload
): Promise<UsuarioCompleto> => {
  const { data } = await api.post<UsuarioCompleto>(BASE_URL, payload);
  return data;
};

export const updateUsuarioCompleto = async (
  id: number,
  payload: UsuarioCompletoPayload
): Promise<UsuarioCompleto> => {
  const { data } = await api.put<UsuarioCompleto>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteUsuarioCompleto = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
