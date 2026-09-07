import api from "./axios";
import type { Producto } from "../types/inventario";
export interface Proveedor { proveedor_id:number; proveedor_ruc:string; proveedor_nombre:string; proveedor_telefono?:string; proveedor_correo?:string; }
export interface Compra { compra_id:number; compra_numero:string; compra_fecha:string; compra_total:number|string; proveedor:Proveedor; }
export const getProveedores=async()=> (await api.get<Proveedor[]>("/api/compras/proveedores")).data;
export const createProveedor=async(payload:Partial<Proveedor>)=> (await api.post<Proveedor>("/api/compras/proveedores",payload)).data;
export const getCompras=async()=> (await api.get<Compra[]>("/api/compras")).data;
export const createCompra=async(payload:unknown)=> (await api.post<Compra>("/api/compras",payload)).data;
export const createAbono=async(id:number,payload:unknown)=> (await api.post(`/api/compras/facturas/${id}/abonos`,payload)).data;
export const createNotaCredito=async(id:number,payload:unknown)=> (await api.post(`/api/compras/facturas/${id}/notas-credito`,payload)).data;
export const getReporte=async(tipo:string, params?:Record<string,string>)=> (await api.get(`/api/reportes/${tipo}`,{params})).data;
export type { Producto };
