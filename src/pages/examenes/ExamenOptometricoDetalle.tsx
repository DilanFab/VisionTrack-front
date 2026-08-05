import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  finalizarExamenOptometrico,
  getExamenOptometrico,
  inactivarExamenOptometrico,
} from "../../api/examenes/examenOptometricoService";
import type { ExamenJsonSectionField, ExamenOptometrico } from "../../types/examenes/ExamenOptometrico";
import { EXAMEN_JSON_SECTION_FIELDS, getExamenEstadoLabel } from "../../types/examenes/ExamenOptometrico";
import { useAuth } from "../../context/useAuth";
import { canEditDraftExam, canOperateExams, canReadClinicalSupervision } from "../../lib/roleCapabilities";
import { getApiErrorMessage } from "../../lib/apiError";
import { confirmarEliminacion, mostrarError, mostrarExito } from "../../lib/alerts";
import { examenEstadoTone, formatFechaClinica, formatHoraClinica } from "../historias/historiaUtils";

const sectionLabels: Record<ExamenJsonSectionField, string> = {
  lensometria: "Lensometría",
  agudeza_visual: "Agudeza visual",
  biomicroscopia: "Biomicroscopía",
  reflejos_pupilares: "Reflejos pupilares",
  oftalmoscopia: "Oftalmoscopía",
  examen_motor: "Examen motor",
  queratometria: "Queratometría",
  refraccion: "Refracción",
};

const clinicalFieldLabels: Array<[keyof ExamenOptometrico, string]> = [
  ["examen_motivo_consulta", "Motivo de consulta"],
  ["examen_anamnesis", "Anamnesis"],
  ["antecedentes_personales_oculares", "Antecedentes personales oculares"],
  ["antecedentes_personales_generales", "Antecedentes personales generales"],
  ["antecedentes_familiares_oculares", "Antecedentes familiares oculares"],
  ["antecedentes_familiares_generales", "Antecedentes familiares generales"],
  ["diagnostico_od", "Diagnóstico OD"],
  ["diagnostico_oi", "Diagnóstico OI"],
  ["diagnostico_motor", "Diagnóstico motor"],
  ["cie10", "CIE10"],
  ["patologico_presuntivo", "Patológico presuntivo"],
  ["tratamiento_conducta", "Tratamiento / conducta"],
];

