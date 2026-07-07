import type { Persona } from "../usuarios/Persona";
import type { EspecialidadMedica } from "../medicos/EspecialidadMedica";
import type { DiaSemana } from "../medicos/HorarioDoctor";
import type { EstadoCita } from "./EstadoCita";

export interface Cita {
  cita_id: number;
  horario_doctor_id: number;
  historia_clinica_id: number;
  cita_fecha: string;
  cita_motivo: string;
  estado_cita_id: number;
  horario_doctor: {
    horario_doctor_id: number;
    horario_doctor_dia: DiaSemana;
    horario_doctor_inicio: string;
    horario_doctor_fin: string;
    doctor: {
      doctor_id: number;
      especialidad_medica: EspecialidadMedica;
      perfil: {
        usuario: {
          persona: Persona;
        };
      };
    };
  };
  historia_clinica: {
    historia_clinica_id: number;
    historia_clinica_numero: string;
    perfil: {
      usuario: {
        persona: Persona;
      };
    };
  };
  estado_cita: EstadoCita;
}

export interface CitaPayload {
  horario_doctor_id: number;
  historia_clinica_id: number;
  cita_fecha: string; // "YYYY-MM-DD"
  cita_motivo: string;
  estado_cita_id?: number; // opcional al crear: el backend asigna "Programada"
}
