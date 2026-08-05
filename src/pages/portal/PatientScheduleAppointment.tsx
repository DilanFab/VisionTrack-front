import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  crearCitaPaciente,
  getDoctoresPaciente,
  getHorariosDoctorPaciente,
  getOcupadosDoctorPaciente,
} from "../../api/portal/pacientePortalService";
import type { Doctor } from "../../types/medicos/Doctor";
import type { HorarioDoctor, DiaSemana } from "../../types/medicos/HorarioDoctor";
import { mostrarError, mostrarExito } from "../../lib/alerts";
import { fechaInputHoy, formatHora, nombreCompleto } from "./patientPortalUtils";

const DIA_POR_INDICE: Record<number, DiaSemana | undefined> = {
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
};

const PatientScheduleAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [horarios, setHorarios] = useState<HorarioDoctor[]>([]);
  const [ocupados, setOcupados] = useState<number[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [fecha, setFecha] = useState(fechaInputHoy());
  const [horarioId, setHorarioId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setDoctores(await getDoctoresPaciente());
      } catch {
        mostrarError("No se pudieron cargar los doctores.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!doctorId) {
      setHorarios([]);
      setOcupados([]);
      setHorarioId("");
      return;
    }
    (async () => {
      try {
        const [horariosData, ocupadosData] = await Promise.all([
          getHorariosDoctorPaciente(Number(doctorId)),
          getOcupadosDoctorPaciente(Number(doctorId), fecha, fecha),
        ]);
        setHorarios(horariosData);
        setOcupados(ocupadosData.map((item) => item.horario_doctor_id));
        setHorarioId("");
      } catch {
        mostrarError("No se pudieron cargar los horarios del doctor.");
      }
    })();
  }, [doctorId, fecha]);

  const diaSeleccionado = DIA_POR_INDICE[new Date(`${fecha}T00:00:00`).getDay()];

  const horariosDisponibles = useMemo(
    () =>
      horarios.filter(
        (horario) =>
          horario.horario_doctor_estado === "A" &&
          horario.horario_doctor_dia === diaSeleccionado &&
          !ocupados.includes(horario.horario_doctor_id)
      ),
    [diaSeleccionado, horarios, ocupados]
  );

  const guardar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!horarioId || !motivo.trim()) return;

    try {
      setSaving(true);
      await crearCitaPaciente({
        horario_doctor_id: Number(horarioId),
        fecha,
        motivo: motivo.trim(),
      });
      mostrarExito("Cita agendada correctamente.");
      navigate("/portal/citas");
    } catch (error: any) {
      mostrarError(error?.response?.data?.error || "No se pudo agendar la cita.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">Portal del Paciente</p>
        <h2 className="text-3xl font-bold text-on-surface">Agendar Cita</h2>
        <p className="text-on-surface-variant text-sm mt-1">Selecciona doctor, fecha y horario disponible.</p>
      </div>

      <form onSubmit={guardar} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-surface-container-low rounded-2xl border border-outline-variant p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Doctor</label>
            <select
              className="w-full rounded-lg border border-outline-variant bg-surface p-3 text-on-surface"
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              disabled={loading || saving}
              required
            >
              <option value="">Selecciona un doctor</option>
              {doctores.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {nombreCompleto(doctor.perfil.usuario.persona)} -{" "}
                  {doctor.especialidad_medica.especialidad_medica_nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Fecha</label>
            <input
              type="date"
              min={fechaInputHoy()}
              className="w-full rounded-lg border border-outline-variant bg-surface p-3 text-on-surface"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              disabled={saving}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Horario disponible</label>
            <select
              className="w-full rounded-lg border border-outline-variant bg-surface p-3 text-on-surface"
              value={horarioId}
              onChange={(event) => setHorarioId(event.target.value)}
              disabled={!doctorId || saving}
              required
            >
              <option value="">
                {diaSeleccionado ? "Selecciona un horario" : "No hay atención en fines de semana"}
              </option>
              {horariosDisponibles.map((horario) => (
                <option key={horario.horario_doctor_id} value={horario.horario_doctor_id}>
                  {horario.horario_doctor_dia} · {formatHora(horario.horario_doctor_inicio)} -{" "}
                  {formatHora(horario.horario_doctor_fin)}
                </option>
              ))}
            </select>
            {doctorId && diaSeleccionado && horariosDisponibles.length === 0 && (
              <p className="text-xs text-on-surface-variant mt-2">No hay horarios disponibles para esta fecha.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Motivo</label>
            <textarea
              className="w-full min-h-32 rounded-lg border border-outline-variant bg-surface p-3 text-on-surface"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              disabled={saving}
              placeholder="Ej. Control visual, cambio de lentes, molestia ocular..."
              required
            />
          </div>
        </section>

        <aside className="lg:col-span-5 bg-surface-container-high rounded-2xl border border-outline-variant p-6 h-fit">
          <h3 className="text-lg font-bold text-on-surface mb-4">Resumen</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase text-outline font-bold">Fecha</p>
              <p className="font-semibold text-on-surface">{fecha}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-outline font-bold">Horarios disponibles</p>
              <p className="font-semibold text-on-surface">{horariosDisponibles.length}</p>
            </div>
            <button
              type="submit"
              disabled={saving || !horarioId || !motivo.trim()}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-primary text-on-primary font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Agendando..." : "Confirmar cita"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default PatientScheduleAppointment;
