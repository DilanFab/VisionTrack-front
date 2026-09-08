import React, { useRef, useEffect, useMemo, useState } from "react";
import { useTheme } from "../../context/useTheme";

interface TopographyMapProps {
  k1OD: number;
  k2OD: number;
  ejeOD: number;
  k1OI: number;
  k2OI: number;
  ejeOI: number;
}

export default function TopographyMap({
  k1OD = 43.25,
  k2OD = 44.75,
  ejeOD = 90,
  k1OI = 43.0,
  k2OI = 44.5,
  ejeOI = 95,
}: TopographyMapProps) {
  const { theme } = useTheme();
  const [selectedEye, setSelectedEye] = useState<"OD" | "OI">("OD");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const k1 = selectedEye === "OD" ? k1OD : k1OI;
  const k2 = selectedEye === "OD" ? k2OD : k2OI;
  const eje = selectedEye === "OD" ? ejeOD : ejeOI;

  const astigmatismo = useMemo(() => Math.abs(k2 - k1), [k1, k2]);
  const isDark = theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create topography image buffer
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const ejeRad = (eje * Math.PI) / 180;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = centerY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const idx = (y * width + x) * 4;

        if (dist <= radius) {
          const normDist = dist / radius;
          const angle = Math.atan2(dy, dx);
          const alignFactor = Math.pow(Math.cos(angle - ejeRad), 2);
          const basePower = k1 + (k2 - k1) * alignFactor;
          const localPower = basePower - 4 * normDist * normDist;

          const minD = 35.0;
          const maxD = 50.0;
          const pct = Math.max(0, Math.min(1, (localPower - minD) / (maxD - minD)));

          const hue = 240 - pct * 300;
          const rgb = hslToRgb(hue / 360, 0.95, 0.5);

          const opacity = dist > radius - 15 
            ? Math.max(0, (radius - dist) / 15)
            : 1.0;

          data[idx] = rgb[0];
          data[idx + 1] = rgb[1];
          data[idx + 2] = rgb[2];
          data[idx + 3] = Math.floor(opacity * 255);
        } else {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw grid overlay (Placido rings) with theme-specific transparency
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.0;

    for (let r = radius / 5; r <= radius; r += radius / 5) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Axis angle indicator lines
    ctx.strokeStyle = isDark ? "rgba(0, 240, 255, 0.6)" : "rgba(0, 229, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const len = radius * 0.9;
    const ax = Math.cos(ejeRad) * len;
    const ay = Math.sin(ejeRad) * len;
    ctx.moveTo(centerX - ax, centerY + ay);
    ctx.lineTo(centerX + ax, centerY - ay);
    ctx.stroke();

    // Draw degree numbers
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("0°", centerX + radius - 2, centerY - 8);
    ctx.fillText("90°", centerX, centerY - radius + 8);
    ctx.fillText("180°", centerX - radius + 10, centerY - 8);

  }, [k1, k2, eje, isDark]);

  return (
    <div
      className={`flex flex-col h-[400px] border rounded-2xl p-4 transition-all duration-300 ${
        isDark
          ? "bg-[#0a0c16]/80 backdrop-blur-md border-[#1e293b]/60 text-[#e2e8f0]"
          : "bg-white border-slate-200 text-slate-800 shadow-sm"
      }`}
    >
      <div className={`flex items-center justify-between border-b pb-2.5 mb-2.5 ${isDark ? "border-[#1e293b]/50" : "border-slate-100"}`}>
        <div>
          <h4 className={`text-xs font-black tracking-wider uppercase ${isDark ? "text-violet-400" : "text-violet-600"}`}>
            Mapa Topográfico Corneal
          </h4>
          <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"} mt-0.5`}>Simulación de curvatura</p>
        </div>
        <div className={`flex p-0.5 rounded-lg border ${isDark ? "bg-[#0f172a] border-[#334155]/30" : "bg-slate-100 border-slate-200"}`}>
          <button
            type="button"
            onClick={() => setSelectedEye("OD")}
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              selectedEye === "OD"
                ? isDark
                  ? "bg-violet-500 text-white shadow-md shadow-violet-500/25"
                  : "bg-violet-600 text-white shadow-md shadow-violet-600/10"
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
                  ? "bg-violet-500 text-white shadow-md shadow-violet-500/25"
                  : "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                : isDark
                ? "text-slate-400 hover:text-[#e2e8f0]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            OI
          </button>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-4 flex-1 overflow-hidden">
        {/* Topography Map Canvas */}
        <div className={`relative p-1.5 rounded-xl border flex items-center justify-center ${isDark ? "bg-[#030712] border-[#1e293b]/40" : "bg-slate-50 border-slate-200"}`}>
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="rounded-full bg-slate-950 shadow-inner"
          />
        </div>

        {/* Legend & Stats */}
        <div className="flex flex-col justify-between self-stretch py-0.5 text-[10px] font-mono gap-2 min-w-[90px] overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <span className={`text-[8px] uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-550"}`}>Curvatura</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-24 bg-gradient-to-t from-blue-600 via-green-500 via-yellow-400 via-orange-500 to-pink-500 rounded border border-[#334155]/30" />
              <div className={`flex flex-col justify-between h-24 text-[8px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span>50.0D</span>
                <span>35.0D</span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col gap-1 border-t pt-1.5 ${isDark ? "border-[#1e293b]/45" : "border-slate-100"}`}>
            <div>
              <span className={isDark ? "text-slate-450" : "text-slate-500"}>K1:</span>
              <div className={`font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>{k1.toFixed(2)} D</div>
            </div>
            <div>
              <span className={isDark ? "text-slate-450" : "text-slate-500"}>K2:</span>
              <div className={`font-black ${isDark ? "text-violet-400" : "text-violet-600"}`}>{k2.toFixed(2)} D</div>
            </div>
            <div>
              <span className={isDark ? "text-slate-450" : "text-slate-500"}>Astig:</span>
              <div className={`font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{astigmatismo.toFixed(2)} D</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
