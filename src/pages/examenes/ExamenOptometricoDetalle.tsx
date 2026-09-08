import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  finalizarExamenOptometrico,
  getExamenOptometrico,
  inactivarExamenOptometrico,
} from "../../api/examenes/examenOptometricoService";
import type { ExamenOptometrico } from "../../types/examenes/ExamenOptometrico";
import { getExamenEstadoLabel } from "../../types/examenes/ExamenOptometrico";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/useTheme";
import { canEditDraftExam, canOperateExams, canReadClinicalSupervision } from "../../lib/roleCapabilities";
import { getApiErrorMessage } from "../../lib/apiError";
import { confirmarEliminacion, mostrarError, mostrarExito } from "../../lib/alerts";
import { formatFechaClinica, formatHoraClinica } from "../historias/historiaUtils";
import EyeViewer3D from "../../components/examenes/EyeViewer3D";
import TopographyMap from "../../components/examenes/TopographyMap";
import VisualSimulation from "../../components/examenes/VisualSimulation";
import { ImprimirDocumentoModal } from "../../components/examenes/ImprimirDocumentoModal";
import { SymbolIcon } from "../../components/SymbolIcon";

// Safe JSON extraction helper
const getJsonVal = (
  section: Record<string, unknown> | null | undefined,
  path: string,
  fallback = ""
): string | number | boolean => {
  if (!section || typeof section !== "object") return fallback;
  const parts = path.split(".");
  let current: unknown = section;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return fallback;
    }
  }
  return typeof current === "string" || typeof current === "number" || typeof current === "boolean"
    ? current
    : fallback;
};

const CURRENT_DATE_OBJ = new Date();
const CURRENT_YEAR = CURRENT_DATE_OBJ.getFullYear();
const CURRENT_MONTH = CURRENT_DATE_OBJ.getMonth();
const CURRENT_DATE = CURRENT_DATE_OBJ.getDate();

// Calculate age from birthdate using module-level constants to ensure rendering purity
const calcularEdad = (fechaNacStr: string | null | undefined): string | number => {
  if (!fechaNacStr) return "N/D";
  try {
    const birth = new Date(fechaNacStr);
    let age = CURRENT_YEAR - birth.getFullYear();
    const monthDiff = CURRENT_MONTH - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && CURRENT_DATE < birth.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  } catch {
    return "N/D";
  }
};

