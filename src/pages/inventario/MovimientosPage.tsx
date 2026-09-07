import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import {
  getMovimientosInventario,
  createMovimientoInventario,
  getProductos,
} from "../../api/inventarioService";
import type { MovimientoInventario, Producto } from "../../types/inventario";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowUp, faArrowDown, faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import { mostrarExito, mostrarError } from "../../lib/alerts";
import { useAuth } from "../../context/useAuth";

const initialForm = {
  producto_id: "",
  movimiento_tipo: "ENTRADA",
  movimiento_cantidad: 1,
  movimiento_motivo: "",
};

export default function MovimientosPage() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const [movData, prodData] = await Promise.all([
        getMovimientosInventario(),
        getProductos(),
      ]);
      setMovimientos(movData);
      setProductos(prodData.filter(p => p.producto_estado === "A"));
    } catch {
      setError("No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // La carga inicial sincroniza estado con la API al montar el componente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, []);

  const handleNuevo = () => {
    setForm(initialForm);
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (!form.producto_id || form.movimiento_cantidad <= 0) {
      mostrarError("Producto y cantidad (mayor a 0) son obligatorios.");
      return;
    }
    
    if (!user) {
        mostrarError("Usuario no autenticado.");
        return;
    }

    const authUser = user as typeof user & { persona_id?: number; id?: number };
    const usuarioId = authUser.usuario_id ?? authUser.persona_id ?? authUser.id;
    if (!usuarioId) {
      mostrarError("Usuario sin identificador, por favor inicia sesión nuevamente.");
      return;
    }

    try {
      setSaving(true);
      await createMovimientoInventario({
        producto_id: Number(form.producto_id),
        usuario_id: usuarioId,
        movimiento_tipo: form.movimiento_tipo,
        movimiento_cantidad: Number(form.movimiento_cantidad),
        movimiento_motivo: form.movimiento_motivo,
      });
      mostrarExito("Movimiento registrado correctamente.");
      setShowModal(false);
      await cargarDatos();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "No se pudo registrar el movimiento.";
      mostrarError(message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { data: "movimiento_id", title: "ID" },
    { data: "movimiento_fecha", title: "Fecha", render: (data: string) => new Date(data).toLocaleString() },
    { data: "producto.producto_nombre", title: "Producto", defaultContent: "N/A" },
    { data: null, title: "Tipo", orderable: true },
    { data: "movimiento_cantidad", title: "Cantidad" },
    { data: "movimiento_motivo", title: "Motivo", defaultContent: "-" },
    { data: "usuario.usuario_nombre", title: "Usuario", defaultContent: "N/A" },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Historial de Movimientos de Inventario</h3>
        <Button variant="primary" onClick={handleNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Registrar Movimiento
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
          data={movimientos}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol, order: [[1, 'desc']] }}
          slots={{
            3: (_data: unknown, row: MovimientoInventario) => {
                let badgeColor = "secondary";
                let icon = faExchangeAlt;
                if (row.movimiento_tipo === "ENTRADA") { badgeColor = "success"; icon = faArrowUp; }
                if (row.movimiento_tipo === "SALIDA") { badgeColor = "danger"; icon = faArrowDown; }
                if (row.movimiento_tipo === "AJUSTE") { badgeColor = "warning"; }
                
                return (
                    <Badge bg={badgeColor}>
                        <FontAwesomeIcon icon={icon} className="me-1"/>
                        {row.movimiento_tipo}
                    </Badge>
                );
            }
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Usuario</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Movimiento de Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Select
                value={form.producto_id}
                onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
              >
                <option value="">Seleccione un producto...</option>
                {productos.map(prod => (
                  <option key={prod.producto_id} value={prod.producto_id}>
                    {prod.producto_codigo} - {prod.producto_nombre} (Stock actual: {prod.producto_stock_actual})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tipo de Movimiento</Form.Label>
                        <Form.Select
                            value={form.movimiento_tipo}
                            onChange={(e) => setForm({ ...form, movimiento_tipo: e.target.value })}
                        >
                            <option value="ENTRADA">ENTRADA (Añadir stock)</option>
                            <option value="SALIDA">SALIDA (Restar stock)</option>
                            <option value="AJUSTE">AJUSTE (Fijar stock exacto)</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Cantidad</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            value={form.movimiento_cantidad}
                            onChange={(e) => setForm({ ...form, movimiento_cantidad: Number(e.target.value) })}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Motivo / Justificación</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                maxLength={500}
                value={form.movimiento_motivo}
                onChange={(e) => setForm({ ...form, movimiento_motivo: e.target.value })}
                placeholder="Ej. Compra de suministros, Uso en consulta, Caducidad..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving}>
            {saving ? "Registrando..." : "Registrar Movimiento"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
