import React from "react";

const UiGuide: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <header className="border-b border-outline-variant/30 pb-4">
        <h2 className="text-3xl font-bold text-primary">UI Master Style Guide</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Guía de componentes maestros y tokens de diseño para mantener la consistencia estética con Stitch.
        </p>
      </header>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-2.5">
          1. Color Palette Tokens
        </h3>
        <p className="text-xs text-on-surface-variant">
          Colores del tema actual (se adaptan dinámicamente al cambiar entre Modo Claro y Modo Oscuro).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-primary text-on-primary shadow-sm">
            <span className="block font-bold text-xs">Primary</span>
            <span className="block text-[10px] font-mono opacity-80">--primary</span>
          </div>
          <div className="p-4 rounded-xl bg-primary-container text-on-primary-container shadow-sm">
            <span className="block font-bold text-xs">Primary Container</span>
            <span className="block text-[10px] font-mono opacity-80">--primary-container</span>
          </div>
          <div className="p-4 rounded-xl bg-secondary text-on-secondary shadow-sm">
            <span className="block font-bold text-xs">Secondary</span>
            <span className="block text-[10px] font-mono opacity-80">--secondary</span>
          </div>
          <div className="p-4 rounded-xl bg-secondary-container text-on-secondary-container shadow-sm">
            <span className="block font-bold text-xs">Secondary Container</span>
            <span className="block text-[10px] font-mono opacity-80">--secondary-container</span>
          </div>
          <div className="p-4 rounded-xl bg-background text-on-background border border-outline-variant/20 shadow-sm">
            <span className="block font-bold text-xs">Background</span>
            <span className="block text-[10px] font-mono opacity-80">--background</span>
          </div>
          <div className="p-4 rounded-xl bg-surface text-on-surface border border-outline-variant/20 shadow-sm">
            <span className="block font-bold text-xs">Surface</span>
            <span className="block text-[10px] font-mono opacity-80">--surface</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container text-on-surface border border-outline-variant/20 shadow-sm">
            <span className="block font-bold text-xs">Surface Container</span>
            <span className="block text-[10px] font-mono opacity-80">--surface-container</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/20 shadow-sm">
            <span className="block font-bold text-xs">Lowest Container</span>
            <span className="block text-[10px] font-mono opacity-80">--surface-container-lowest</span>
          </div>
        </div>
      </section>

      {/* 2. Typography Hierarchy */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-2.5">
          2. Typography Hierarchy
        </h3>
        <div className="p-5 bg-surface-container/40 rounded-xl border border-outline-variant/25 space-y-4">
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">DISPLAY LG (Inter, 48px, bold, tracking-tight)</span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">VisionTrack</h1>
          </div>
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">HEADLINE LG (Inter, 32px, semibold)</span>
            <h2 className="text-2xl md:text-3xl font-semibold text-on-surface">Precision Diagnostics</h2>
          </div>
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">HEADLINE MD (Inter, 24px, semibold)</span>
            <h3 className="text-xl font-semibold text-on-surface">Patient Clinical History</h3>
          </div>
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">BODY REGULAR (Inter, 14px, leading-relaxed)</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Proprietary system for authorized medical personnel only. Unauthorized access is strictly prohibited and monitored.
            </p>
          </div>
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">LABEL MONO (JetBrains Mono, 12px, tracking-wider)</span>
            <span className="text-xs font-mono font-bold tracking-wider text-outline uppercase">
              ADMINISTRATOR EMAIL
            </span>
          </div>
        </div>
      </section>

      {/* 3. Button Component Styles */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-2.5">
          3. Interactive Buttons
        </h3>
        <div className="flex flex-wrap gap-4 items-center p-5 bg-surface-container/40 rounded-xl border border-outline-variant/25">
          {/* Primary Button */}
          <div className="text-center space-y-2">
            <button className="bg-primary text-on-primary py-3 px-6 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary-container hover:shadow-lg active:scale-95 transition-all shadow-md shadow-primary/10 cursor-pointer">
              Primary Button
            </button>
            <span className="block text-[10px] text-outline font-mono">bg-primary</span>
          </div>

          {/* Secondary Button */}
          <div className="text-center space-y-2">
            <button className="bg-secondary text-on-secondary py-3 px-6 rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 hover:shadow-lg active:scale-95 transition-all shadow-md shadow-secondary/10 cursor-pointer">
              Secondary Button
            </button>
            <span className="block text-[10px] text-outline font-mono">bg-secondary</span>
          </div>

          {/* Outline Button */}
          <div className="text-center space-y-2">
            <button className="bg-transparent border border-outline text-on-surface-variant py-3 px-6 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              Outline Button
            </button>
            <span className="block text-[10px] text-outline font-mono">border-outline</span>
          </div>

          {/* Icon Button */}
          <div className="text-center space-y-2">
            <button className="bg-primary/10 text-primary hover:bg-primary/20 p-3 rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <span className="material-symbols-outlined">visibility</span>
            </button>
            <span className="block text-[10px] text-outline font-mono">Icon Button</span>
          </div>
        </div>
      </section>

      {/* 4. Form Controls */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-2.5">
          4. Form Inputs & Glow Focus
        </h3>
        <div className="p-5 bg-surface-container/40 rounded-xl border border-outline-variant/25 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input with Icon Left */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
              INPUT WITH ICON LEFT
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                  alternate_email
                </span>
              </div>
              <input
                type="text"
                placeholder="admin@visiontrack.health"
                className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-normal placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
              />
            </div>
            <span className="block text-[10px] text-outline font-mono">.glow-input / pl-10</span>
          </div>

          {/* Simple Select Dropdown */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
              SELECT DROPDOWN
            </label>
            <select className="block w-full px-3.5 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input">
              <option>Opción 1</option>
              <option>Opción 2</option>
            </select>
            <span className="block text-[10px] text-outline font-mono">select / focus:border-primary</span>
          </div>
        </div>
      </section>

      {/* 5. Card styles */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-2.5">
          5. Containers & Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bento Card */}
          <div className="space-y-2">
            <div className="bento-card p-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest transition-all hover:border-primary/30">
              <h4 className="font-bold text-on-surface text-base">Bento Card Style</h4>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Tarjeta de fondo sólido (blanco en claro, marino bajo en oscuro) con transición sutil de borde al pasar el ratón.
              </p>
            </div>
            <span className="block text-[10px] text-outline font-mono">.bento-card (Claro / Bento)</span>
          </div>

          {/* Glassmorphism Card */}
          <div className="space-y-2">
            <div className="glass-card p-6 rounded-xl relative overflow-hidden">
              <div className="reticle top-0 left-0 border-r-0 border-b-0"></div>
              <div className="reticle top-0 right-0 border-l-0 border-b-0"></div>
              <h4 className="font-bold text-primary text-base">Glassmorphism Card</h4>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Tarjeta translúcida con filtro de desenfoque (`backdrop-filter: blur`), ideal para logins y paneles futuristas.
              </p>
            </div>
            <span className="block text-[10px] text-outline font-mono">.glass-card / .reticle (Oscuro / Stitch)</span>
          </div>
        </div>
      </section>

      {/* 6. Alerts & Ambient States */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-2.5">
          6. Alerts & Ambient States
        </h3>
        <div className="p-5 bg-surface-container/40 rounded-xl border border-outline-variant/25 space-y-4">
          {/* Error alert */}
          <div className="p-3.5 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-center gap-2.5 text-sm">
            <span className="material-symbols-outlined text-error">error</span>
            <span>Credenciales incorrectas. Verifique e intente de nuevo.</span>
          </div>

          {/* Pulse badge */}
          <div className="flex items-center space-x-2 bg-surface-container-lowest/50 p-3 rounded-lg border border-outline-variant/20 inline-flex">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
              Server Operational
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UiGuide;
