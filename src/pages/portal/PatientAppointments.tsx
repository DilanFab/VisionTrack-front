import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelarCitaPaciente,
  confirmarCitaPaciente,
  getMisCitasPaciente,
} from "../../api/portal/pacientePortalService";
import type { Cita } from "../../types/citas/Cita";
import { mostrarError, mostrarExito } from "../../lib/alerts";
import {
  esCitaFutura,
  estaCancelada,
  estaProgramada,
  estadoBadgeClass,
  formatFecha,
  formatHora,
  nombreDoctor,
} from "./patientPortalUtils";

const PatientAppointments: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const cargarCitas = async () => {
    setLoading(true);
    try {
      setCitas(await getMisCitasPaciente());
    } catch {
      mostrarError("No se pudieron cargar tus citas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const citasOrdenadas = useMemo(
    () => [...citas].sort((a, b) => b.cita_fecha.localeCompare(a.cita_fecha)),
    [citas]
  );

  const confirmar = async (cita: Cita) => {
    try {
      setSavingId(cita.cita_id);
      const actualizada = await confirmarCitaPaciente(cita.cita_id);
      setCitas((prev) => prev.map((item) => (item.cita_id === actualizada.cita_id ? actualizada : item)));
      mostrarExito("Cita confirmada correctamente.");
    } catch {
      mostrarError("No se pudo confirmar la cita.");
    } finally {
      setSavingId(null);
    }
  };

  const cancelar = async (cita: Cita) => {
    if (!window.confirm("¿Deseas cancelar esta cita?")) return;
    try {
      setSavingId(cita.cita_id);
      const actualizada = await cancelarCitaPaciente(cita.cita_id);
      setCitas((prev) => prev.map((item) => (item.cita_id === actualizada.cita_id ? actualizada : item)));
      mostrarExito("Cita cancelada correctamente.");
    } catch {
      mostrarError("No se pudo cancelar la cita.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">Portal del Paciente</p>
          <h2 className="text-3xl font-bold text-on-surface">Mis Citas</h2>
          <p className="text-on-surface-variant text-sm mt-1">Consulta y gestiona tus atenciones programadas.</p>
        </div>
        <Link
          to="/portal/agendar"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Agendar cita
        </Link>
      </div>

      <section className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-on-surface-variant">Cargando citas...</div>
        ) : citasOrdenadas.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">event_note</span>
            <p className="font-bold text-on-surface">No tienes citas registradas.</p>
            <p className="text-sm text-on-surface-variant mt-1">Agenda tu primera consulta desde el portal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-high text-on-surface-variant">
                <tr>
                  <th className="text-left px-5 py-4 font-bold">Doctor</th>
                  <th className="text-left px-5 py-4 font-bold">Fecha</th>
                  <th className="text-left px-5 py-4 font-bold">Horario</th>
                  <th className="text-left px-5 py-4 font-bold">Motivo</th>
                  <th className="text-left px-5 py-4 font-bold">Estado</th>
                  <th className="text-right px-5 py-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasOrdenadas.map((cita) => {
                  const puedeActuar = esCitaFutura(cita) && estaProgramada(cita) && !estaCancelada(cita);
                  return (
                    <tr key={cita.cita_id} className="border-t border-outline-variant">
                      <td className="px-5 py-4">
                        <p className="font-bold text-on-surface">Dr(a). {nombreDoctor(cita)}</p>
                        <p className="text-xs text-on-surface-variant">
                          {cita.horario_doctor.doctor.especialidad_medica.especialidad_medica_nombre}
                        </p>
                      </td>
                      <td className="px-5 py-4">{formatFecha(cita.cita_fecha)}</td>
                      <td className="px-5 py-4">
                        {formatHora(cita.horario_doctor.horario_doctor_inicio)} -{" "}
                        {formatHora(cita.horario_doctor.horario_doctor_fin)}
                      </td>
                      <td className="px-5 py-4 max-w-xs">{cita.cita_motivo}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${estadoBadgeClass(
                            cita.estado_cita.estado_cita_nombre
                          )}`}
                        >
                          {cita.estado_cita.estado_cita_nombre}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={!puedeActuar || savingId === cita.cita_id}
                            onClick={() => confirmar(cita)}
                            className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            disabled={!puedeActuar || savingId === cita.cita_id}
                            onClick={() => cancelar(cita)}
                            className="px-3 py-2 rounded-lg bg-error text-on-error text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientAppointments;
