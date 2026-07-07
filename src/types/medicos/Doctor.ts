import type { Persona } from "../usuarios/Persona";
import type { EspecialidadMedica } from "./EspecialidadMedica";

export interface Doctor {
  doctor_id: number;
  especialidad_medica_id: number;
  doctor_estado: string; // 'A' | 'I'
  especialidad_medica: EspecialidadMedica;
  perfil: {
    perfil_id: number;
    usuario_id: number;
    rol_id: number;
    perfil_estado: string;
    usuario: {
      usuario_id: number;
      usuario_nombre: string;
      usuario_imagen: string;
      usuario_estado: string;
      persona: Persona;
    };
  };
}

export interface DoctorPayload {
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
  especialidad_medica_id: number;
  doctor_estado: string;
}
