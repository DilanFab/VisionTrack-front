import api from "../axios";
import type { Paciente, PacientePayload } from "../../types/citas/Paciente";

const BASE_URL = "/api/pacientes-completos";

export const getPacientesCompletos = async (): Promise<Paciente[]> => {
  const { data } = await api.get<Paciente[]>(BASE_URL);
  return data;
};

export const createPacienteCompleto = async (payload: PacientePayload): Promise<Paciente> => {
  const { data } = await api.post<Paciente>(BASE_URL, payload);
  return data;
};

export const updatePacienteCompleto = async (id: number, payload: PacientePayload): Promise<Paciente> => {
  const { data } = await api.put<Paciente>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deletePacienteCompleto = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
