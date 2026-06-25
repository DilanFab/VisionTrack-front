
export default function Dashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Panel de Control Clínico</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Estado en tiempo real de pacientes y diagnósticos clínicos.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-high rounded-lg px-4 py-2 border border-outline-variant flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">calendar_month</span>
            <span className="font-medium text-sm">24 Oct, 2026</span>
          </div>
        </div>
      </div>

      {/* Grid Layout for Dashboard Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Diagnostic Chart Card */}
        <div className="md:col-span-8 glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[100px] text-primary">biotech</span>
          </div>
          <h3 className="text-lg font-bold text-primary mb-6">Precisión de Diagnóstico</h3>
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
              <p className="text-outline text-xs uppercase tracking-wider mb-1">Pacientes Activos</p>
              <h4 className="text-3xl font-bold text-secondary">1,284</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                trending_up
              </span>
            </div>
          </div>

          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-outline text-xs uppercase tracking-wider mb-1">Diagnósticos Pendientes</p>
              <h4 className="text-3xl font-bold text-primary">42</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                hourglass_top
              </span>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="glass-card p-6 rounded-2xl flex-grow">
            <h4 className="text-md font-bold text-on-surface mb-4">Acciones Rápidas</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-variant/40 transition-colors group">
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface">Reporte Diario</span>
                </span>
                <span className="material-symbols-outlined text-outline text-sm">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-variant/40 transition-colors group">
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">folder_shared</span>
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface">Registros Médicos</span>
                </span>
                <span className="material-symbols-outlined text-outline text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 border border-outline-variant">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-bold text-on-surface">Análisis de Rendimiento</h4>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white dark:bg-surface-container-high border border-outline-variant rounded-full text-[10px] font-bold text-on-surface-variant">24 Horas</button>
              <button className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold">Semana</button>
            </div>
          </div>
          <div className="flex-1 min-h-[140px] bg-white dark:bg-surface-container-high rounded-xl border border-outline-variant relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
              <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(var(--color-primary) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            </div>
            <div className="relative w-full h-32 px-6">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                <path className="opacity-30" d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,30" fill="none" stroke="var(--color-primary)" strokeWidth="2"></path>
                <path className="opacity-30" d="M0,60 Q60,30 120,60 T240,60 T360,60 T480,40" fill="none" stroke="var(--color-secondary)" strokeWidth="2"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-on-surface-variant text-xs italic">Monitoreo de latencia activo...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-6">
          <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wider mb-1">Copia de Seguridad</p>
                <h4 className="text-lg font-bold">Servidores Seguros</h4>
              </div>
              <span className="material-symbols-outlined text-white/70">cloud_done</span>
            </div>
            <p className="text-[10px] opacity-70">Último backup: Hace 12 minutos</p>
          </div>

          <div className="bg-secondary p-6 rounded-2xl text-white shadow-lg shadow-secondary/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wider mb-1">Velocidad de Nube</p>
                <h4 className="text-lg font-bold">1.2ms Latencia</h4>
              </div>
              <span className="material-symbols-outlined text-white/70">speed</span>
            </div>
            <p className="text-[10px] opacity-70">Sincronización optimizada con Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
