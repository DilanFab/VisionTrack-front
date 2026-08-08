import api from "./axios";
import type {
  Factura,
  CreateFacturaPayload,
  ResumenVentas,
} from "../types/facturacion";

const URL = "/api/facturas";

export const getFacturas = async (): Promise<Factura[]> => {
  const { data } = await api.get<{ success: boolean; data: Factura[] }>(URL);
  return data.data;
};

export const getFacturaById = async (id: number): Promise<Factura> => {
  const { data } = await api.get<{ success: boolean; data: Factura }>(`${URL}/${id}`);
  return data.data;
};

export const createFactura = async (
  payload: CreateFacturaPayload
): Promise<Factura> => {
  const { data } = await api.post<{ success: boolean; data: Factura }>(URL, payload);
  return data.data;
};

export const anularFactura = async (id: number): Promise<void> => {
  await api.patch(`${URL}/${id}/anular`);
};

export const getResumenVentas = async (): Promise<ResumenVentas> => {
  const { data } = await api.get<{ success: boolean; data: ResumenVentas }>(`${URL}/resumen`);
  return data.data;
};
