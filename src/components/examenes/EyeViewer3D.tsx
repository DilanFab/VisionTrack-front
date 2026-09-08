import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { useTheme } from "../../context/useTheme";

type GLTFResult = GLTF & {
  nodes: {
    Sphere032: THREE.Mesh;
    Sphere032_1: THREE.Mesh;
    Sphere032_2: THREE.Mesh;
    Sphere038: THREE.Mesh;
    Sphere038_1: THREE.Mesh;
    Sphere038_2: THREE.Mesh;
    Sphere033: THREE.Mesh;
    Sphere033_1: THREE.Mesh;
    Lens001: THREE.Mesh;
    Lens002: THREE.Mesh;
    Sphere039: THREE.Mesh;
    Sphere039_1: THREE.Mesh;
    Sphere040: THREE.Mesh;
    Sphere040_1: THREE.Mesh;
    OpticNerve: THREE.Mesh;
    Vessel_FarLower: THREE.Mesh;
    Vessel_FarUpper: THREE.Mesh;
    Vessel_Lower: THREE.Mesh;
    Vessel_Lower001: THREE.Mesh;
    Vessel_MidLower: THREE.Mesh;
    Vessel_MidUpper: THREE.Mesh;
    Vessel_Upper: THREE.Mesh;
  };
  materials: {
    ['Sclera_Mat.012']: THREE.MeshStandardMaterial;
    ['Retina_Mat.012']: THREE.MeshStandardMaterial;
    ['Sclera_Mat.013']: THREE.MeshStandardMaterial;
    ['Retina_Mat.013']: THREE.MeshStandardMaterial;
    ['Lens_Mat.011']: THREE.MeshStandardMaterial;
    ['Lens_Mat.013']: THREE.MeshStandardMaterial;
    ['Lens_Mat.014']: THREE.MeshStandardMaterial;
    ['Lens_Mat.016']: THREE.MeshStandardMaterial;
    ['Lens_Mat.017']: THREE.MeshStandardMaterial;
    ['Lens_Mat.018']: THREE.MeshStandardMaterial;
    ['Lens_Mat.019']: THREE.MeshStandardMaterial;
    ['Nerve_Mat.011']: THREE.MeshStandardMaterial;
    ['Vessels_Mat.011']: THREE.MeshStandardMaterial;
    ['Vessels_Mat.012']: THREE.MeshStandardMaterial;
  };
};

interface EyeModelProps {
  esfera: number; // e.g., -2.50, +1.25, etc.
  cilindro: number;
  eje: number;
  selectedEye: "OD" | "OI";
  theme: string;
  viewMode: "optico" | "anatomia";
  isPlaying: boolean;
  explosionProgress: number;
}

