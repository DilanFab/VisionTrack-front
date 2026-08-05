import type { Cita } from "../../types/citas/Cita";
import type { Persona } from "../../types/usuarios/Persona";

export const nombreCompleto = (persona: Persona): string =>
  [
    persona.persona_primer_nombre,
    persona.persona_segundo_nombre,
    persona.persona_primer_apellido,
    persona.persona_segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ");

export const nombreDoctor = (cita: Cita): string =>
  nombreCompleto(cita.horario_doctor.doctor.perfil.usuario.persona);

export const formatFecha = (iso: string): string => {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export const formatHora = (iso: string): string => iso.slice(11, 16);

export const esCitaFutura = (cita: Cita): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(cita.cita_fecha).getTime() >= hoy.getTime();
};

export const estaCancelada = (cita: Cita): boolean =>
  cita.estado_cita.estado_cita_nombre === "Cancelada";

export const estaProgramada = (cita: Cita): boolean =>
  cita.estado_cita.estado_cita_nombre === "Programada";

export const estadoBadgeClass = (estado: string): string => {
  switch (estado) {
    case "Confirmada":
      return "bg-primary/10 text-primary border-primary/30";
    case "Cancelada":
      return "bg-error-container text-on-error-container border-error/30";
    case "Completada":
      return "bg-secondary/10 text-secondary border-secondary/30";
    default:
      return "bg-surface-container-high text-on-surface-variant border-outline-variant";
  }
};

export const fechaInputHoy = (): string => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(
    hoy.getDate()
  ).padStart(2, "0")}`;
};
