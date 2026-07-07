import api from "../axios";
import type { Doctor, DoctorPayload } from "../../types/medicos/Doctor";

const BASE_URL = "/api/doctores-completos";

export const getDoctoresCompletos = async (): Promise<Doctor[]> => {
  const { data } = await api.get<Doctor[]>(BASE_URL);
  return data;
};

export const createDoctorCompleto = async (payload: DoctorPayload): Promise<Doctor> => {
  const { data } = await api.post<Doctor>(BASE_URL, payload);
  return data;
};

export const updateDoctorCompleto = async (id: number, payload: DoctorPayload): Promise<Doctor> => {
  const { data } = await api.put<Doctor>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteDoctorCompleto = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
