import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import {
  getCategoriasProducto,
  createCategoriaProducto,
  updateCategoriaProducto,
  deleteCategoriaProducto,
} from "../../api/inventarioService";
import type { CategoriaProducto } from "../../types/inventario";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = {
  categoria_producto_nombre: "",
  categoria_producto_descripcion: "",
  categoria_producto_estado: "A",
};

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setError("");
      setCategorias(await getCategoriasProducto());
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEditar = (categoria: CategoriaProducto) => {
    setEditingId(categoria.categoria_producto_id);
    setForm({
      categoria_producto_nombre: categoria.categoria_producto_nombre,
      categoria_producto_descripcion: categoria.categoria_producto_descripcion || "",
      categoria_producto_estado: categoria.categoria_producto_estado,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("La categoría se eliminará permanentemente.");
    if (!confirmado) return;

    try {
      await deleteCategoriaProducto(id);
      mostrarExito("Categoría eliminada correctamente.");
      await cargarCategorias();
    } catch {
      mostrarError("No se pudo eliminar la categoría.");
    }
  };

  const handleGuardar = async () => {
    if (!form.categoria_producto_nombre.trim()) {
      mostrarError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateCategoriaProducto(editingId, form);
        mostrarExito("Categoría actualizada correctamente.");
      } else {
        await createCategoriaProducto(form);
        mostrarExito("Categoría creada correctamente.");
      }
      setShowModal(false);
      await cargarCategorias();
    } catch {
      mostrarError("No se pudo guardar la categoría. Revisa que el nombre no esté duplicado.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { data: "categoria_producto_id", title: "ID" },
    { data: "categoria_producto_nombre", title: "Nombre" },
    { data: "categoria_producto_descripcion", title: "Descripción" },
    { data: "categoria_producto_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Categorías de Insumos / Productos</h3>
        <Button variant="primary" onClick={handleNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Agregar Categoría
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
          data={categorias}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            3: (_data: unknown, row: CategoriaProducto) => (
              <Badge bg={row.categoria_producto_estado === "A" ? "success" : "secondary"}>
                {row.categoria_producto_estado === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            4: (_data: unknown, row: CategoriaProducto) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleEliminar(row.categoria_producto_id)}>
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
          <Modal.Title>{editingId ? "Editar Categoría" : "Nueva Categoría"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                maxLength={100}
                value={form.categoria_producto_nombre}
                onChange={(e) => setForm({ ...form, categoria_producto_nombre: e.target.value })}
                placeholder="Ej. Medicamentos"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={500}
                value={form.categoria_producto_descripcion}
                onChange={(e) => setForm({ ...form, categoria_producto_descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={form.categoria_producto_estado}
                onChange={(e) => setForm({ ...form, categoria_producto_estado: e.target.value })}
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </Form.Select>
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
