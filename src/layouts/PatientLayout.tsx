import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export const PatientLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem("patientSidebarCollapsed") === "true"
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("patientSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden flex">
      <Sidebar section="patient" collapsed={collapsed && !mobileSidebarOpen} mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div
        className={`flex-1 min-w-0 min-h-screen flex flex-col sidebar-transition ${
          collapsed ? "md:ml-[88px]" : "md:ml-[280px]"
        }`}
      >
        <Topbar
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          searchPlaceholder="Buscar citas, doctores o historial..."
        />

        <main className="flex-grow min-w-0 p-4 sm:p-6 lg:p-8 bg-background relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="w-full max-w-[1440px] min-w-0 mx-auto relative z-10">
            <Outlet />
          </div>
        </main>

        <footer className="mt-auto py-6 px-8 border-t border-outline-variant bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-outline text-xs">© 2026 VisionTrack Portal del Paciente.</p>
            <div className="flex gap-6 text-xs">
              <span className="text-on-surface-variant">Historial visual</span>
              <span className="text-on-surface-variant">Gestión de citas</span>
              <span className="text-on-surface-variant">Soporte clínico</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
