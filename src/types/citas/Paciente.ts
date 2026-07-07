import type { Persona } from "../usuarios/Persona";
import type { Rol } from "../rolesPermisos/Rol";

export interface Paciente {
  historia_clinica_id: number;
  historia_clinica_numero: string;
  historia_clinica_fecha_apertura: string;
  historia_clinica_estado: string; // 'A' | 'I'
  perfil: {
    perfil_id: number;
    usuario_id: number;
    rol_id: number;
    perfil_estado: string;
    rol: Rol;
    usuario: {
      usuario_id: number;
      usuario_nombre: string;
      usuario_imagen: string;
      usuario_estado: string;
      persona: Persona;
    };
  };
}

export interface PacientePayload {
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
  historia_clinica_estado: string;
}
