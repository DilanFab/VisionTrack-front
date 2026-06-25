import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const userName = user?.persona.nombre || "Usuario";
  const userRole = user?.roles[0] || "Miembro del Equipo";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex justify-between items-center h-16 px-8 bg-surface-container border-b border-outline-variant sticky top-0 z-40">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-grow max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            className="w-full bg-surface-dim border border-outline-variant rounded-full py-2 pl-10 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors text-sm"
            placeholder="Buscar pacientes, historiales, diagnósticos..."
            type="text"
          />
        </div>
      </div>

      {/* Right: Actions, Theme Switcher & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
          >
            <span className="material-symbols-outlined">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>

          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-outline-variant"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-on-surface leading-none">{userName}</p>
            <p className="text-[10px] text-outline uppercase tracking-widest font-bold mt-1">{userRole}</p>
          </div>
          {user?.usuario_imagen && user.usuario_imagen !== "default.png" ? (
            <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt={`Avatar de ${userName}`}
                src={user.usuario_imagen}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary/10 text-primary flex items-center justify-center font-bold text-sm select-none">
              {userInitial}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
