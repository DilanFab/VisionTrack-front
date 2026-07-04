import api from "../axios";
import type { Permiso } from "../../types/rolesPermisos/Permiso";

const BASE_URL = "/api/permisos";

export const getPermisos = async (): Promise<Permiso[]> => {
  const { data } = await api.get<Permiso[]>(BASE_URL);
  return data;
};

// Reemplaza por completo los permisos de un rol (borrado físico + recreación)
export const setPermisosDeRol = async (
  rolId: number,
  menuIds: number[]
): Promise<Permiso[]> => {
  const { data } = await api.put<Permiso[]>(`${BASE_URL}/rol/${rolId}`, {
    menu_ids: menuIds,
  });
  return data;
};
