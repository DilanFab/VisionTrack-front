import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import {
  getGeneros,
  createGenero,
  updateGenero,
  deleteGenero,
} from "../../api/usuarios/generoService";
import type { Genero } from "../../types/usuarios/Genero";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = { genero_nombre: "", genero_estado: "A" };

export default function Generos() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarGeneros = async () => {
    try {
      setLoading(true);
      setError("");
      setGeneros(await getGeneros());
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGeneros();
  }, []);

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEditar = (genero: Genero) => {
    setEditingId(genero.genero_id);
    setForm({ genero_nombre: genero.genero_nombre, genero_estado: genero.genero_estado });
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("El género se eliminará permanentemente.");
    if (!confirmado) return;

    try {
        await deleteGenero(id);
        mostrarExito("Género eliminado correctamente.");
        await cargarGeneros();
    } catch {
        mostrarError("No se pudo eliminar el género.");
    }
  };

    const handleGuardar = async () => {
        if (!form.genero_nombre.trim()) {
            mostrarError("El nombre del género es obligatorio.");
            return;
        }
        try {
            setSaving(true);
            if (editingId) {
            await updateGenero(editingId, form);
            mostrarExito("Género actualizado correctamente.");
            } else {
            await createGenero(form);
            mostrarExito("Género creado correctamente.");
            }
            setShowModal(false);
            await cargarGeneros();
        } catch {
            mostrarError("No se pudo guardar el género.");
        } finally {
            setSaving(false);
        }
    };

  const columns = [
    { data: "genero_id", title: "ID" },
    { data: "genero_nombre", title: "Nombre" },
    { data: "genero_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Géneros</h3>
        <Button variant="primary" onClick={handleNuevo}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Agregar Género
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
          data={generos}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            2: (_data: unknown, row: Genero) => (
              <Badge bg={row.genero_estado === "A" ? "success" : "secondary"}>
                {row.genero_estado === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            3: (_data: unknown, row: Genero) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleEliminar(row.genero_id)}>
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Género" : "Nuevo Género"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                maxLength={20}
                value={form.genero_nombre}
                onChange={(e) => setForm({ ...form, genero_nombre: e.target.value })}
                placeholder="Ej. Masculino"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={form.genero_estado}
                onChange={(e) => setForm({ ...form, genero_estado: e.target.value })}
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