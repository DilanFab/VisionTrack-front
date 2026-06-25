import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden flex">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[280px] min-h-screen flex flex-col">
        {/* Header Navigation Bar */}
        <Topbar />

        {/* Dynamic Nested Content Canvas */}
        <main className="flex-grow p-8 bg-background relative overflow-hidden">
          {/* Atmospheric background glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-[1440px] mx-auto relative z-10">
            <Outlet />
          </div>
        </main>

        {/* Footer Area */}
        <footer className="mt-auto py-6 px-8 border-t border-outline-variant bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-outline text-xs">
              © 2026 VisionTrack Analytics Engine. v2.4.1-stable
            </p>
            <div className="flex gap-6 text-xs">
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#health">
                Estado del Sistema
              </a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#logs">
                Registros de Auditoría
              </a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#support">
                Soporte Técnico
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
