import { SymbolIcon } from "../../components/SymbolIcon";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelarCitaPaciente,
  confirmarCitaPaciente,
  getMisCitasPaciente,
} from "../../api/portal/pacientePortalService";
import type { Cita } from "../../types/citas/Cita";
import { confirmarEliminacion, mostrarError, mostrarExito } from "../../lib/alerts";
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
    void Promise.resolve().then(cargarCitas);
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
    if (!(await confirmarEliminacion("La cita pasará a estado cancelado y no se podrá confirmar después."))) return;
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
          <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">Portal del paciente</p>
          <h2 className="text-3xl font-bold text-on-surface">Mis citas visuales</h2>
          <p className="text-on-surface-variant text-sm mt-1">Consulta, confirma o cancela tus atenciones programadas con claridad.</p>
        </div>
        <Link
          to="/portal/agendar"
          className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-xl vt-primary-action text-sm font-bold active:scale-[0.98] transition-all"
        >
          <SymbolIcon name="add" className="text-base" />
          Agendar cita visual
        </Link>
      </div>

      <section className="vt-surface-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-on-surface-variant"><SymbolIcon name="progress_activity" className="animate-spin align-middle mr-2" />Cargando tus citas...</div>
        ) : citasOrdenadas.length === 0 ? (
          <div className="vt-empty-state p-10 text-center m-6 rounded-2xl">
            <SymbolIcon name="event_note" className="text-5xl text-outline mb-3" />
            <p className="font-bold text-on-surface">No tienes citas registradas</p>
            <p className="text-sm text-on-surface-variant mt-1">Agenda tu primera consulta visual desde el portal.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 2xl:hidden">
              {citasOrdenadas.map((cita) => {
                const puedeActuar = esCitaFutura(cita) && estaProgramada(cita) && !estaCancelada(cita);
                return (
                  <article key={cita.cita_id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface leading-snug">Dr(a). {nombreDoctor(cita)}</p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {cita.horario_doctor.doctor.especialidad_medica.especialidad_medica_nombre}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex px-3 py-1 rounded-full border text-xs font-bold ${estadoBadgeClass(
                          cita.estado_cita.estado_cita_nombre
                        )}`}
                      >
                        {cita.estado_cita.estado_cita_nombre}
                      </span>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                      <div>
                        <dt className="text-xs uppercase text-outline font-bold">Fecha</dt>
                        <dd className="mt-1 text-on-surface font-semibold">{formatFecha(cita.cita_fecha)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-outline font-bold">Horario</dt>
                        <dd className="mt-1 text-on-surface font-semibold">
                          {formatHora(cita.horario_doctor.horario_doctor_inicio)} - {formatHora(cita.horario_doctor.horario_doctor_fin)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-outline font-bold">Motivo</dt>
                        <dd className="mt-1 text-on-surface font-semibold break-words">{cita.cita_motivo}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <button
                        type="button"
                        disabled={!puedeActuar || savingId === cita.cita_id}
                        onClick={() => confirmar(cita)}
                        className="inline-flex justify-center rounded-lg px-3 py-2 vt-primary-action text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Confirmar cita con ${nombreDoctor(cita)}`}
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        disabled={!puedeActuar || savingId === cita.cita_id}
                        onClick={() => cancelar(cita)}
                        className="inline-flex justify-center rounded-lg px-3 py-2 vt-danger-action text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Cancelar cita con ${nombreDoctor(cita)}`}
                      >
                        Cancelar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden 2xl:block max-w-full overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[20%]" />
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="bg-surface-container-high text-on-surface-variant">
                  <tr>
                    <th className="text-left px-4 py-4 font-bold">Doctor</th>
                    <th className="text-left px-4 py-4 font-bold">Fecha</th>
                    <th className="text-left px-4 py-4 font-bold">Horario</th>
                    <th className="text-left px-4 py-4 font-bold">Motivo</th>
                    <th className="text-left px-4 py-4 font-bold">Estado</th>
                    <th className="text-right px-4 py-4 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasOrdenadas.map((cita) => {
                    const puedeActuar = esCitaFutura(cita) && estaProgramada(cita) && !estaCancelada(cita);
                    return (
                      <tr key={cita.cita_id} className="border-t border-outline-variant">
                        <td className="px-4 py-4 align-middle">
                          <p className="font-bold text-on-surface break-words">Dr(a). {nombreDoctor(cita)}</p>
                          <p className="text-xs text-on-surface-variant">
                            {cita.horario_doctor.doctor.especialidad_medica.especialidad_medica_nombre}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-middle">{formatFecha(cita.cita_fecha)}</td>
                        <td className="px-4 py-4 align-middle">
                          {formatHora(cita.horario_doctor.horario_doctor_inicio)} - {formatHora(cita.horario_doctor.horario_doctor_fin)}
                        </td>
                        <td className="px-4 py-4 align-middle break-words">{cita.cita_motivo}</td>
                        <td className="px-4 py-4 align-middle">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${estadoBadgeClass(
                              cita.estado_cita.estado_cita_nombre
                            )}`}
                          >
                            {cita.estado_cita.estado_cita_nombre}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={!puedeActuar || savingId === cita.cita_id}
                              onClick={() => confirmar(cita)}
                              className="px-3 py-2 rounded-lg vt-primary-action text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label={`Confirmar cita con ${nombreDoctor(cita)}`}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              disabled={!puedeActuar || savingId === cita.cita_id}
                              onClick={() => cancelar(cita)}
                              className="px-3 py-2 rounded-lg vt-danger-action text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label={`Cancelar cita con ${nombreDoctor(cita)}`}
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
          </>
        )}
      </section>
    </div>
  );
};

export default PatientAppointments;
