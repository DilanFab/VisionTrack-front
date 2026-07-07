import api from "../axios";
import type { EstadoCita } from "../../types/citas/EstadoCita";

const BASE_URL = "/api/estados-cita";

export const getEstadosCita = async (): Promise<EstadoCita[]> => {
  const { data } = await api.get<EstadoCita[]>(BASE_URL);
  return data;
};

export const createEstadoCita = async (
  payload: Omit<EstadoCita, "estado_cita_id">
): Promise<EstadoCita> => {
  const { data } = await api.post<EstadoCita>(BASE_URL, payload);
  return data;
};

export const updateEstadoCita = async (
  id: number,
  payload: Omit<EstadoCita, "estado_cita_id">
): Promise<EstadoCita> => {
  const { data } = await api.put<EstadoCita>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteEstadoCita = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
