import { SymbolIcon } from "../components/SymbolIcon";
import React from "react";

const tokenCards = [
  ["Primario", "--primary", "bg-primary text-on-primary", "Acciones principales y foco clínico"],
  ["Primario suave", "--primary-container", "bg-primary-container text-on-primary-container", "Superficies destacadas"],
  ["Salud", "--secondary", "bg-secondary text-on-secondary", "Confirmaciones y estados saludables"],
  ["Salud suave", "--secondary-container", "bg-secondary-container text-on-secondary-container", "Éxitos sin saturación"],
  ["Superficie", "--surface", "bg-surface text-on-surface border border-outline-variant", "Contenido base"],
  ["Contenedor", "--surface-container", "bg-surface-container text-on-surface border border-outline-variant", "Tarjetas y áreas agrupadas"],
  ["Advertencia", "--tertiary", "bg-tertiary text-on-tertiary", "Atención o revisión requerida"],
  ["Error", "--error", "bg-error text-on-error", "Errores y acciones destructivas"],
];

const UiGuide: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
      <header className="border-b border-outline-variant/40 pb-5">
        <p className="vt-page-kicker mb-2">Sistema visual VisionTrack</p>
        <h2 className="text-3xl font-bold text-on-surface">Guía de experiencia clínica</h2>
        <p className="text-sm text-on-surface-variant mt-2 max-w-3xl">
          Referencia de tokens, componentes y estados para mantener una interfaz clara, accesible y centrada en usuarios clínicos y pacientes.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-3">1. Paleta semántica</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Los colores comunican propósito: precisión visual, confianza clínica, salud, advertencia y error. No uses color como única señal.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tokenCards.map(([name, token, classes, usage]) => (
            <div key={token} className={`p-4 rounded-2xl shadow-sm ${classes}`}>
              <span className="block font-bold text-sm">{name}</span>
              <span className="block text-[11px] font-mono opacity-80 mt-1">{token}</span>
              <span className="block text-xs opacity-80 mt-3">{usage}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-3">2. Jerarquía y microcopy</h3>
        <div className="vt-surface-card p-6 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">KICKER · CONTEXTO</span>
            <p className="vt-page-kicker">Portal del paciente</p>
          </div>
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">TÍTULO · TAREA PRINCIPAL</span>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">Agendar cita visual</h1>
          </div>
          <div>
            <span className="text-[10px] text-outline font-mono block mb-1">DESCRIPCIÓN · ORIENTACIÓN</span>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
              Elige especialista, fecha y horario disponible. Usa mensajes cortos en español y explica el siguiente paso cuando haya errores o estados vacíos.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-3">3. Botones y acciones</h3>
        <div className="vt-surface-card flex flex-wrap gap-4 items-center p-6 rounded-2xl">
          <button className="bg-primary text-on-primary py-3 px-5 rounded-xl font-bold text-sm hover:brightness-95 active:scale-[0.98] transition-all shadow-md shadow-primary/10">
            Agendar cita
          </button>
          <button className="bg-secondary text-on-secondary py-3 px-5 rounded-xl font-bold text-sm hover:brightness-95 active:scale-[0.98] transition-all shadow-md shadow-secondary/10">
            Confirmar atención
          </button>
          <button className="bg-surface-container-high border border-outline-variant text-on-surface py-3 px-5 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-colors">
            Cancelar
          </button>
          <button className="bg-error text-on-error py-3 px-5 rounded-xl font-bold text-sm hover:brightness-95 transition-all">
            Eliminar registro
          </button>
          <button aria-label="Cambiar tema" className="bg-primary/10 text-primary hover:bg-primary/20 p-3 rounded-full flex items-center justify-center transition-colors">
            <SymbolIcon name="routine" />
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-3">4. Formularios</h3>
        <div className="vt-surface-card p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-wider uppercase ml-1" htmlFor="guide-email">
              Correo institucional
            </label>
            <div className="relative group">
              <SymbolIcon name="alternate_email" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
              <input
                id="guide-email"
                type="email"
                placeholder="nombre@visiontrack.health"
                className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all glow-input"
              />
            </div>
            <p className="text-xs text-on-surface-variant">Usa etiquetas visibles, placeholders útiles y mensajes de recuperación.</p>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant tracking-wider uppercase ml-1" htmlFor="guide-select">
              Especialidad visual
            </label>
            <select id="guide-select" className="block w-full px-3.5 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all glow-input">
              <option>Optometría clínica</option>
              <option>Oftalmología</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-3">5. Tarjetas y estados</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="vt-surface-card p-6 rounded-2xl">
            <p className="text-xs uppercase tracking-wider text-outline font-bold">Citas activas</p>
            <p className="text-4xl font-bold text-primary mt-3">12</p>
            <p className="text-sm text-on-surface-variant mt-2">Métrica con prioridad visual clara.</p>
          </div>
          <div className="vt-empty-state p-6 rounded-2xl text-center">
            <SymbolIcon name="event_available" className="text-4xl text-outline mb-2" />
            <p className="font-bold text-on-surface">No hay citas próximas</p>
            <p className="text-sm text-on-surface-variant mt-1">Ofrece una acción cuando exista un siguiente paso.</p>
          </div>
          <div className="p-6 rounded-2xl bg-error-container text-on-error-container border border-error/20">
            <div className="flex items-start gap-3">
              <SymbolIcon name="error" className="text-error" />
              <div>
                <p className="font-bold">No se pudo guardar</p>
                <p className="text-sm mt-1">Explica qué ocurrió y cómo recuperarse.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface border-l-4 border-primary pl-3">6. Reglas de uso</h3>
        <div className="vt-surface-card p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-on-surface-variant">
          <p><strong className="text-on-surface">Foco visible:</strong> todo control interactivo debe poder recorrerse con teclado.</p>
          <p><strong className="text-on-surface">Iconos:</strong> las acciones solo con icono requieren `aria-label` o `title`.</p>
          <p><strong className="text-on-surface">Estados:</strong> loading, error, vacío y éxito deben tener texto visible en español.</p>
          <p><strong className="text-on-surface">Consistencia:</strong> reutiliza tokens y evita colores hexadecimales locales salvo casos justificados.</p>
        </div>
      </section>
    </div>
  );
};

export default UiGuide;
