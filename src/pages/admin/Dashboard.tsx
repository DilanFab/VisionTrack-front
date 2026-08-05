import { SymbolIcon } from "../../components/SymbolIcon";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="vt-page-kicker mb-2">Centro clínico</p>
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Panel de control clínico</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Resumen operativo para priorizar pacientes, citas y seguimiento visual.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-high rounded-lg px-4 py-2 border border-outline-variant flex items-center gap-3">
            <SymbolIcon name="calendar_month" className="text-secondary" />
            <span className="font-medium text-sm">Hoy</span>
          </div>
        </div>
      </div>

      {/* Grid Layout for Dashboard Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Diagnostic Chart Card */}
        <div className="md:col-span-8 glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <SymbolIcon name="biotech" className="text-[100px] text-primary" />
          </div>
          <h3 className="text-lg font-bold text-primary mb-6">Indicadores de atención visual</h3>
          <div className="h-64 flex items-end gap-3 mb-4">
            {/* Visual Bar Chart Mockup */}
            <div className="flex-grow bg-surface-container rounded-t-lg h-[40%] hover:h-[60%] transition-all duration-500 bg-gradient-to-t from-primary/20 to-primary"></div>
            <div className="flex-grow bg-surface-container rounded-t-lg h-[75%] hover:h-[85%] transition-all duration-500 bg-gradient-to-t from-primary/20 to-primary"></div>
            <div className="flex-grow bg-surface-container rounded-t-lg h-[55%] hover:h-[70%] transition-all duration-500 bg-gradient-to-t from-primary/20 to-primary"></div>
            <div className="flex-grow bg-surface-container rounded-t-lg h-[90%] hover:h-[95%] transition-all duration-500 bg-gradient-to-t from-secondary/20 to-secondary glow-active"></div>
            <div className="flex-grow bg-surface-container rounded-t-lg h-[65%] hover:h-[80%] transition-all duration-500 bg-gradient-to-t from-primary/20 to-primary"></div>
            <div className="flex-grow bg-surface-container rounded-t-lg h-[45%] hover:h-[60%] transition-all duration-500 bg-gradient-to-t from-primary/20 to-primary"></div>
            <div className="flex-grow bg-surface-container rounded-t-lg h-[80%] hover:h-[90%] transition-all duration-500 bg-gradient-to-t from-primary/20 to-primary"></div>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant text-xs font-semibold px-2">
            <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
          </div>
        </div>

        {/* Side KPI Cards */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-outline text-xs uppercase tracking-wider mb-1">Pacientes activos</p>
              <h4 className="text-3xl font-bold text-secondary">1,284</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <SymbolIcon name="trending_up" className="text-secondary" />
            </div>
          </div>

          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-outline text-xs uppercase tracking-wider mb-1">Seguimientos pendientes</p>
              <h4 className="text-3xl font-bold text-primary">42</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <SymbolIcon name="hourglass_top" className="text-primary" />
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="glass-card p-6 rounded-2xl flex-grow">
            <h4 className="text-md font-bold text-on-surface mb-4">Acciones rápidas</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-variant/40 transition-colors group">
                <span className="flex items-center gap-3">
                  <SymbolIcon name="analytics" className="text-primary" />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface">Revisar agenda diaria</span>
                </span>
                <SymbolIcon name="chevron_right" className="text-outline text-sm" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-variant/40 transition-colors group">
                <span className="flex items-center gap-3">
                  <SymbolIcon name="folder_shared" className="text-primary" />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface">Abrir historiales clínicos</span>
                </span>
                <SymbolIcon name="chevron_right" className="text-outline text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 border border-outline-variant">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-bold text-on-surface">Rendimiento operativo</h4>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded-full text-[10px] font-bold text-on-surface-variant">24 Horas</button>
              <button className="px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-bold">Semana</button>
            </div>
          </div>
          <div className="flex-1 min-h-[140px] bg-surface-container-lowest rounded-xl border border-outline-variant relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
              <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(var(--color-primary) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            </div>
            <div className="relative w-full h-32 px-6">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                <path className="opacity-55" d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,30" fill="none" stroke="var(--color-primary)" strokeWidth="2"></path>
                <path className="opacity-55" d="M0,60 Q60,30 120,60 T240,60 T360,60 T480,40" fill="none" stroke="var(--color-secondary)" strokeWidth="2"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-on-surface-variant text-xs italic">Monitoreo de actividad clínica activo...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-6">
          <div className="bg-primary-container p-6 rounded-2xl text-on-primary-container vt-accent-readable shadow-lg shadow-primary/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wider mb-1">Respaldo clínico</p>
                <h4 className="text-lg font-bold">Datos protegidos</h4>
              </div>
              <SymbolIcon name="cloud_done" className="text-on-primary-container/80" />
            </div>
            <p className="text-[10px] opacity-70">Último backup: Hace 12 minutos</p>
          </div>

          <div className="bg-secondary-container p-6 rounded-2xl text-on-secondary-container vt-accent-readable shadow-lg shadow-secondary/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wider mb-1">Sincronización</p>
                <h4 className="text-lg font-bold">Servicio estable</h4>
              </div>
              <SymbolIcon name="speed" className="text-on-secondary-container/80" />
            </div>
            <p className="text-[10px] opacity-70">Información clínica actualizada</p>
          </div>
        </div>
      </div>
    </div>
  );
}
