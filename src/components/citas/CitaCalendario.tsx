import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { EventInput } from "@fullcalendar/core";
import type { HorarioDoctor, DiaSemana } from "../../types/medicos/HorarioDoctor";
import { mostrarError } from "../../lib/alerts";
import "../medicos/HorarioDoctorModal.css";

export interface CitaOcupada {
  horario_doctor_id: number;
  cita_fecha: string; // "YYYY-MM-DD"
}

export interface CitaSeleccion {
  cita_fecha: string; // "YYYY-MM-DD"
  horario_doctor_id: number;
}

interface Props {
  horarios: HorarioDoctor[];
  ocupados: CitaOcupada[];
  seleccion: CitaSeleccion | null;
  onSeleccionar: (fecha: string, horarioDoctorId: number) => void;
}

const DIA_INDICE: Record<DiaSemana, number> = {
  Lunes: 1,
  Martes: 2,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
};
const DIA_POR_INDICE: Record<number, DiaSemana> = {
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
};

// Los @db.Time llegan como ISO con fecha ficticia 1970-01-01Z: la hora debe
// leerse en UTC (getUTCHours), no con getHours(), que aplicaría la zona
// horaria del navegador y correría la hora (y rompería la comparación en
// handleDateClick para zonas con offset distinto de 0).
const horaLocal = (iso: string) => {
  const d = new Date(iso);
  return { horas: d.getUTCHours(), minutos: d.getUTCMinutes() };
};

const formatHora = (iso: string) => {
  const { horas, minutos } = horaLocal(iso);
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:00`;
};

const formatearFechaISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const construirFechaLocal = (fechaISO: string, horas: number, minutos: number) => {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos);
};

export default function CitaCalendario({ horarios, ocupados, seleccion, onSeleccionar }: Props) {
  const eventos = useMemo<EventInput[]>(() => {
    const disponibilidad: EventInput[] = horarios.map((h) => ({
      daysOfWeek: [DIA_INDICE[h.horario_doctor_dia]],
      startTime: formatHora(h.horario_doctor_inicio),
      endTime: formatHora(h.horario_doctor_fin),
      display: "background",
      color: "var(--warning-container)",
    }));

    const ocupadosEventos: EventInput[] = ocupados.flatMap((o) => {
      const horario = horarios.find((h) => h.horario_doctor_id === o.horario_doctor_id);
      if (!horario) return [];
      const inicio = horaLocal(horario.horario_doctor_inicio);
      const fin = horaLocal(horario.horario_doctor_fin);
      return [
        {
          start: construirFechaLocal(o.cita_fecha, inicio.horas, inicio.minutos),
          end: construirFechaLocal(o.cita_fecha, fin.horas, fin.minutos),
          display: "block",
          backgroundColor: "var(--error-container)",
          borderColor: "var(--error)",
          title: "Ocupado",
        },
      ];
    });

    const seleccionEvento: EventInput[] = (() => {
      if (!seleccion) return [];
      const horario = horarios.find((h) => h.horario_doctor_id === seleccion.horario_doctor_id);
      if (!horario) return [];
      const inicio = horaLocal(horario.horario_doctor_inicio);
      const fin = horaLocal(horario.horario_doctor_fin);
      return [
        {
          start: construirFechaLocal(seleccion.cita_fecha, inicio.horas, inicio.minutos),
          end: construirFechaLocal(seleccion.cita_fecha, fin.horas, fin.minutos),
          display: "block",
          backgroundColor: "var(--primary)",
          borderColor: "var(--primary)",
          title: "Seleccionado",
        },
      ];
    })();

    return [...disponibilidad, ...ocupadosEventos, ...seleccionEvento];
  }, [horarios, ocupados, seleccion]);

  const handleDateClick = (info: DateClickArg) => {
    const dia = DIA_POR_INDICE[info.date.getDay()];
    if (!dia) return;

    const horario = horarios.find((h) => {
      if (h.horario_doctor_dia !== dia) return false;
      const { horas, minutos } = horaLocal(h.horario_doctor_inicio);
      return horas === info.date.getHours() && minutos === info.date.getMinutes();
    });
    if (!horario) {
      mostrarError("El doctor no atiende en ese horario.");
      return;
    }

    const fechaISO = formatearFechaISO(info.date);
    const yaOcupado = ocupados.some(
      (o) => o.horario_doctor_id === horario.horario_doctor_id && o.cita_fecha === fechaISO
    );
    if (yaOcupado) {
      mostrarError("Ese horario ya está ocupado por otra cita.");
      return;
    }

    onSeleccionar(fechaISO, horario.horario_doctor_id);
  };

  if (horarios.length === 0) {
    return (
      <div className="vt-empty-state small rounded-xl p-4 text-center text-on-surface-variant">
        Selecciona un doctor con horarios configurados para ver su disponibilidad.
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-3 mb-3 small" aria-label="Leyenda de disponibilidad">
        <span>
          <span
            className="d-inline-block me-1"
            style={{ width: 12, height: 12, backgroundColor: "var(--warning-container)", border: "1px solid var(--warning)", borderRadius: 3 }}
          />
          Disponible
        </span>
        <span>
          <span
            className="d-inline-block me-1"
            style={{ width: 12, height: 12, backgroundColor: "var(--error-container)", border: "1px solid var(--error)", borderRadius: 3 }}
          />
          Ocupado
        </span>
        <span>
          <span
            className="d-inline-block me-1"
            style={{ width: 12, height: 12, backgroundColor: "var(--primary)", borderRadius: 3 }}
          />
          Seleccionado
        </span>
      </div>
      <div className="horario-doctor-calendario">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          locale={esLocale}
          hiddenDays={[0, 6]}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          slotDuration="01:00:00"
          snapDuration="01:00:00"
          slotLabelContent={(arg) => `${arg.date.getHours()}h00`}
          dayHeaderFormat={{ weekday: "short", day: "numeric", month: "numeric" }}
          dateClick={handleDateClick}
          events={eventos}
          height="auto"
        />
      </div>
    </div>
  );
}
