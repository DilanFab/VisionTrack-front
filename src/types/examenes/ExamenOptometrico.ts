import type { Cita } from "../citas/Cita";
import type { Paciente } from "../citas/Paciente";

export type ExamenOptometricoEstado = "B" | "F" | "I";

export type ExamenJsonSection = Record<string, unknown>;

export const EXAMEN_JSON_SECTION_FIELDS = [
  "lensometria",
  "agudeza_visual",
  "biomicroscopia",
  "reflejos_pupilares",
  "oftalmoscopia",
  "examen_motor",
  "queratometria",
  "refraccion",
] as const;

export type ExamenJsonSectionField = (typeof EXAMEN_JSON_SECTION_FIELDS)[number];

export interface ExamenOptometrico {
  examen_optometrico_id: number;
  historia_clinica_id: number;
  cita_id: number | null;
  examinador_id: number | null;
  examen_fecha: string | null;
  examen_hora: string | null;
  examen_consultorio: string | null;
  examen_llave: string | null;
  examen_motivo_consulta: string | null;
  examen_anamnesis: string | null;
  antecedentes_personales_oculares: string | null;
  antecedentes_personales_generales: string | null;
  antecedentes_familiares_oculares: string | null;
  antecedentes_familiares_generales: string | null;
  lensometria: ExamenJsonSection;
  agudeza_visual: ExamenJsonSection;
  biomicroscopia: ExamenJsonSection;
  reflejos_pupilares: ExamenJsonSection;
  oftalmoscopia: ExamenJsonSection;
  examen_motor: ExamenJsonSection;
  queratometria: ExamenJsonSection;
  refraccion: ExamenJsonSection;
  diagnostico_od: string | null;
  diagnostico_oi: string | null;
  diagnostico_motor: string | null;
  cie10: string | null;
  patologico_presuntivo: string | null;
  tratamiento_conducta: string | null;
  consentimiento_informado: boolean;
  consentimiento_firma: string | null;
  examen_nombre_examinador: string | null;
  examen_nivel_paralelo_jornada: string | null;
  examen_estado: ExamenOptometricoEstado;
  historia_clinica?: Paciente;
  cita?: Cita | null;
  examinador?: {
    usuario_id: number;
    usuario_nombre: string;
    persona?: unknown;
  } | null;
}

export interface PaginatedExamenOptometricoResponse {
  data: ExamenOptometrico[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExamenOptometricoQuery {
  page?: number;
  limit?: number;
  historia_clinica_id?: number;
  cita_id?: number;
  examinador_id?: number;
  examen_estado?: ExamenOptometricoEstado;
  fecha?: string;
}

export interface ExamenOptometricoPayload {
  historia_clinica_id: number;
  cita_id?: number | null;
  examinador_id?: number | null;
  examen_fecha?: string;
  examen_hora?: string | null;
  examen_consultorio?: string | null;
  examen_llave?: string | null;
  examen_motivo_consulta?: string | null;
  examen_anamnesis?: string | null;
  antecedentes_personales_oculares?: string | null;
  antecedentes_personales_generales?: string | null;
  antecedentes_familiares_oculares?: string | null;
  antecedentes_familiares_generales?: string | null;
  lensometria?: ExamenJsonSection;
  agudeza_visual?: ExamenJsonSection;
  biomicroscopia?: ExamenJsonSection;
  reflejos_pupilares?: ExamenJsonSection;
  oftalmoscopia?: ExamenJsonSection;
  examen_motor?: ExamenJsonSection;
  queratometria?: ExamenJsonSection;
  refraccion?: ExamenJsonSection;
  diagnostico_od?: string | null;
  diagnostico_oi?: string | null;
  diagnostico_motor?: string | null;
  cie10?: string | null;
  patologico_presuntivo?: string | null;
  tratamiento_conducta?: string | null;
  consentimiento_informado?: boolean;
  consentimiento_firma?: string | null;
  examen_nombre_examinador?: string | null;
  examen_nivel_paralelo_jornada?: string | null;
}

export const getExamenEstadoLabel = (estado: ExamenOptometricoEstado | string | null | undefined) => {
  if (estado === "B") return "Borrador";
  if (estado === "F") return "Finalizado";
  if (estado === "I") return "Inactivo";
  return "Sin estado";
};
