import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPacientesCompletos } from "../../api/citas/pacienteCompletoService";
import { getCitas } from "../../api/citas/citaService";
import { getExamenesPorHistoriaClinica } from "../../api/examenes/examenOptometricoService";
import type { Paciente } from "../../types/citas/Paciente";
import type { Cita } from "../../types/citas/Cita";
import type { ExamenOptometrico } from "../../types/examenes/ExamenOptometrico";
import { getExamenEstadoLabel } from "../../types/examenes/ExamenOptometrico";
import { useAuth } from "../../context/useAuth";
import { canOperateExams, canReadClinicalSupervision, hasDoctorRole } from "../../lib/roleCapabilities";
import { getApiErrorMessage } from "../../lib/apiError";
import { SymbolIcon } from "../../components/SymbolIcon";
import { doctorUsuarioIdFromCita, examenEstadoTone, formatFechaClinica, nombreCompletoPersona } from "./historiaUtils";

export default function HistoriaClinicaDetalle() {
  const { historiaId } = useParams();
  const historiaClinicaId = Number(historiaId);
  const { user } = useAuth();
  const [historia, setHistoria] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [examenes, setExamenes] = useState<ExamenOptometrico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!historiaClinicaId) return;
      try {
        setLoading(true);
        setError(null);
        const [historiasData, citasData, examenesData] = await Promise.all([
          getPacientesCompletos(),
          getCitas(),
          getExamenesPorHistoriaClinica(historiaClinicaId),
        ]);
        setHistoria(historiasData.find((item) => item.historia_clinica_id === historiaClinicaId) ?? null);
        setCitas(citasData.filter((cita) => cita.historia_clinica_id === historiaClinicaId));
        setExamenes(examenesData.data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "No se pudo cargar el detalle de la historia clínica."));
      } finally {
        setLoading(false);
      }
    };
    void Promise.resolve().then(cargar);
  }, [historiaClinicaId]);

  const citasPermitidas = useMemo(() => {
    if (!hasDoctorRole(user?.roles)) return citas;
    return citas.filter((cita) => doctorUsuarioIdFromCita(cita) === user?.usuario_id);
  }, [citas, user?.roles, user?.usuario_id]);

  const puedeOperarExamen = canOperateExams(user?.roles);
  const modoSupervisor = canReadClinicalSupervision(user?.roles);

  if (loading) return <div className="vt-surface-card rounded-2xl p-8 text-on-surface-variant">Cargando historia clínica...</div>;
  if (error) return <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>;
  if (!historia) return <div className="vt-surface-card rounded-2xl p-8 text-on-surface-variant">Historia clínica no encontrada.</div>;

  const persona = historia.perfil.usuario.persona;

  return (
    <div className="space-y-6">
      <header className="vt-surface-card rounded-3xl p-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link to="/admin/historial" className="text-sm font-bold text-primary no-underline inline-flex items-center gap-2 mb-4">
              ← Volver a historias
            </Link>
            <p className="text-xs uppercase tracking-widest text-outline font-bold">Historia clínica {historia.historia_clinica_numero}</p>
            <h2 className="text-3xl font-bold text-on-surface mt-1">{nombreCompletoPersona(persona)}</h2>
            <p className="text-on-surface-variant mt-2">
              CI {persona.persona_cedula} · Apertura {formatFechaClinica(historia.historia_clinica_fecha_apertura)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {modoSupervisor && <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">Modo supervisión</span>}
            {puedeOperarExamen && (
              <Link to={`/admin/historial/${historiaClinicaId}/examenes/nuevo`} className="vt-primary-action inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold no-underline">
                <SymbolIcon name="add" /> Nuevo examen manual
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <article className="vt-surface-card rounded-2xl p-5">
          <h3 className="font-bold text-on-surface mb-4">Datos básicos</h3>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-outline font-bold uppercase text-xs">Correo</dt><dd className="text-on-surface">{persona.persona_correo || "No registrado"}</dd></div>
            <div><dt className="text-outline font-bold uppercase text-xs">Teléfono</dt><dd className="text-on-surface">{persona.persona_telefono || "No registrado"}</dd></div>
            <div><dt className="text-outline font-bold uppercase text-xs">Dirección</dt><dd className="text-on-surface">{persona.persona_direccion || "No registrada"}</dd></div>
          </dl>
        </article>

        <article className="vt-surface-card rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-bold text-on-surface mb-4">Citas relacionadas</h3>
          {citasPermitidas.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No hay citas visibles para este rol.</p>
          ) : (
            <div className="space-y-3">
              {citasPermitidas.slice(0, 6).map((cita) => (
                <div key={cita.cita_id} className="rounded-xl border border-outline-variant p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-on-surface">{formatFechaClinica(cita.cita_fecha)} · {cita.estado_cita.estado_cita_nombre}</p>
                    <p className="text-sm text-on-surface-variant">{cita.cita_motivo}</p>
                  </div>
                  {puedeOperarExamen && (
                    <Link to={`/admin/citas/${cita.cita_id}/examen/nuevo`} className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-bold text-primary no-underline hover:bg-primary/10">
                      <SymbolIcon name="biotech" /> Examen desde cita
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="vt-surface-card rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-on-surface">Exámenes optométricos</h3>
            <p className="text-sm text-on-surface-variant">Borradores, finalizados e inactivos asociados a esta historia.</p>
          </div>
        </div>

        {examenes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant p-8 text-center">
            <SymbolIcon name="history_edu" className="text-4xl text-primary mb-3" />
            <h4 className="font-bold text-on-surface">Sin exámenes registrados</h4>
            <p className="text-sm text-on-surface-variant mt-1">Cuando exista un examen aparecerá aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {examenes.map((examen) => (
              <article key={examen.examen_optometrico_id} className="rounded-2xl border border-outline-variant p-4 bg-surface-container-lowest/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-outline font-bold">Examen #{examen.examen_optometrico_id}</p>
                    <h4 className="text-lg font-bold text-on-surface mt-1">{formatFechaClinica(examen.examen_fecha)} {examen.cita_id ? `· Cita #${examen.cita_id}` : "· Manual"}</h4>
                    <p className="text-sm text-on-surface-variant">{examen.examen_motivo_consulta || "Sin motivo registrado"}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${examenEstadoTone(examen.examen_estado)}`}>
                    {getExamenEstadoLabel(examen.examen_estado)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Link to={`/admin/historial/${historiaClinicaId}/examenes/${examen.examen_optometrico_id}`} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface no-underline hover:bg-surface-variant">
                    Ver detalle
                  </Link>
                  {puedeOperarExamen && examen.examen_estado === "B" && (
                    <Link to={`/admin/historial/${historiaClinicaId}/examenes/${examen.examen_optometrico_id}/editar`} className="vt-primary-action rounded-lg px-3 py-2 text-sm font-bold no-underline">
                      Editar borrador
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
