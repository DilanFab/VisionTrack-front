export interface Menu {
  menu_id: number;
  menu_padre: number | null;
  menu_nombre: string;
  menu_icono: string | null;
  menu_referencia: string | null;
  menu_estado: string; // 'A' | 'I'
}
