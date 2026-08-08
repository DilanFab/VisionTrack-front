import type { Producto } from "./inventario";

export type TarifaIva = 0 | 5 | 8 | 15;
export type MetodoPago = "Efectivo" | "Tarjeta" | "Transferencia";

export interface DetalleFactura {
  detalle_id: number;
  factura_id: number;
  producto_id: number | null;
  detalle_concepto: string;
  detalle_cantidad: number;
  detalle_precio_unit: number;
  detalle_tarifa_iva: TarifaIva;
  detalle_iva_valor: number;
  detalle_subtotal: number;
  detalle_total: number;
  producto?: Pick<Producto, "producto_nombre" | "producto_codigo"> | null;
}

export interface ClienteFactura {
  persona_id: number;
  persona_cedula: string;
  persona_primer_nombre: string;
  persona_primer_apellido: string;
  persona_correo: string;
  persona_telefono: string;
}

export interface Factura {
  factura_id: number;
  cliente_id: number;
  factura_numero: string;
  factura_fecha: string;
  metodo_pago: MetodoPago;
  subtotal_iva_0: number;
  subtotal_iva_5: number;
  subtotal_iva_8: number;
  subtotal_iva_15: number;
  iva_5: number;
  iva_8: number;
  iva_15: number;
  total: number;
  factura_notas?: string;
  factura_estado: "A" | "I";
  factura_creada: string;
  cliente?: ClienteFactura;
  detalles?: DetalleFactura[];
}

// Payload para crear factura
export interface DetalleInput {
  producto_id?: number | null;
  detalle_concepto: string;
  detalle_cantidad: number;
  detalle_precio_unit: number;
  detalle_tarifa_iva: TarifaIva;
}

export interface CreateFacturaPayload {
  cliente_id: number;
  metodo_pago: MetodoPago;
  factura_notas?: string;
  detalles: DetalleInput[];
}

export interface ResumenVentas {
  ventas_hoy: { total: number; cantidad: number };
  ventas_mes: { total: number; cantidad: number };
}
