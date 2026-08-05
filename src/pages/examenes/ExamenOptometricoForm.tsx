import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCita } from "../../api/citas/citaService";
import {
  createExamenOptometrico,
  getExamenOptometrico,
  updateExamenOptometrico,
} from "../../api/examenes/examenOptometricoService";
import type { Cita } from "../../types/citas/Cita";
import type { ExamenJsonSectionField, ExamenOptometrico, ExamenOptometricoPayload } from "../../types/examenes/ExamenOptometrico";
import { EXAMEN_JSON_SECTION_FIELDS } from "../../types/examenes/ExamenOptometrico";
import { useAuth } from "../../context/useAuth";
import { canEditDraftExam, canOperateExams } from "../../lib/roleCapabilities";
import { getApiErrorMessage } from "../../lib/apiError";
import { mostrarError, mostrarExito } from "../../lib/alerts";
import { SymbolIcon } from "../../components/SymbolIcon";
import { formatFechaClinica, nombreCompletoPersona } from "../historias/historiaUtils";

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

const today = () => new Date().toISOString().slice(0, 10);

const stringifySection = (value: unknown) => JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);

interface FormState {
  examen_fecha: string;
  examen_hora: string;
  examen_consultorio: string;
  examen_motivo_consulta: string;
  examen_anamnesis: string;
  antecedentes_personales_oculares: string;
  antecedentes_personales_generales: string;
  antecedentes_familiares_oculares: string;
  antecedentes_familiares_generales: string;
  diagnostico_od: string;
  diagnostico_oi: string;
  diagnostico_motor: string;
  cie10: string;
  patologico_presuntivo: string;
  tratamiento_conducta: string;
  consentimiento_informado: boolean;
  examen_nombre_examinador: string;
  secciones: Record<ExamenJsonSectionField, string>;
}

const initialForm = (): FormState => ({
  examen_fecha: today(),
  examen_hora: "",
  examen_consultorio: "",
  examen_motivo_consulta: "",
  examen_anamnesis: "",
  antecedentes_personales_oculares: "",
  antecedentes_personales_generales: "",
  antecedentes_familiares_oculares: "",
  antecedentes_familiares_generales: "",
  diagnostico_od: "",
  diagnostico_oi: "",
  diagnostico_motor: "",
  cie10: "",
  patologico_presuntivo: "",
  tratamiento_conducta: "",
  consentimiento_informado: false,
  examen_nombre_examinador: "",
  secciones: Object.fromEntries(EXAMEN_JSON_SECTION_FIELDS.map((field) => [field, "{}"])) as Record<ExamenJsonSectionField, string>,
});

const valueOrNull = (value: string) => value.trim() || null;

