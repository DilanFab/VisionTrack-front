export interface Persona {
  persona_id: number;
  genero_id: number;
  persona_cedula: string;
  persona_primer_nombre: string;
  persona_segundo_nombre: string | null;
  persona_primer_apellido: string;
  persona_segundo_apellido: string | null;
  persona_fecha_nacimiento: string;
  persona_direccion: string;
  persona_telefono: string;
  persona_correo: string;
  persona_estado: string; // 'A' | 'I'
}
