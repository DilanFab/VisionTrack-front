import { useEffect, useMemo, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import {
  getRoles,
  createRol,
  updateRol,
  deleteRol,
} from "../../api/rolesPermisos/rolService";
import { getMenus } from "../../api/rolesPermisos/menuService";
import { getPermisos, setPermisosDeRol } from "../../api/rolesPermisos/permisoService";
import type { Rol } from "../../types/rolesPermisos/Rol";
import type { Menu } from "../../types/rolesPermisos/Menu";
import type { Permiso } from "../../types/rolesPermisos/Permiso";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faPlus,
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";
import { buildMenuTree, collectIds, getAncestorIds, type MenuNode } from "../../lib/menuTree";

const initialForm = {
  rol_nombre: "",
  rol_descripcion: "",
  rol_estado: "A",
};

type NodeState = "checked" | "unchecked" | "indeterminate";

const getNodeState = (node: MenuNode, checked: Set<number>): NodeState => {
  const ids = collectIds(node);
  const total = ids.filter((id) => checked.has(id)).length;
  if (total === 0) return "unchecked";
  if (total === ids.length) return "checked";
  return "indeterminate";
};

interface MenuPermisoNodeProps {
  node: MenuNode;
  depth: number;
  checked: Set<number>;
  expanded: Set<number>;
  onToggleChecked: (node: MenuNode) => void;
  onToggleExpanded: (menuId: number) => void;
}

const MenuPermisoNode: React.FC<MenuPermisoNodeProps> = ({
  node,
  depth,
  checked,
  expanded,
  onToggleChecked,
  onToggleExpanded,
}) => {
  const hasHijos = node.hijos.length > 0;
  const isExpanded = expanded.has(node.menu_id);
  const state = getNodeState(node, checked);

  return (
    <div>
      <div className="d-flex align-items-center gap-2 py-1" style={{ paddingLeft: depth * 24 }}>
        {hasHijos ? (
          <Button
            variant="link"
            className="p-0 text-body-secondary"
            style={{ width: 16 }}
            onClick={() => onToggleExpanded(node.menu_id)}
          >
            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} size="xs" />
          </Button>
        ) : (
          <span style={{ width: 16, display: "inline-block" }} />
        )}
        <Form.Check
          type="checkbox"
          id={`permiso-menu-${node.menu_id}`}
          label={node.menu_nombre}
          checked={state === "checked"}
          ref={(el: HTMLInputElement | null) => {
            if (el) el.indeterminate = state === "indeterminate";
          }}
          onChange={() => onToggleChecked(node)}
        />
      </div>
      {hasHijos && isExpanded && (
        <div>
          {node.hijos.map((hijo) => (
            <MenuPermisoNode
              key={hijo.menu_id}
              node={hijo}
              depth={depth + 1}
              checked={checked}
              expanded={expanded}
              onToggleChecked={onToggleChecked}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Roles() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [checkedMenuIds, setCheckedMenuIds] = useState<Set<number>>(new Set());
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<number>>(new Set());

  const menuTree = useMemo(() => buildMenuTree(menus), [menus]);
  const menusById = useMemo(() => new Map(menus.map((m) => [m.menu_id, m])), [menus]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const [rolesData, menusData, permisosData] = await Promise.all([
        getRoles(),
        getMenus(),
        getPermisos(),
      ]);
      setRoles(rolesData);
      setMenus(menusData);
      setPermisos(permisosData);
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(cargarDatos);
  }, []);

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setCheckedMenuIds(new Set());
    setExpandedMenuIds(new Set());
    setShowModal(true);
  };

  const handleEditar = (rol: Rol) => {
    setEditingId(rol.rol_id);
    setForm({
      rol_nombre: rol.rol_nombre,
      rol_descripcion: rol.rol_descripcion,
      rol_estado: rol.rol_estado,
    });
    const menuIdsDelRol = permisos
      .filter((p) => p.rol_id === rol.rol_id && p.permiso_estado === "A")
      .map((p) => p.menu_id);
    setCheckedMenuIds(new Set(menuIdsDelRol));
    setExpandedMenuIds(new Set());
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("El rol se eliminará permanentemente.");
    if (!confirmado) return;

    try {
        await deleteRol(id);
        mostrarExito("Rol eliminado correctamente.");
        await cargarDatos();
    } catch {
        mostrarError("No se pudo eliminar el rol.");
    }
  };

  const toggleMenuChecked = (node: MenuNode) => {
    const ids = collectIds(node);
    const state = getNodeState(node, checkedMenuIds);
    setCheckedMenuIds((prev) => {
      const next = new Set(prev);
      if (state === "checked") {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
        // Al marcar un menú, sus padres también deben quedar seleccionados
        // para poder construir el árbol de navegación del rol.
        getAncestorIds(node.menu_id, menusById).forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleMenuExpanded = (menuId: number) => {
    setExpandedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

    const handleGuardar = async () => {
        if (!form.rol_nombre.trim()) {
            mostrarError("El nombre del rol es obligatorio.");
            return;
        }
        if (!form.rol_descripcion.trim()) {
            mostrarError("La descripción del rol es obligatoria.");
            return;
        }
        try {
            setSaving(true);
            const rolId = editingId ?? (await createRol(form)).rol_id;
            if (editingId) {
                await updateRol(editingId, form);
            }
            await setPermisosDeRol(rolId, Array.from(checkedMenuIds));
            mostrarExito(editingId ? "Rol actualizado correctamente." : "Rol creado correctamente.");
            setShowModal(false);
            await cargarDatos();
        } catch {
            mostrarError("No se pudo guardar el rol.");
        } finally {
            setSaving(false);
        }
    };

  const columns = [
    { data: "rol_id", title: "ID" },
    { data: "rol_nombre", title: "Nombre" },
    { data: "rol_descripcion", title: "Descripción" },
    { data: "rol_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Roles</h3>
        <Button variant="primary" onClick={handleNuevo}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Agregar Rol
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <DataTable
          data={roles}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            3: (_data: unknown, row: Rol) => (
              <Badge bg={row.rol_estado === "A" ? "success" : "secondary"}>
                {row.rol_estado === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            4: (_data: unknown, row: Rol) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)} title="Editar" aria-label="Editar registro">
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" title="Eliminar" aria-label="Eliminar registro" onClick={() => handleEliminar(row.rol_id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </>
            ),
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Rol" : "Nuevo Rol"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                maxLength={100}
                value={form.rol_nombre}
                onChange={(e) => setForm({ ...form, rol_nombre: e.target.value })}
                placeholder="Ej. Administrador"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={500}
                value={form.rol_descripcion}
                onChange={(e) => setForm({ ...form, rol_descripcion: e.target.value })}
                placeholder="Ej. Acceso total al sistema"
              />
            </Form.Group>
            {editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={form.rol_estado}
                  onChange={(e) => setForm({ ...form, rol_estado: e.target.value })}
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Permisos</Form.Label>
              <div
                className="border border-outline-variant rounded p-2"
                style={{ maxHeight: 260, overflowY: "auto" }}
              >
                {menuTree.length === 0 ? (
                  <div className="text-body-secondary small px-1">No hay menús registrados.</div>
                ) : (
                  menuTree.map((node) => (
                    <MenuPermisoNode
                      key={node.menu_id}
                      node={node}
                      depth={0}
                      checked={checkedMenuIds}
                      expanded={expandedMenuIds}
                      onToggleChecked={toggleMenuChecked}
                      onToggleExpanded={toggleMenuExpanded}
                    />
                  ))
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
