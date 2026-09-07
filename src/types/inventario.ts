import type { ConfiguracionIva } from "./facturacion";

export interface CategoriaProducto {
  categoria_producto_id: number;
  categoria_producto_nombre: string;
  categoria_producto_descripcion?: string;
  categoria_producto_estado: string; // "A" | "I"
}

export interface Producto {
  producto_id: number;
  categoria_producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  producto_descripcion?: string;
  producto_precio_unitario: number;
  producto_stock_actual: number;
  producto_stock_minimo: number;
  producto_unidad_medida: string;
  producto_estado: string; // "A" | "I"
  iva_id?: number | null;
  categoria?: CategoriaProducto;
  configuracion_iva?: ConfiguracionIva | null;
}

export interface MovimientoInventario {
  movimiento_id: number;
  producto_id: number;
  usuario_id: number;
  movimiento_tipo: string; // "ENTRADA" | "SALIDA" | "AJUSTE"
  movimiento_cantidad: number;
  movimiento_motivo?: string;
  movimiento_fecha: string;
  producto?: Producto;
  usuario?: {
    usuario_id: number;
    usuario_nombre: string;
  };
}
