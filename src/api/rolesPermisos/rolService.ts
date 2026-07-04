import api from "../axios";
import type { Rol } from "../../types/rolesPermisos/Rol";

const BASE_URL = "/api/roles";

export const getRoles = async (): Promise<Rol[]> => {
  const { data } = await api.get<Rol[]>(BASE_URL);
  return data;
};

export const createRol = async (
  payload: Omit<Rol, "rol_id">
): Promise<Rol> => {
  const { data } = await api.post<Rol>(BASE_URL, payload);
  return data;
};

export const updateRol = async (
  id: number,
  payload: Omit<Rol, "rol_id">
): Promise<Rol> => {
  const { data } = await api.put<Rol>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteRol = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
