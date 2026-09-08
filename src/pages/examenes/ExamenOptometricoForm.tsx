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
import type { ExamenOptometrico, ExamenOptometricoPayload } from "../../types/examenes/ExamenOptometrico";
import { useAuth } from "../../context/useAuth";
import { canEditDraftExam, canOperateExams } from "../../lib/roleCapabilities";
import { getApiErrorMessage } from "../../lib/apiError";
import { mostrarError, mostrarExito } from "../../lib/alerts";
import { SymbolIcon } from "../../components/SymbolIcon";
import { formatFechaClinica, nombreCompletoPersona } from "../historias/historiaUtils";

const today = () => new Date().toISOString().slice(0, 10);

interface EyeMeasurement {
  esf: string;
  cyl: string;
  eje: string;
  va?: string;
  add?: string;
  avl?: string;
  avp?: string;
  alt?: string;
}

interface AvMeasurement {
  vl_sc: string;
  vp_sc: string;
  ph: string;
  rx_en_uso: string;
  vl_cc: string;
  vp_cc: string;
}

interface QueratometriaMeasurement {
  k1: string;
  k2: string;
  eje: string;
}

export default function ExamenOptometricoForm() {
  const { historiaId, citaId, examenId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Basic Info States
  const [examenFecha, setExamenFecha] = useState(today());
  const [examenHora, setExamenHora] = useState("");
  const [examenConsultorio, setExamenConsultorio] = useState("");
  const [examenMotivoConsulta, setExamenMotivoConsulta] = useState("");
  const [examenAnamnesis, setExamenAnamnesis] = useState("");
  
  // Demographics inside JSON
  const [ocupacion, setOcupacion] = useState("");
  const [hobby, setHobby] = useState("");

  // Antecedentes
  const [antecedentesPersonales, setAntecedentesPersonales] = useState("");
  const [antecedentesFamiliares, setAntecedentesFamiliares] = useState("");

  // Refracción Computarizada
  const [compOD, setCompOD] = useState<EyeMeasurement>({ esf: "", cyl: "", eje: "" });
  const [compOI, setCompOI] = useState<EyeMeasurement>({ esf: "", cyl: "", eje: "" });
  const [compDp, setCompDp] = useState("");
  const [compUcv, setCompUcv] = useState("");
  const [compMpc, setCompMpc] = useState("");
  const [compEa, setCompEa] = useState("");

  // Agudeza Visual
  const [avOD, setAvOD] = useState<AvMeasurement>({ vl_sc: "", vp_sc: "", ph: "", rx_en_uso: "", vl_cc: "", vp_cc: "" });
  const [avOI, setAvOI] = useState<AvMeasurement>({ vl_sc: "", vp_sc: "", ph: "", rx_en_uso: "", vl_cc: "", vp_cc: "" });
  const [avAO, setAvAO] = useState<AvMeasurement>({ vl_sc: "", vp_sc: "", ph: "", rx_en_uso: "", vl_cc: "", vp_cc: "" });
  const [avAdd, setAvAdd] = useState("");

  // Refracción Manual
  const [manualOD, setManualOD] = useState<EyeMeasurement>({ esf: "", cyl: "", eje: "", va: "", add: "" });
  const [manualOI, setManualOI] = useState<EyeMeasurement>({ esf: "", cyl: "", eje: "", va: "", add: "" });

  // Rx Final
  const [rxFinalOD, setRxFinalOD] = useState<EyeMeasurement>({ esf: "", cyl: "", eje: "", add: "", avl: "", avp: "", alt: "" });
  const [rxFinalOI, setRxFinalOI] = useState<EyeMeasurement>({ esf: "", cyl: "", eje: "", add: "", avl: "", avp: "", alt: "" });
  const [rxFinalDnp, setRxFinalDnp] = useState("");
  const [rxFinalAo, setRxFinalAo] = useState("");
  const [rxFinalAlt, setRxFinalAlt] = useState("");

  // Queratometría
  const [kOD, setKOD] = useState<QueratometriaMeasurement>({ k1: "", k2: "", eje: "" });
  const [kOI, setKOI] = useState<QueratometriaMeasurement>({ k1: "", k2: "", eje: "" });

  // Secondary text fields (saved inside JSON as simple text)
  const [biomicroscopiaTexto, setBiomicroscopiaTexto] = useState("");
  const [reflejosTexto, setReflejosTexto] = useState("");
  const [oftalmoscopiaTexto, setOftalmoscopiaTexto] = useState("");
  const [motorTexto, setMotorTexto] = useState("");

  // Diagnostics and Treatment
  const [diagnosticoOD, setDiagnosticoOD] = useState("");
  const [diagnosticoOI, setDiagnosticoOI] = useState("");
  const [diagnosticoMotor, setDiagnosticoMotor] = useState("");
  const [cie10, setCie10] = useState("");
  const [patologicoPresuntivo, setPatologicoPresuntivo] = useState("");
  const [tratamientoConducta, setTratamientoConducta] = useState("");
  const [consentimientoInformado, setConsentimientoInformado] = useState(false);
  const [examenNombreExaminador, setExamenNombreExaminador] = useState("");

  // Component States
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
          setExamenMotivoConsulta(citaData.cita_motivo || "");
        }
        if (examenId) {
          const data = await getExamenOptometrico(Number(examenId));
          setExamen(data);
          setHistoriaClinicaId(data.historia_clinica_id);
          
          // Basic fields
          setExamenFecha(data.examen_fecha?.slice(0, 10) || today());
          setExamenHora(data.examen_hora?.slice(11, 16) || "");
          setExamenConsultorio(data.examen_consultorio || "");
          setExamenMotivoConsulta(data.examen_motivo_consulta || "");
          setExamenAnamnesis(data.examen_anamnesis || "");
          
          setDiagnosticoOD(data.diagnostico_od || "");
          setDiagnosticoOI(data.diagnostico_oi || "");
          setDiagnosticoMotor(data.diagnostico_motor || "");
          setCie10(data.cie10 || "");
          setPatologicoPresuntivo(data.patologico_presuntivo || "");
          setTratamientoConducta(data.tratamiento_conducta || "");
          setConsentimientoInformado(Boolean(data.consentimiento_informado));
          setExamenNombreExaminador(data.examen_nombre_examinador || "");

          // Backgrounds/Ocular history from text fields
          setAntecedentesPersonales(data.antecedentes_personales_oculares || data.antecedentes_personales_generales || "");
          setAntecedentesFamiliares(data.antecedentes_familiares_oculares || data.antecedentes_familiares_generales || "");

          // Extraction from JSONs
          const refr = data.refraccion || {};
          const comp = refr.computarizada || {};
          setCompOD(comp.od || { esf: "", cyl: "", eje: "" });
          setCompOI(comp.oi || { esf: "", cyl: "", eje: "" });
          setCompDp(comp.dp || "");
          setCompUcv(comp.ucv || "");
          setCompMpc(comp.mpc || "");
          setCompEa(comp.ea || "");
          
          setOcupacion(refr.ocupacion || data.lensometria?.ocupacion || "");
          setHobby(refr.hobby || data.lensometria?.hobby || "");

          const manual = refr.manual || {};
          setManualOD(manual.od || { esf: "", cyl: "", eje: "", va: "", add: "" });
          setManualOI(manual.oi || { esf: "", cyl: "", eje: "", va: "", add: "" });

          const av = data.agudeza_visual || {};
          setAvOD(av.od || { vl_sc: "", vp_sc: "", ph: "", rx_en_uso: "", vl_cc: "", vp_cc: "" });
          setAvOI(av.oi || { vl_sc: "", vp_sc: "", ph: "", rx_en_uso: "", vl_cc: "", vp_cc: "" });
          setAvAO(av.ao || { vl_sc: "", vp_sc: "", ph: "", rx_en_uso: "", vl_cc: "", vp_cc: "" });
          setAvAdd(av.add || "");

          const rx = data.lensometria?.rxFinal || {};
          setRxFinalOD(rx.od || { esf: "", cyl: "", eje: "", add: "", avl: "", avp: "", alt: "" });
          setRxFinalOI(rx.oi || { esf: "", cyl: "", eje: "", add: "", avl: "", avp: "", alt: "" });
          setRxFinalDnp(rx.dnp || "");
          setRxFinalAo(rx.ao || "");
          setRxFinalAlt(rx.alt || "");

          const q = data.queratometria || {};
          setKOD(q.od || { k1: "", k2: "", eje: "" });
          setKOI(q.oi || { k1: "", k2: "", eje: "" });

          // Secondary texts
          setBiomicroscopiaTexto(data.biomicroscopia?.texto || "");
          setReflejosTexto(data.reflejos_pupilares?.texto || "");
          setOftalmoscopiaTexto(data.oftalmoscopia?.texto || "");
          setMotorTexto(data.examen_motor?.texto || "");
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
    if (cita) return nombreCompletoPersona(cita.historia_clinica.perfil.usuario.persona);
    if (examen && examen.historia_clinica?.perfil?.usuario?.persona) {
      return nombreCompletoPersona(examen.historia_clinica.perfil.usuario.persona);
    }
    return null;
  }, [cita, examen]);

  const buildPayload = (): ExamenOptometricoPayload | null => {
    if (!historiaClinicaId) {
      mostrarError("El examen debe estar asociado a una historia clínica.");
      return null;
    }

    // Map all inputs back to JSON schemas
    const refraccion = {
      computarizada: {
        od: compOD,
        oi: compOI,
        dp: compDp,
        ucv: compUcv,
        mpc: compMpc,
        ea: compEa,
      },
      manual: {
        od: manualOD,
        oi: manualOI,
      },
      ocupacion,
      hobby
    };

    const agudeza_visual = {
      od: avOD,
      oi: avOI,
      ao: avAO,
      add: avAdd,
    };

    const lensometria = {
      rxFinal: {
        od: rxFinalOD,
        oi: rxFinalOI,
        dnp: rxFinalDnp,
        ao: rxFinalAo,
        alt: rxFinalAlt,
      },
      ocupacion,
      hobby
    };

    const queratometria = {
      od: kOD,
      oi: kOI,
    };

    const biomicroscopia = { texto: biomicroscopiaTexto };
    const reflejos_pupilares = { texto: reflejosTexto };
    const oftalmoscopia = { texto: oftalmoscopiaTexto };
    const examen_motor = { texto: motorTexto };

    return {
      historia_clinica_id: historiaClinicaId,
      cita_id: cita?.cita_id ?? examen?.cita_id ?? null,
      examen_fecha: examenFecha,
      examen_hora: examenHora.trim() || null,
      examen_consultorio: examenConsultorio.trim() || null,
      examen_motivo_consulta: examenMotivoConsulta.trim() || null,
      examen_anamnesis: examenAnamnesis.trim() || null,
      antecedentes_personales_oculares: antecedentesPersonales.trim() || null,
      antecedentes_personales_generales: antecedentesPersonales.trim() || null,
      antecedentes_familiares_oculares: antecedentesFamiliares.trim() || null,
      antecedentes_familiares_generales: antecedentesFamiliares.trim() || null,
      diagnostico_od: diagnosticoOD.trim() || null,
      diagnostico_oi: diagnosticoOI.trim() || null,
      diagnostico_motor: diagnosticoMotor.trim() || null,
      cie10: cie10.trim() || null,
      patologico_presuntivo: patologicoPresuntivo.trim() || null,
      tratamiento_conducta: tratamientoConducta.trim() || null,
      consentimiento_informado: consentimientoInformado,
      examen_nombre_examinador: examenNombreExaminador.trim() || null,
      refraccion,
      agudeza_visual,
      lensometria,
      queratometria,
      biomicroscopia,
      reflejos_pupilares,
      oftalmoscopia,
      examen_motor,
    };
  };

  const autofillDemoData = () => {
    setExamenFecha(today());
    setExamenHora("10:30");
    setExamenConsultorio("Consultorio B-12");
    setExamenMotivoConsulta("Paciente refiere disminución progresiva de agudeza visual de lejos de 6 meses de evolución. Sensación de cansancio ocular y cefaleas ocasionales por la tarde.");
    setExamenAnamnesis("Usa lentes monofocales desde hace 3 años, no actualizados. No refiere antecedentes quirúrgicos oculares ni alergias.");
    setOcupacion("Ingeniero de Software");
    setHobby("Lectura, Ciclismo");
    setAntecedentesPersonales("Astigmatismo corregido con gafas. Ojo seco leve.");
    setAntecedentesFamiliares("Madre diagnosticada con glaucoma de ángulo abierto controlado. Padre hipermetrope.");
    
    setCompOD({ esf: "-2.50", cyl: "-0.75", eje: "90" });
    setCompOI({ esf: "-2.00", cyl: "-0.50", eje: "85" });
    setCompDp("62");
    setCompUcv("20/100");
    setCompMpc("+1.00");
    setCompEa("+0.75");

    setAvOD({ vl_sc: "20/100", vp_sc: "20/20", ph: "20/25", rx_en_uso: "Gafas 3 años", vl_cc: "20/20", vp_cc: "20/20" });
    setAvOI({ vl_sc: "20/80", vp_sc: "20/20", ph: "20/20", rx_en_uso: "Gafas 3 años", vl_cc: "20/20", vp_cc: "20/20" });
    setAvAO({ vl_sc: "20/70", vp_sc: "20/20", ph: "20/20", rx_en_uso: "Gafas 3 años", vl_cc: "20/20", vp_cc: "20/20" });
    setAvAdd("+1.50");

    setManualOD({ esf: "-2.50", cyl: "-0.75", eje: "90", va: "20/20", add: "+1.50" });
    setManualOI({ esf: "-2.00", cyl: "-0.50", eje: "85", va: "20/20", add: "+1.50" });

    setRxFinalOD({ esf: "-2.50", cyl: "-0.75", eje: "90", add: "+1.50", avl: "20/20", avp: "0.50", alt: "1.00" });
    setRxFinalOI({ esf: "-2.00", cyl: "-0.50", eje: "85", add: "+1.50", avl: "20/20", avp: "0.50", alt: "1.00" });
    setRxFinalDnp("31");
    setRxFinalAo("62");
    setRxFinalAlt("14");

    setKOD({ k1: "43.25", k2: "44.75", eje: "90" });
    setKOI({ k1: "43.00", k2: "44.50", eje: "95" });

    setBiomicroscopiaTexto("Córnea transparente sin infiltrados. Conjuntiva bulbar normoémica. Cámara anterior formada y limpia.");
    setReflejosTexto("Reflejo fotomotor y consensual presentes y simétricos (PIRRL).");
    setOftalmoscopiaTexto("Papila de bordes netos, buena coloración, relación copa-disco 0.3. Mácula sana. Vasos normales.");
    setMotorTexto("Movimientos oculares extraoculares (MOEs) completos y simétricos. Test de Hirschberg centrado.");

    setDiagnosticoOD("Miopía moderada + Astigmatismo miópico compuesto.");
    setDiagnosticoOI("Miopía leve + Astigmatismo miópico simple.");
    setDiagnosticoMotor("Ortoforia.");
    setCie10("H52.1");
    setPatologicoPresuntivo("Ninguno.");
    setTratamientoConducta("Lentes monofocales correctoras con filtro de luz azul para uso permanente frente a pantallas. Gotas lubricantes (lágrimas artificiales) 1 gota cada 6 horas. Control oftalmológico en 12 meses.");
    setConsentimientoInformado(true);
    setExamenNombreExaminador(user?.usuario_nombre || "Optómetra");
    
    mostrarExito("¡Simulación cargada! Todos los campos clínicos han sido rellenados de forma realista.");
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
          <p className="text-xs uppercase tracking-widest text-outline font-bold">Registro de Examen Optométrico</p>
          <h2 className="text-3xl font-bold text-on-surface">{isEditing ? "Editar borrador" : cita ? "Nuevo examen desde cita" : "Nuevo examen manual"}</h2>
          {patientLabel && (
            <p className="text-on-surface-variant text-sm mt-1 font-bold">
              Paciente: {patientLabel}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {canEdit && (
            <button
              type="button"
              onClick={autofillDemoData}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-900/20 hover:scale-105 active:scale-95"
            >
              <SymbolIcon name="bolt" /> Simular Datos
            </button>
          )}
          {!canEdit && <span className="rounded-full border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant">Solo lectura por estado</span>}
        </div>
      </header>

      {/* Basic Consultation Metadata */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">Información de Consulta</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <label className="space-y-2 text-sm font-bold text-on-surface md:col-span-1">Fecha
            <input type="date" className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={examenFecha} disabled={!canEdit || saving} onChange={(e) => setExamenFecha(e.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-bold text-on-surface md:col-span-1">Hora
            <input type="time" className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={examenHora} disabled={!canEdit || saving} onChange={(e) => setExamenHora(e.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-bold text-on-surface md:col-span-1">Consultorio
            <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={examenConsultorio} disabled={!canEdit || saving} onChange={(e) => setExamenConsultorio(e.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-bold text-on-surface md:col-span-1">Ocupación
            <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={ocupacion} disabled={!canEdit || saving} onChange={(e) => setOcupacion(e.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-bold text-on-surface md:col-span-1">Hobby
            <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={hobby} disabled={!canEdit || saving} onChange={(e) => setHobby(e.target.value)} />
          </label>
        </div>
      </section>

      {/* Motiv, Anamnesis and Backgrounds */}
      <section className="vt-surface-card rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <label className="space-y-2 text-sm font-bold text-on-surface">Motivo de consulta
          <textarea className="w-full min-h-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={examenMotivoConsulta} disabled={!canEdit || saving} onChange={(e) => setExamenMotivoConsulta(e.target.value)} />
        </label>
        <label className="space-y-2 text-sm font-bold text-on-surface">Anamnesis / Observaciones generales
          <textarea className="w-full min-h-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={examenAnamnesis} disabled={!canEdit || saving} onChange={(e) => setExamenAnamnesis(e.target.value)} />
        </label>
        <label className="space-y-2 text-sm font-bold text-on-surface">Antecedentes personales
          <textarea className="w-full min-h-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={antecedentesPersonales} disabled={!canEdit || saving} onChange={(e) => setAntecedentesPersonales(e.target.value)} placeholder="Ej: Diabético, hipertensión, cirugía ocular previa..." />
        </label>
        <label className="space-y-2 text-sm font-bold text-on-surface">Antecedentes familiares
          <textarea className="w-full min-h-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={antecedentesFamiliares} disabled={!canEdit || saving} onChange={(e) => setAntecedentesFamiliares(e.target.value)} placeholder="Ej: Glaucoma, cataratas, ceguera familiar..." />
        </label>
      </section>

      {/* 1. Refracción Computarizada */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">1. Refracción Computarizada</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-bold">
          {/* OD Column */}
          <div className="border border-outline-variant rounded-xl p-4 space-y-3 bg-surface-container-lowest/50">
            <h4 className="text-cyan-600 font-black border-b border-outline-variant pb-1">Ojo Derecho (OD)</h4>
            <label className="block text-xs">Esfera (ESF)
              <input type="number" step="0.25" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compOD.esf} disabled={!canEdit || saving} onChange={(e) => setCompOD({ ...compOD, esf: e.target.value })} />
            </label>
            <label className="block text-xs">Cilindro (CYL)
              <input type="number" step="0.25" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compOD.cyl} disabled={!canEdit || saving} onChange={(e) => setCompOD({ ...compOD, cyl: e.target.value })} />
            </label>
            <label className="block text-xs">Eje (°)
              <input type="number" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compOD.eje} disabled={!canEdit || saving} onChange={(e) => setCompOD({ ...compOD, eje: e.target.value })} />
            </label>
          </div>
          {/* OI Column */}
          <div className="border border-outline-variant rounded-xl p-4 space-y-3 bg-surface-container-lowest/50">
            <h4 className="text-pink-600 font-black border-b border-outline-variant pb-1">Ojo Izquierdo (OI)</h4>
            <label className="block text-xs">Esfera (ESF)
              <input type="number" step="0.25" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compOI.esf} disabled={!canEdit || saving} onChange={(e) => setCompOI({ ...compOI, esf: e.target.value })} />
            </label>
            <label className="block text-xs">Cilindro (CYL)
              <input type="number" step="0.25" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compOI.cyl} disabled={!canEdit || saving} onChange={(e) => setCompOI({ ...compOI, cyl: e.target.value })} />
            </label>
            <label className="block text-xs">Eje (°)
              <input type="number" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compOI.eje} disabled={!canEdit || saving} onChange={(e) => setCompOI({ ...compOI, eje: e.target.value })} />
            </label>
          </div>
          {/* General parameters */}
          <div className="border border-outline-variant rounded-xl p-4 space-y-3 bg-surface-container-lowest/50 md:col-span-2 grid grid-cols-2 gap-3 self-start">
            <h4 className="text-slate-600 font-black border-b border-outline-variant pb-1 col-span-2">Parámetros Adicionales</h4>
            <label className="text-xs">Distancia Pupilar (DP)
              <input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compDp} disabled={!canEdit || saving} onChange={(e) => setCompDp(e.target.value)} />
            </label>
            <label className="text-xs">U.C.V
              <input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compUcv} disabled={!canEdit || saving} onChange={(e) => setCompUcv(e.target.value)} />
            </label>
            <label className="text-xs">M.P.C
              <input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compMpc} disabled={!canEdit || saving} onChange={(e) => setCompMpc(e.target.value)} />
            </label>
            <label className="text-xs">E.A
              <input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={compEa} disabled={!canEdit || saving} onChange={(e) => setCompEa(e.target.value)} />
            </label>
          </div>
        </div>
      </section>

      {/* 2. Agudeza Visual */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">2. Agudeza Visual</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold">
            <thead>
              <tr className="border-b border-outline-variant text-slate-500">
                <th className="py-2">OJO</th>
                <th>VL S.C.</th>
                <th>VP S.C.</th>
                <th>PH</th>
                <th>RX EN USO</th>
                <th>VL C.C.</th>
                <th>VP C.C.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              <tr>
                <td className="py-2 font-black text-cyan-600">OD</td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOD.vl_sc} disabled={!canEdit || saving} onChange={(e) => setAvOD({ ...avOD, vl_sc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOD.vp_sc} disabled={!canEdit || saving} onChange={(e) => setAvOD({ ...avOD, vp_sc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-20" value={avOD.ph} disabled={!canEdit || saving} onChange={(e) => setAvOD({ ...avOD, ph: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-32" value={avOD.rx_en_uso} disabled={!canEdit || saving} onChange={(e) => setAvOD({ ...avOD, rx_en_uso: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOD.vl_cc} disabled={!canEdit || saving} onChange={(e) => setAvOD({ ...avOD, vl_cc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOD.vp_cc} disabled={!canEdit || saving} onChange={(e) => setAvOD({ ...avOD, vp_cc: e.target.value })} /></td>
              </tr>
              <tr>
                <td className="py-2 font-black text-pink-600">OI</td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOI.vl_sc} disabled={!canEdit || saving} onChange={(e) => setAvOI({ ...avOI, vl_sc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOI.vp_sc} disabled={!canEdit || saving} onChange={(e) => setAvOI({ ...avOI, vp_sc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-20" value={avOI.ph} disabled={!canEdit || saving} onChange={(e) => setAvOI({ ...avOI, ph: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-32" value={avOI.rx_en_uso} disabled={!canEdit || saving} onChange={(e) => setAvOI({ ...avOI, rx_en_uso: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOI.vl_cc} disabled={!canEdit || saving} onChange={(e) => setAvOI({ ...avOI, vl_cc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avOI.vp_cc} disabled={!canEdit || saving} onChange={(e) => setAvOI({ ...avOI, vp_cc: e.target.value })} /></td>
              </tr>
              <tr>
                <td className="py-2 font-black text-purple-600">AO</td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avAO.vl_sc} disabled={!canEdit || saving} onChange={(e) => setAvAO({ ...avAO, vl_sc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avAO.vp_sc} disabled={!canEdit || saving} onChange={(e) => setAvAO({ ...avAO, vp_sc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-20" value={avAO.ph} disabled={!canEdit || saving} onChange={(e) => setAvAO({ ...avAO, ph: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-32" value={avAO.rx_en_uso} disabled={!canEdit || saving} onChange={(e) => setAvAO({ ...avAO, rx_en_uso: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avAO.vl_cc} disabled={!canEdit || saving} onChange={(e) => setAvAO({ ...avAO, vl_cc: e.target.value })} /></td>
                <td><input className="rounded border border-outline-variant p-1 font-normal w-24" value={avAO.vp_cc} disabled={!canEdit || saving} onChange={(e) => setAvAO({ ...avAO, vp_cc: e.target.value })} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-2">
          <label className="text-xs flex items-center gap-2">Adición (ADD)
            <input className="rounded border border-outline-variant p-1 font-normal w-28" value={avAdd} disabled={!canEdit || saving} onChange={(e) => setAvAdd(e.target.value)} />
          </label>
        </div>
      </section>

      {/* 3. Refracción Manual */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">3. Refracción Manual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-bold">
          <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest/50 space-y-3">
            <h4 className="text-cyan-600 border-b border-outline-variant pb-1">Ojo Derecho (OD)</h4>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">Esfera (ESF)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOD.esf} disabled={!canEdit || saving} onChange={(e) => setManualOD({ ...manualOD, esf: e.target.value })} />
              </label>
              <label className="text-xs">Cilindro (CYL)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOD.cyl} disabled={!canEdit || saving} onChange={(e) => setManualOD({ ...manualOD, cyl: e.target.value })} />
              </label>
              <label className="text-xs">Eje (°)
                <input type="number" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOD.eje} disabled={!canEdit || saving} onChange={(e) => setManualOD({ ...manualOD, eje: e.target.value })} />
              </label>
              <label className="text-xs">Agudeza Visual (VA)
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOD.va} disabled={!canEdit || saving} onChange={(e) => setManualOD({ ...manualOD, va: e.target.value })} />
              </label>
              <label className="text-xs col-span-2">Adición (ADD)
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOD.add} disabled={!canEdit || saving} onChange={(e) => setManualOD({ ...manualOD, add: e.target.value })} />
              </label>
            </div>
          </div>
          <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest/50 space-y-3">
            <h4 className="text-pink-600 border-b border-outline-variant pb-1">Ojo Izquierdo (OI)</h4>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">Esfera (ESF)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOI.esf} disabled={!canEdit || saving} onChange={(e) => setManualOI({ ...manualOI, esf: e.target.value })} />
              </label>
              <label className="text-xs">Cilindro (CYL)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOI.cyl} disabled={!canEdit || saving} onChange={(e) => setManualOI({ ...manualOI, cyl: e.target.value })} />
              </label>
              <label className="text-xs">Eje (°)
                <input type="number" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOI.eje} disabled={!canEdit || saving} onChange={(e) => setManualOI({ ...manualOI, eje: e.target.value })} />
              </label>
              <label className="text-xs">Agudeza Visual (VA)
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOI.va} disabled={!canEdit || saving} onChange={(e) => setManualOI({ ...manualOI, va: e.target.value })} />
              </label>
              <label className="text-xs col-span-2">Adición (ADD)
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={manualOI.add} disabled={!canEdit || saving} onChange={(e) => setManualOI({ ...manualOI, add: e.target.value })} />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rx Final */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">4. Rx Final (Fórmula Diagnóstica Prescrita)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-bold">
          <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest/50 space-y-3">
            <h4 className="text-cyan-600 border-b border-outline-variant pb-1">Ojo Derecho (OD)</h4>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">Esfera (ESF)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOD.esf} disabled={!canEdit || saving} onChange={(e) => setRxFinalOD({ ...rxFinalOD, esf: e.target.value })} />
              </label>
              <label className="text-xs">Cilindro (CYL)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOD.cyl} disabled={!canEdit || saving} onChange={(e) => setRxFinalOD({ ...rxFinalOD, cyl: e.target.value })} />
              </label>
              <label className="text-xs">Eje (°)
                <input type="number" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOD.eje} disabled={!canEdit || saving} onChange={(e) => setRxFinalOD({ ...rxFinalOD, eje: e.target.value })} />
              </label>
              <label className="text-xs">Adición (ADD)
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOD.add} disabled={!canEdit || saving} onChange={(e) => setRxFinalOD({ ...rxFinalOD, add: e.target.value })} />
              </label>
              <label className="text-xs">AVL
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOD.avl} disabled={!canEdit || saving} onChange={(e) => setRxFinalOD({ ...rxFinalOD, avl: e.target.value })} />
              </label>
              <label className="text-xs">AVP
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOD.avp} disabled={!canEdit || saving} onChange={(e) => setRxFinalOD({ ...rxFinalOD, avp: e.target.value })} />
              </label>
              <label className="text-xs col-span-2">ALT
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOD.alt} disabled={!canEdit || saving} onChange={(e) => setRxFinalOD({ ...rxFinalOD, alt: e.target.value })} />
              </label>
            </div>
          </div>
          <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest/50 space-y-3">
            <h4 className="text-pink-600 border-b border-outline-variant pb-1">Ojo Izquierdo (OI)</h4>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">Esfera (ESF)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOI.esf} disabled={!canEdit || saving} onChange={(e) => setRxFinalOI({ ...rxFinalOI, esf: e.target.value })} />
              </label>
              <label className="text-xs">Cilindro (CYL)
                <input type="number" step="0.25" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOI.cyl} disabled={!canEdit || saving} onChange={(e) => setRxFinalOI({ ...rxFinalOI, cyl: e.target.value })} />
              </label>
              <label className="text-xs">Eje (°)
                <input type="number" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOI.eje} disabled={!canEdit || saving} onChange={(e) => setRxFinalOI({ ...rxFinalOI, eje: e.target.value })} />
              </label>
              <label className="text-xs">Adición (ADD)
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOI.add} disabled={!canEdit || saving} onChange={(e) => setRxFinalOI({ ...rxFinalOI, add: e.target.value })} />
              </label>
              <label className="text-xs">AVL
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOI.avl} disabled={!canEdit || saving} onChange={(e) => setRxFinalOI({ ...rxFinalOI, avl: e.target.value })} />
              </label>
              <label className="text-xs">AVP
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOI.avp} disabled={!canEdit || saving} onChange={(e) => setRxFinalOI({ ...rxFinalOI, avp: e.target.value })} />
              </label>
              <label className="text-xs col-span-2">ALT
                <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalOI.alt} disabled={!canEdit || saving} onChange={(e) => setRxFinalOI({ ...rxFinalOI, alt: e.target.value })} />
              </label>
            </div>
          </div>
        </div>
        {/* General final prescription metadata */}
        <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/60 pt-3">
          <label className="text-xs font-bold">DNP
            <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalDnp} disabled={!canEdit || saving} onChange={(e) => setRxFinalDnp(e.target.value)} />
          </label>
          <label className="text-xs font-bold">AO
            <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalAo} disabled={!canEdit || saving} onChange={(e) => setRxFinalAo(e.target.value)} />
          </label>
          <label className="text-xs font-bold">ALT
            <input className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={rxFinalAlt} disabled={!canEdit || saving} onChange={(e) => setRxFinalAlt(e.target.value)} />
          </label>
        </div>
      </section>

      {/* 5. Queratometría (Topografía) */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">5. Queratometría (Mediciones para Mapa Topográfico)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-bold">
          <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest/50 space-y-3">
            <h4 className="text-cyan-600 border-b border-outline-variant pb-1">Ojo Derecho (OD)</h4>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs">K1 (Plano - D)
                <input type="number" step="0.05" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={kOD.k1} disabled={!canEdit || saving} onChange={(e) => setKOD({ ...kOD, k1: e.target.value })} placeholder="Ej: 43.25" />
              </label>
              <label className="text-xs">K2 (Curvo - D)
                <input type="number" step="0.05" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={kOD.k2} disabled={!canEdit || saving} onChange={(e) => setKOD({ ...kOD, k2: e.target.value })} placeholder="Ej: 44.75" />
              </label>
              <label className="text-xs">Eje (°)
                <input type="number" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={kOD.eje} disabled={!canEdit || saving} onChange={(e) => setKOD({ ...kOD, eje: e.target.value })} placeholder="Ej: 90" />
              </label>
            </div>
          </div>
          <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest/50 space-y-3">
            <h4 className="text-pink-600 border-b border-outline-variant pb-1">Ojo Izquierdo (OI)</h4>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs">K1 (Plano - D)
                <input type="number" step="0.05" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={kOI.k1} disabled={!canEdit || saving} onChange={(e) => setKOI({ ...kOI, k1: e.target.value })} placeholder="Ej: 43.00" />
              </label>
              <label className="text-xs">K2 (Curvo - D)
                <input type="number" step="0.05" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={kOI.k2} disabled={!canEdit || saving} onChange={(e) => setKOI({ ...kOI, k2: e.target.value })} placeholder="Ej: 44.50" />
              </label>
              <label className="text-xs">Eje (°)
                <input type="number" className="w-full rounded border border-outline-variant bg-surface-container-lowest p-2 font-normal" value={kOI.eje} disabled={!canEdit || saving} onChange={(e) => setKOI({ ...kOI, eje: e.target.value })} placeholder="Ej: 95" />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Other clinical sections */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">Secciones Fisiológicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm font-bold">
          <label className="space-y-2">Biomicroscopía
            <textarea className="w-full min-h-20 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={biomicroscopiaTexto} disabled={!canEdit || saving} onChange={(e) => setBiomicroscopiaTexto(e.target.value)} placeholder="Ej: Cornea clara, conjuntiva sana, camara anterior formada..." />
          </label>
          <label className="space-y-2">Reflejos pupilares
            <textarea className="w-full min-h-20 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={reflejosTexto} disabled={!canEdit || saving} onChange={(e) => setReflejosTexto(e.target.value)} placeholder="Ej: PIRRL (Pupilas Isocoricas Reactivas a la Luz y Acomodacion)..." />
          </label>
          <label className="space-y-2">Oftalmoscopía (Fondo de Ojo)
            <textarea className="w-full min-h-20 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={oftalmoscopiaTexto} disabled={!canEdit || saving} onChange={(e) => setOftalmoscopiaTexto(e.target.value)} placeholder="Ej: Papila de bordes netos, relacion arteria-vena 2/3, retina aplicada..." />
          </label>
          <label className="space-y-2">Examen motor
            <textarea className="w-full min-h-20 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={motorTexto} disabled={!canEdit || saving} onChange={(e) => setMotorTexto(e.target.value)} placeholder="Ej: MOEs conservados, ortoforia de lejos y cerca..." />
          </label>
        </div>
      </section>

      {/* Diagnostics and Treatment */}
      <section className="vt-surface-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-b border-outline-variant pb-2">Diagnóstico y Tratamiento</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-sm font-bold">
          <label className="space-y-2">Diagnóstico Ojo Derecho (OD)
            <textarea className="w-full min-h-20 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={diagnosticoOD} disabled={!canEdit || saving} onChange={(e) => setDiagnosticoOD(e.target.value)} placeholder="Ej: Miopia moderada + Astigmatismo miopico simple..." />
          </label>
          <label className="space-y-2">Diagnóstico Ojo Izquierdo (OI)
            <textarea className="w-full min-h-20 rounded-xl border border-outline-variant p-3 font-normal bg-surface-container-lowest" value={diagnosticoOI} disabled={!canEdit || saving} onChange={(e) => setDiagnosticoOI(e.target.value)} placeholder="Ej: Miopia leve..." />
          </label>
          <label className="space-y-2">Diagnóstico motor / Observaciones
            <textarea className="w-full min-h-20 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={diagnosticoMotor} disabled={!canEdit || saving} onChange={(e) => setDiagnosticoMotor(e.target.value)} placeholder="Ej: Ortoforia..." />
          </label>
          <label className="space-y-2">Código CIE10
            <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={cie10} disabled={!canEdit || saving} onChange={(e) => setCie10(e.target.value)} placeholder="Ej: H52.1" />
          </label>
          <label className="space-y-2 lg:col-span-2">Patológico Presuntivo
            <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={patologicoPresuntivo} disabled={!canEdit || saving} onChange={(e) => setPatologicoPresuntivo(e.target.value)} placeholder="Ej: Sospecha de Glaucoma..." />
          </label>
          <label className="space-y-2 lg:col-span-3">Tratamiento / conducta prescrita
            <textarea className="w-full min-h-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={tratamientoConducta} disabled={!canEdit || saving} onChange={(e) => setTratamientoConducta(e.target.value)} placeholder="Ej: Lentes monofocales con filtro antirreflejo y control en 1 año..." />
          </label>
          <label className="space-y-2">Nombre del examinador responsable
            <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal" value={examenNombreExaminador} disabled={!canEdit || saving} onChange={(e) => setExamenNombreExaminador(e.target.value)} />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-outline-variant p-4 text-sm font-bold text-on-surface col-span-2">
            <input type="checkbox" checked={consentimientoInformado} disabled={!canEdit || saving} onChange={(e) => setConsentimientoInformado(e.target.checked)} />
            Consentimiento informado registrado y firmado por el paciente
          </label>
        </div>
      </section>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Link to={historiaClinicaId ? `/admin/historial/${historiaClinicaId}` : "/admin/historial"} className="rounded-xl border border-outline-variant px-5 py-3 font-bold text-on-surface no-underline hover:bg-surface-variant">Cancelar</Link>
        <button type="submit" disabled={!canEdit || saving} className="vt-primary-action rounded-xl px-5 py-3 font-bold disabled:opacity-50">
          <SymbolIcon name="task_alt" className="me-2" /> {saving ? "Guardando..." : "Guardar borrador"}
        </button>
      </div>
    </form>
  );
}
