import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../../api/rolesPermisos/menuService";
import type { Menu } from "../../types/rolesPermisos/Menu";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition, IconName } from "@fortawesome/fontawesome-svg-core";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = {
  menu_padre: "",
  menu_nombre: "",
  menu_icono: "",
  menu_referencia: "",
  menu_estado: "A",
};

// Busca el ícono en el set "fas" registrado en la librería (ver src/lib/fontawesome.ts)
// a partir del nombre tal como aparece en fontawesome.com, ej. "bars", "chart-line".
const resolveIcon = (nombre: string | null | undefined): IconDefinition | null => {
  const trimmed = nombre?.trim();
  if (!trimmed) return null;
  const found = findIconDefinition({ prefix: "fas", iconName: trimmed as IconName });
  return found ?? null;
};

export default function Menus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarMenus = async () => {
    try {
      setLoading(true);
      setError("");
      setMenus(await getMenus());
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMenus();
  }, []);

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEditar = (menu: Menu) => {
    setEditingId(menu.menu_id);
    setForm({
      menu_padre: menu.menu_padre ? String(menu.menu_padre) : "",
      menu_nombre: menu.menu_nombre,
      menu_icono: menu.menu_icono ?? "",
      menu_referencia: menu.menu_referencia ?? "",
      menu_estado: menu.menu_estado,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("El menú se eliminará permanentemente.");
    if (!confirmado) return;

    try {
        await deleteMenu(id);
        mostrarExito("Menú eliminado correctamente.");
        await cargarMenus();
    } catch {
        mostrarError("No se pudo eliminar el menú.");
    }
  };

    const handleGuardar = async () => {
        if (!form.menu_nombre.trim()) {
            mostrarError("El nombre del menú es obligatorio.");
            return;
        }
        try {
            setSaving(true);
            const payload = {
                menu_padre: form.menu_padre ? Number(form.menu_padre) : null,
                menu_nombre: form.menu_nombre,
                menu_icono: form.menu_icono.trim() || null,
                menu_referencia: form.menu_referencia.trim() || null,
                menu_estado: form.menu_estado,
            };
            if (editingId) {
            await updateMenu(editingId, payload);
            mostrarExito("Menú actualizado correctamente.");
            } else {
            await createMenu(payload);
            mostrarExito("Menú creado correctamente.");
            }
            setShowModal(false);
            await cargarMenus();
        } catch {
            mostrarError("No se pudo guardar el menú.");
        } finally {
            setSaving(false);
        }
    };

  const columns = [
    { data: "menu_id", title: "ID" },
    { data: null, title: "Menú Padre" },
    { data: "menu_nombre", title: "Nombre" },
    { data: null, title: "Ícono" },
    { data: null, title: "Referencia" },
    { data: "menu_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  const iconoPreview = resolveIcon(form.menu_icono);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Menús</h3>
        <Button variant="primary" onClick={handleNuevo}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Agregar Menú
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
          data={menus}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            1: (_data: unknown, row: Menu) =>
              menus.find((m) => m.menu_id === row.menu_padre)?.menu_nombre || "—",
            3: (_data: unknown, row: Menu) => {
              const icon = resolveIcon(row.menu_icono);
              return (
                <span className="d-inline-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={icon ?? faQuestion} opacity={icon ? 1 : 0.3} />
                  <span>{row.menu_icono || "—"}</span>
                </span>
              );
            },
            4: (_data: unknown, row: Menu) => row.menu_referencia || "—",
            5: (_data: unknown, row: Menu) => (
              <Badge bg={row.menu_estado === "A" ? "success" : "secondary"}>
                {row.menu_estado === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            6: (_data: unknown, row: Menu) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleEliminar(row.menu_id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </>
            ),
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Menú Padre</th>
              <th>Nombre</th>
              <th>Ícono</th>
              <th>Referencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Menú" : "Nuevo Menú"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Menú Padre</Form.Label>
              <Form.Select
                value={form.menu_padre}
                onChange={(e) => setForm({ ...form, menu_padre: e.target.value })}
              >
                <option value="">Ninguno (menú raíz)</option>
                {menus
                  .filter((m) => m.menu_id !== editingId)
                  .map((m) => (
                    <option key={m.menu_id} value={m.menu_id}>
                      {m.menu_nombre}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                maxLength={50}
                value={form.menu_nombre}
                onChange={(e) => setForm({ ...form, menu_nombre: e.target.value })}
                placeholder="Ej. Dashboard"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ícono (FontAwesome)</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  maxLength={500}
                  value={form.menu_icono}
                  onChange={(e) => setForm({ ...form, menu_icono: e.target.value })}
                  placeholder="Ej. bars"
                />
                <div
                  className="d-flex align-items-center justify-content-center border rounded flex-shrink-0"
                  style={{ width: 42, height: 38 }}
                  title={iconoPreview ? form.menu_icono : "Ícono no encontrado"}
                >
                  <FontAwesomeIcon icon={iconoPreview ?? faQuestion} opacity={iconoPreview ? 1 : 0.3} />
                </div>
              </div>
              <Form.Text muted>
                Nombre del ícono estilo Solid tal como aparece en fontawesome.com, ej.{" "}
                <code>bars</code>, <code>user</code>, <code>chart-line</code>.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Referencia</Form.Label>
              <Form.Control
                type="text"
                maxLength={500}
                value={form.menu_referencia}
                onChange={(e) => setForm({ ...form, menu_referencia: e.target.value })}
                placeholder="Ej. /medicos/doctores"
              />
              <Form.Text muted>
                Ruta relativa a la sección, sin el prefijo <code>/admin</code> o <code>/portal</code>:
                el Sidebar lo antepone automáticamente según el perfil del usuario.
              </Form.Text>
            </Form.Group>
            {editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={form.menu_estado}
                  onChange={(e) => setForm({ ...form, menu_estado: e.target.value })}
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </Form.Select>
              </Form.Group>
            )}
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