// 3D Anatomical Eye Model Component
const EyeModel: React.FC<EyeModelProps> = ({
  esfera,
  cilindro,
  eje,
  theme,
  viewMode,
  isPlaying,
  explosionProgress,
}) => {
  const isDark = theme === "dark";
  const groupRef = useRef<THREE.Group>(null);

  // Load imported model from public folder
  const { nodes, materials } = useGLTF("/models/ojofinal.glb") as unknown as GLTFResult;

  // Calculate focal point based on Sphere (esfera) and Cylinder (cilindro)
  // Aligned with the physical dimensions of the imported model ojofinal.glb:
  // Cornea is at Z ≈ -1.55 (-2.015 at scale 1.3)
  // Lens is at Z ≈ -0.93 (-1.21 at scale 1.3)
  // Retina is at Z ≈ 0.93 (1.21 at scale 1.3)
  const focusX = useMemo(() => {
    const totalPower = esfera + cilindro / 2; // spherical equivalent
    let val = 1.21 + totalPower * 0.15;
    if (val < 0.2) val = 0.2;
    if (val > 2.0) val = 2.0;
    return val;
  }, [esfera, cilindro]);

  // Create light rays aligned with model geometry
  const rays = useMemo(() => {
    const rayList: number[][] = [];
    const count = 7;
    const radius = 0.5;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const p0 = [-3.0, y, z];
      const p1 = [-2.0, y * 0.85, z * 0.85]; // Cornea entry point (at scale 1.3)
      const p2 = [-1.2, y * 0.55, z * 0.55]; // Lens entry/refraction point (at scale 1.3)
      const p3 = [focusX, 0, 0]; // Convergence point

      const distFromLensToFocus = focusX - (-1.2);
      const distFromFocusToEnd = 2.2 - focusX;
      const factor = distFromFocusToEnd / (distFromLensToFocus || 0.1);
      const p4 = [2.2, -y * 0.55 * factor, -z * 0.55 * factor]; // Divergent rays after focus

      rayList.push([...p0, ...p1, ...p2, ...p3, ...p4]);
    }
    return rayList;
  }, [focusX]);

  const axisRad = useMemo(() => (eje * Math.PI) / 180, [eje]);
  const showAllParts = viewMode === "anatomia";

  // Normalized progress factor for programmatic disassembly (despiece)
  const f = explosionProgress / 100;

  return (
    <group rotation={[axisRad * 0.2, 0, 0]}>
      {/* 
        Integrated Anatomical Model Group
        Rotated 90 degrees around Y so the front of the eye points along -X axis,
        and scaled/centered to fit the scene.
      */}
      <group ref={groupRef} rotation={[0, Math.PI / 2, 0]} scale={1.3} position={[0.0, 0.0, 0.0]}>
        
        {/* Sclera & Retina Upper Half - Hidden in Optical view */}
        <group position={[0, 1.2 * f, 0]} visible={showAllParts}>
          <mesh geometry={nodes.Sphere038.geometry} material={nodes.Sphere038.material} />
          <mesh geometry={nodes.Sphere038_1.geometry} material={materials['Sclera_Mat.013']} />
          <mesh geometry={nodes.Sphere038_2.geometry} material={materials['Retina_Mat.013']} />
        </group>

        {/* Sclera & Retina Lower Half */}
        <group position={[0, -1.2 * f, 0]}>
          <mesh geometry={nodes.Sphere032.geometry} material={nodes.Sphere032.material} />
          <mesh geometry={nodes.Sphere032_1.geometry} material={materials['Sclera_Mat.012']} />
          <mesh geometry={nodes.Sphere032_2.geometry} material={materials['Retina_Mat.012']} />
        </group>

        {/* Crystalline Lens */}
        <group position={[0, 0, -0.926 - 0.6 * f]}>
          <mesh geometry={nodes.Sphere033.geometry}>
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.95}
              roughness={0.05}
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh geometry={nodes.Sphere033_1.geometry} material={materials['Lens_Mat.013']} />
        </group>

        {/* Lens Details */}
        <mesh 
          geometry={nodes.Lens001.geometry} 
          material={materials['Lens_Mat.014']} 
          position={[0, 0, -0.412 - 0.4 * f]} 
          rotation={[Math.PI / 2, 0, 0]} 
          scale={[0.7, 0.7, 0.77]} 
        />
        <mesh 
          geometry={nodes.Lens002.geometry} 
          material={materials['Lens_Mat.013']} 
          position={[0, 0, -1.038 - 0.8 * f]} 
          rotation={[Math.PI / 2, 0, 0]} 
          scale={[1.73, 1.73, 1.66]} 
        />

        {/* Iris Layers */}
        <group position={[0, 0, -1.442 - 1.2 * f]} rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 0.82, 0.93]}>
          <mesh geometry={nodes.Sphere039.geometry} material={materials['Lens_Mat.016']} />
          <mesh geometry={nodes.Sphere039_1.geometry} material={materials['Lens_Mat.017']} />
        </group>

        {/* Cornea Layer - Glassy Physical Material */}
        <group position={[-0.005, 0, -1.545 - 1.5 * f]} rotation={[Math.PI / 2, 0, 0]} scale={[1.12, 0.56, 1.12]}>
          <mesh geometry={nodes.Sphere040.geometry}>
            <meshPhysicalMaterial
              color={isDark ? "#e0f7fa" : "#0ea5e9"}
              transmission={0.9}
              roughness={0.1}
              transparent
              opacity={isDark ? 0.35 : 0.45}
            />
          </mesh>
          <mesh geometry={nodes.Sphere040_1.geometry} material={materials['Lens_Mat.019']} />
        </group>

        {/* Optic Nerve */}
        <mesh 
          geometry={nodes.OpticNerve.geometry} 
          material={materials['Nerve_Mat.011']} 
          position={[0, 0, 0.257 + 1.5 * f]} 
        />

        {/* Blood Vessels */}
        <mesh 
          geometry={nodes.Vessel_FarLower.geometry} 
          material={materials['Vessels_Mat.011']} 
          position={[-0.23, 0, 0 + 1.0 * f]} 
          rotation={[-0.096, 0, 0]} 
        />
        <mesh 
          geometry={nodes.Vessel_FarUpper.geometry} 
          material={materials['Vessels_Mat.011']} 
          position={[-0.23, 0, -0.06 + 1.0 * f]} 
        />
        <mesh 
          geometry={nodes.Vessel_Lower.geometry} 
          material={materials['Vessels_Mat.011']} 
          position={[-0.23, 0, 0 + 1.0 * f]} 
          rotation={[0.141, 0, 0.583]} 
        />
        <mesh 
          geometry={nodes.Vessel_Lower001.geometry} 
          material={materials['Vessels_Mat.012']} 
          position={[-0.1, 0.374, -0.021 + 1.0 * f]} 
          rotation={[0.229, -0.103, 0.604]} 
        />
        <mesh 
          geometry={nodes.Vessel_MidLower.geometry} 
          material={materials['Vessels_Mat.011']} 
          position={[0, 0, 1.0 * f]} 
        />
        <mesh 
          geometry={nodes.Vessel_MidUpper.geometry} 
          material={materials['Vessels_Mat.011']} 
          position={[0, 0, 1.0 * f]} 
        />
        <mesh 
          geometry={nodes.Vessel_Upper.geometry} 
          material={materials['Vessels_Mat.011']} 
          position={[0, 0, 1.0 * f]} 
        />

      </group>

      {/* Light Rays going through the model (Only visible in Optical view mode) */}
      {viewMode === "optico" && (
        <>
          {rays.map((ray, idx) => {
            const points = [
              new THREE.Vector3(ray[0], ray[1], ray[2]),
              new THREE.Vector3(ray[3], ray[4], ray[5]),
              new THREE.Vector3(ray[6], ray[7], ray[8]),
              new THREE.Vector3(ray[9], ray[10], ray[11]),
              new THREE.Vector3(ray[12], ray[13], ray[14]),
            ];

            return (
              <group key={idx}>
                {/* Incident rays (outside eye) */}
                <Line
                  points={[points[0], points[1]]}
                  color={isDark ? "#00f0ff" : "#0288d1"}
                  lineWidth={1.5}
                  transparent
                  opacity={0.65}
                />
                {/* Rays refracting through Cornea and Lens */}
                <Line
                  points={[points[1], points[2], points[3]]}
                  color={isDark ? "#ffeb3b" : "#fbc02d"}
                  lineWidth={2}
                  transparent
                  opacity={0.9}
                />
                {/* Diverging rays after focus */}
                <Line
                  points={[points[3], points[4]]}
                  color="#ff3d00"
                  lineWidth={1}
                  transparent
                  opacity={0.45}
                />
              </group>
            );
          })}

          {/* Focus point indicator sphere */}
          <mesh position={[focusX, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={isDark ? "#ffeb3b" : "#e65100"} />
          </mesh>

          {/* Macula Center Target (yellow dot on retina wall) */}
          <mesh position={[1.21, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0, 0.08, 16]} />
            <meshBasicMaterial color={isDark ? "#00e676" : "#2e7d32"} transparent opacity={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
};

interface EyeViewer2DFallbackProps {
  esfera: number;
  cilindro: number;
  eje: number;
  selectedEye: "OD" | "OI";
  theme: string;
  viewMode: "optico" | "anatomia";
  explosionProgress: number;
}

const EyeViewer2DFallback: React.FC<EyeViewer2DFallbackProps> = ({
  esfera,
  cilindro,
  eje,
  selectedEye,
  theme,
  viewMode,
  explosionProgress,
}) => {
  const isDark = theme === "dark";

  // Calculate focal point using the same logic as 3D
  const focusX = useMemo(() => {
    const totalPower = esfera + cilindro / 2; // spherical equivalent
    let val = 1.31 + totalPower * 0.15;
    if (val < 0.2) val = 0.2;
    if (val > 2.2) val = 2.2;
    return val;
  }, [esfera, cilindro]);

  // Map 3D coordinate X into 2D SVG coordinates
  // Lens center is at X = 235, Retina is at X = 350 (Distance = 115)
  // 3D Lens is at -0.15, Retina is at 1.31 (Distance = 1.46)
  const SVG_focusX = useMemo(() => {
    const X_lens = 235;
    const X_retina = 350;
    const scale = (X_retina - X_lens) / 1.46; // approx 78.76
    return X_lens + (focusX + 0.15) * scale;
  }, [focusX]);

  // Calculate light rays path
  const rays2D = useMemo(() => {
    const rayYPositions = [120, 135, 150, 165, 180];
    return rayYPositions.map((yStart) => {
      const dy = Math.abs(yStart - 150);
      const xCornea = 145 + (dy * dy) / 60; // approximate cornea curvature
      
      // Lens entry point (light converges slightly between cornea and lens)
      const yLens = 150 + (yStart - 150) * 0.8;
      const xLens = 235;

      // Focus point is (SVG_focusX, 150)
      // Divergence calculation
      const distLensToFocus = SVG_focusX - xLens;
      // Avoid division by zero
      const safeDist = distLensToFocus <= 0 ? 0.1 : distLensToFocus;
      const slope = (150 - yLens) / safeDist;
      
      let yEnd = 150 + slope * (420 - SVG_focusX);
      // Clamp to make sure they don't blow up visually
      if (yEnd < 30) yEnd = 30;
      if (yEnd > 270) yEnd = 270;

      return {
        p0: [50, yStart],
        p1: [xCornea, yStart],
        p2: [xLens, yLens],
        p3: [SVG_focusX, 150],
        p4: [420, yEnd]
      };
    });
  }, [SVG_focusX]);

  // Slide factors for Despiece 3D simulation
  const corneaOffset = -explosionProgress * 0.85;
  const irisOffset = -explosionProgress * 0.45;
  const lensOffset = -explosionProgress * 0.15;
  const vitreousOffset = explosionProgress * 0.1;
  const retinaOffset = explosionProgress * 0.25;
  const scleraOffset = explosionProgress * 0.4;
  const nerveOffset = explosionProgress * 0.55;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#030712]">
      {/* Fallback Banner */}
      <div className={`absolute top-2 right-2 left-2 z-10 px-3 py-1.5 rounded-lg border text-[9px] flex items-center justify-between pointer-events-auto ${
        isDark
          ? "bg-slate-900/90 border-[#38bdf8]/20 text-[#38bdf8]"
          : "bg-cyan-50 border-cyan-200 text-cyan-800"
      }`}>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-cyan-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>WebGL no disponible en tu navegador. Mostrando visor óptico y anatómico 2D interactivo.</span>
        </div>
        <a 
          href="https://get.webgl.org/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-cyan-400 font-bold ml-2 text-[8px]"
        >
          Soporte WebGL
        </a>
      </div>

      {/* SVG schematic */}
      <svg
        viewBox="0 0 500 300"
        className="w-full h-full max-h-[350px] select-none"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="vitreousGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isDark ? "#0ea5e9" : "#0288d1"} stopOpacity="0.02" />
            <stop offset="100%" stopColor={isDark ? "#0ea5e9" : "#0288d1"} stopOpacity="0.12" />
          </radialGradient>
          <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#e0f7fa" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="corneaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e0f7fa" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="scleraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? "#334155" : "#cbd5e1"} />
            <stop offset="100%" stopColor={isDark ? "#1e293b" : "#94a3b8"} />
          </linearGradient>
          <linearGradient id="nerveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? "#94a3b8" : "#94a3b8"} />
            <stop offset="100%" stopColor={isDark ? "#475569" : "#64748b"} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* --- EYE STRUCTURES WITH SLIDING OFFSETS FOR EXPLODED ANATOMY --- */}

        {/* 1. Optic Nerve Group */}
        <g transform={`translate(${nerveOffset}, 0)`}>
          <path
            d="M 345,138 C 370,138 390,134 410,132 L 410,168 C 390,166 370,162 345,162 Z"
            fill="url(#nerveGrad)"
            stroke={isDark ? "#475569" : "#94a3b8"}
            strokeWidth="1"
          />
          {/* Inner fibers */}
          <path
            d="M 345,146 C 368,146 388,142 410,140 M 345,154 C 368,154 388,150 410,148"
            stroke={isDark ? "#ef4444" : "#f43f5e"}
            strokeWidth="0.8"
            strokeDasharray="4,2"
            opacity="0.6"
          />
          {viewMode === "anatomia" && (
            <g opacity={explosionProgress / 100} className="transition-opacity duration-300 pointer-events-none">
              <line x1="380" y1="150" x2="430" y2="200" stroke={isDark ? "#f43f5e" : "#e11d48"} strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="380" cy="150" r="2" fill={isDark ? "#f43f5e" : "#e11d48"} />
              <text x="435" y="204" textAnchor="start" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="9" fontWeight="bold">Nervio Óptico</text>
            </g>
          )}
        </g>

        {/* 2. Sclera (Outer Shell) Group */}
        <g transform={`translate(${scleraOffset}, 0)`}>
          <path
            d="M 215,72 A 90,90 0 1,1 215,228"
            fill="none"
            stroke="url(#scleraGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {viewMode === "anatomia" && (
            <g opacity={explosionProgress / 100} className="transition-opacity duration-300 pointer-events-none">
              <line x1="330" y1="90" x2="380" y2="40" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="330" cy="90" r="2" fill={isDark ? "#94a3b8" : "#64748b"} />
              <text x="385" y="36" textAnchor="start" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="9" fontWeight="bold">Esclerótica</text>
            </g>
          )}
        </g>

        {/* 3. Retina (Inner layer) Group */}
        <g transform={`translate(${retinaOffset}, 0)`}>
          <path
            d="M 212,82 A 85,85 0 1,1 212,218"
            fill="none"
            stroke={isDark ? "#f43f5e" : "#ef4444"}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Macula target */}
          <circle
            cx="350"
            cy="150"
            r="4.5"
            fill={isDark ? "#00e676" : "#22c55e"}
            stroke={isDark ? "#030712" : "#ffffff"}
            strokeWidth="1.5"
          />
          {viewMode === "anatomia" && (
            <g opacity={explosionProgress / 100} className="transition-opacity duration-300 pointer-events-none">
              <line x1="320" y1="200" x2="370" y2="250" stroke={isDark ? "#f43f5e" : "#ef4444"} strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="320" cy="200" r="2" fill={isDark ? "#f43f5e" : "#ef4444"} />
              <text x="375" y="254" textAnchor="start" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="9" fontWeight="bold">Retina (Mácula)</text>
            </g>
          )}
        </g>

        {/* 4. Vitreous Humor (Interior Fill) Group */}
        <g transform={`translate(${vitreousOffset}, 0)`}>
          <path
            d="M 215,72 A 90,90 0 1,1 215,228 Z"
            fill="url(#vitreousGrad)"
            opacity={1 - explosionProgress / 140}
          />
          {viewMode === "anatomia" && (
            <g opacity={explosionProgress / 100} className="transition-opacity duration-300 pointer-events-none">
              <line x1="280" y1="120" x2="330" y2="70" stroke={isDark ? "#06b6d4" : "#0288d1"} strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="280" cy="120" r="2" fill={isDark ? "#06b6d4" : "#0288d1"} />
              <text x="335" y="66" textAnchor="start" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="9" fontWeight="bold">Humor Vítreo</text>
            </g>
          )}
        </g>

        {/* 5. Crystalline Lens Group */}
        <g transform={`translate(${lensOffset}, 0)`}>
          <path
            d="M 235,115 C 220,135 220,165 235,185 C 250,165 250,135 235,115 Z"
            fill="url(#lensGrad)"
            stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(2,136,209,0.4)"}
            strokeWidth="1.5"
          />
          {viewMode === "anatomia" && (
            <g opacity={explosionProgress / 100} className="transition-opacity duration-300 pointer-events-none">
              <line x1="235" y1="125" x2="180" y2="75" stroke={isDark ? "#38bdf8" : "#0288d1"} strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="235" cy="125" r="2" fill={isDark ? "#38bdf8" : "#0288d1"} />
              <text x="175" y="71" textAnchor="end" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="9" fontWeight="bold">Cristalino</text>
            </g>
          )}
        </g>

        {/* 6. Iris Group */}
        <g transform={`translate(${irisOffset}, 0)`}>
          {/* Top Iris */}
          <path
            d="M 213,72.1 L 213,115 L 218,115 L 218,72.1 Z"
            fill={isDark ? "#0ea5e9" : "#0288d1"}
            opacity="0.95"
          />
          {/* Bottom Iris */}
          <path
            d="M 213,185 L 213,227.9 L 218,227.9 L 218,185 Z"
            fill={isDark ? "#0ea5e9" : "#0288d1"}
            opacity="0.95"
          />
          {viewMode === "anatomia" && (
            <g opacity={explosionProgress / 100} className="transition-opacity duration-300 pointer-events-none">
              <line x1="215" y1="93" x2="150" y2="45" stroke={isDark ? "#0ea5e9" : "#0288d1"} strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="215" cy="93" r="2" fill={isDark ? "#0ea5e9" : "#0288d1"} />
              <text x="145" y="41" textAnchor="end" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="9" fontWeight="bold">Iris (Pupila)</text>
            </g>
          )}
        </g>

        {/* 7. Cornea Group */}
        <g transform={`translate(${corneaOffset}, 0)`}>
          <path
            d="M 215,227.9 A 100,100 0 0,0 215,72.1 A 85,85 0 0,1 215,227.9 Z"
            fill="url(#corneaGrad)"
            stroke={isDark ? "#06b6d4" : "#0ea5e9"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {viewMode === "anatomia" && (
            <g opacity={explosionProgress / 100} className="transition-opacity duration-300 pointer-events-none">
              <line x1="175" y1="110" x2="120" y2="60" stroke={isDark ? "#06b6d4" : "#0ea5e9"} strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="175" cy="110" r="2" fill={isDark ? "#06b6d4" : "#0ea5e9"} />
              <text x="115" y="56" textAnchor="end" fill={isDark ? "#cbd5e1" : "#475569"} fontSize="9" fontWeight="bold">Córnea</text>
            </g>
          )}
        </g>

        {/* --- LIGHT RAYS SIMULATION OVERLAYS (Only in optical simulation view mode) --- */}
        {viewMode === "optico" && (
          <g>
            {/* Draw Ray Paths */}
            {rays2D.map((ray, idx) => (
              <g key={idx}>
                {/* Incident ray (outside eye) */}
                <line
                  x1={ray.p0[0]}
                  y1={ray.p0[1]}
                  x2={ray.p1[0]}
                  y2={ray.p1[1]}
                  stroke={isDark ? "#00f0ff" : "#0288d1"}
                  strokeWidth="1.5"
                  strokeOpacity="0.75"
                />
                {/* Cornea-to-lens transition */}
                <line
                  x1={ray.p1[0]}
                  y1={ray.p1[1]}
                  x2={ray.p2[0]}
                  y2={ray.p2[1]}
                  stroke={isDark ? "#00f0ff" : "#0288d1"}
                  strokeWidth="1.5"
                  strokeOpacity="0.75"
                />
                {/* Lens to Focus point */}
                <line
                  x1={ray.p2[0]}
                  y1={ray.p2[1]}
                  x2={ray.p3[0]}
                  y2={ray.p3[1]}
                  stroke={isDark ? "#ffeb3b" : "#fbc02d"}
                  strokeWidth="2"
                  strokeOpacity="0.9"
                />
                {/* Divergent ray path after focus */}
                <line
                  x1={ray.p3[0]}
                  y1={ray.p3[1]}
                  x2={ray.p4[0]}
                  y2={ray.p4[1]}
                  stroke="#ff3d00"
                  strokeWidth="1"
                  strokeOpacity="0.55"
                />
              </g>
            ))}

            {/* Target focus indicator node */}
            <circle
              cx={SVG_focusX}
              cy="150"
              r="4.5"
              fill={isDark ? "#ffeb3b" : "#e65100"}
              stroke={isDark ? "#030712" : "#ffffff"}
              strokeWidth="1"
              className="animate-ping"
              style={{ transformOrigin: `${SVG_focusX}px 150px` }}
            />
            <circle
              cx={SVG_focusX}
              cy="150"
              r="3.5"
              fill={isDark ? "#ffeb3b" : "#e65100"}
              stroke={isDark ? "#030712" : "#ffffff"}
              strokeWidth="1"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

interface EyeViewer3DProps {
  esferaOD: number;
  cilindroOD: number;
  ejeOD: number;
  esferaOI: number;
  cilindroOI: number;
  ejeOI: number;
}

export default function EyeViewer3D({
  esferaOD = 0,
  cilindroOD = 0,
  ejeOD = 0,
  esferaOI = 0,
  cilindroOI = 0,
  ejeOI = 0,
}: EyeViewer3DProps) {
  const { theme } = useTheme();
  const [selectedEye, setSelectedEye] = useState<"OD" | "OI">("OD");
  const [viewMode, setViewMode] = useState<"optico" | "anatomia">("optico");
  const [isPlaying, setIsPlaying] = useState(false);
  const [explosionProgress, setExplosionProgress] = useState(0);
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  // Check WebGL availability on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebGLSupported(supported);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  // Auto-animate despiece when playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && viewMode === "anatomia") {
      interval = setInterval(() => {
        setExplosionProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, viewMode]);

  const activeSphere = selectedEye === "OD" ? esferaOD : esferaOI;
  const activeCylinder = selectedEye === "OD" ? cilindroOD : cilindroOI;
  const activeAxis = selectedEye === "OD" ? ejeOD : ejeOI;

  const isDark = theme === "dark";

  // Auto-pause playing if switching view modes
  useEffect(() => {
    setIsPlaying(false);
    setExplosionProgress(0);
  }, [viewMode]);

  const getVisionDescription = () => {
    if (viewMode === "anatomia") return "Modelo anatómico completo con despiece interactivo";
    const totalPower = activeSphere + activeCylinder / 2;
    if (totalPower < -0.5) return "Miopía (Enfoque antes de retina)";
    if (totalPower > 0.5) return "Hipermetropía (Enfoque detrás de retina)";
    if (Math.abs(activeCylinder) > 0.5) return "Astigmatismo (Enfoque asimétrico)";
    return "Emetropía (Enfoque correcto en retina)";
  };

  return (
    <div
      className={`flex flex-col h-[450px] border rounded-2xl p-4 transition-all duration-300 ${
        isDark
          ? "bg-[#0a0c16]/80 backdrop-blur-md border-[#1e293b]/60 text-[#e2e8f0]"
          : "bg-white border-slate-200 text-slate-800 shadow-sm"
      }`}
    >
      <div className={`flex items-center justify-between border-b pb-2.5 mb-2.5 ${isDark ? "border-[#1e293b]/50" : "border-slate-100"}`}>
        <div>
          <h4 className={`text-xs font-black tracking-wider uppercase ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
            Visualización 3D del Ojo
          </h4>
          <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{getVisionDescription()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode Selector (Simulación vs Despiece) */}
          <div className={`flex p-0.5 rounded-lg border text-[10px] font-bold ${isDark ? "bg-[#0f172a] border-[#334155]/30" : "bg-slate-100 border-slate-200"}`}>
            <button
              type="button"
              onClick={() => setViewMode("optico")}
              className={`px-2.5 py-0.5 rounded-md transition-all ${
                viewMode === "optico"
                  ? isDark
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-cyan-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-[#e2e8f0]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Simulación
            </button>
            <button
              type="button"
              onClick={() => setViewMode("anatomia")}
              className={`px-2.5 py-0.5 rounded-md transition-all ${
                viewMode === "anatomia"
                  ? isDark
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-cyan-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-[#e2e8f0]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Despiece 3D
            </button>
          </div>

          {/* Eye selector (OD/OI) */}
          <div className={`flex p-0.5 rounded-lg border ${isDark ? "bg-[#0f172a] border-[#334155]/30" : "bg-slate-100 border-slate-200"}`}>
            <button
              type="button"
              onClick={() => setSelectedEye("OD")}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                selectedEye === "OD"
                  ? isDark
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-cyan-600 text-white shadow-sm"
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
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "bg-cyan-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-[#e2e8f0]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              OI
            </button>
          </div>
        </div>
      </div>

      <div className={`relative w-full flex-1 bg-[#030712] rounded-xl overflow-hidden border ${isDark ? "border-[#1e293b]/40 bg-[#030712]" : "border-slate-100 bg-slate-950"}`}>
        {webGLSupported === null ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[10px]">
            Cargando visualizador...
          </div>
        ) : webGLSupported ? (
          <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
            <ambientLight intensity={isDark ? 0.75 : 0.9} />
            <directionalLight position={[-10, 5, 5]} intensity={1.5} />
            <directionalLight position={[10, -5, -5]} intensity={0.5} />
            <pointLight position={[0, 0, 3]} intensity={0.8} />

            <React.Suspense fallback={null}>
              <EyeModel
                esfera={activeSphere}
                cilindro={activeCylinder}
                eje={activeAxis}
                selectedEye={selectedEye}
                theme={theme}
                viewMode={viewMode}
                isPlaying={isPlaying}
                explosionProgress={explosionProgress}
              />
            </React.Suspense>

            <OrbitControls
              enableZoom={true}
              minDistance={2}
              maxDistance={8}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        ) : (
          <EyeViewer2DFallback
            esfera={activeSphere}
            cilindro={activeCylinder}
            eje={activeAxis}
            selectedEye={selectedEye}
            theme={theme}
            viewMode={viewMode}
            explosionProgress={explosionProgress}
          />
        )}

        {/* Legend overlays (Only in optical simulation mode) */}
        {viewMode === "optico" && (
          <div className={`absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none p-1.5 rounded border text-[9px] ${
            isDark 
              ? "bg-[#0a0c16]/80 border-[#1e293b]/40 text-slate-400" 
              : "bg-white/90 border-slate-200 text-slate-600"
          }`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-1 rounded ${isDark ? "bg-[#00f0ff]" : "bg-[#0288d1]"}`} />
              <span>Haz de luz incidente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-1 rounded ${isDark ? "bg-[#ffeb3b]" : "bg-[#fbc02d]"}`} />
              <span>Convergencia (Enfoque)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-1 rounded bg-[#ff3d00]" />
              <span>Haz divergente</span>
            </div>
          </div>
        )}

        {/* Play/Pause & Slider control bar (Only in 3D Anatomy/Explosion mode) */}
        {viewMode === "anatomia" && (
          <div className={`absolute bottom-2 left-2 right-2 flex items-center gap-2.5 p-2 rounded-xl border backdrop-blur-md text-[10px] ${
            isDark
              ? "bg-[#0a0c16]/90 border-[#1e293b]/60 text-slate-200"
              : "bg-white/95 border-slate-200 text-slate-800 shadow-md"
          }`}>
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg transition-all ${
                isPlaying
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
              }`}
              title={isPlaying ? "Pausar animación" : "Reproducir animación"}
            >
              {isPlaying ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Range Slider */}
            <div className="flex-1 flex items-center gap-2">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Despiece:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={explosionProgress}
                onChange={(e) => {
                  setIsPlaying(false);
                  setExplosionProgress(Number(e.target.value));
                }}
                className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[9px] font-mono w-7 text-right">{explosionProgress}%</span>
            </div>
          </div>
        )}

        {/* Measurement stats overlay */}
        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded border text-[9px] font-mono ${
          isDark
            ? "bg-[#0a0c16]/80 border-[#1e293b]/40 text-cyan-400"
            : "bg-white/90 border-slate-200 text-cyan-700 font-bold"
        }`}>
          ESF: {activeSphere > 0 ? `+${activeSphere.toFixed(2)}` : activeSphere.toFixed(2)} D |
          CYL: {activeCylinder > 0 ? `+${activeCylinder.toFixed(2)}` : activeCylinder.toFixed(2)} D |
          EJE: {activeAxis}°
        </div>
      </div>
    </div>
  );
}

// Preload the model file
useGLTF.preload("/models/ojofinal.glb");

