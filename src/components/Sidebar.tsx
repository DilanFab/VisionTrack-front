import { SymbolIcon } from "../components/SymbolIcon";
import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import logoImg from "../assets/logo.svg";
import { getNavigationMenus } from "../api/authNavigationService";
import type { Menu } from "../types/rolesPermisos/Menu";
import { buildMenuTree, collectIds, getAncestorIds, type MenuNode } from "../lib/menuTree";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition, IconName } from "@fortawesome/fontawesome-svg-core";
import { faQuestion, faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { hasAdminRole, hasDoctorRole, hasReceptionistRole, isAdminPathAllowed } from "../lib/roleCapabilities";

interface SidebarProps {
  collapsed: boolean;
  section: "admin" | "patient";
  mobileOpen?: boolean;
  onClose?: () => void;
}

const resolveIcon = (nombre: string | null | undefined): IconDefinition | null => {
  const trimmed = nombre?.trim();
  if (!trimmed) return null;
  return findIconDefinition({ prefix: "fas", iconName: trimmed as IconName }) ?? null;
};

const normalizeMenuName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isPatientPortalNode = (node: MenuNode) => {
  const name = normalizeMenuName(node.menu_nombre);
  return name.includes("portal") && name.includes("paciente");
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, section, mobileOpen = false, onClose }) => {
  const { logout, hasRole, user } = useAuth();

  const [menus, setMenus] = useState<Menu[]>([]);
  // Vacío por defecto: todos los grupos del menú arrancan cerrados. Acordeón
  // global: solo una rama (de raíz a hoja) puede estar abierta a la vez, así
  // que abrir cualquier grupo cierra todo lo demás salvo sus propios ancestros
  // (para poder desplegar submenús anidados, ej. Personas -> Usuarios, sin
  // cerrar al padre en el camino).
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const menusData = await getNavigationMenus();
        setMenus(menusData);
      } catch (error) {
        console.error("No se pudo cargar el menú de navegación:", error);
      }
    })();
  }, []);

  const menusVisibles = useMemo(
    () => menus.filter((m) => m.menu_estado === "A"),
    [menus]
  );

  const menuTree = useMemo(() => {
    const filtrarNodoPorRol = (node: MenuNode): MenuNode | null => {
      const hijos = node.hijos.map(filtrarNodoPorRol).filter((hijo): hijo is MenuNode => Boolean(hijo));
      const referenciaPermitida = !node.menu_referencia || isAdminPathAllowed(node.menu_referencia, user?.roles);
      if (!referenciaPermitida && hijos.length === 0) return null;
      return { ...node, hijos };
    };

    const tree = buildMenuTree(menusVisibles);
    if (section === "admin") {
      return tree
        .filter((node) => !isPatientPortalNode(node))
        .map(filtrarNodoPorRol)
        .filter((node): node is MenuNode => Boolean(node));
    }

    const patientRoots = tree.filter(isPatientPortalNode);
    return patientRoots.length > 0 ? patientRoots : tree;
  }, [menusVisibles, section, user?.roles]);

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
    `flex items-center rounded-xl transition-all focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus-ring focus-visible:outline-offset-2 ${
      collapsed ? "justify-center px-3 py-3" : "gap-4 px-4 py-3"
    } ${
      isActive
        ? "text-primary font-bold border-r-3 border-primary bg-primary-container/55 shadow-sm"
        : "text-on-surface-variant hover:bg-surface-variant/70 hover:text-on-surface"
    }`;

  // `menu_referencia` en BD se guarda relativo a la sección (ej. "/medicos/doctores").
  // La sección la decide el layout actual, no los roles del usuario: un usuario
  // con rol Paciente y Administrador no debe ver rutas del portal dentro de /admin.
  const basePath = section === "patient" ? "/portal" : "/admin";
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
          aria-label={node.menu_nombre}
          onClick={onClose}
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
          onClick={onClose}
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
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-variant/70 hover:text-on-surface focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus-ring focus-visible:outline-offset-2 cursor-pointer bg-transparent border-none text-left"
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


  const staffQuickLinks = useMemo(() => {
    if (section !== "admin") return [];
    if (hasDoctorRole(user?.roles)) {
      return [
        { to: "/admin/citas", label: "Mis citas", icon: "calendar_month" },
        { to: "/admin/historial", label: "Historias clínicas", icon: "clinical_notes" },
      ];
    }
    if (hasReceptionistRole(user?.roles) && !hasAdminRole(user?.roles)) {
      return [
        { to: "/admin/citas", label: "Gestión de citas", icon: "event_available" },
        { to: "/admin/usuarios/pacientes", label: "Pacientes", icon: "groups" },
      ];
    }
    if (hasAdminRole(user?.roles)) {
      return [
        { to: "/admin/dashboard", label: "Supervisión", icon: "dashboard" },
        { to: "/admin/historial", label: "Supervisión clínica", icon: "clinical_notes" },
      ];
    }
    return [];
  }, [section, user?.roles]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 z-40 bg-inverse-surface/35 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`h-screen fixed left-0 top-0 bg-surface-container-low/95 backdrop-blur-xl border-r border-outline-variant flex flex-col py-8 z-50 sidebar-transition w-[280px] md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-[88px]" : "md:w-[280px]"}`}
        id="sidebar"
        aria-label="Navegación principal"
      >
      {/* Header */}
      <div className={`mb-10 flex justify-center ${collapsed ? "px-2" : "px-8"}`}>
        {!collapsed && mobileOpen && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full p-2 text-on-surface-variant hover:bg-surface-variant md:hidden"
            aria-label="Cerrar menú"
          >
            <SymbolIcon name="close" />
          </button>
        )}
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

        {staffQuickLinks.length > 0 && !collapsed && (
          <div className="pt-3 mt-3 border-t border-outline-variant/70 space-y-2">
            <div className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-outline select-none">
              Accesos por rol
            </div>
            {staffQuickLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => navClass(isActive)} onClick={onClose}>
                <SymbolIcon name={link.icon} />
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}
          </div>
        )}
        {staffQuickLinks.length > 0 && collapsed && staffQuickLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => navClass(isActive)} title={link.label} aria-label={link.label} onClick={onClose}>
            <SymbolIcon name={link.icon} />
          </NavLink>
        ))}

        {/* Guía de Estilos - herramienta de desarrollo, no forma parte de tbl_menu */}
        {(hasRole("Administrador") || hasRole("Médico")) && (
          <NavLink
            to="/admin/ui-guide"
            className={({ isActive }) => navClass(isActive)}
            title={collapsed ? "Guía de Estilos" : undefined}
            aria-label="Guía de estilos"
            onClick={onClose}
          >
            <SymbolIcon name="palette" />
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
          aria-label="Cerrar sesión"
        >
          <SymbolIcon name="logout" className="text-error" />
          {!collapsed && <span className="font-medium text-error">Cerrar Sesión</span>}
        </button>
      </div>
      </aside>
    </>
  );
};
