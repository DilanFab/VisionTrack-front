import { SymbolIcon } from "../../components/SymbolIcon";
import React, { useEffect, useMemo, useState } from "react";
import { getMisCitasPaciente } from "../../api/portal/pacientePortalService";
import type { Cita } from "../../types/citas/Cita";
import { estadoBadgeClass, formatFecha, formatHora, nombreDoctor } from "./patientPortalUtils";

const PatientHistory: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setCitas(await getMisCitasPaciente());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const historial = useMemo(
    () =>
      [...citas]
        .filter((cita) => cita.estado_cita.estado_cita_nombre !== "Programada")
        .sort((a, b) => b.cita_fecha.localeCompare(a.cita_fecha)),
    [citas]
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">Portal del paciente</p>
        <h2 className="text-3xl font-bold text-on-surface">Historial clínico visual</h2>
        <p className="text-on-surface-variant text-sm mt-1">Consulta tus atenciones anteriores y el estado de tus citas.</p>
      </div>

      <section className="vt-surface-card rounded-2xl p-6">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant"><SymbolIcon name="progress_activity" className="animate-spin align-middle mr-2" />Cargando historial...</div>
        ) : historial.length === 0 ? (
          <div className="vt-empty-state p-8 text-center rounded-2xl">
            <SymbolIcon name="history_edu" className="text-5xl text-outline mb-3" />
            <p className="font-bold text-on-surface">Aún no tienes atenciones en historial.</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Las citas confirmadas, canceladas o completadas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historial.map((cita) => (
              <div key={cita.cita_id} className="rounded-xl bg-surface border border-outline-variant p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-on-surface">Dr(a). {nombreDoctor(cita)}</p>
                    <p className="text-sm text-on-surface-variant">
                      {cita.horario_doctor.doctor.especialidad_medica.especialidad_medica_nombre}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-2">
                      {formatFecha(cita.cita_fecha)} · {formatHora(cita.horario_doctor.horario_doctor_inicio)} -{" "}
                      {formatHora(cita.horario_doctor.horario_doctor_fin)}
                    </p>
                    <p className="text-sm text-on-surface mt-3">{cita.cita_motivo}</p>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${estadoBadgeClass(
                      cita.estado_cita.estado_cita_nombre
                    )}`}
                  >
                    {cita.estado_cita.estado_cita_nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientHistory;
