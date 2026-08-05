import api from "./axios";
import type { Menu } from "../types/rolesPermisos/Menu";

export const getNavigationMenus = async (): Promise<Menu[]> => {
  const { data } = await api.get<Menu[]>("/api/auth/navigation");
  return data;
};
