import api from "../axios";
import type {
  ExamenOptometrico,
  ExamenOptometricoPayload,
  ExamenOptometricoQuery,
  PaginatedExamenOptometricoResponse,
} from "../../types/examenes/ExamenOptometrico";

const BASE_URL = "/api/examenes-optometricos";

const toParams = (query?: ExamenOptometricoQuery) => {
  if (!query) return undefined;
  return Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value)])
  );
};

export const getExamenesOptometricos = async (
  query?: ExamenOptometricoQuery
): Promise<PaginatedExamenOptometricoResponse> => {
  const { data } = await api.get<PaginatedExamenOptometricoResponse>(BASE_URL, { params: toParams(query) });
  return data;
};

export const getExamenesPorHistoriaClinica = async (
  historiaClinicaId: number,
  query?: Omit<ExamenOptometricoQuery, "historia_clinica_id">
): Promise<PaginatedExamenOptometricoResponse> => {
  const { data } = await api.get<PaginatedExamenOptometricoResponse>(
    `/api/historias-clinicas/${historiaClinicaId}/examenes-optometricos`,
    { params: toParams(query) }
  );
  return data;
};

export const getExamenOptometrico = async (id: number): Promise<ExamenOptometrico> => {
  const { data } = await api.get<ExamenOptometrico>(`${BASE_URL}/${id}`);
  return data;
};

export const createExamenOptometrico = async (
  payload: ExamenOptometricoPayload
): Promise<ExamenOptometrico> => {
  const { data } = await api.post<ExamenOptometrico>(BASE_URL, payload);
  return data;
};

export const updateExamenOptometrico = async (
  id: number,
  payload: Partial<ExamenOptometricoPayload>
): Promise<ExamenOptometrico> => {
  const { data } = await api.put<ExamenOptometrico>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const finalizarExamenOptometrico = async (id: number): Promise<ExamenOptometrico> => {
  const { data } = await api.patch<ExamenOptometrico>(`${BASE_URL}/${id}/finalizar`, {});
  return data;
};

export const inactivarExamenOptometrico = async (id: number): Promise<ExamenOptometrico> => {
  const { data } = await api.delete<{ examen: ExamenOptometrico }>(`${BASE_URL}/${id}`);
  return data.examen;
};
