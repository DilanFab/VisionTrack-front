import type { Persona } from "../../types/usuarios/Persona";
import type { Cita } from "../../types/citas/Cita";
import type { ExamenOptometricoEstado } from "../../types/examenes/ExamenOptometrico";

export const nombreCompletoPersona = (persona: Persona) =>
  [persona.persona_primer_nombre, persona.persona_segundo_nombre, persona.persona_primer_apellido, persona.persona_segundo_apellido]
    .filter(Boolean)
    .join(" ");

export const formatFechaClinica = (value?: string | null) => {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "2-digit" });
};

export const formatHoraClinica = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 5);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
};

export const doctorUsuarioIdFromCita = (cita: Cita) => cita.horario_doctor.doctor.perfil.usuario.usuario_id;

export const examenEstadoTone = (estado: ExamenOptometricoEstado | string | null | undefined) => {
  if (estado === "B") return "bg-warning/15 text-warning border-warning/30";
  if (estado === "F") return "bg-secondary/15 text-secondary border-secondary/30";
  if (estado === "I") return "bg-error/15 text-error border-error/30";
  return "bg-surface-variant text-on-surface-variant border-outline-variant";
};
