import api from "../axios";
import type { ConfiguracionIva, ConfiguracionIvaPayload } from "../../types/facturacion";

const URL = "/api/configuracion-iva";

export const getConfiguracionesIva = async (soloActivos = false): Promise<ConfiguracionIva[]> => {
  const params = soloActivos ? "?soloActivos=true" : "";
  const { data } = await api.get<{ success: boolean; data: ConfiguracionIva[] }>(`${URL}${params}`);
  return data.data;
};

export const getConfiguracionIvaById = async (id: number): Promise<ConfiguracionIva> => {
  const { data } = await api.get<{ success: boolean; data: ConfiguracionIva }>(`${URL}/${id}`);
  return data.data;
};

export const createConfiguracionIva = async (payload: ConfiguracionIvaPayload): Promise<ConfiguracionIva> => {
  const { data } = await api.post<{ success: boolean; data: ConfiguracionIva }>(URL, payload);
  return data.data;
};

export const updateConfiguracionIva = async (id: number, payload: Partial<ConfiguracionIvaPayload>): Promise<ConfiguracionIva> => {
  const { data } = await api.put<{ success: boolean; data: ConfiguracionIva }>(`${URL}/${id}`, payload);
  return data.data;
};

export const deleteConfiguracionIva = async (id: number): Promise<void> => {
  await api.delete(`${URL}/${id}`);
};
