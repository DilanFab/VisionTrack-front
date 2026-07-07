import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.svg";
import { getMenus } from "../api/rolesPermisos/menuService";
import { getRoles } from "../api/rolesPermisos/rolService";
import { getPermisos } from "../api/rolesPermisos/permisoService";
import type { Menu } from "../types/rolesPermisos/Menu";
import type { Rol } from "../types/rolesPermisos/Rol";
import type { Permiso } from "../types/rolesPermisos/Permiso";
import { buildMenuTree, collectIds, getAncestorIds, type MenuNode } from "../lib/menuTree";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition, IconName } from "@fortawesome/fontawesome-svg-core";
import { faQuestion, faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  collapsed: boolean;
}

const resolveIcon = (nombre: string | null | undefined): IconDefinition | null => {
  const trimmed = nombre?.trim();
  if (!trimmed) return null;
  return findIconDefinition({ prefix: "fas", iconName: trimmed as IconName }) ?? null;
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { logout, hasRole, user } = useAuth();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  // Vacío por defecto: todos los grupos del menú arrancan cerrados. Acordeón
  // global: solo una rama (de raíz a hoja) puede estar abierta a la vez, así
  // que abrir cualquier grupo cierra todo lo demás salvo sus propios ancestros
  // (para poder desplegar submenús anidados, ej. Personas -> Usuarios, sin
  // cerrar al padre en el camino).
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [menusData, rolesData, permisosData] = await Promise.all([
          getMenus(),
          getRoles(),
          getPermisos(),
        ]);
        setMenus(menusData);
        setRoles(rolesData);
        setPermisos(permisosData);
      } catch (error) {
        console.error("No se pudo cargar el menú de navegación:", error);
      }
    })();
  }, []);

  // Ids de rol del usuario autenticado (puede tener varios roles a la vez).
  const rolIdsDelUsuario = useMemo(() => {
    if (!user) return new Set<number>();
    return new Set(
      roles
        .filter((r) => r.rol_estado === "A" && user.roles.includes(r.rol_nombre))
        .map((r) => r.rol_id)
    );
  }, [roles, user]);

  // Ids de menú habilitados por CUALQUIERA de los roles del usuario. Al ser un
  // Set, los menús comunes entre varios roles quedan deduplicados de forma natural.
  const menuIdsPermitidos = useMemo(
    () =>
      new Set(
        permisos
          .filter((p) => p.permiso_estado === "A" && rolIdsDelUsuario.has(p.rol_id))
          .map((p) => p.menu_id)
      ),
    [permisos, rolIdsDelUsuario]
  );

  const menusVisibles = useMemo(
    () => menus.filter((m) => m.menu_estado === "A" && menuIdsPermitidos.has(m.menu_id)),
    [menus, menuIdsPermitidos]
  );

  const menuTree = useMemo(() => buildMenuTree(menusVisibles), [menusVisibles]);

  const menusPorId = useMemo(
    () => new Map(menusVisibles.map((m) => [m.menu_id, m])),
    [menusVisibles]
  );

  const toggleGroup = (node: MenuNode) => {
    setExpandedGroupIds((prev) => {
      if (prev.has(node.menu_id)) {
        // Al cerrar un grupo, también se cierran sus descendientes para que no
        // queden abiertos "de fantasma" la próxima vez que se despliegue.
        const next = new Set(prev);
        collectIds(node).forEach((id) => next.delete(id));
        return next;
      }
      // Al abrir, solo quedan abiertos los ancestros del grupo (para mantener
      // visible el camino hasta él) y el propio grupo; cualquier otra rama
      // abierta en cualquier parte del árbol se cierra.
      return new Set([...getAncestorIds(node.menu_id, menusPorId), node.menu_id]);
    });
  };

  const navClass = (isActive: boolean) =>
    `flex items-center rounded-lg transition-all ${
      collapsed ? "justify-center px-3 py-3" : "gap-4 px-4 py-3"
    } ${
      isActive
        ? "text-primary font-bold border-r-2 border-primary bg-surface-variant/30"
        : "text-on-surface-variant hover:bg-surface-variant"
    }`;

  // `menu_referencia` en BD se guarda relativo a la sección (ej. "/medicos/doctores"),
  // sin el prefijo de layout, para que el mismo registro sirva sin importar bajo
  // qué sección navegue el perfil del usuario (panel administrativo o portal).
  const basePath = hasRole("Paciente") ? "/portal" : "/admin";
  const resolveRuta = (referencia: string) => `${basePath}${referencia}`;

  // En el rail colapsado el ícono es la única pista visual disponible, así que
  // siempre se muestra algo (con "?" atenuado si falta o no se reconoce).
  const renderIconCollapsed = (node: MenuNode) => {
    const icon = resolveIcon(node.menu_icono);
    return <FontAwesomeIcon icon={icon ?? faQuestion} fixedWidth opacity={icon ? 1 : 0.4} />;
  };

  // En la vista expandida, si el menú no tiene ícono asignado no se reserva
  // espacio para uno: el texto queda alineado a la izquierda sin gutter.
  const renderIconExpanded = (node: MenuNode) => {
    if (!node.menu_icono?.trim()) return null;
    const icon = resolveIcon(node.menu_icono);
    return <FontAwesomeIcon icon={icon ?? faQuestion} fixedWidth opacity={icon ? 1 : 0.4} />;
  };

  // En modo colapsado (rail de íconos) no hay espacio para anidar ni expandir
  // grupos: se listan todos los nodos alcanzables como enlaces planos. Los
  // títulos raíz no tienen referencia propia, así que ya quedan excluidos.
  const renderCollapsedNode = (node: MenuNode): React.ReactNode => (
    <React.Fragment key={node.menu_id}>
      {node.menu_referencia && (
        <NavLink
          to={resolveRuta(node.menu_referencia)}
          className={({ isActive }) => navClass(isActive)}
          title={node.menu_nombre}
        >
          {renderIconCollapsed(node)}
        </NavLink>
      )}
      {node.hijos.map(renderCollapsedNode)}
    </React.Fragment>
  );

  // Los menús raíz (sin padre) son títulos que dividen el árbol: no son
  // clicables ni colapsables, y se muestran atenuados.
  const renderTitulo = (node: MenuNode): React.ReactNode => (
    <div key={node.menu_id}>
      <div className="px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-outline select-none">
        {node.menu_nombre}
      </div>
      {node.hijos.length > 0 && (
        <div className="space-y-2">
          {node.hijos.map((hijo) => renderExpandedNode(hijo, 1))}
        </div>
      )}
    </div>
  );

  const renderExpandedNode = (node: MenuNode, depth: number): React.ReactNode => {
    const hasHijos = node.hijos.length > 0;
    const style = depth > 1 ? { marginLeft: (depth - 1) * 16 } : undefined;

    if (!hasHijos) {
      if (!node.menu_referencia) return null;
      return (
        <NavLink
          key={node.menu_id}
          to={resolveRuta(node.menu_referencia)}
          className={({ isActive }) => navClass(isActive)}
          style={style}
        >
          {renderIconExpanded(node)}
          <span className="font-medium">{node.menu_nombre}</span>
        </NavLink>
      );
    }

    const isExpanded = expandedGroupIds.has(node.menu_id);
    return (
      <div key={node.menu_id}>
        <button
          type="button"
          onClick={() => toggleGroup(node)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-on-surface-variant hover:bg-surface-variant cursor-pointer bg-transparent border-none text-left"
          style={style}
        >
          {renderIconExpanded(node)}
          <span className="font-medium flex-grow">{node.menu_nombre}</span>
          <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} size="xs" />
        </button>
        {isExpanded && (
          <div className="space-y-2 mt-2">
            {node.hijos.map((hijo) => renderExpandedNode(hijo, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-8 z-50 sidebar-transition hidden md:flex ${
        collapsed ? "w-[88px]" : "w-[280px]"
      }`}
      id="sidebar"
    >
      {/* Header */}
      <div className={`mb-10 flex justify-center ${collapsed ? "px-2" : "px-8"}`}>
        {collapsed ? (
          <div
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm select-none"
            title="VisionTrack"
          >
            VT
          </div>
        ) : (
          <img src={logoImg} alt="VisionTrack Logo" className="h-16 w-auto object-contain" />
        )}
      </div>

      {/* Navigation Tabs (dinámico según tbl_menu / tbl_permiso / roles del usuario) */}
      <nav className={`flex-grow min-h-0 overflow-y-auto space-y-2 ${collapsed ? "px-2" : "px-4"}`}>
        {collapsed ? menuTree.map(renderCollapsedNode) : menuTree.map(renderTitulo)}

        {/* Guía de Estilos - herramienta de desarrollo, no forma parte de tbl_menu */}
        {(hasRole("Administrador") || hasRole("Médico")) && (
          <NavLink
            to="/admin/ui-guide"
            className={({ isActive }) => navClass(isActive)}
            title={collapsed ? "Guía de Estilos" : undefined}
          >
            <span className="material-symbols-outlined">palette</span>
            {!collapsed && <span className="font-medium">Guía de Estilos</span>}
          </NavLink>
        )}
      </nav>

      {/* Footer Tabs */}
      <div className={`border-t border-outline-variant pt-6 space-y-2 ${collapsed ? "px-2" : "px-4"}`}>
        <button
          onClick={logout}
          className={`w-full flex items-center text-on-surface-variant hover:bg-surface-variant transition-colors rounded-lg cursor-pointer bg-transparent border-none text-left ${
            collapsed ? "justify-center px-3 py-3" : "gap-4 px-4 py-3"
          }`}
          title={collapsed ? "Cerrar Sesión" : undefined}
        >
          <span className="material-symbols-outlined text-error">logout</span>
          {!collapsed && <span className="font-medium text-error">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
