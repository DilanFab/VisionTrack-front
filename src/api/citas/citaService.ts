import api from "../axios";
import type { Cita, CitaPayload } from "../../types/citas/Cita";
import type { PaginatedResponse } from "../../types/Pagination";

const BASE_URL = "/api/citas";

export const getCitas = async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Cita>> => {
  const { data } = await api.get<PaginatedResponse<Cita>>(BASE_URL, { params });
  return data;
};

export const createCita = async (payload: CitaPayload): Promise<Cita> => {
  const { data } = await api.post<Cita>(BASE_URL, payload);
  return data;
};

export const updateCita = async (id: number, payload: CitaPayload): Promise<Cita> => {
  const { data } = await api.put<Cita>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteCita = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