export default function ExamenOptometricoDetalle() {
  const { historiaId, examenId } = useParams();
  const { user } = useAuth();
  const [examen, setExamen] = useState<ExamenOptometrico | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!examenId) return;
      try {
        setLoading(true);
        setError(null);
        setExamen(await getExamenOptometrico(Number(examenId)));
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "No se pudo cargar el examen optométrico."));
      } finally {
        setLoading(false);
      }
    };
    void Promise.resolve().then(cargar);
  }, [examenId]);

  const finalizar = async () => {
    if (!examen || !canOperateExams(user?.roles)) return;
    const confirmado = await confirmarEliminacion("El examen quedará finalizado y pasará a solo lectura.");
    if (!confirmado) return;
    try {
      setActionLoading(true);
      setExamen(await finalizarExamenOptometrico(examen.examen_optometrico_id));
      mostrarExito("Examen finalizado correctamente.");
    } catch (err: unknown) {
      mostrarError(getApiErrorMessage(err, "No se pudo finalizar el examen."));
    } finally {
      setActionLoading(false);
    }
  };

  const inactivar = async () => {
    if (!examen || !canOperateExams(user?.roles)) return;
    const confirmado = await confirmarEliminacion("El examen será marcado como inactivo.");
    if (!confirmado) return;
    try {
      setActionLoading(true);
      const actualizado = await inactivarExamenOptometrico(examen.examen_optometrico_id);
      setExamen(actualizado);
      mostrarExito("Examen inactivado correctamente.");
    } catch (err: unknown) {
      mostrarError(getApiErrorMessage(err, "No se pudo inactivar el examen."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="vt-surface-card rounded-2xl p-8 text-on-surface-variant">Cargando examen optométrico...</div>;
  if (error) return <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>;
  if (!examen) return <div className="vt-surface-card rounded-2xl p-8 text-on-surface-variant">Examen no encontrado.</div>;

  const historiaClinicaId = Number(historiaId) || examen.historia_clinica_id;
  const puedeEditar = canEditDraftExam(user?.roles, examen.examen_estado);
  const supervisor = canReadClinicalSupervision(user?.roles);

  return (
    <div className="space-y-6">
      <header className="vt-surface-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Link to={`/admin/historial/${historiaClinicaId}`} className="text-sm font-bold text-primary no-underline inline-flex items-center gap-2 mb-4">
              ← Volver a historia
            </Link>
            <p className="text-xs uppercase tracking-widest text-outline font-bold">Examen optométrico #{examen.examen_optometrico_id}</p>
            <h2 className="text-3xl font-bold text-on-surface mt-1">
              {formatFechaClinica(examen.examen_fecha)} {formatHoraClinica(examen.examen_hora)}
            </h2>
            <p className="text-on-surface-variant mt-2">{examen.cita_id ? `Derivado de cita #${examen.cita_id}` : "Registro manual"}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-start xl:justify-end">
            <span className={`rounded-full border px-4 py-2 text-sm font-bold ${examenEstadoTone(examen.examen_estado)}`}>
              {getExamenEstadoLabel(examen.examen_estado)}
            </span>
            {supervisor && <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">Modo supervisión</span>}
            {puedeEditar && (
              <Link to={`/admin/historial/${historiaClinicaId}/examenes/${examen.examen_optometrico_id}/editar`} className="vt-primary-action rounded-xl px-4 py-2 text-sm font-bold no-underline">
                Editar borrador
              </Link>
            )}
            {canOperateExams(user?.roles) && examen.examen_estado === "B" && (
              <button type="button" disabled={actionLoading} onClick={finalizar} className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary hover:bg-secondary/20">
                Finalizar
              </button>
            )}
            {canOperateExams(user?.roles) && examen.examen_estado !== "I" && (
              <button type="button" disabled={actionLoading} onClick={inactivar} className="vt-danger-action rounded-xl px-4 py-2 text-sm font-bold">
                Inactivar
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="vt-surface-card rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div><p className="text-outline font-bold uppercase text-xs">Consultorio</p><p className="text-on-surface">{examen.examen_consultorio || "No registrado"}</p></div>
        <div><p className="text-outline font-bold uppercase text-xs">Examinador</p><p className="text-on-surface">{examen.examen_nombre_examinador || examen.examinador?.usuario_nombre || "No registrado"}</p></div>
        <div><p className="text-outline font-bold uppercase text-xs">Consentimiento</p><p className="text-on-surface">{examen.consentimiento_informado ? "Registrado" : "No registrado"}</p></div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {clinicalFieldLabels.map(([key, label]) => (
          <article key={String(key)} className="vt-surface-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">{label}</p>
            <p className="text-on-surface whitespace-pre-wrap">{String(examen[key] || "Sin registro")}</p>
          </article>
        ))}
      </section>

      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface">Secciones clínicas estructuradas</h3>
          <p className="text-sm text-on-surface-variant">Visualización solo lectura de las mediciones JSON guardadas.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {EXAMEN_JSON_SECTION_FIELDS.map((field) => (
            <article key={field} className="rounded-2xl border border-outline-variant bg-surface-container-lowest/60 p-4">
              <p className="text-sm font-bold text-on-surface mb-2">{sectionLabels[field]}</p>
              <pre className="max-h-72 overflow-auto rounded-xl bg-surface-container-low p-3 text-xs text-on-surface whitespace-pre-wrap">
                {JSON.stringify(examen[field] || {}, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
