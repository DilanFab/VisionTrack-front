import api from "../axios";
import type { Menu } from "../../types/rolesPermisos/Menu";

const BASE_URL = "/api/menus";

export const getMenus = async (): Promise<Menu[]> => {
  const { data } = await api.get<Menu[]>(BASE_URL);
  return data;
};

export const createMenu = async (
  payload: Omit<Menu, "menu_id">
): Promise<Menu> => {
  const { data } = await api.post<Menu>(BASE_URL, payload);
  return data;
};

export const updateMenu = async (
  id: number,
  payload: Omit<Menu, "menu_id">
): Promise<Menu> => {
  const { data } = await api.put<Menu>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteMenu = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
