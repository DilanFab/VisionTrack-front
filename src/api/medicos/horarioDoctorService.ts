import api from "../axios";
import type { HorarioDoctor, HorarioDoctorSlot } from "../../types/medicos/HorarioDoctor";

const BASE_URL = "/api/horarios-doctor";

export const getHorariosPorDoctor = async (doctorId: number): Promise<HorarioDoctor[]> => {
  const { data } = await api.get<HorarioDoctor[]>(`${BASE_URL}/doctor/${doctorId}`);
  return data;
};

export const setHorariosPorDoctor = async (
  doctorId: number,
  horarios: HorarioDoctorSlot[]
): Promise<HorarioDoctor[]> => {
  const { data } = await api.put<HorarioDoctor[]>(`${BASE_URL}/doctor/${doctorId}`, { horarios });
  return data;
};