export default function ExamenOptometricoDetalle() {
  const { historiaId, examenId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [examen, setExamen] = useState<ExamenOptometrico | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
      navigate(`/admin/historial/${historiaClinicaId}`);
    } catch (err: unknown) {
      mostrarError(getApiErrorMessage(err, "No se pudo inactivar el examen."));
    } finally {
      setActionLoading(false);
    }
  };

  const historiaClinicaId = Number(historiaId) || examen?.historia_clinica_id || 0;
  const puedeEditar = canEditDraftExam(user?.roles, examen?.examen_estado);
  const supervisor = canReadClinicalSupervision(user?.roles);

  const isDark = theme === "dark";

  // Extraction of values for 3D visualizers and topography
  const spheresAndCylinders = useMemo(() => {
    if (!examen) return { sphereOD: 0, cylinderOD: 0, axisOD: 0, sphereOI: 0, cylinderOI: 0, axisOI: 0 };
    
    const rxFinalOD_esf = getJsonVal(examen.lensometria, "rxFinal.od.esf");
    const rxFinalOD_cyl = getJsonVal(examen.lensometria, "rxFinal.od.cyl");
    const rxFinalOD_eje = getJsonVal(examen.lensometria, "rxFinal.od.eje");
    
    const rxFinalOI_esf = getJsonVal(examen.lensometria, "rxFinal.oi.esf");
    const rxFinalOI_cyl = getJsonVal(examen.lensometria, "rxFinal.oi.cyl");
    const rxFinalOI_eje = getJsonVal(examen.lensometria, "rxFinal.oi.eje");

    const manualOD_esf = getJsonVal(examen.refraccion, "manual.od.esf");
    const manualOD_cyl = getJsonVal(examen.refraccion, "manual.od.cyl");
    const manualOD_eje = getJsonVal(examen.refraccion, "manual.od.eje");

    const manualOI_esf = getJsonVal(examen.refraccion, "manual.oi.esf");
    const manualOI_cyl = getJsonVal(examen.refraccion, "manual.oi.cyl");
    const manualOI_eje = getJsonVal(examen.refraccion, "manual.oi.eje");

    const compOD_esf = getJsonVal(examen.refraccion, "computarizada.od.esf");
    const compOD_cyl = getJsonVal(examen.refraccion, "computarizada.od.cyl");
    const compOD_eje = getJsonVal(examen.refraccion, "computarizada.od.eje");

    const compOI_esf = getJsonVal(examen.refraccion, "computarizada.oi.esf");
    const compOI_cyl = getJsonVal(examen.refraccion, "computarizada.oi.cyl");
    const compOI_eje = getJsonVal(examen.refraccion, "computarizada.oi.eje");

    const parseVal = (v: unknown): number => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const parsed = parseFloat(v);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    return {
      sphereOD: parseVal(rxFinalOD_esf || manualOD_esf || compOD_esf || 0),
      cylinderOD: parseVal(rxFinalOD_cyl || manualOD_cyl || compOD_cyl || 0),
      axisOD: parseVal(rxFinalOD_eje || manualOD_eje || compOD_eje || 0),
      
      sphereOI: parseVal(rxFinalOI_esf || manualOI_esf || compOI_esf || 0),
      cylinderOI: parseVal(rxFinalOI_cyl || manualOI_cyl || compOI_cyl || 0),
      axisOI: parseVal(rxFinalOI_eje || manualOI_eje || compOI_eje || 0),
    };
  }, [examen]);

  const topographyValues = useMemo(() => {
    if (!examen) return { k1OD: 43.25, k2OD: 44.75, ejeOD: 90, k1OI: 43.0, k2OI: 44.5, ejeOI: 95 };

    const parseVal = (v: unknown, fallback: number): number => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const parsed = parseFloat(v);
        return isNaN(parsed) ? fallback : parsed;
      }
      return fallback;
    };

    return {
      k1OD: parseVal(getJsonVal(examen.queratometria, "od.k1"), 43.25),
      k2OD: parseVal(getJsonVal(examen.queratometria, "od.k2"), 44.75),
      ejeOD: parseVal(getJsonVal(examen.queratometria, "od.eje"), 90),
      k1OI: parseVal(getJsonVal(examen.queratometria, "oi.k1"), 43.00),
      k2OI: parseVal(getJsonVal(examen.queratometria, "oi.k2"), 44.50),
      ejeOI: parseVal(getJsonVal(examen.queratometria, "oi.eje"), 95),
    };
  }, [examen]);

  if (loading) return <div className="p-8 text-slate-400">Cargando expediente clínico...</div>;
  if (error) return <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-sm text-red-400">{error}</div>;
  if (!examen) return <div className="p-8 text-slate-400">Expediente clínico no encontrado.</div>;

  const persona = examen.historia_clinica?.perfil?.usuario?.persona;
  const fullName = persona 
    ? `${persona.persona_primer_nombre || ""} ${persona.persona_segundo_nombre || ""} ${persona.persona_primer_apellido || ""} ${persona.persona_segundo_apellido || ""}`.trim()
    : "Paciente No Identificado";

  return (
    <div
      className={`p-6 rounded-3xl min-h-screen font-sans border shadow-2xl relative overflow-hidden space-y-6 transition-all duration-300 ${
        isDark
          ? "dark bg-[#070a13] text-[#e2e8f0] border-[#1e2942]"
          : "bg-[#f8fafc] text-slate-800 border-slate-200"
      }`}
    >
      {/* Background Glows (Only in dark mode) */}
      {isDark && (
        <>
          <div className="absolute right-0 top-0 h-96 w-96 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute left-1/4 bottom-10 h-[500px] w-[500px] bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
        </>
      )}

      {/* Top Header */}
      <header className={`relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between border-b pb-5 ${isDark ? "border-[#1e2942]/60" : "border-slate-200"}`}>
        <div>
          <Link
            to={`/admin/historial/${historiaClinicaId}`}
            className={`text-xs font-bold no-underline inline-flex items-center gap-2 mb-3 tracking-wider uppercase transition-colors ${
              isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"
            }`}
          >
            ← Volver al Historial del Paciente
          </Link>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-black tracking-tight uppercase ${isDark ? "text-white" : "text-slate-800"}`}>
              Historia Clínica
            </h1>
            <span className={`text-xs border px-3 py-1 rounded-full font-mono font-bold ${
              isDark ? "bg-[#1e2942]/80 border-[#38bdf8]/30 text-[#38bdf8]" : "bg-cyan-50 border-cyan-200 text-cyan-700"
            }`}>
              HC: {examen.historia_clinica?.historia_clinica_numero || "HC-0000"}
            </span>
          </div>
          <p className={`text-xs font-mono mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Examen #{examen.examen_optometrico_id} · Fecha: {formatFechaClinica(examen.examen_fecha)} {formatHoraClinica(examen.examen_hora)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-black tracking-wider border uppercase ${
              examen.examen_estado === "B"
                ? "border-amber-500/30 bg-amber-950/30 text-amber-400"
                : examen.examen_estado === "F"
                ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400"
                : "border-slate-500/30 bg-slate-900/30 text-slate-400"
            }`}
          >
            {getExamenEstadoLabel(examen.examen_estado)}
          </span>

          {supervisor && (
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              isDark ? "border-purple-500/30 bg-purple-950/30 text-purple-400" : "border-purple-200 bg-purple-50 text-purple-700"
            }`}>
              Modo Supervisión
            </span>
          )}

          {puedeEditar && (
            <Link
              to={`/admin/historial/${historiaClinicaId}/examenes/${examen.examen_optometrico_id}/editar`}
              className={`font-bold rounded-xl px-4 py-2 text-xs transition-all flex items-center gap-1.5 ${
                isDark ? "bg-cyan-500 hover:bg-cyan-600 text-slate-950" : "bg-cyan-600 hover:bg-cyan-700 text-white"
              }`}
            >
              <SymbolIcon name="edit" className="text-sm" /> Editar Borrador
            </Link>
          )}

          {canOperateExams(user?.roles) && examen.examen_estado === "B" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={finalizar}
              className={`border font-bold rounded-xl px-4 py-2 text-xs transition-all flex items-center gap-1.5 ${
                isDark ? "bg-[#1e2942]/60 hover:bg-[#1e2942] border-emerald-500/30 text-emerald-400" : "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700"
              }`}
            >
              <SymbolIcon name="check_circle" className="text-sm" /> Finalizar
            </button>
          )}

          {canOperateExams(user?.roles) && examen.examen_estado !== "I" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={inactivar}
              className={`border font-bold rounded-xl px-4 py-2 text-xs transition-all ${
                isDark ? "bg-red-950/40 hover:bg-red-950/80 border-red-500/30 text-red-400" : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
              }`}
            >
              Inactivar
            </button>
          )}

          {/* Botón de Impresión de Receta / Certificado */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className={`font-bold rounded-xl px-4 py-2 text-xs transition-all flex items-center gap-1.5 ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "bg-white hover:bg-slate-50 text-cyan-800 border border-cyan-300 shadow-sm"
            }`}
          >
            <SymbolIcon name="print" className="text-sm" /> Imprimir Receta / Certificado
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Left Side: Medical Record Content (col-span 1) */}
        <div className="space-y-6">
          
          {/* Section 1: Patient Header Info */}
          <section className={`border rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-center relative overflow-hidden transition-all ${
            isDark
              ? "bg-[#0e1327]/80 border-[#1e2942]/60"
              : "bg-white border-slate-200 shadow-sm"
          }`}>
            {isDark && <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black ${
              isDark ? "bg-cyan-950 border border-cyan-500/40 text-cyan-400" : "bg-cyan-50 border border-cyan-300 text-cyan-700"
            }`}>
              {fullName.charAt(0)}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
              <div className={`md:col-span-3 pb-2 border-b ${isDark ? "border-[#1e2942]/40" : "border-slate-100"}`}>
                <h3 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>{fullName}</h3>
                <p className={`text-xs font-mono mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cédula: {persona?.persona_cedula || "N/D"}</p>
              </div>
              <div>
                <span className={`text-[10px] uppercase tracking-widest block ${isDark ? "text-slate-400" : "text-slate-550"}`}>Edad</span>
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{calcularEdad(persona?.persona_fecha_nacimiento)} años</span>
              </div>
              <div>
                <span className={`text-[10px] uppercase tracking-widest block ${isDark ? "text-slate-400" : "text-slate-550"}`}>Ocupación</span>
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                  {getJsonVal(examen.refraccion, "ocupacion") || getJsonVal(examen.lensometria, "ocupacion") || "No registrada"}
                </span>
              </div>
              <div>
                <span className={`text-[10px] uppercase tracking-widest block ${isDark ? "text-slate-400" : "text-slate-550"}`}>Hobby</span>
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                  {getJsonVal(examen.refraccion, "hobby") || getJsonVal(examen.lensometria, "hobby") || "No registrado"}
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Refracción Computarizada */}
          <section className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isDark ? "bg-[#0e1327]/80 border-[#1e2942]/60" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`border-b pb-2 ${isDark ? "border-[#1e2942]/50" : "border-slate-100"}`}>
              <h3 className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>1. Refracción Computarizada</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#1e2942] text-slate-400" : "border-slate-250 text-slate-500"}`}>
                    <th className="py-2">OJO</th>
                    <th>ESFERA (ESF)</th>
                    <th>CILINDRO (CYL)</th>
                    <th>EJE</th>
                    <th>DP</th>
                    <th>U.C.V</th>
                    <th>M.P.C</th>
                    <th>E.A</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-[#1e2942]/40 text-white" : "divide-slate-100 text-slate-700"}`}>
                  <tr>
                    <td className="py-2.5 font-bold text-[#06b6d4]">OD</td>
                    <td>{getJsonVal(examen.refraccion, "computarizada.od.esf") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "computarizada.od.cyl") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "computarizada.od.eje") || "0"}°</td>
                    <td rowSpan={2} className={`align-middle border-l pl-3 ${isDark ? "border-[#1e2942]/60" : "border-slate-100"}`}>
                      {getJsonVal(examen.refraccion, "computarizada.dp") || "N/A"}
                    </td>
                    <td rowSpan={2} className="align-middle pl-3">
                      {getJsonVal(examen.refraccion, "computarizada.ucv") || "N/A"}
                    </td>
                    <td rowSpan={2} className="align-middle pl-3">
                      {getJsonVal(examen.refraccion, "computarizada.mpc") || "N/A"}
                    </td>
                    <td rowSpan={2} className="align-middle pl-3">
                      {getJsonVal(examen.refraccion, "computarizada.ea") || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-pink-500">OI</td>
                    <td>{getJsonVal(examen.refraccion, "computarizada.oi.esf") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "computarizada.oi.cyl") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "computarizada.oi.eje") || "0"}°</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Antecedentes */}
          <section className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isDark ? "bg-[#0e1327]/80 border-[#1e2942]/60" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`border-b pb-2 ${isDark ? "border-[#1e2942]/50" : "border-slate-100"}`}>
              <h3 className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>2. Antecedentes Oculares y Generales</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDark ? "bg-[#070a13] border-[#1e2942]/40 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <span className={`text-[10px] uppercase tracking-widest block font-bold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Antecedentes Personales</span>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {examen.antecedentes_personales_oculares || examen.antecedentes_personales_generales || "Sin antecedentes registrados"}
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDark ? "bg-[#070a13] border-[#1e2942]/40 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <span className={`text-[10px] uppercase tracking-widest block font-bold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Antecedentes Familiares</span>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {examen.antecedentes_familiares_oculares || examen.antecedentes_familiares_generales || "Sin antecedentes registrados"}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Agudeza Visual */}
          <section className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isDark ? "bg-[#0e1327]/80 border-[#1e2942]/60" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`border-b pb-2 flex items-center justify-between ${isDark ? "border-[#1e2942]/50" : "border-slate-100"}`}>
              <h3 className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>3. Agudeza Visual</h3>
              {getJsonVal(examen.agudeza_visual, "add") && (
                <span className={`text-xs font-mono font-bold ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>ADD: {getJsonVal(examen.agudeza_visual, "add")}</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#1e2942] text-slate-400" : "border-slate-250 text-slate-500"}`}>
                    <th className="py-2">OJO</th>
                    <th>VL S.C.</th>
                    <th>VP S.C.</th>
                    <th>PH</th>
                    <th>RX EN USO</th>
                    <th>VL C.C.</th>
                    <th>VP C.C.</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-[#1e2942]/40 text-white" : "divide-slate-100 text-slate-700"}`}>
                  <tr>
                    <td className="py-2.5 font-bold text-[#06b6d4]">OD</td>
                    <td>{getJsonVal(examen.agudeza_visual, "od.vl_sc") || "20/20"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "od.vp_sc") || "0.50"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "od.ph") || "-"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "od.rx_en_uso") || "Ninguna"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "od.vl_cc") || "20/20"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "od.vp_cc") || "0.50"}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-pink-500">OI</td>
                    <td>{getJsonVal(examen.agudeza_visual, "oi.vl_sc") || "20/20"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "oi.vp_sc") || "0.50"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "oi.ph") || "-"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "oi.rx_en_uso") || "Ninguna"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "oi.vl_cc") || "20/20"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "oi.vp_cc") || "0.50"}</td>
                  </tr>
                  <tr className={isDark ? "bg-slate-900/30" : "bg-slate-50"}>
                    <td className="py-2.5 font-bold text-purple-500">AO</td>
                    <td>{getJsonVal(examen.agudeza_visual, "ao.vl_sc") || "20/20"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "ao.vp_sc") || "0.50"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "ao.ph") || "-"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "ao.rx_en_uso") || "Ninguna"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "ao.vl_cc") || "20/20"}</td>
                    <td>{getJsonVal(examen.agudeza_visual, "ao.vp_cc") || "0.50"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Refracción Manual */}
          <section className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isDark ? "bg-[#0e1327]/80 border-[#1e2942]/60" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`border-b pb-2 ${isDark ? "border-[#1e2942]/50" : "border-slate-100"}`}>
              <h3 className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>4. Refracción Manual</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#1e2942] text-slate-400" : "border-slate-250 text-slate-500"}`}>
                    <th className="py-2">OJO</th>
                    <th>ESFERA (ESF)</th>
                    <th>CILINDRO (CYL)</th>
                    <th>EJE</th>
                    <th>VA</th>
                    <th>ADD</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-[#1e2942]/40 text-white" : "divide-slate-100 text-slate-700"}`}>
                  <tr>
                    <td className="py-2.5 font-bold text-[#06b6d4]">OD</td>
                    <td>{getJsonVal(examen.refraccion, "manual.od.esf") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "manual.od.cyl") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "manual.od.eje") || "0"}°</td>
                    <td>{getJsonVal(examen.refraccion, "manual.od.va") || "20/20"}</td>
                    <td>{getJsonVal(examen.refraccion, "manual.od.add") || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-pink-500">OI</td>
                    <td>{getJsonVal(examen.refraccion, "manual.oi.esf") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "manual.oi.cyl") || "0.00"}</td>
                    <td>{getJsonVal(examen.refraccion, "manual.oi.eje") || "0"}°</td>
                    <td>{getJsonVal(examen.refraccion, "manual.oi.va") || "20/20"}</td>
                    <td>{getJsonVal(examen.refraccion, "manual.oi.add") || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Rx Final */}
          <section className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isDark ? "bg-[#0e1327]/80 border-[#1e2942]/60" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`border-b pb-2 flex items-center justify-between ${isDark ? "border-[#1e2942]/50" : "border-slate-100"}`}>
              <h3 className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>5. Rx Final (Fórmula Prescrita)</h3>
              <div className={`flex gap-4 text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span>DNP: <strong className={isDark ? "text-white" : "text-slate-800"}>{getJsonVal(examen.lensometria, "rxFinal.dnp") || "N/A"}</strong></span>
                <span>AO: <strong className={isDark ? "text-white" : "text-slate-800"}>{getJsonVal(examen.lensometria, "rxFinal.ao") || "N/A"}</strong></span>
                <span>ALT: <strong className={isDark ? "text-white" : "text-slate-800"}>{getJsonVal(examen.lensometria, "rxFinal.alt") || "N/A"}</strong></span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#1e2942] text-slate-400" : "border-slate-250 text-slate-500"}`}>
                    <th className="py-2">OJO</th>
                    <th>ESFERA (ESF)</th>
                    <th>CILINDRO (CYL)</th>
                    <th>EJE</th>
                    <th>ADD</th>
                    <th>AVL</th>
                    <th>AVP</th>
                    <th>ALT</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-[#1e2942]/40 text-white" : "divide-slate-100 text-slate-700"}`}>
                  <tr>
                    <td className="py-2.5 font-bold text-[#06b6d4]">OD</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.od.esf") || "0.00"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.od.cyl") || "0.00"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.od.eje") || "0"}°</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.od.add") || "-"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.od.avl") || "20/20"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.od.avp") || "0.50"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.od.alt") || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-pink-500">OI</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.oi.esf") || "0.00"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.oi.cyl") || "0.00"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.oi.eje") || "0"}°</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.oi.add") || "-"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.oi.avl") || "20/20"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.oi.avp") || "0.50"}</td>
                    <td>{getJsonVal(examen.lensometria, "rxFinal.oi.alt") || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7: Diagnóstico, Observaciones y Tratamiento */}
          <section className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isDark ? "bg-[#0e1327]/80 border-[#1e2942]/60" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`border-b pb-2 ${isDark ? "border-[#1e2942]/50" : "border-slate-100"}`}>
              <h3 className={`text-xs uppercase tracking-widest font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>6. Observaciones, Diagnóstico y Tratamiento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className={`p-3.5 rounded-xl border transition-all col-span-3 ${
                isDark ? "bg-[#070a13] border-[#1e2942]/40 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <span className={`text-[10px] uppercase tracking-widest block font-bold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Observaciones / Anamnesis</span>
                <p className="whitespace-pre-wrap leading-relaxed">{examen.examen_anamnesis || "Sin observaciones registradas"}</p>
              </div>
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDark ? "bg-[#070a13] border-[#1e2942]/40 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <span className={`text-[10px] uppercase tracking-widest block font-bold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Diagnóstico OD</span>
                <p className="leading-relaxed">{examen.diagnostico_od || "Sin diagnóstico registrado"}</p>
              </div>
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDark ? "bg-[#070a13] border-[#1e2942]/40 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <span className={`text-[10px] uppercase tracking-widest block font-bold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Diagnóstico OI</span>
                <p className="leading-relaxed">{examen.diagnostico_oi || "Sin diagnóstico registrado"}</p>
              </div>
              <div className={`p-3.5 rounded-xl border transition-all ${
                isDark ? "bg-[#070a13] border-[#1e2942]/40 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <span className={`text-[10px] uppercase tracking-widest block font-bold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Diagnóstico Motor / CIE-10</span>
                <p className="leading-relaxed font-mono">
                  {examen.diagnostico_motor ? `${examen.diagnostico_motor} ` : ""}
                  {examen.cie10 ? `[CIE-10: ${examen.cie10}]` : ""}
                  {!examen.diagnostico_motor && !examen.cie10 ? "Sin diagnóstico registrado" : ""}
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border transition-all col-span-3 ${
                isDark ? "bg-[#070a13] border-[#1e2942]/40 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <span className={`text-[10px] uppercase tracking-widest block font-bold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Tratamiento / Conducta Recomendada</span>
                <p className={`font-bold whitespace-pre-wrap leading-relaxed ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{examen.tratamiento_conducta || "Sin tratamiento registrado"}</p>
              </div>
            </div>
            <div className={`pt-3 border-t flex flex-col md:flex-row md:items-center justify-between text-[10px] gap-2 ${
              isDark ? "border-[#1e2942]/40 text-slate-400" : "border-slate-100 text-slate-500"
            }`}>
              <div>Optometrista Responsable: <strong className={isDark ? "text-white" : "text-slate-800"}>{examen.examen_nombre_examinador || examen.examinador?.usuario_nombre || "No especificado"}</strong></div>
              <div>Consentimiento Informado: <strong className={examen.consentimiento_informado ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>{examen.consentimiento_informado ? "Firmado/Autorizado" : "No registrado"}</strong></div>
            </div>
          </section>

        </div>

        {/* Right Side: Interactive Visualizers (col-span 1) */}
        <div className="lg:col-span-1 space-y-6">
          <EyeViewer3D
            esferaOD={spheresAndCylinders.sphereOD}
            cilindroOD={spheresAndCylinders.cylinderOD}
            ejeOD={spheresAndCylinders.axisOD}
            esferaOI={spheresAndCylinders.sphereOI}
            cilindroOI={spheresAndCylinders.cylinderOI}
            ejeOI={spheresAndCylinders.axisOI}
          />

          <TopographyMap
            k1OD={topographyValues.k1OD}
            k2OD={topographyValues.k2OD}
            ejeOD={topographyValues.ejeOD}
            k1OI={topographyValues.k1OI}
            k2OI={topographyValues.k2OI}
            ejeOI={topographyValues.ejeOI}
          />

          <VisualSimulation
            esferaOD={spheresAndCylinders.sphereOD}
            cilindroOD={spheresAndCylinders.cylinderOD}
            esferaOI={spheresAndCylinders.sphereOI}
            cilindroOI={spheresAndCylinders.cylinderOI}
          />
        </div>
      </div>

      {showPrintModal && (
        <ImprimirDocumentoModal
          show={showPrintModal}
          onHide={() => setShowPrintModal(false)}
          examen={examen}
        />
      )}
    </div>
  );
}
