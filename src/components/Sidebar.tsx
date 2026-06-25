import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.svg";

export const Sidebar: React.FC = () => {
  const { logout, hasRole } = useAuth();

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-8 z-50 sidebar-transition hidden md:flex" id="sidebar">
      {/* Header */}
      <div className="px-8 mb-10 flex justify-center">
        <img src={logoImg} alt="VisionTrack Logo" className="h-16 w-auto object-contain" />
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-grow px-4 space-y-2">
        {(hasRole("Administrador") || hasRole("Médico") || hasRole("Recepcionista")) && (
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-medium">Dashboard</span>
          </NavLink>
        )}

        {(hasRole("Administrador") || hasRole("Médico") || hasRole("Recepcionista")) && (
          <NavLink
            to="/admin/pacientes"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-medium">Pacientes</span>
          </NavLink>
        )}

        {(hasRole("Administrador") || hasRole("Médico") || hasRole("Recepcionista")) && (
          <NavLink
            to="/admin/citas"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-medium">Citas</span>
          </NavLink>
        )}

        {/* Personal (Staff) - ONLY for Admin */}
        {hasRole("Administrador") && (
          <NavLink
            to="/admin/personal"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">badge</span>
            <span className="font-medium">Personal (Staff)</span>
          </NavLink>
        )}

        {/* Diagnósticos (Clinical / Optical data) - ONLY for Admin and Doctor */}
        {(hasRole("Administrador") || hasRole("Médico")) && (
          <NavLink
            to="/admin/historial"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">visibility</span>
            <span className="font-medium">Diagnósticos</span>
          </NavLink>
        )}

        {/* Inventario - ONLY for Admin and Receptionist */}
        {(hasRole("Administrador") || hasRole("Recepcionista")) && (
          <NavLink
            to="/admin/inventario"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-medium">Inventario</span>
          </NavLink>
        )}

        {/* Facturación - ONLY for Admin and Receptionist */}
        {(hasRole("Administrador") || hasRole("Recepcionista")) && (
          <NavLink
            to="/admin/facturacion"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-medium">Facturación</span>
          </NavLink>
        )}

        {/* Guía de Estilos - ONLY for Admin and Doctor (developer/test view) */}
        {(hasRole("Administrador") || hasRole("Médico")) && (
          <NavLink
            to="/admin/ui-guide"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">palette</span>
            <span className="font-medium">Guía de Estilos</span>
          </NavLink>
        )}
      </nav>

      {/* CTA Action - ONLY for Admin and Doctor */}
      {(hasRole("Administrador") || hasRole("Médico")) && (
        <div className="px-6 mb-8">
          <button className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10 cursor-pointer">
            <span className="material-symbols-outlined">add</span>
            Nuevo Diagnóstico
          </button>
        </div>
      )}

      {/* Footer Tabs */}
      <div className="px-4 border-t border-outline-variant pt-6 space-y-2">
        <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-colors rounded-lg" href="#help">
          <span className="material-symbols-outlined">help</span>
          <span className="font-medium">Centro de Ayuda</span>
        </a>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-colors rounded-lg cursor-pointer bg-transparent border-none text-left"
        >
          <span className="material-symbols-outlined text-error">logout</span>
          <span className="font-medium text-error">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
