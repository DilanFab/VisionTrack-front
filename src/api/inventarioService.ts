import api from "./axios";
import type { CategoriaProducto, Producto, MovimientoInventario } from "../types/inventario";

// --- Categorías de Producto ---
const CATEGORIAS_URL = "/api/categorias-producto";

export const getCategoriasProducto = async (): Promise<CategoriaProducto[]> => {
  const { data } = await api.get<{ success: boolean; data: CategoriaProducto[] }>(CATEGORIAS_URL);
  return data.data;
};

export const createCategoriaProducto = async (
  payload: Omit<CategoriaProducto, "categoria_producto_id">
): Promise<CategoriaProducto> => {
  const { data } = await api.post<{ success: boolean; data: CategoriaProducto }>(CATEGORIAS_URL, payload);
  return data.data;
};

export const updateCategoriaProducto = async (
  id: number,
  payload: Partial<Omit<CategoriaProducto, "categoria_producto_id">>
): Promise<CategoriaProducto> => {
  const { data } = await api.put<{ success: boolean; data: CategoriaProducto }>(`${CATEGORIAS_URL}/${id}`, payload);
  return data.data;
};

export const deleteCategoriaProducto = async (id: number): Promise<void> => {
  await api.delete(`${CATEGORIAS_URL}/${id}`);
};

// --- Productos ---
const PRODUCTOS_URL = "/api/productos";

export const getProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get<{ success: boolean; data: Producto[] }>(PRODUCTOS_URL);
  return data.data;
};

export const getProductoById = async (id: number): Promise<Producto> => {
  const { data } = await api.get<{ success: boolean; data: Producto }>(`${PRODUCTOS_URL}/${id}`);
  return data.data;
};

export const getAlertasStockBajo = async (): Promise<Producto[]> => {
  const { data } = await api.get<{ success: boolean; data: Producto[] }>(`${PRODUCTOS_URL}/alertas-stock`);
  return data.data;
};

export const createProducto = async (
  payload: Omit<Producto, "producto_id" | "categoria" | "producto_estado">
): Promise<Producto> => {
  const { data } = await api.post<{ success: boolean; data: Producto }>(PRODUCTOS_URL, payload);
  return data.data;
};

export const updateProducto = async (
  id: number,
  payload: Partial<Omit<Producto, "producto_id" | "categoria">>
): Promise<Producto> => {
  const { data } = await api.put<{ success: boolean; data: Producto }>(`${PRODUCTOS_URL}/${id}`, payload);
  return data.data;
};

export const deleteProducto = async (id: number): Promise<void> => {
  await api.delete(`${PRODUCTOS_URL}/${id}`);
};

// --- Movimientos de Inventario ---
const MOVIMIENTOS_URL = "/api/movimientos-inventario";

export const getMovimientosInventario = async (): Promise<MovimientoInventario[]> => {
  const { data } = await api.get<{ success: boolean; data: MovimientoInventario[] }>(MOVIMIENTOS_URL);
  return data.data;
};

export interface CreateMovimientoPayload {
  producto_id: number;
  usuario_id: number;
  movimiento_tipo: string;
  movimiento_cantidad: number;
  movimiento_motivo?: string;
}

export const createMovimientoInventario = async (
  payload: CreateMovimientoPayload
): Promise<MovimientoInventario> => {
  const { data } = await api.post<{ success: boolean; data: MovimientoInventario }>(MOVIMIENTOS_URL, payload);
  return data.data;
};
