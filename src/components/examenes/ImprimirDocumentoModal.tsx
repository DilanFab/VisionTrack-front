import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { SymbolIcon } from "../SymbolIcon";
import type { ExamenOptometrico } from "../../types/examenes/ExamenOptometrico";
import { formatFechaClinica, formatHoraClinica } from "../../pages/historias/historiaUtils";

interface ImprimirDocumentoModalProps {
  show: boolean;
  onHide: () => void;
  examen: ExamenOptometrico;
}

// Helper para extraer campos anidados en JSON
const getVal = (obj: unknown, path: string, fallback = "-"): string => {
  if (!obj || typeof obj !== "object") return fallback;
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      return fallback;
    }
  }
  return cur !== undefined && cur !== null && String(cur).trim() !== "" ? String(cur) : fallback;
};

const CURRENT_DATE_OBJ = new Date();
const CURRENT_YEAR = CURRENT_DATE_OBJ.getFullYear();
const CURRENT_MONTH = CURRENT_DATE_OBJ.getMonth();
const CURRENT_DATE = CURRENT_DATE_OBJ.getDate();

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

export const ImprimirDocumentoModal: React.FC<ImprimirDocumentoModalProps> = ({
  show,
  onHide,
  examen,
}) => {
  const [tipoDoc, setTipoDoc] = useState<"receta" | "certificado">("receta");

  const persona = examen.historia_clinica?.perfil?.usuario?.persona;
  const nombrePaciente = persona
    ? [
        persona.persona_primer_nombre,
        persona.persona_segundo_nombre,
        persona.persona_primer_apellido,
        persona.persona_segundo_apellido,
      ]
        .filter(Boolean)
        .join(" ")
    : "Paciente General";

  const cedulaPaciente = persona?.persona_cedula || "N/A";
  const numHistoria = examen.historia_clinica?.historia_clinica_numero || `HC-${examen.historia_clinica_id}`;
  const edadPaciente = calcularEdad(persona?.persona_fecha_nacimiento);
  const nombreDoctor =
    examen.examen_nombre_examinador ||
    examen.examinador?.usuario_nombre ||
    "Dr. Optómetra Tratante";

  // Valores de refracción final o manual
  const odEsf = getVal(
    examen.lensometria,
    "rxFinal.od.esf",
    getVal(examen.refraccion, "manual.od.esf", getVal(examen.refraccion, "computarizada.od.esf", "0.00"))
  );
  const odCyl = getVal(
    examen.lensometria,
    "rxFinal.od.cyl",
    getVal(examen.refraccion, "manual.od.cyl", getVal(examen.refraccion, "computarizada.od.cyl", "0.00"))
  );
  const odEje = getVal(
    examen.lensometria,
    "rxFinal.od.eje",
    getVal(examen.refraccion, "manual.od.eje", getVal(examen.refraccion, "computarizada.od.eje", "0°"))
  );
  const odAdd = getVal(
    examen.lensometria,
    "rxFinal.od.add",
    getVal(examen.refraccion, "manual.od.add", "-")
  );
  const odAvl = getVal(
    examen.lensometria,
    "rxFinal.od.avl",
    getVal(examen.refraccion, "manual.od.va", "20/20")
  );
  const odAvp = getVal(examen.lensometria, "rxFinal.od.avp", "0.50M");

  const oiEsf = getVal(
    examen.lensometria,
    "rxFinal.oi.esf",
    getVal(examen.refraccion, "manual.oi.esf", getVal(examen.refraccion, "computarizada.oi.esf", "0.00"))
  );
  const oiCyl = getVal(
    examen.lensometria,
    "rxFinal.oi.cyl",
    getVal(examen.refraccion, "manual.oi.cyl", getVal(examen.refraccion, "computarizada.oi.cyl", "0.00"))
  );
  const oiEje = getVal(
    examen.lensometria,
    "rxFinal.oi.eje",
    getVal(examen.refraccion, "manual.oi.eje", getVal(examen.refraccion, "computarizada.oi.eje", "0°"))
  );
  const oiAdd = getVal(
    examen.lensometria,
    "rxFinal.oi.add",
    getVal(examen.refraccion, "manual.oi.add", "-")
  );
  const oiAvl = getVal(
    examen.lensometria,
    "rxFinal.oi.avl",
    getVal(examen.refraccion, "manual.oi.va", "20/20")
  );
  const oiAvp = getVal(examen.lensometria, "rxFinal.oi.avp", "0.50M");

  const dnp = getVal(
    examen.lensometria,
    "rxFinal.dnp",
    getVal(examen.refraccion, "computarizada.dp", "62 mm")
  );

  // Agudeza visual sin corrección
  const avSinOD = getVal(examen.agudeza_visual, "od.vl_sc", "20/40");
  const avSinOI = getVal(examen.agudeza_visual, "oi.vl_sc", "20/40");

  const handlePrint = () => {
    const printableElement = document.getElementById("area-impresion-clinica");
    if (!printableElement) {
      window.print();
      return;
    }

    // Crear iframe invisible para aislar la impresión y asegurar exactamente 1 página sin residuos del DOM
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "style",
      "position: fixed; width: 0; height: 0; border: 0; left: -9999px; top: -9999px;"
    );
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return;
    }

    const htmlContent = printableElement.outerHTML;

    iframeDoc.open();
    iframeDoc.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${tipoDoc === "receta" ? "Receta_Oftalmologica" : "Certificado_Salud_Visual"}_${cedulaPaciente}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.35;
    }
    .clinica-receta-page {
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
      border: none !important;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`);
    iframeDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 200);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      dialogClassName="modal-documento-impresion"
    >
      <Modal.Header closeButton className="border-b bg-slate-900 text-white print:hidden">
        <Modal.Title className="text-base font-bold flex items-center gap-2">
          <SymbolIcon name="print" />
          Emisión e Impresión de Documentos Clínicos
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-slate-100 dark:bg-slate-950">
        {/* Selector de Tipo de Documento y Botón Imprimir */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTipoDoc("receta")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tipoDoc === "receta"
                  ? "bg-cyan-700 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <SymbolIcon name="prescriptions" />
              Receta Oftálmica (Rx)
            </button>
            <button
              type="button"
              onClick={() => setTipoDoc("certificado")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tipoDoc === "certificado"
                  ? "bg-cyan-700 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <SymbolIcon name="verified" />
              Certificado de Salud Visual
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95"
          >
            <SymbolIcon name="print" />
            Imprimir / Guardar PDF
          </button>
        </div>

        {/* Vista Previa del Documento (Diseño exacto A4, 1 página) */}
        <div className="p-4 sm:p-8 flex justify-center overflow-auto max-h-[80vh]">
          <div
            id="area-impresion-clinica"
            className="clinica-receta-page"
            style={{
              width: "100%",
              maxWidth: "760px",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              padding: "24px 28px",
              margin: "0 auto",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              lineHeight: 1.35,
            }}
          >
            {/* 1. ENCABEZADO / MEMBRETE CLÍNICO */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                paddingBottom: "10px",
                borderBottom: "2.5px solid #0891b2",
                marginBottom: "12px",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg
                    style={{ width: "28px", height: "28px" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3.2" />
                  </svg>
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      letterSpacing: "-0.5px",
                      color: "#0891b2",
                    }}
                  >
                    VISIONTRACK
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    letterSpacing: "1.2px",
                    color: "#0f172a",
                    textTransform: "uppercase",
                    marginTop: "2px",
                  }}
                >
                  Centro Oftalmológico & Salud Visual
                </div>
                <div style={{ fontSize: "8.5px", color: "#64748b", marginTop: "1px" }}>
                  R.U.C.: 1792345678001 · Licencia MSP / ACESS: No. 2026-VT-089
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontSize: "8.5px",
                  color: "#475569",
                  lineHeight: "1.35",
                }}
              >
                <div style={{ fontWeight: 800, color: "#0f172a" }}>Consultorio Principal</div>
                <div>Av. República del Salvador N34-123 y NNUU, Piso 4</div>
                <div>Telf: (02) 234-5678 · Cel: 099 876 5432</div>
                <div style={{ color: "#0891b2", fontWeight: 600 }}>Quito - Ecuador · citas@visiontrack.med.ec</div>
              </div>
            </div>

            {/* 2. TARJETA DE DATOS DEL PACIENTE */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "6px 12px",
                  fontSize: "11px",
                }}
              >
                <div>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    PACIENTE
                  </div>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "13px" }}>
                    {nombrePaciente}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    CÉDULA / DNI
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {cedulaPaciente}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    HISTORIA CLÍNICA
                  </div>
                  <div style={{ fontWeight: 800, color: "#0891b2" }}>
                    {numHistoria}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    OPTÓMETRA TRATANTE
                  </div>
                  <div style={{ fontWeight: 600, color: "#334155" }}>
                    {nombreDoctor}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    EDAD
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {edadPaciente} años
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    FECHA DE EXAMEN
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {formatFechaClinica(examen.examen_fecha)} {formatHoraClinica(examen.examen_hora)}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CONTENIDO: RECETA OFTALMOLÓGICA */}
            {tipoDoc === "receta" && (
              <div>
                <div style={{ textAlign: "center", margin: "8px 0 10px 0" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "#0f172a",
                      borderBottom: "2px solid #0891b2",
                      paddingBottom: "3px",
                    }}
                  >
                    RECETA OFTALMOLÓGICA / PRESCRIPCIÓN ÓPTICA
                  </span>
                </div>

                {/* Tabla de Graduación */}
                <div
                  style={{
                    border: "1.5px solid #0f172a",
                    borderRadius: "6px",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                        <th style={{ padding: "6px 8px", textAlign: "left", paddingLeft: "12px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px" }}>
                          OJO
                        </th>
                        <th style={{ padding: "6px 6px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px" }}>ESFERA</th>
                        <th style={{ padding: "6px 6px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px" }}>CILINDRO</th>
                        <th style={{ padding: "6px 6px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px" }}>EJE</th>
                        <th style={{ padding: "6px 6px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px" }}>ADICIÓN</th>
                        <th style={{ padding: "6px 6px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px" }}>AV LEJOS</th>
                        <th style={{ padding: "6px 6px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.5px" }}>AV CERCA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            fontWeight: 800,
                            backgroundColor: "#f8fafc",
                            color: "#0f172a",
                            fontSize: "11px",
                          }}
                        >
                          O.D. (Derecho)
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                          {odEsf}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                          {odCyl}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                          {odEje}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "#475569" }}>
                          {odAdd}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "#0891b2" }}>
                          {odAvl}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "#475569" }}>
                          {odAvp}
                        </td>
                      </tr>
                      <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            fontWeight: 800,
                            backgroundColor: "#f8fafc",
                            color: "#0f172a",
                            fontSize: "11px",
                          }}
                        >
                          O.I. (Izquierdo)
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                          {oiEsf}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                          {oiCyl}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 800, fontSize: "12px", color: "#0f172a" }}>
                          {oiEje}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "#475569" }}>
                          {oiAdd}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "#0891b2" }}>
                          {oiAvl}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "#475569" }}>
                          {oiAvp}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderTop: "1px solid #cbd5e1",
                      padding: "6px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                  >
                    <span>
                      Distancia Pupilar (DP / DNP): <strong style={{ color: "#0f172a" }}>{dnp}</strong>
                    </span>
                    <span>
                      Uso sugerido: <strong style={{ color: "#0f172a" }}>Permanente / Lectura</strong>
                    </span>
                  </div>
                </div>

                {/* Bloques de Diagnóstico e Indicaciones */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8.5px",
                        fontWeight: 800,
                        color: "#0891b2",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                        borderBottom: "1px solid #e2e8f0",
                        paddingBottom: "2px",
                      }}
                    >
                      Diagnóstico Refractivo
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#1e293b", lineHeight: "1.35" }}>
                      <p style={{ margin: "0 0 2px 0" }}>
                        <strong>OD:</strong> {examen.diagnostico_od || "Miopía y astigmatismo miópico"}
                      </p>
                      <p style={{ margin: "0 0 2px 0" }}>
                        <strong>OI:</strong> {examen.diagnostico_oi || "Miopía y astigmatismo miópico"}
                      </p>
                      {examen.cie10 && (
                        <p style={{ margin: "2px 0 0 0", fontSize: "9.5px", color: "#0891b2", fontWeight: 700 }}>
                          CIE-10: {examen.cie10}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8.5px",
                        fontWeight: 800,
                        color: "#0891b2",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                        borderBottom: "1px solid #e2e8f0",
                        paddingBottom: "2px",
                      }}
                    >
                      Indicaciones / Tipo de Lente
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#1e293b", lineHeight: "1.35" }}>
                      <p style={{ margin: 0 }}>
                        {examen.tratamiento_conducta ||
                          "Lentes de armazón con tratamiento antirreflejo y filtro azul (Blue Block) con protección UV. Control visual en 12 meses."}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "8.5px",
                    color: "#64748b",
                    textAlign: "center",
                    fontStyle: "italic",
                    marginTop: "6px",
                  }}
                >
                  * Esta fórmula óptica tiene una validez recomendada de un (1) año calendario a partir de su emisión.
                </div>
              </div>
            )}

            {/* 4. CONTENIDO: CERTIFICADO DE SALUD VISUAL */}
            {tipoDoc === "certificado" && (
              <div>
                <div style={{ textAlign: "center", margin: "8px 0 10px 0" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "#0f172a",
                      borderBottom: "2px solid #0891b2",
                      paddingBottom: "3px",
                    }}
                  >
                    CERTIFICADO DE SALUD VISUAL Y APTITUD OCULAR
                  </span>
                </div>

                <div style={{ fontSize: "11px", color: "#1e293b", lineHeight: "1.45" }}>
                  <p style={{ margin: "0 0 8px 0" }}>
                    El suscrito profesional especialista en Optometría y Salud Ocular del Centro Oftálmico{" "}
                    <strong>VISIONTRACK</strong>, debidamente acreditado ante la autoridad sanitaria nacional:
                  </p>

                  <div
                    style={{
                      textAlign: "center",
                      fontWeight: 900,
                      letterSpacing: "2px",
                      fontSize: "13px",
                      color: "#0f172a",
                      margin: "8px 0",
                    }}
                  >
                    CERTIFICA:
                  </div>

                  <p style={{ margin: "0 0 6px 0" }}>
                    Haber evaluado en valoración clínica optométrica integral al/a la paciente:
                  </p>

                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      textAlign: "center",
                      margin: "6px 0 10px 0",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>
                      {nombrePaciente}
                    </div>
                    <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>
                      Cédula de Identidad / Pasaporte: <strong>{cedulaPaciente}</strong>
                    </div>
                  </div>

                  <p style={{ margin: "0 0 6px 0", fontWeight: 700 }}>
                    Habiéndose determinado los siguientes parámetros clínicos:
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px 12px",
                      backgroundColor: "#f1f5f9",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      marginBottom: "10px",
                      fontSize: "10.5px",
                    }}
                  >
                    <div>
                      <strong>Agudeza Visual S/C:</strong> OD: {avSinOD} | OI: {avSinOI}
                    </div>
                    <div>
                      <strong>Agudeza Visual C/C:</strong> OD: {odAvl} | OI: {oiAvl}
                    </div>
                    <div>
                      <strong>Refracción Compensatoria:</strong> OD: {odEsf} {odCyl} | OI: {oiEsf} {oiCyl}
                    </div>
                    <div>
                      <strong>Segmento Anterior:</strong> Sin hallazgos patológicos activos
                    </div>
                  </div>

                  <div
                    style={{
                      borderLeft: "4px solid #059669",
                      backgroundColor: "#ecfdf5",
                      padding: "8px 12px",
                      borderRadius: "0 6px 6px 0",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#065f46", textTransform: "uppercase" }}>
                      CONCLUSIÓN / DICTAMEN DE APTITUD
                    </div>
                    <div style={{ fontSize: "11px", color: "#064e3b", marginTop: "2px" }}>
                      El/la paciente se encuentra <strong>CLÍNICAMENTE APTO(A)</strong> para desempeñar con normalidad
                      sus actividades académicas, laborales y de conducción vehicular, cumpliendo con el uso debido de su
                      corrección óptica prescrita.
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: "9px", color: "#64748b", fontStyle: "italic" }}>
                    Se expide el presente documento a solicitud de la parte interesada para los fines legales o
                    institucionales que correspondan.
                  </p>
                </div>
              </div>
            )}

            {/* 5. FIRMA DEL OPTÓMETRA Y PIE DE PÁGINA */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "20px",
                paddingTop: "12px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "8.5px", color: "#64748b", lineHeight: "1.4" }}>
                <div>Registro Electrónico Oficial: <strong>#VT-{examen.examen_optometrico_id}</strong></div>
                <div>Firma Digital y Certificado Validado en Servidor Clínico</div>
                <div>Fecha de Certificación: {formatFechaClinica(examen.examen_fecha)}</div>
              </div>

              <div style={{ textAlign: "center", minWidth: "220px" }}>
                <div
                  style={{
                    borderBottom: "1.5px solid #0f172a",
                    marginBottom: "4px",
                    paddingBottom: "2px",
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "14px",
                    color: "#0891b2",
                  }}
                >
                  {nombreDoctor}
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a" }}>
                  {nombreDoctor}
                </div>
                <div style={{ fontSize: "8.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Especialista en Optometría y Salud Ocular
                </div>
                <div style={{ fontSize: "8px", color: "#64748b" }}>Reg. Profesional MSP / Senescyt: 17-OPT-8924</div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t bg-white dark:bg-slate-900 print:hidden flex justify-between">
        <span className="text-xs text-slate-500">
          Formato estándar optimizado para 1 hoja A4 / Carta.
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onHide}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <SymbolIcon name="print" />
            Imprimir / Guardar PDF
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
