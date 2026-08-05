import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMisCitasPaciente } from "../../api/portal/pacientePortalService";
import type { Cita } from "../../types/citas/Cita";
import {
  esCitaFutura,
  estaCancelada,
  estadoBadgeClass,
  formatFecha,
  formatHora,
  nombreDoctor,
} from "./patientPortalUtils";

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName = user?.persona?.nombre || user?.usuario_nombre || "Paciente";
  const primerNombre = displayName.split(" ")[0];

  useEffect(() => {
    (async () => {
      try {
        setCitas(await getMisCitasPaciente());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const citasActivas = useMemo(
    () => citas.filter((cita) => esCitaFutura(cita) && !estaCancelada(cita)),
    [citas]
  );
  const proximaCita = useMemo(
    () => [...citasActivas].sort((a, b) => a.cita_fecha.localeCompare(b.cita_fecha))[0],
    [citasActivas]
  );
  const citasCompletadas = citas.filter((cita) => cita.estado_cita.estado_cita_nombre === "Completada").length;
  const citasCanceladas = citas.filter(estaCancelada).length;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">Portal del Paciente</p>
          <h2 className="text-3xl font-bold text-on-surface">Hola, {primerNombre}</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Gestiona tus citas, revisa tu historial y mantén tu información clínica organizada.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/portal/agendar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Agendar cita
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-outline text-xs uppercase tracking-wider">Citas activas</p>
            <span className="material-symbols-outlined text-primary">event_available</span>
          </div>
          <p className="text-3xl font-bold text-primary mt-3">{loading ? "..." : citasActivas.length}</p>
        </div>
        <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-outline text-xs uppercase tracking-wider">Atenciones completadas</p>
            <span className="material-symbols-outlined text-secondary">task_alt</span>
          </div>
          <p className="text-3xl font-bold text-secondary mt-3">{loading ? "..." : citasCompletadas}</p>
        </div>
        <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-outline text-xs uppercase tracking-wider">Canceladas</p>
            <span className="material-symbols-outlined text-error">event_busy</span>
          </div>
          <p className="text-3xl font-bold text-error mt-3">{loading ? "..." : citasCanceladas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 glass-card rounded-2xl p-6 border border-outline-variant/30">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Próxima cita</h3>
              <p className="text-sm text-on-surface-variant">Tu siguiente atención programada.</p>
            </div>
            <Link to="/portal/citas" className="text-sm font-bold text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          {proximaCita ? (
            <div className="rounded-xl bg-surface-container-low border border-outline-variant p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-on-surface">Dr(a). {nombreDoctor(proximaCita)}</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {proximaCita.horario_doctor.doctor.especialidad_medica.especialidad_medica_nombre}
                  </p>
                </div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${estadoBadgeClass(
                    proximaCita.estado_cita.estado_cita_nombre
                  )}`}
                >
                  {proximaCita.estado_cita.estado_cita_nombre}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-xs uppercase text-outline font-bold">Fecha</p>
                  <p className="font-semibold">{formatFecha(proximaCita.cita_fecha)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-outline font-bold">Horario</p>
                  <p className="font-semibold">
                    {formatHora(proximaCita.horario_doctor.horario_doctor_inicio)} -{" "}
                    {formatHora(proximaCita.horario_doctor.horario_doctor_fin)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-outline font-bold">Motivo</p>
                  <p className="font-semibold">{proximaCita.cita_motivo}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-surface-container-low border border-dashed border-outline-variant p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">event_available</span>
              <p className="font-bold text-on-surface">No tienes citas próximas.</p>
              <p className="text-sm text-on-surface-variant mt-1">Puedes agendar una nueva consulta desde el portal.</p>
            </div>
          )}
        </section>

        <section className="lg:col-span-4 bg-surface-container-high rounded-2xl p-6 border border-outline-variant">
          <h3 className="text-lg font-bold text-on-surface mb-4">Accesos rápidos</h3>
          <div className="space-y-3">
            <Link
              to="/portal/agendar"
              className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-variant/40 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Agendar nueva cita
              </span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </Link>
            <Link
              to="/portal/historial"
              className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-variant/40 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                Revisar historial
              </span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </Link>
            <Link
              to="/portal/perfil"
              className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-variant/40 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <span className="material-symbols-outlined text-primary">person</span>
                Ver mi perfil
              </span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;
