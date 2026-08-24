import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { 
  getConfiguracionesIva, 
  createConfiguracionIva, 
  updateConfiguracionIva, 
  deleteConfiguracionIva 
} from "../../api/ventas/configuracionIvaService";
import type { ConfiguracionIva } from "../../types/facturacion";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = {
  iva_porcentaje: 0,
  iva_descripcion: "",
  iva_activo: true,
};

export default function ConfiguracionIva() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionIva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getConfiguracionesIva(false);
      setConfiguraciones(data);
    } catch {
      setError("No se pudo conectar con la API para obtener las configuraciones de IVA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEditar = (conf: ConfiguracionIva) => {
    setEditingId(conf.iva_id);
    setForm({
      iva_porcentaje: Number(conf.iva_porcentaje),
      iva_descripcion: conf.iva_descripcion,
      iva_activo: conf.iva_activo,
    });
    setShowModal(true);
  };

  const handleToggleActivo = async (conf: ConfiguracionIva) => {
    try {
      await updateConfiguracionIva(conf.iva_id, { iva_activo: !conf.iva_activo });
      mostrarExito(`Configuración ${!conf.iva_activo ? "activada" : "desactivada"}`);
      cargarDatos();
    } catch {
      mostrarError("Error al cambiar estado de la configuración");
    }
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("La configuración de IVA se desactivará.");
    if (!confirmado) return;

    try {
      await deleteConfiguracionIva(id);
      mostrarExito("Configuración de IVA eliminada.");
      await cargarDatos();
    } catch {
      mostrarError("No se pudo eliminar la configuración de IVA.");
    }
  };

  const handleGuardar = async () => {
    if (!form.iva_descripcion.trim()) {
      mostrarError("La descripción es obligatoria.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateConfiguracionIva(editingId, {
          iva_porcentaje: form.iva_porcentaje,
          iva_descripcion: form.iva_descripcion,
          iva_activo: form.iva_activo,
        });
        mostrarExito("Configuración actualizada correctamente.");
      } else {
        await createConfiguracionIva({
          iva_porcentaje: form.iva_porcentaje,
          iva_descripcion: form.iva_descripcion,
          iva_activo: form.iva_activo,
        });
        mostrarExito("Configuración creada correctamente.");
      }
      setShowModal(false);
      await cargarDatos();
    } catch (err: any) {
      mostrarError(err?.response?.data?.message ?? "Error al guardar la configuración de IVA.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { data: "iva_porcentaje", title: "Porcentaje (%)", render: (data: any) => `${Number(data)}%` },
    { data: "iva_descripcion", title: "Descripción" },
    { data: null, title: "Activo", orderable: false },
    { data: null, title: "Estado (Borrado)", orderable: false },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Configuración de IVA</h3>
        <Button variant="primary" onClick={handleNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Agregar Tarifa
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
          data={configuraciones}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            2: (_data: unknown, row: ConfiguracionIva) => (
              <Form.Check
                type="switch"
                checked={row.iva_activo}
                onChange={() => handleToggleActivo(row)}
                id={`switch-activo-${row.iva_id}`}
                label={row.iva_activo ? "Sí" : "No"}
              />
            ),
            3: (_data: unknown, row: ConfiguracionIva) => (
              <Badge bg={row.iva_estado === "A" ? "success" : "secondary"}>
                {row.iva_estado === "A" ? "Vigente" : "Eliminado"}
              </Badge>
            ),
            4: (_data: unknown, row: ConfiguracionIva) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                {row.iva_estado === "A" && (
                  <Button size="sm" variant="danger" onClick={() => handleEliminar(row.iva_id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                )}
              </>
            ),
          }}
        >
          <thead>
            <tr>
              <th>Porcentaje (%)</th>
              <th>Descripción</th>
              <th>Activo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Configuración IVA" : "Nueva Configuración IVA"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Porcentaje (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.iva_porcentaje}
                    onChange={(e) => setForm({ ...form, iva_porcentaje: Number(e.target.value) })}
                    disabled={!!editingId} // Usualmente el porcentaje no se edita, se crea uno nuevo
                  />
                  {editingId && <Form.Text className="text-muted">El porcentaje no es editable una vez creado. Desactive esta tarifa y cree una nueva si es necesario.</Form.Text>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Activa</Form.Label>
                  <Form.Check
                    type="switch"
                    checked={form.iva_activo}
                    onChange={(e) => setForm({ ...form, iva_activo: e.target.checked })}
                    label="Habilitada para facturación"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                maxLength={100}
                value={form.iva_descripcion}
                onChange={(e) => setForm({ ...form, iva_descripcion: e.target.value })}
                placeholder="Ej. IVA 15% (General)"
              />
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
