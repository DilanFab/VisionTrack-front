import type { Persona } from "./Persona";
import type { Rol } from "../rolesPermisos/Rol";

export interface UsuarioCompleto {
  usuario_id: number;
  usuario_nombre: string;
  usuario_imagen: string;
  usuario_estado: string; // 'A' | 'I'
  persona: Persona;
  perfiles: Array<{
    perfil_id: number;
    rol_id: number;
    perfil_estado: string;
    rol: Rol;
    doctor?: {
      doctor_id: number;
      especialidad_medica_id: number;
      doctor_estado: string;
      especialidad_medica?: {
        especialidad_medica_id: number;
        especialidad_medica_nombre: string;
      };
    } | null;
    historias_clinicas?: Array<{
      historia_clinica_id: number;
      historia_clinica_numero: string;
    }>;
  }>;
}

export interface UsuarioCompletoPayload {
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
  usuario_nombre: string;
  usuario_contrasena?: string;
  usuario_imagen: string;
  usuario_estado: string;
  rol_ids: number[];
  especialidad_medica_id?: number;
}
