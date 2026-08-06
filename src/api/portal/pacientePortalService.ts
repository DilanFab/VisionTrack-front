import api from "../axios";
import type { Cita } from "../../types/citas/Cita";
import type { Doctor } from "../../types/medicos/Doctor";
import type { HorarioDoctor } from "../../types/medicos/HorarioDoctor";
import { unwrapApiList, type PaginatedApiResponse } from "../../lib/apiList";

export interface HorarioOcupado {
  horario_doctor_id: number;
  cita_fecha: string;
}

export interface CrearCitaPacientePayload {
  horario_doctor_id: number;
  fecha: string;
  motivo: string;
}

export const getMisCitasPaciente = async (): Promise<Cita[]> => {
  const { data } = await api.get<Cita[] | PaginatedApiResponse<Cita>>("/api/movil/mis-citas");
  return unwrapApiList(data);
};

export const getDoctoresPaciente = async (): Promise<Doctor[]> => {
  const { data } = await api.get<Doctor[]>("/api/movil/doctores");
  return data;
};

export const getHorariosDoctorPaciente = async (doctorId: number): Promise<HorarioDoctor[]> => {
  const { data } = await api.get<HorarioDoctor[]>(`/api/movil/horarios-doctor/${doctorId}`);
  return data;
};

export const getOcupadosDoctorPaciente = async (
  doctorId: number,
  desde: string,
  hasta: string
): Promise<HorarioOcupado[]> => {
  const { data } = await api.get<HorarioOcupado[]>(`/api/movil/ocupados/${doctorId}`, {
    params: { desde, hasta },
  });
  return data;
};

export const crearCitaPaciente = async (payload: CrearCitaPacientePayload): Promise<Cita> => {
  const { data } = await api.post<Cita>("/api/movil/agendar", payload);
  return data;
};

export const confirmarCitaPaciente = async (citaId: number): Promise<Cita> => {
  const { data } = await api.patch<Cita>(`/api/movil/mis-citas/${citaId}/confirmar`);
  return data;
};

export const cancelarCitaPaciente = async (citaId: number): Promise<Cita> => {
  const { data } = await api.patch<Cita>(`/api/movil/mis-citas/${citaId}/cancelar`);
  return data;
};
