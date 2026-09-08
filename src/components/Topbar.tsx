import { SymbolIcon } from "../components/SymbolIcon";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";
import { resolveUsuarioImagenUrl } from "../lib/imagenUsuario";
import { getFunctionalRoleLabel } from "../lib/roleCapabilities";
import { getAlertasStockBajo } from "../api/inventarioService";
import type { Producto } from "../types/inventario";

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

  const [alertasStock, setAlertasStock] = useState<Producto[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [bannerDescartado, setBannerDescartado] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = user?.persona.nombre || "Usuario";
  const userRole = getFunctionalRoleLabel(user?.roles);
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarUrl = resolveUsuarioImagenUrl(user?.usuario_imagen);

  // Consulta de productos con bajo stock para la alerta de inventario
  useEffect(() => {
    let isMounted = true;
    const fetchAlertas = async () => {
      try {
        const data = await getAlertasStockBajo();
        if (isMounted) {
          setAlertasStock(data || []);
        }
      } catch {
        // En caso de que el rol no tenga permisos de inventario o la API no responda
      }
    };

    void fetchAlertas();
    const interval = setInterval(fetchAlertas, 45000); // Actualiza cada 45 segundos
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Cerrar menú desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      onToggleSidebar();
      return;
    }
    onOpenMobileSidebar?.();
  };

  return (
    <div className="sticky top-0 z-40">
      {/* Banner de alerta por stock crítico si existen faltantes */}
      {alertasStock.length > 0 && !bannerDescartado && (
        <div className="bg-amber-500/15 dark:bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200 transition-all">
          <div className="flex items-center gap-2">
            <SymbolIcon name="warning" className="text-amber-500 text-base shrink-0" />
            <span>
              <strong>Alerta de Inventario:</strong> Hay <strong>{alertasStock.length}</strong> producto(s) con stock por debajo del mínimo permitido.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/inventario/productos"
              className="font-bold underline hover:text-amber-700 dark:hover:text-amber-100 transition-colors"
            >
              Revisar existencias →
            </Link>
            <button
              type="button"
              onClick={() => setBannerDescartado(true)}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold text-xs"
              title="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Barra de Navegación Principal */}
      <header className="flex justify-between items-center min-h-16 px-4 sm:px-6 lg:px-8 bg-surface-container/90 backdrop-blur-xl border-b border-outline-variant">
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

        {/* Right: Actions, Theme Switcher, Notifications & Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2 sm:gap-4">
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

            {/* Notification Bell con Badge Numérico de Alertas de Stock */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMostrarDropdown(!mostrarDropdown)}
                className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-variant/70 transition-colors relative cursor-pointer"
                title={
                  alertasStock.length > 0
                    ? `${alertasStock.length} alerta(s) de stock bajo`
                    : "Notificaciones del sistema"
                }
                aria-label="Ver notificaciones y alertas de stock"
              >
                <SymbolIcon name="notifications" />
                {alertasStock.length > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                    {alertasStock.length > 9 ? "9+" : alertasStock.length}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
                )}
              </button>

              {/* Menú Desplegable de Notificaciones y Alertas de Stock */}
              {mostrarDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-4 z-50 text-on-surface">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <SymbolIcon name="notifications_active" className="text-primary" />
                      <span className="font-bold text-sm">Alertas de Inventario</span>
                    </div>
                    {alertasStock.length > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">
                        {alertasStock.length} crítico(s)
                      </span>
                    )}
                  </div>

                  {alertasStock.length === 0 ? (
                    <div className="py-6 text-center text-on-surface-variant text-xs space-y-1">
                      <SymbolIcon name="check_circle" className="text-emerald-500 text-2xl" />
                      <p className="font-semibold text-on-surface">Inventario en estado óptimo</p>
                      <p>Todos los productos superan el stock mínimo configurado.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      <p className="text-[11px] text-outline font-medium">
                        Los siguientes productos requieren reabastecimiento urgente:
                      </p>
                      {alertasStock.map((prod) => (
                        <div
                          key={prod.producto_id}
                          className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-on-surface truncate">{prod.producto_nombre}</p>
                            <p className="text-[10px] text-outline font-mono">Cód: {prod.producto_codigo}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md">
                              Stock: {prod.producto_stock_actual} / Mín: {prod.producto_stock_minimo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-outline-variant flex justify-between items-center text-xs">
                    <Link
                      to="/admin/inventario/productos"
                      onClick={() => setMostrarDropdown(false)}
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Ver Catálogo de Productos →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMostrarDropdown(false)}
                      className="text-outline hover:text-on-surface font-semibold"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
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
    </div>
  );
};
