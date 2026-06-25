import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Get first name or display name
  const displayName = user?.persona?.nombre || user?.usuario_nombre || "Paciente";

  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex flex-col relative transition-colors duration-300 pb-24 md:pb-8">
      {/* Floating Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest/80 text-on-surface transition-all shadow-lg border border-outline-variant/30 backdrop-blur-md active:scale-95 cursor-pointer z-50"
        title="Cambiar Tema"
      >
        <span className="material-symbols-outlined flex items-center justify-center">
          {theme === "light" ? "dark_mode" : "light_mode"}
        </span>
      </button>

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md px-6 pt-8 pb-4 flex justify-between items-center border-b border-outline-variant/20 max-w-2xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">VisionTrack</h1>
          <p className="text-xs font-semibold text-on-surface-variant opacity-70 tracking-widest uppercase">Portal del Paciente</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-surface-container-high flex items-center justify-center text-primary">
            {user?.usuario_imagen && user.usuario_imagen !== "default.png" ? (
              <img className="w-full h-full object-cover" src={user.usuario_imagen} alt={displayName} />
            ) : (
              <span className="material-symbols-outlined">person</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Max width to simulate mobile PWA on desktop) */}
      <main className="flex-grow px-6 pt-6 pb-12 max-w-2xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Greetings Section */}
        <section className="animate-fadeIn">
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
            Hola, {displayName.split(" ")[0]}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Bienvenido a tu historial visual y control de citas de optometría.
          </p>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* Quick Stat: Last Vision Exam */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-36 border border-outline-variant/30 hover:border-primary/40 transition-all shadow-md group">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Último Examen</p>
              <p className="text-xl font-extrabold text-secondary mt-0.5">20/20 Izq / 20/20 Der</p>
            </div>
          </div>

          {/* Quick Stat: Next Visit */}
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-36 border border-outline-variant/30 hover:border-primary/40 transition-all shadow-md group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Próxima Cita</p>
              <p className="text-xl font-extrabold text-primary mt-0.5">Pendiente</p>
            </div>
          </div>
        </section>

        {/* Diagnostic Visual Card */}
        <section className="glass-card rounded-2xl p-6 border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Tu Estabilidad Visual
          </h3>
          <div className="bg-surface-container-low/50 rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/10 text-center">
            <p className="text-xs text-on-surface-variant mb-1 font-medium">Índice de Salud Ocular</p>
            <div className="text-4xl font-extrabold text-on-surface tracking-tight">98.4%</div>
            <p className="text-xs text-secondary font-bold flex items-center gap-1 mt-1.5">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Tu visión se mantiene estable y saludable.
            </p>
          </div>
        </section>

        {/* Interactive Appointments Actions */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary font-bold">event</span>
            Mis Citas y Consultas
          </h3>

          <div className="glass-card p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">add_circle</span>
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-on-surface text-sm">Agendar Nueva Cita</h4>
              <p className="text-xs text-on-surface-variant">Agenda tu consulta preventiva anual de optometría.</p>
            </div>
            <button className="bg-primary text-on-primary rounded-xl px-4 py-2 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer">
              Solicitar
            </button>
          </div>
        </section>

        {/* Prescription details placeholder */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">assignment</span>
            Última Receta de Lentes
          </h3>
          <div className="glass-card p-5 rounded-2xl border border-outline-variant/30 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20">
                <p className="font-bold text-primary mb-1">Ojo Derecho (OD)</p>
                <p><span className="text-on-surface-variant font-medium">ESF:</span> -1.50</p>
                <p><span className="text-on-surface-variant font-medium">CIL:</span> -0.75</p>
                <p><span className="text-on-surface-variant font-medium">EJE:</span> 180°</p>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20">
                <p className="font-bold text-primary mb-1">Ojo Izquierdo (OI)</p>
                <p><span className="text-on-surface-variant font-medium">ESF:</span> -1.25</p>
                <p><span className="text-on-surface-variant font-medium">CIL:</span> -0.50</p>
                <p><span className="text-on-surface-variant font-medium">EJE:</span> 175°</p>
              </div>
            </div>
            <div className="text-center pt-2">
              <button 
                onClick={() => alert("Función de descarga en PDF disponible próximamente.")}
                className="w-full bg-surface-variant hover:bg-surface-variant/80 border border-outline-variant/40 text-on-surface text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Descargar Receta (PDF)
              </button>
            </div>
          </div>
        </section>

        {/* Logout container for PWA/Mobile view */}
        <section className="pt-4 text-center">
          <button 
            onClick={logout}
            className="text-error font-bold text-xs hover:underline flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Cerrar Sesión Segura
          </button>
        </section>

      </main>

      {/* Bottom PWA Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-2xl rounded-t-2xl max-w-2xl mx-auto w-full">
        {/* Home tab (Active) */}
        <a className="flex flex-col items-center justify-center text-primary rounded-xl px-4 py-1 active:scale-95 transition-all duration-200" href="#home">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[10px] font-bold tracking-wider mt-0.5">Inicio</span>
        </a>
        {/* Appointments tab */}
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface px-4 py-1 active:scale-95 transition-all duration-200" href="#appointments" onClick={() => alert("Mis citas completas próximamente.")}>
          <span className="material-symbols-outlined">event</span>
          <span className="text-[10px] font-bold tracking-wider mt-0.5">Citas</span>
        </a>
        {/* History tab */}
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface px-4 py-1 active:scale-95 transition-all duration-200" href="#history" onClick={() => alert("Historial clínico completo próximamente.")}>
          <span className="material-symbols-outlined">history_edu</span>
          <span className="text-[10px] font-bold tracking-wider mt-0.5">Historial</span>
        </a>
        {/* Profile tab */}
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface px-4 py-1 active:scale-95 transition-all duration-200" href="#profile" onClick={() => alert("Editar perfil próximamente.")}>
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold tracking-wider mt-0.5">Perfil</span>
        </a>
      </nav>
    </div>
  );
};

export default PatientDashboard;
