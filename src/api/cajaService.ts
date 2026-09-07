import api from "./axios";

export interface Caja {
  caja_id: number;
  caja_estado: "ABIERTA" | "CERRADA";
  caja_monto_inicial: number | string;
  caja_total_efectivo: number | string;
  caja_total_tarjeta: number | string;
  caja_total_transferencia: number | string;
  caja_total_ventas: number | string;
  caja_monto_vueltos: number | string;
  caja_monto_banco: number | string;
  caja_efectivo_contado?: number | string | null;
  caja_diferencia?: number | string | null;
  caja_observacion?: string | null;
  caja_fecha_apertura: string;
  caja_fecha_cierre?: string | null;
}

const URL = "/api/cajas";
export const getCajas = async () => (await api.get<Caja[]>(URL)).data;
export const getCajaAbierta = async () => (await api.get<Caja | null>(`${URL}/abierta`)).data;
export const abrirCaja = async (payload: { monto_inicial: number; observacion?: string }) => (await api.post<Caja>(`${URL}/abrir`, payload)).data;
export const cerrarCaja = async (id: number, payload: { efectivo_contado: number; monto_vueltos: number; monto_banco: number; observacion: string }) => (await api.post<Caja>(`${URL}/${id}/cerrar`, payload)).data;
export const registrarMovimientoCaja = async (payload: { tipo: string; monto: number; metodo_pago?: string; observacion?: string }) => (await api.post(`${URL}/movimientos`, payload)).data;
