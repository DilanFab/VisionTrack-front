import { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getCategoriasProducto,
} from "../../api/inventarioService";
import { getConfiguracionesIva } from "../../api/ventas/configuracionIvaService";
import type { Producto, CategoriaProducto } from "../../types/inventario";
import type { ConfiguracionIva } from "../../types/facturacion";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = {
  categoria_producto_id: "",
  producto_codigo: "",
  producto_nombre: "",
  producto_descripcion: "",
  producto_precio_unitario: 0,
  producto_stock_actual: 0,
  producto_stock_minimo: 5,
  producto_unidad_medida: "",
  producto_estado: "A",
  iva_id: "",
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [ivas, setIvas] = useState<ConfiguracionIva[]>([]);
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
      const [prodData, catData, ivaData] = await Promise.all([
        getProductos(),
        getCategoriasProducto(),
        getConfiguracionesIva(true),
      ]);
      setProductos(prodData);
      setCategorias(catData.filter(c => c.categoria_producto_estado === "A"));
      setIvas(ivaData);
    } catch {
      setError("No se pudo conectar con la API.");
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

  const handleEditar = (producto: Producto) => {
    setEditingId(producto.producto_id);
    setForm({
      categoria_producto_id: producto.categoria_producto_id.toString(),
      producto_codigo: producto.producto_codigo,
      producto_nombre: producto.producto_nombre,
      producto_descripcion: producto.producto_descripcion || "",
      producto_precio_unitario: producto.producto_precio_unitario,
      producto_stock_actual: producto.producto_stock_actual,
      producto_stock_minimo: producto.producto_stock_minimo,
      producto_unidad_medida: producto.producto_unidad_medida,
      producto_estado: producto.producto_estado,
      iva_id: producto.iva_id ? producto.iva_id.toString() : "",
    });
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("El producto se eliminará permanentemente.");
    if (!confirmado) return;

    try {
      await deleteProducto(id);
      mostrarExito("Producto eliminado correctamente.");
      await cargarDatos();
    } catch {
      mostrarError("No se pudo eliminar el producto.");
    }
  };

  const handleGuardar = async () => {
    if (!form.producto_nombre.trim() || !form.producto_codigo.trim() || !form.categoria_producto_id) {
      mostrarError("Nombre, código y categoría son obligatorios.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        categoria_producto_id: Number(form.categoria_producto_id),
        producto_precio_unitario: Number(form.producto_precio_unitario),
        producto_stock_actual: Number(form.producto_stock_actual),
        producto_stock_minimo: Number(form.producto_stock_minimo),
        iva_id: form.iva_id ? Number(form.iva_id) : null,
      };

      if (editingId) {
        await updateProducto(editingId, payload);
        mostrarExito("Producto actualizado correctamente.");
      } else {
        await createProducto(payload);
        mostrarExito("Producto creado correctamente.");
      }
      setShowModal(false);
      await cargarDatos();
    } catch {
      mostrarError("No se pudo guardar el producto. Revisa que el código no esté duplicado.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { data: "producto_codigo", title: "Código" },
    { data: "producto_nombre", title: "Nombre" },
    { data: "categoria.categoria_producto_nombre", title: "Categoría", defaultContent: "N/A" },
    { 
      data: null, 
      title: "IVA", 
      render: (_data: any, _type: any, row: Producto) => row.configuracion_iva ? `${row.configuracion_iva.iva_porcentaje}%` : "No asignado" 
    },
    { data: "producto_stock_actual", title: "Stock" },
    { data: null, title: "Estado", orderable: false },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Catálogo de Productos</h3>
        <Button variant="primary" onClick={handleNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Agregar Producto
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
          data={productos}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            3: (_data: unknown, row: Producto) => (
               <span className={row.producto_stock_actual <= row.producto_stock_minimo ? "text-danger fw-bold" : ""}>
                 {row.producto_stock_actual} {row.producto_unidad_medida}
               </span>
            ),
            4: (_data: unknown, row: Producto) => (
              <>
                <Badge bg={row.producto_estado === "A" ? "success" : "secondary"} className="me-2">
                  {row.producto_estado === "A" ? "Activo" : "Inactivo"}
                </Badge>
                {row.producto_stock_actual <= row.producto_stock_minimo && (
                   <Badge bg="danger" title={`Stock mínimo: ${row.producto_stock_minimo}`}>
                     <FontAwesomeIcon icon={faExclamationTriangle} className="me-1"/>
                     Bajo Stock
                   </Badge>
                )}
              </>
            ),
            5: (_data: unknown, row: Producto) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleEliminar(row.producto_id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </>
            ),
          }}
        >
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>IVA</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Producto" : "Nuevo Producto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Código / SKU</Form.Label>
                        <Form.Control
                            type="text"
                            maxLength={50}
                            value={form.producto_codigo}
                            onChange={(e) => setForm({ ...form, producto_codigo: e.target.value })}
                            placeholder="Ej. MED-001"
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            maxLength={150}
                            value={form.producto_nombre}
                            onChange={(e) => setForm({ ...form, producto_nombre: e.target.value })}
                            placeholder="Ej. Paracetamol 500mg"
                        />
                    </Form.Group>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Categoría</Form.Label>
                        <Form.Select
                            value={form.categoria_producto_id}
                            onChange={(e) => setForm({ ...form, categoria_producto_id: e.target.value })}
                        >
                            <option value="">Seleccione una categoría...</option>
                            {categorias.map(cat => (
                                <option key={cat.categoria_producto_id} value={cat.categoria_producto_id}>
                                    {cat.categoria_producto_nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Unidad de Medida</Form.Label>
                        <Form.Control
                            type="text"
                            maxLength={50}
                            value={form.producto_unidad_medida}
                            onChange={(e) => setForm({ ...form, producto_unidad_medida: e.target.value })}
                            placeholder="Ej. Caja, Frasco, Unidad"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                maxLength={500}
                value={form.producto_descripcion}
                onChange={(e) => setForm({ ...form, producto_descripcion: e.target.value })}
              />
            </Form.Group>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Precio Unitario</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={form.producto_precio_unitario}
                            onChange={(e) => setForm({ ...form, producto_precio_unitario: Number(e.target.value) })}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Stock Actual</Form.Label>
                        <Form.Control
                            type="number"
                            value={form.producto_stock_actual}
                            onChange={(e) => setForm({ ...form, producto_stock_actual: Number(e.target.value) })}
                            disabled={!!editingId} // Si edita, que use movimientos de inventario idealmente, o lo permita. Aquí lo deshabilitamos para forzar el uso de movimientos si ya existe.
                        />
                         {editingId && <Form.Text className="text-muted">Use Movimientos para ajustar stock.</Form.Text>}
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Stock Mínimo (Alerta)</Form.Label>
                        <Form.Control
                            type="number"
                            value={form.producto_stock_minimo}
                            onChange={(e) => setForm({ ...form, producto_stock_minimo: Number(e.target.value) })}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tarifa de IVA</Form.Label>
                  <Form.Select
                    value={form.iva_id}
                    onChange={(e) => setForm({ ...form, iva_id: e.target.value })}
                  >
                    <option value="">No Asignado</option>
                    {ivas.map(iva => (
                      <option key={iva.iva_id} value={iva.iva_id}>
                        {iva.iva_descripcion} ({iva.iva_porcentaje}%)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={form.producto_estado}
                    onChange={(e) => setForm({ ...form, producto_estado: e.target.value })}
                  >
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
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
