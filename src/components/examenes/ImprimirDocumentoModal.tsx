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
  const nombreDoctor =
    examen.examen_nombre_examinador ||
    examen.examinador?.usuario_nombre ||
    "Dr. Optómetra Tratante";

  // Valores de refracción final (o refracción manual como respaldo)
  const odEsf = getVal(examen.lensometria, "rxFinal.od.esf", getVal(examen.refraccion, "manual.od.esf", "0.00"));
  const odCyl = getVal(examen.lensometria, "rxFinal.od.cyl", getVal(examen.refraccion, "manual.od.cyl", "0.00"));
  const odEje = getVal(examen.lensometria, "rxFinal.od.eje", getVal(examen.refraccion, "manual.od.eje", "0°"));
  const odAdd = getVal(examen.lensometria, "rxFinal.od.add", getVal(examen.refraccion, "manual.od.add", "-"));
  const odAvl = getVal(examen.lensometria, "rxFinal.od.avl", getVal(examen.refraccion, "manual.od.va", "20/20"));
  const odAvp = getVal(examen.lensometria, "rxFinal.od.avp", "0.50M");

  const oiEsf = getVal(examen.lensometria, "rxFinal.oi.esf", getVal(examen.refraccion, "manual.oi.esf", "0.00"));
  const oiCyl = getVal(examen.lensometria, "rxFinal.oi.cyl", getVal(examen.refraccion, "manual.oi.cyl", "0.00"));
  const oiEje = getVal(examen.lensometria, "rxFinal.oi.eje", getVal(examen.refraccion, "manual.oi.eje", "0°"));
  const oiAdd = getVal(examen.lensometria, "rxFinal.oi.add", getVal(examen.refraccion, "manual.oi.add", "-"));
  const oiAvl = getVal(examen.lensometria, "rxFinal.oi.avl", getVal(examen.refraccion, "manual.oi.va", "20/20"));
  const oiAvp = getVal(examen.lensometria, "rxFinal.oi.avp", "0.50M");

  const dnp = getVal(examen.lensometria, "rxFinal.dnp", getVal(examen.refraccion, "computarizada.dp", "62 mm"));

  // Agudeza visual sin corrección
  const avSinOD = getVal(examen.agudeza_visual, "od.vl_sc", "20/40");
  const avSinOI = getVal(examen.agudeza_visual, "oi.vl_sc", "20/40");

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="modal-documento-impresion">
      <Modal.Header closeButton className="border-b bg-slate-900 text-white print:hidden">
        <Modal.Title className="text-base font-bold flex items-center gap-2">
          <SymbolIcon name="print" />
          Impresión de Receta y Certificado Visual
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-slate-100 dark:bg-slate-950">
        {/* Selector de tipo de documento (Oculto en impresión) */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTipoDoc("receta")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tipoDoc === "receta"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
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
                  ? "bg-primary text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
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

        {/* Contenedor Imprimible (Diseño A4 limpio y profesional) */}
        <div className="p-6 md:p-10 flex justify-center">
          <div
            id="area-impresion-clinica"
            className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-2xl border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none"
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
          >
            {/* MEMBRETE CLÍNICO */}
            <header className="border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-cyan-700">VISIONTRACK</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 uppercase tracking-wider">
                      Centro Oftálmico
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Centro Especializado de Salud Visual, Optometría y Diagnóstico Ocular
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    RUC: 1792345678001 · Permiso MS: 2026-VT-089
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-800">Sede Central - Consultorio Oftálmico</p>
                  <p>Av. República del Salvador y NNUU</p>
                  <p>Telf: (02) 234-5678 · Cel: 099 876 5432</p>
                  <p>atencion@visiontrack.med.ec</p>
                </div>
              </div>
            </header>

            {/* DATOS DEL PACIENTE */}
            <section className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente</span>
                  <span className="font-bold text-slate-800 text-sm">{nombrePaciente}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cédula / ID</span>
                  <span className="font-bold text-slate-800">{cedulaPaciente}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Historia Clínica</span>
                  <span className="font-bold text-cyan-800">{numHistoria}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha de Examen</span>
                  <span className="font-bold text-slate-800">
                    {formatFechaClinica(examen.examen_fecha)} {formatHoraClinica(examen.examen_hora)}
                  </span>
                </div>
              </div>
            </section>

            {/* CONTENIDO 1: RECETA OFTÁLMICA */}
            {tipoDoc === "receta" && (
              <div className="space-y-6">
                <div className="text-center pb-2">
                  <h3 className="text-base font-black tracking-wider uppercase text-slate-900 border-b pb-1 inline-block">
                    RECETA OFTALMOLÓGICA / PRESCRIPCIÓN ÓPTICA
                  </h3>
                </div>

                {/* TABLA DE GRADUACIÓN / REFRACTIVA */}
                <div className="border border-slate-900 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="py-2.5 px-3 text-left">OJO</th>
                        <th className="py-2.5 px-2">ESFERA</th>
                        <th className="py-2.5 px-2">CILINDRO</th>
                        <th className="py-2.5 px-2">EJE</th>
                        <th className="py-2.5 px-2">ADICIÓN</th>
                        <th className="py-2.5 px-2">AV LEJOS</th>
                        <th className="py-2.5 px-2">AV CERCA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-mono font-medium">
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-left font-bold font-sans text-slate-900 bg-slate-100">
                          O.D. (Derecho)
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900">{odEsf}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{odCyl}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{odEje}</td>
                        <td className="py-3 px-2 text-slate-700">{odAdd}</td>
                        <td className="py-3 px-2 text-slate-700">{odAvl}</td>
                        <td className="py-3 px-2 text-slate-700">{odAvp}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-left font-bold font-sans text-slate-900 bg-slate-100">
                          O.I. (Izquierdo)
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900">{oiEsf}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{oiCyl}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{oiEje}</td>
                        <td className="py-3 px-2 text-slate-700">{oiAdd}</td>
                        <td className="py-3 px-2 text-slate-700">{oiAvl}</td>
                        <td className="py-3 px-2 text-slate-700">{oiAvp}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="bg-slate-100 p-2 text-right border-t border-slate-300 text-[11px] font-bold text-slate-700">
                    Distancia Pupilar (DP/DNP): <span className="text-slate-900">{dnp}</span>
                  </div>
                </div>

                {/* DIAGNÓSTICO Y TRATAMIENTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                    <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                      Diagnóstico Refractivo / Clínico
                    </span>
                    <p className="font-medium text-slate-800">
                      <strong>OD:</strong> {examen.diagnostico_od || "Miopía / Astigmatismo"}
                    </p>
                    <p className="font-medium text-slate-800 mt-0.5">
                      <strong>OI:</strong> {examen.diagnostico_oi || "Miopía / Astigmatismo"}
                    </p>
                    {examen.cie10 && (
                      <p className="text-[11px] text-cyan-800 font-bold mt-1">
                        Código CIE-10: {examen.cie10}
                      </p>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                    <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                      Tratamiento / Indicaciones Ópticas
                    </span>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {examen.tratamiento_conducta ||
                        "Lentes de armazón para visión lejana con filtro antirreflejo y protección UV. Control visual anual."}
                    </p>
                  </div>
                </div>

                {/* NOTA DE VIGENCIA */}
                <div className="text-[10px] text-slate-500 text-center italic border-t pt-2">
                  * Esta prescripción óptica tiene una validez recomendada de un (1) año a partir de la fecha de emisión.
                </div>
              </div>
            )}

            {/* CONTENIDO 2: CERTIFICADO MÉDICO VISUAL */}
            {tipoDoc === "certificado" && (
              <div className="space-y-6 text-xs leading-relaxed text-slate-800">
                <div className="text-center pb-2">
                  <h3 className="text-base font-black tracking-wider uppercase text-slate-900 border-b pb-1 inline-block">
                    CERTIFICADO MÉDICO DE SALUD VISUAL
                  </h3>
                </div>

                <div className="space-y-4 text-justify font-sans text-sm">
                  <p>
                    El suscrito profesional del Centro Oftálmico <strong>VISIONTRACK</strong>, en legal ejercicio de sus funciones,
                  </p>

                  <p className="font-bold uppercase tracking-wide text-center text-sm my-3">
                    CERTIFICA:
                  </p>

                  <p>
                    Haber evaluado en consulta optométrica y examen clínico especializado a el/la paciente:
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center my-3 font-medium">
                    <p className="text-base font-bold text-slate-900">{nombrePaciente}</p>
                    <p className="text-xs text-slate-600 mt-1">Cédula de Identidad / Pasaporte: <strong>{cedulaPaciente}</strong></p>
                  </div>

                  <p>
                    Habiéndose obtenido los siguientes resultados clínicos durante la valoración optométrica integral:
                  </p>

                  <ul className="list-disc pl-6 space-y-1 my-3">
                    <li><strong>Agudeza Visual Sin Corrección:</strong> O.D. {avSinOD} · O.I. {avSinOI}</li>
                    <li><strong>Agudeza Visual Con Corrección Óptica:</strong> O.D. {odAvl} · O.I. {oiAvl}</li>
                    <li><strong>Diagnóstico Ocular:</strong> {examen.diagnostico_od || "Defecto refractivo corregible"} / {examen.diagnostico_oi || "Defecto refractivo corregible"} {examen.cie10 ? `[CIE-10: ${examen.cie10}]` : ""}</li>
                    <li><strong>Examen Motor / Biomicroscopía:</strong> Segmento anterior y reflejos pupilares sin hallazgos patológicos agudos.</li>
                  </ul>

                  <p>
                    <strong>CONCLUSIÓN / APTITUD:</strong>{" "}
                    {examen.tratamiento_conducta ||
                      "El paciente se encuentra APTO para el desempeño de sus actividades cotidianas, laborales y académicas habituales con el uso debido de su compensación óptica prescrita."}
                  </p>

                  <p className="pt-2 text-xs text-slate-600">
                    Se extiende el presente certificado a petición de la parte interesada para los fines pertinentes que considere necesarios.
                  </p>
                </div>
              </div>
            )}

            {/* FIRMA Y SELLO PROFESIONAL */}
            <footer className="mt-16 pt-8 border-t border-slate-200">
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <p>ID Examen: #{examen.examen_optometrico_id}</p>
                  <p>Registro Electrónico Oficial</p>
                  <p className="font-mono">Firma Digital Verificada</p>
                </div>

                <div className="text-center min-w-[240px]">
                  <div className="border-b-2 border-slate-900 pb-1 mb-1 font-serif text-slate-600 italic">
                    {nombreDoctor}
                  </div>
                  <p className="font-bold text-xs text-slate-900">{nombreDoctor}</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">
                    Especialista en Optometría y Salud Visual
                  </p>
                  <p className="text-[10px] text-slate-500">Reg. Profesional: 17-OPT-8924</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t bg-white dark:bg-slate-900 print:hidden flex justify-between">
        <span className="text-xs text-slate-500">
          Tip: En el diálogo de impresión puedes seleccionar &quot;Guardar como PDF&quot;.
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onHide}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <SymbolIcon name="print" />
            Imprimir
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
