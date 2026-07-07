import api from "../axios";
import type { EspecialidadMedica } from "../../types/medicos/EspecialidadMedica";

const BASE_URL = "/api/especialidades-medicas";

export const getEspecialidadesMedicas = async (): Promise<EspecialidadMedica[]> => {
  const { data } = await api.get<EspecialidadMedica[]>(BASE_URL);
  return data;
};

export const createEspecialidadMedica = async (
  payload: Omit<EspecialidadMedica, "especialidad_medica_id">
): Promise<EspecialidadMedica> => {
  const { data } = await api.post<EspecialidadMedica>(BASE_URL, payload);
  return data;
};

export const updateEspecialidadMedica = async (
  id: number,
  payload: Omit<EspecialidadMedica, "especialidad_medica_id">
): Promise<EspecialidadMedica> => {
  const { data } = await api.put<EspecialidadMedica>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteEspecialidadMedica = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
