import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import {
  getEstadosCita,
  createEstadoCita,
  updateEstadoCita,
  deleteEstadoCita,
} from "../../api/citas/estadoCitaService";
import type { EstadoCita } from "../../types/citas/EstadoCita";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = {
  estado_cita_nombre: "",
  estado_cita_descripcion: "",
  estado_cita_estado: "A",
};

export default function EstadoCitas() {
  const [estados, setEstados] = useState<EstadoCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarEstados = async () => {
    try {
      setLoading(true);
      setError("");
      setEstados(await getEstadosCita());
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(cargarEstados);
  }, []);

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEditar = (estado: EstadoCita) => {
    setEditingId(estado.estado_cita_id);
    setForm({
      estado_cita_nombre: estado.estado_cita_nombre,
      estado_cita_descripcion: estado.estado_cita_descripcion,
      estado_cita_estado: estado.estado_cita_estado,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("El estado de cita se eliminará permanentemente.");
    if (!confirmado) return;

    try {
        await deleteEstadoCita(id);
        mostrarExito("Estado de cita eliminado correctamente.");
        await cargarEstados();
    } catch {
        mostrarError("No se pudo eliminar el estado de cita.");
    }
  };

    const handleGuardar = async () => {
        if (!form.estado_cita_nombre.trim()) {
            mostrarError("El nombre del estado de cita es obligatorio.");
            return;
        }
        if (!form.estado_cita_descripcion.trim()) {
            mostrarError("La descripción del estado de cita es obligatoria.");
            return;
        }
        try {
            setSaving(true);
            if (editingId) {
            await updateEstadoCita(editingId, form);
            mostrarExito("Estado de cita actualizado correctamente.");
            } else {
            await createEstadoCita(form);
            mostrarExito("Estado de cita creado correctamente.");
            }
            setShowModal(false);
            await cargarEstados();
        } catch {
            mostrarError("No se pudo guardar el estado de cita.");
        } finally {
            setSaving(false);
        }
    };

  const columns = [
    { data: "estado_cita_id", title: "ID" },
    { data: "estado_cita_nombre", title: "Nombre" },
    { data: "estado_cita_descripcion", title: "Descripción" },
    { data: "estado_cita_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Estados de Cita</h3>
        <Button variant="primary" onClick={handleNuevo}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Agregar Estado
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
          data={estados}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            3: (_data: unknown, row: EstadoCita) => (
              <Badge bg={row.estado_cita_estado === "A" ? "success" : "secondary"}>
                {row.estado_cita_estado === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            4: (_data: unknown, row: EstadoCita) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)} title="Editar" aria-label="Editar registro">
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" title="Eliminar" aria-label="Eliminar registro" onClick={() => handleEliminar(row.estado_cita_id)}>
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
          <Modal.Title>{editingId ? "Editar Estado de Cita" : "Nuevo Estado de Cita"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                maxLength={100}
                value={form.estado_cita_nombre}
                onChange={(e) => setForm({ ...form, estado_cita_nombre: e.target.value })}
                placeholder="Ej. Confirmada"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={500}
                value={form.estado_cita_descripcion}
                onChange={(e) => setForm({ ...form, estado_cita_descripcion: e.target.value })}
                placeholder="Ej. La cita fue confirmada por el paciente"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={form.estado_cita_estado}
                onChange={(e) => setForm({ ...form, estado_cita_estado: e.target.value })}
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