export default function ExamenOptometricoForm() {
  const { historiaId, citaId, examenId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [examen, setExamen] = useState<ExamenOptometrico | null>(null);
  const [cita, setCita] = useState<Cita | null>(null);
  const [historiaClinicaId, setHistoriaClinicaId] = useState(Number(historiaId) || 0);
  const [loading, setLoading] = useState(Boolean(examenId || citaId));
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(examenId);
  const canEdit = !isEditing || canEditDraftExam(user?.roles, examen?.examen_estado);
  const canOperate = canOperateExams(user?.roles);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        if (citaId) {
          const citaData = await getCita(Number(citaId));
          setCita(citaData);
          setHistoriaClinicaId(citaData.historia_clinica_id);
          setForm((current) => ({
            ...current,
            examen_motivo_consulta: current.examen_motivo_consulta || citaData.cita_motivo,
          }));
        }
        if (examenId) {
          const examenData = await getExamenOptometrico(Number(examenId));
          setExamen(examenData);
          setHistoriaClinicaId(examenData.historia_clinica_id);
          setForm({
            examen_fecha: examenData.examen_fecha?.slice(0, 10) || today(),
            examen_hora: examenData.examen_hora?.slice(11, 16) || "",
            examen_consultorio: examenData.examen_consultorio || "",
            examen_motivo_consulta: examenData.examen_motivo_consulta || "",
            examen_anamnesis: examenData.examen_anamnesis || "",
            antecedentes_personales_oculares: examenData.antecedentes_personales_oculares || "",
            antecedentes_personales_generales: examenData.antecedentes_personales_generales || "",
            antecedentes_familiares_oculares: examenData.antecedentes_familiares_oculares || "",
            antecedentes_familiares_generales: examenData.antecedentes_familiares_generales || "",
            diagnostico_od: examenData.diagnostico_od || "",
            diagnostico_oi: examenData.diagnostico_oi || "",
            diagnostico_motor: examenData.diagnostico_motor || "",
            cie10: examenData.cie10 || "",
            patologico_presuntivo: examenData.patologico_presuntivo || "",
            tratamiento_conducta: examenData.tratamiento_conducta || "",
            consentimiento_informado: Boolean(examenData.consentimiento_informado),
            examen_nombre_examinador: examenData.examen_nombre_examinador || "",
            secciones: Object.fromEntries(EXAMEN_JSON_SECTION_FIELDS.map((field) => [field, stringifySection(examenData[field])])) as Record<ExamenJsonSectionField, string>,
          });
        }
      } catch (err: unknown) {
        mostrarError(getApiErrorMessage(err, "No se pudo cargar el examen optométrico."));
      } finally {
        setLoading(false);
      }
    };
    if (examenId || citaId) void Promise.resolve().then(cargar);
  }, [citaId, examenId]);

  const patientLabel = useMemo(() => {
    if (!cita) return null;
    return nombreCompletoPersona(cita.historia_clinica.perfil.usuario.persona);
  }, [cita]);

  const buildPayload = (): ExamenOptometricoPayload | null => {
    if (!historiaClinicaId) {
      mostrarError("El examen debe estar asociado a una historia clínica.");
      return null;
    }
    const secciones: Partial<Record<ExamenJsonSectionField, Record<string, unknown>>> = {};
    for (const field of EXAMEN_JSON_SECTION_FIELDS) {
      try {
        secciones[field] = JSON.parse(form.secciones[field]) as Record<string, unknown>;
      } catch {
        mostrarError(`La sección ${sectionLabels[field]} debe tener JSON válido.`);
        return null;
      }
    }
    return {
      historia_clinica_id: historiaClinicaId,
      cita_id: cita?.cita_id ?? examen?.cita_id ?? null,
      examen_fecha: form.examen_fecha,
      examen_hora: valueOrNull(form.examen_hora),
      examen_consultorio: valueOrNull(form.examen_consultorio),
      examen_motivo_consulta: valueOrNull(form.examen_motivo_consulta),
      examen_anamnesis: valueOrNull(form.examen_anamnesis),
      antecedentes_personales_oculares: valueOrNull(form.antecedentes_personales_oculares),
      antecedentes_personales_generales: valueOrNull(form.antecedentes_personales_generales),
      antecedentes_familiares_oculares: valueOrNull(form.antecedentes_familiares_oculares),
      antecedentes_familiares_generales: valueOrNull(form.antecedentes_familiares_generales),
      diagnostico_od: valueOrNull(form.diagnostico_od),
      diagnostico_oi: valueOrNull(form.diagnostico_oi),
      diagnostico_motor: valueOrNull(form.diagnostico_motor),
      cie10: valueOrNull(form.cie10),
      patologico_presuntivo: valueOrNull(form.patologico_presuntivo),
      tratamiento_conducta: valueOrNull(form.tratamiento_conducta),
      consentimiento_informado: form.consentimiento_informado,
      examen_nombre_examinador: valueOrNull(form.examen_nombre_examinador),
      ...secciones,
    };
  };

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    if (!canOperate || !canEdit) {
      mostrarError("Tu rol no puede guardar este examen.");
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    try {
      setSaving(true);
      const saved = examenId
        ? await updateExamenOptometrico(Number(examenId), payload)
        : await createExamenOptometrico(payload);
      mostrarExito(examenId ? "Borrador actualizado correctamente." : "Examen optométrico creado correctamente.");
      navigate(`/admin/historial/${saved.historia_clinica_id}/examenes/${saved.examen_optometrico_id}`);
    } catch (err: unknown) {
      mostrarError(getApiErrorMessage(err, "No se pudo guardar el examen optométrico."));
    } finally {
      setSaving(false);
    }
  };

  if (!canOperate) {
    return <div className="vt-surface-card rounded-2xl p-8 text-on-surface-variant">Tu rol no puede operar exámenes optométricos.</div>;
  }

  if (loading) return <div className="vt-surface-card rounded-2xl p-8 text-on-surface-variant">Cargando formulario clínico...</div>;

  return (
    <form onSubmit={guardar} className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link to={historiaClinicaId ? `/admin/historial/${historiaClinicaId}` : "/admin/historial"} className="text-sm font-bold text-primary no-underline inline-flex items-center gap-2 mb-3">
            ← Volver a historia
          </Link>
          <p className="text-xs uppercase tracking-widest text-outline font-bold">Examen optométrico</p>
          <h2 className="text-3xl font-bold text-on-surface">{isEditing ? "Editar borrador" : cita ? "Nuevo examen desde cita" : "Nuevo examen manual"}</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {patientLabel ? `${patientLabel} · Cita ${formatFechaClinica(cita?.cita_fecha)}` : "Registro clínico asociado a historia clínica."}
          </p>
        </div>
        {!canEdit && <span className="rounded-full border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant">Solo lectura por estado</span>}
      </header>

      <section className="vt-surface-card rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="space-y-2 text-sm font-bold text-on-surface">Fecha
          <input type="date" className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={form.examen_fecha} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, examen_fecha: e.target.value })} />
        </label>
        <label className="space-y-2 text-sm font-bold text-on-surface">Hora
          <input type="time" className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={form.examen_hora} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, examen_hora: e.target.value })} />
        </label>
        <label className="space-y-2 text-sm font-bold text-on-surface">Consultorio
          <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={form.examen_consultorio} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, examen_consultorio: e.target.value })} />
        </label>
      </section>

      <section className="vt-surface-card rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          ["Motivo de consulta", "examen_motivo_consulta"],
          ["Anamnesis", "examen_anamnesis"],
          ["Antecedentes personales oculares", "antecedentes_personales_oculares"],
          ["Antecedentes personales generales", "antecedentes_personales_generales"],
          ["Antecedentes familiares oculares", "antecedentes_familiares_oculares"],
          ["Antecedentes familiares generales", "antecedentes_familiares_generales"],
        ].map(([label, key]) => (
          <label key={key} className="space-y-2 text-sm font-bold text-on-surface">{label}
            <textarea className="w-full min-h-28 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={form[key as keyof FormState] as string} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </label>
        ))}
      </section>

      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface">Secciones clínicas JSON</h3>
          <p className="text-sm text-on-surface-variant">Usa objetos JSON para guardar mediciones estructuradas por sección.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {EXAMEN_JSON_SECTION_FIELDS.map((field) => (
            <label key={field} className="space-y-2 text-sm font-bold text-on-surface">{sectionLabels[field]}
              <textarea className="font-mono text-xs w-full min-h-36 rounded-xl border border-outline-variant bg-surface-container-lowest p-3" value={form.secciones[field]} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, secciones: { ...form.secciones, [field]: e.target.value } })} />
            </label>
          ))}
        </div>
      </section>

      <section className="vt-surface-card rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          ["Diagnóstico OD", "diagnostico_od"],
          ["Diagnóstico OI", "diagnostico_oi"],
          ["Diagnóstico motor", "diagnostico_motor"],
          ["CIE10", "cie10"],
          ["Patológico presuntivo", "patologico_presuntivo"],
          ["Tratamiento / conducta", "tratamiento_conducta"],
        ].map(([label, key]) => (
          <label key={key} className="space-y-2 text-sm font-bold text-on-surface">{label}
            <textarea className="w-full min-h-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={form[key as keyof FormState] as string} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </label>
        ))}
        <label className="space-y-2 text-sm font-bold text-on-surface">Nombre del examinador
          <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={form.examen_nombre_examinador} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, examen_nombre_examinador: e.target.value })} />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-outline-variant p-4 text-sm font-bold text-on-surface">
          <input type="checkbox" checked={form.consentimiento_informado} disabled={!canEdit || saving} onChange={(e) => setForm({ ...form, consentimiento_informado: e.target.checked })} />
          Consentimiento informado registrado
        </label>
      </section>

      <div className="flex justify-end gap-3">
        <Link to={historiaClinicaId ? `/admin/historial/${historiaClinicaId}` : "/admin/historial"} className="rounded-xl border border-outline-variant px-5 py-3 font-bold text-on-surface no-underline hover:bg-surface-variant">Cancelar</Link>
        <button type="submit" disabled={!canEdit || saving} className="vt-primary-action rounded-xl px-5 py-3 font-bold disabled:opacity-50">
          <SymbolIcon name="task_alt" className="me-2" /> {saving ? "Guardando..." : "Guardar borrador"}
        </button>
      </div>
    </form>
  );
}
