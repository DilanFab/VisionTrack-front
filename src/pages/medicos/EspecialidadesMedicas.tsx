import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import {
  getEspecialidadesMedicas,
  createEspecialidadMedica,
  updateEspecialidadMedica,
  deleteEspecialidadMedica,
} from "../../api/medicos/especialidadMedicaService";
import type { EspecialidadMedica } from "../../types/medicos/EspecialidadMedica";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = {
  especialidad_medica_nombre: "",
  especialidad_medica_descripcion: "",
  especialidad_medica_estado: "A",
};

export default function EspecialidadesMedicas() {
  const [especialidades, setEspecialidades] = useState<EspecialidadMedica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarEspecialidades = async () => {
    try {
      setLoading(true);
      setError("");
      setEspecialidades(await getEspecialidadesMedicas());
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEditar = (especialidad: EspecialidadMedica) => {
    setEditingId(especialidad.especialidad_medica_id);
    setForm({
      especialidad_medica_nombre: especialidad.especialidad_medica_nombre,
      especialidad_medica_descripcion: especialidad.especialidad_medica_descripcion,
      especialidad_medica_estado: especialidad.especialidad_medica_estado,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("La especialidad médica se eliminará permanentemente.");
    if (!confirmado) return;

    try {
        await deleteEspecialidadMedica(id);
        mostrarExito("Especialidad médica eliminada correctamente.");
        await cargarEspecialidades();
    } catch {
        mostrarError("No se pudo eliminar la especialidad médica.");
    }
  };

    const handleGuardar = async () => {
        if (!form.especialidad_medica_nombre.trim()) {
            mostrarError("El nombre de la especialidad médica es obligatorio.");
            return;
        }
        if (!form.especialidad_medica_descripcion.trim()) {
            mostrarError("La descripción de la especialidad médica es obligatoria.");
            return;
        }
        try {
            setSaving(true);
            if (editingId) {
            await updateEspecialidadMedica(editingId, form);
            mostrarExito("Especialidad médica actualizada correctamente.");
            } else {
            await createEspecialidadMedica(form);
            mostrarExito("Especialidad médica creada correctamente.");
            }
            setShowModal(false);
            await cargarEspecialidades();
        } catch {
            mostrarError("No se pudo guardar la especialidad médica.");
        } finally {
            setSaving(false);
        }
    };

  const columns = [
    { data: "especialidad_medica_id", title: "ID" },
    { data: "especialidad_medica_nombre", title: "Nombre" },
    { data: "especialidad_medica_descripcion", title: "Descripción" },
    { data: "especialidad_medica_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Especialidades Médicas</h3>
        <Button variant="primary" onClick={handleNuevo}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Agregar Especialidad
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
          data={especialidades}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            3: (_data: unknown, row: EspecialidadMedica) => (
              <Badge bg={row.especialidad_medica_estado === "A" ? "success" : "secondary"}>
                {row.especialidad_medica_estado === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            4: (_data: unknown, row: EspecialidadMedica) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleEliminar(row.especialidad_medica_id)}>
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
          <Modal.Title>{editingId ? "Editar Especialidad Médica" : "Nueva Especialidad Médica"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                maxLength={100}
                value={form.especialidad_medica_nombre}
                onChange={(e) => setForm({ ...form, especialidad_medica_nombre: e.target.value })}
                placeholder="Ej. Oftalmología Pediátrica"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={500}
                value={form.especialidad_medica_descripcion}
                onChange={(e) => setForm({ ...form, especialidad_medica_descripcion: e.target.value })}
                placeholder="Ej. Atención oftalmológica especializada en pacientes infantiles"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={form.especialidad_medica_estado}
                onChange={(e) => setForm({ ...form, especialidad_medica_estado: e.target.value })}
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
