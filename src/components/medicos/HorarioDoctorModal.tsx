import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { getHorariosPorDoctor, setHorariosPorDoctor } from "../../api/medicos/horarioDoctorService";
import type { Doctor } from "../../types/medicos/Doctor";
import type { DiaSemana, HorarioDoctorSlot } from "../../types/medicos/HorarioDoctor";
import { mostrarExito, mostrarError } from "../../lib/alerts";
import "./HorarioDoctorModal.css";

interface Props {
  show: boolean;
  onHide: () => void;
  doctor: Doctor | null;
}

// Semana de referencia (fija, sin significado calendario real) usada únicamente
// para dibujar la grilla de lunes a viernes en FullCalendar.
const FECHA_REFERENCIA = "2024-01-01"; // Lunes
const FECHA_POR_DIA: Record<DiaSemana, string> = {
  Lunes: "2024-01-01",
  Martes: "2024-01-02",
  Miercoles: "2024-01-03",
  Jueves: "2024-01-04",
  Viernes: "2024-01-05",
};
const DIA_POR_INDICE: Record<number, DiaSemana> = {
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
};

const formatHora = (fecha: Date) =>
  `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}:00`;

const construirFechaLocal = (fechaBase: string, horas: number, minutos: number) => {
  const [anio, mes, dia] = fechaBase.split("-").map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos);
};

export default function HorarioDoctorModal({ show, onHide, doctor }: Props) {
  const [eventos, setEventos] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show || !doctor) {
      setEventos([]);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const horarios = await getHorariosPorDoctor(doctor.doctor_id);
        setEventos(
          horarios.map((h) => {
            const fechaBase = FECHA_POR_DIA[h.horario_doctor_dia];
            const inicio = new Date(h.horario_doctor_inicio);
            const fin = new Date(h.horario_doctor_fin);
            // Los @db.Time llegan como ISO con fecha ficticia 1970-01-01Z: la hora
            // se debe leer en UTC (getUTCHours), no con getHours(), que aplicaría
            // la zona horaria del navegador y correría la hora mostrada.
            const start = construirFechaLocal(fechaBase, inicio.getUTCHours(), inicio.getUTCMinutes());
            const end = construirFechaLocal(fechaBase, fin.getUTCHours(), fin.getUTCMinutes());
            return {
              id: `${h.horario_doctor_dia}-${start.getHours()}`,
              start,
              end,
              backgroundColor: "#198754",
              borderColor: "#198754",
              display: "block",
              extendedProps: { dia: h.horario_doctor_dia },
            };
          })
        );
      } catch {
        mostrarError("No se pudieron cargar los horarios del doctor.");
      } finally {
        setLoading(false);
      }
    })();
  }, [show, doctor]);

  const handleSelect = (info: DateSelectArg) => {
    const nuevos: EventInput[] = [];
    const cursor = new Date(info.start);
    while (cursor < info.end) {
      const siguiente = new Date(cursor.getTime() + 60 * 60 * 1000);
      const dia = DIA_POR_INDICE[cursor.getDay()];
      if (dia) {
        nuevos.push({
          id: `${dia}-${cursor.getHours()}`,
          start: new Date(cursor),
          end: siguiente,
          backgroundColor: "#198754",
          borderColor: "#198754",
          display: "block",
          extendedProps: { dia },
        });
      }
      cursor.setTime(siguiente.getTime());
    }

    setEventos((prev) => {
      const mapa = new Map(prev.map((e) => [e.id as string, e]));
      nuevos.forEach((e) => mapa.set(e.id as string, e));
      return Array.from(mapa.values());
    });
    info.view.calendar.unselect();
  };

  const handleEventClick = (info: EventClickArg) => {
    setEventos((prev) => prev.filter((e) => e.id !== info.event.id));
  };

  const selectAllow = (selectInfo: DateSelectArg) => {
    const finAjustado = new Date(selectInfo.end.getTime() - 1);
    return selectInfo.start.toDateString() === finAjustado.toDateString();
  };

  const handleGuardar = async () => {
    if (!doctor) return;
    try {
      setSaving(true);
      const slots: HorarioDoctorSlot[] = eventos.map((e) => ({
        horario_doctor_dia: (e.extendedProps as { dia: DiaSemana }).dia,
        horario_doctor_inicio: formatHora(e.start as Date),
        horario_doctor_fin: formatHora(e.end as Date),
      }));
      await setHorariosPorDoctor(doctor.doctor_id, slots);
      mostrarExito("Horario del doctor guardado correctamente.");
      onHide();
    } catch {
      mostrarError("No se pudo guardar el horario del doctor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          Disponibilidad{doctor ? ` — ${doctor.perfil.usuario.persona.persona_primer_nombre} ${doctor.perfil.usuario.persona.persona_primer_apellido}` : ""}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <div className="horario-doctor-calendario">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              initialDate={FECHA_REFERENCIA}
              headerToolbar={false}
              locale={esLocale}
              hiddenDays={[0, 6]}
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="20:00:00"
              slotDuration="01:00:00"
              snapDuration="01:00:00"
              slotLabelContent={(arg) => `${arg.date.getHours()}h00`}
              selectable
              selectMirror
              select={handleSelect}
              selectAllow={selectAllow}
              eventClick={handleEventClick}
              events={eventos}
              height="auto"
              dayHeaderFormat={{ weekday: "long" }}
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardar} disabled={saving || loading}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
