import React, { useState, useMemo } from "react";
import { useTheme } from "../../context/useTheme";

interface VisualSimulationProps {
  esferaOD: number;
  cilindroOD: number;
  esferaOI: number;
  cilindroOI: number;
}

export default function VisualSimulation({
  esferaOD = 0,
  cilindroOD = 0,
  esferaOI = 0,
  cilindroOI = 0,
}: VisualSimulationProps) {
  const { theme } = useTheme();
  const [selectedEye, setSelectedEye] = useState<"OD" | "OI">("OD");
  const [mode, setMode] = useState<"sin" | "con">("sin");

  const activeSphere = selectedEye === "OD" ? esferaOD : esferaOI;
  const activeCylinder = selectedEye === "OD" ? cilindroOD : cilindroOI;

  const isDark = theme === "dark";

  const blurAmount = useMemo(() => {
    const totalPower = Math.abs(activeSphere) + Math.abs(activeCylinder) / 2;
    const px = totalPower * 2.2;
    return Math.max(0, Math.min(12, px));
  }, [activeSphere, activeCylinder]);

  const improvementPct = useMemo(() => {
    const totalPower = Math.abs(activeSphere) + Math.abs(activeCylinder) / 2;
    if (totalPower <= 0.25) return 0;
    const pct = Math.round(40 + (1 - Math.exp(-totalPower * 0.6)) * 58);
    return Math.min(98, pct);
  }, [activeSphere, activeCylinder]);

  return (
    <div
      className={`flex flex-col h-auto border rounded-2xl p-4 transition-all duration-300 ${
        isDark
          ? "bg-[#0a0c16]/80 backdrop-blur-md border-[#1e293b]/60 text-[#e2e8f0]"
          : "bg-white border-slate-200 text-slate-800 shadow-sm"
      }`}
    >
      <div className={`flex items-center justify-between border-b pb-2.5 mb-2.5 ${isDark ? "border-[#1e293b]/50" : "border-slate-100"}`}>
        <div>
          <h4 className={`text-xs font-black tracking-wider uppercase ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            Calidad Visual Simulada
          </h4>
          <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"} mt-0.5`}>Simulación de agudeza</p>
        </div>
        <div className={`flex p-0.5 rounded-lg border ${isDark ? "bg-[#0f172a] border-[#334155]/30" : "bg-slate-100 border-slate-200"}`}>
          <button
            type="button"
            onClick={() => setSelectedEye("OD")}
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              selectedEye === "OD"
                ? isDark
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25"
                  : "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : isDark
                ? "text-slate-400 hover:text-[#e2e8f0]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            OD
          </button>
          <button
            type="button"
            onClick={() => setSelectedEye("OI")}
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              selectedEye === "OI"
                ? isDark
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25"
                  : "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : isDark
                ? "text-slate-400 hover:text-[#e2e8f0]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            OI
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Toggle Mode */}
        <div className={`flex p-0.5 rounded-xl border text-[10px] ${isDark ? "bg-[#070a13] border-[#1e293b]/50" : "bg-slate-100 border-slate-200"}`}>
          <button
            type="button"
            onClick={() => setMode("sin")}
            className={`flex-1 py-1 font-bold rounded-lg transition-all ${
              mode === "sin"
                ? isDark
                  ? "bg-slate-800 text-amber-400"
                  : "bg-white text-amber-600 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sin Corrección
          </button>
          <button
            type="button"
            onClick={() => setMode("con")}
            className={`flex-1 py-1 font-bold rounded-lg transition-all ${
              mode === "con"
                ? isDark
                  ? "bg-slate-800 text-emerald-400"
                  : "bg-white text-emerald-600 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Con Corrección
          </button>
        </div>

        {/* Visual Target Image Container */}
        <div className={`relative w-full rounded-xl overflow-hidden border ${isDark ? "bg-[#030712] border-[#1e293b]/40" : "bg-slate-100 border-slate-200"}`}>
          <img
            src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80"
            alt="Simulación visual"
            className="w-full h-auto block transition-all duration-300"
            style={{
              filter: mode === "sin" ? `blur(${blurAmount}px)` : "none",
            }}
          />
          <div className="absolute top-2 right-2 bg-slate-950/75 px-2 py-0.5 rounded text-[8px] text-slate-300 font-bold border border-slate-800">
            {mode === "sin" ? "Sin Corrección" : "Con Corrección"}
          </div>
          {mode === "sin" && blurAmount > 0 && (
            <div className="absolute bottom-2 left-2 bg-amber-950/80 px-2 py-0.5 rounded text-[8px] text-amber-400 font-bold border border-amber-800">
              Desf: {blurAmount.toFixed(1)}px
            </div>
          )}
        </div>

        {/* Estimated Improvement Progress */}
        {improvementPct > 0 ? (
          <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#070a13] border-[#1e293b]/40" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className={isDark ? "text-slate-400" : "text-slate-650"}>Mejora visual estimada</span>
              <span className={`font-bold font-mono ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{improvementPct}%</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${improvementPct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className={`p-2.5 rounded-xl border text-center text-[10px] ${
            isDark ? "bg-[#070a13] border-[#1e293b]/40 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            Visión normal (Emetropía) · No requiere corrección
          </div>
        )}
      </div>
    </div>
  );
}
