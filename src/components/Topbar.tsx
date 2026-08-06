import { SymbolIcon } from "../components/SymbolIcon";
import React from "react";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";
import { resolveUsuarioImagenUrl } from "../lib/imagenUsuario";
import { getFunctionalRoleLabel } from "../lib/roleCapabilities";

interface TopbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar?: () => void;
  searchPlaceholder?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  collapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  searchPlaceholder = "Buscar pacientes, historiales, diagnósticos...",
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const userName = user?.persona.nombre || "Usuario";
  const userRole = getFunctionalRoleLabel(user?.roles);
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarUrl = resolveUsuarioImagenUrl(user?.usuario_imagen);

  const handleMenuClick = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      onToggleSidebar();
      return;
    }
    onOpenMobileSidebar?.();
  };

  return (
    <header className="flex justify-between items-center min-h-16 px-4 sm:px-6 lg:px-8 bg-surface-container/90 backdrop-blur-xl border-b border-outline-variant sticky top-0 z-40">
      {/* Left: Sidebar Toggle + Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-grow max-w-xl">
        <button
          type="button"
          onClick={handleMenuClick}
          className="inline-flex p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-variant/70 transition-colors cursor-pointer"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          aria-label={collapsed ? "Expandir menú" : "Abrir o colapsar menú"}
        >
          <SymbolIcon name={collapsed ? "menu_open" : "menu"} />
        </button>

        <div className="relative w-full hidden sm:block">
          <SymbolIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-2.5 pl-10 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors text-sm"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>

      {/* Right: Actions, Theme Switcher & Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-4">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-variant/70 transition-colors cursor-pointer"
            title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
            aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
          >
            <SymbolIcon name={theme === "light" ? "dark_mode" : "light_mode"} />
          </button>

          <button type="button" className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-variant/70 transition-colors relative cursor-pointer" aria-label="Ver notificaciones">
            <SymbolIcon name="notifications" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>

        <div className="hidden sm:block h-8 w-[1px] bg-outline-variant"></div>

        <div className="flex items-center gap-3 sm:pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-on-surface leading-none">{userName}</p>
            <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mt-1">{userRole}</p>
          </div>
          {avatarUrl ? (
            <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt={`Avatar de ${userName}`}
                src={avatarUrl}
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
