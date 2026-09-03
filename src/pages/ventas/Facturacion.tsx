import { useEffect, useState, useCallback } from "react";
import { Row, Col, Form, Button, Spinner, Badge, Table, Alert, Modal, Card, Tabs, Tab } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch, faPlus, faTrash, faReceipt, faUser,
  faBox, faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { getProductos } from "../../api/inventarioService";
import { createFactura, anularFactura, getFacturas } from "../../api/facturacionService";
import { getConfiguracionesIva } from "../../api/ventas/configuracionIvaService";
import { useAuth } from "../../context/useAuth";
import type { Producto } from "../../types/inventario";
import type {
  Factura,
  DetalleInput,
  MetodoPago,
  ConfiguracionIva
} from "../../types/facturacion";
import { getPacientesCompletos } from "../../api/citas/pacienteCompletoService";
import { mostrarExito, mostrarError } from "../../lib/alerts";
import type { Persona } from "../../types/usuarios/Persona";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number | string) =>
  Number(n).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Insensible a acentos/mayúsculas para búsquedas por nombre o cédula
const normalizarTexto = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const METODOS: MetodoPago[] = ["Efectivo", "Tarjeta", "Transferencia"];

interface ItemCarrito extends DetalleInput {
  _key: number; // key única para React
}

export default function Facturacion() {
  const { hasRole } = useAuth();
  const canEmit = hasRole("Recepcionista");

  // ─── Estado cliente ──────────────────────────────────────────────────────
  const [busquedaCedula, setBusquedaCedula] = useState("");
  const [cliente, setCliente] = useState<Persona | null>(null);
  const [errCliente, setErrCliente] = useState("");

  // ─── Estado carrito ──────────────────────────────────────────────────────
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [notas, setNotas] = useState("");
  const [emitiendo, setEmitiendo] = useState(false);

  // ─── Estado para agregar item ────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([]);
  const [configuracionesIva, setConfiguracionesIva] = useState<ConfiguracionIva[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tipoItem, setTipoItem] = useState<"producto" | "libre">("producto");
  const [productoSelId, setProductoSelId] = useState<number | "">("");
  const [conceptoLibre, setConceptoLibre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precioUnit, setPrecioUnit] = useState(0);
  const [tarifaSel, setTarifaSel] = useState<number>(0);

  // ─── Historial reciente ──────────────────────────────────────────────────
  const [historial, setHistorial] = useState<Factura[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [facturaDetalle, setFacturaDetalle] = useState<Factura | null>(null);
  
  // ─── Clientes (pacientes registrados) para búsqueda y autocomplete ──────
  const [clientes, setClientes] = useState<Persona[]>([]);

  const [_key, setKey] = useState(0); // para reset de carrito

  // Cargar productos, clientes e historial al montar
  useEffect(() => {
    getProductos().then(setProductos).catch(() => {});
    getConfiguracionesIva(true).then((ivas) => {
      setConfiguracionesIva(ivas);
      if (ivas.length > 0) setTarifaSel(Number(ivas[0].iva_porcentaje));
    }).catch(() => {});
    cargarHistorial();
    getPacientesCompletos()
      .then((pacientes) =>
        setClientes(
          pacientes
            .map((p) => p.perfil?.usuario?.persona)
            .filter((persona): persona is Persona => Boolean(persona))
        )
      )
      .catch(() => console.error("No se pudo cargar la lista de clientes"));
  }, []);

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const data = await getFacturas();
      setHistorial(data.slice(0, 15)); // últimas 15
    } catch {
      // silencioso
    } finally {
      setCargandoHistorial(false);
    }
  };

  // ─── Buscar cliente (por cédula o nombre, insensible a acentos) ──────────
  const buscarCliente = () => {
    const tokens = normalizarTexto(busquedaCedula).split(/[^a-z0-9]+/).filter(Boolean);
    if (tokens.length === 0) return;
    setErrCliente("");
    setCliente(null);

    if (clientes.length === 0) {
      setErrCliente("No hay clientes cargados. Verifica que la API esté disponible.");
      return;
    }

    const found = clientes.find((p) => {
      const haystack = normalizarTexto(
        [
          p.persona_cedula,
          p.persona_primer_nombre,
          p.persona_segundo_nombre ?? "",
          p.persona_primer_apellido,
          p.persona_segundo_apellido ?? "",
        ].join(" ")
      );
      return tokens.every((t) => haystack.includes(t));
    });

    if (found) {
      setCliente(found);
    } else {
      setErrCliente(`No se encontró ningún cliente con "${busquedaCedula}"`);
    }
  };

  // ─── Cálculos del carrito ────────────────────────────────────────────────
  const calcTotales = useCallback(() => {
    const subtotalesPorTarifa: Record<number, number> = {};
    const ivasPorTarifa: Record<number, number> = {};
    let total = 0;
    
    carrito.forEach((i) => {
      const sub = i.detalle_cantidad * i.detalle_precio_unit;
      const iv = sub * (i.detalle_tarifa_iva / 100);
      
      subtotalesPorTarifa[i.detalle_tarifa_iva] = (subtotalesPorTarifa[i.detalle_tarifa_iva] || 0) + sub;
      ivasPorTarifa[i.detalle_tarifa_iva] = (ivasPorTarifa[i.detalle_tarifa_iva] || 0) + iv;
      total += sub + iv;
    });

    return { subtotalesPorTarifa, ivasPorTarifa, total };
  }, [carrito]);

  const totales = calcTotales();

  // ─── Agregar item al carrito ─────────────────────────────────────────────
  const abrirModal = () => {
    setTipoItem("producto");
    setProductoSelId("");
    setConceptoLibre("");
    setCantidad(1);
    setPrecioUnit(0);
    if (configuracionesIva.length > 0) setTarifaSel(Number(configuracionesIva[0].iva_porcentaje));
    setShowAddModal(true);
  };

  const confirmarItem = () => {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      mostrarError("La cantidad debe ser mayor que cero.");
      return;
    }

    if (tipoItem === "producto") {
      if (!productoSelId) return;
      const prod = productos.find((p) => p.producto_id === Number(productoSelId));
      if (!prod) return;
      
      const tarifaAplicable = prod.configuracion_iva ? Number(prod.configuracion_iva.iva_porcentaje) : 0;

      setCarrito((prev) => [
        ...prev,
        {
          _key: Date.now(),
          producto_id: prod.producto_id,
          detalle_concepto: prod.producto_nombre,
          detalle_cantidad: cantidad,
          detalle_precio_unit: Number(prod.producto_precio_unitario),
          detalle_tarifa_iva: tarifaAplicable as any,
        },
      ]);
    } else {
      if (!conceptoLibre.trim() || precioUnit <= 0) return;
      setCarrito((prev) => [
        ...prev,
        {
          _key: Date.now(),
          producto_id: null,
          detalle_concepto: conceptoLibre.trim(),
          detalle_cantidad: cantidad,
          detalle_precio_unit: precioUnit,
          detalle_tarifa_iva: tarifaSel as any,
        },
      ]);
    }
    setShowAddModal(false);
  };

  const eliminarItem = (key: number) => {
    setCarrito((prev) => prev.filter((i) => i._key !== key));
  };

  const actualizarCantidad = (key: number, val: number) => {
    if (val < 1) return;
    setCarrito((prev) => prev.map((i) => (i._key === key ? { ...i, detalle_cantidad: val } : i)));
  };

  // ─── Emitir factura ──────────────────────────────────────────────────────
  const emitirFactura = async () => {
    if (!cliente) { mostrarError("Selecciona un cliente primero"); return; }
    if (carrito.length === 0) { mostrarError("El carrito está vacío"); return; }
    setEmitiendo(true);
    try {
      const payload = {
        cliente_id: cliente.persona_id,
        metodo_pago: metodo,
        factura_notas: notas || undefined,
        detalles: carrito.map(({ _key: _, ...rest }) => rest),
      };
      const nuevaFactura = await createFactura(payload);
      mostrarExito(`✅ Factura ${nuevaFactura.factura_numero} emitida correctamente`);
      // Reset
      setCarrito([]);
      setCliente(null);
      setBusquedaCedula("");
      setNotas("");
      setKey((k) => k + 1);
      cargarHistorial();
    } catch (err: any) {
      mostrarError(err?.response?.data?.message ?? "Error al emitir factura");
    } finally {
      setEmitiendo(false);
    }
  };

  // ─── Anular factura ──────────────────────────────────────────────────────
  const handleAnular = async (f: Factura) => {
    if (!window.confirm(`¿Anular la factura ${f.factura_numero}? Se revertirá el stock.`)) return;
    try {
      await anularFactura(f.factura_id);
      mostrarExito("Factura anulada y stock revertido");
      cargarHistorial();
    } catch (err: any) {
      mostrarError(err?.response?.data?.message ?? "Error al anular");
    }
  };

  // ─── Seleccionar producto en modal cambia precio automático ─────────────
  const onProductoChange = (id: number | "") => {
    setProductoSelId(id);
    if (id) {
      const p = productos.find((x) => x.producto_id === Number(id));
      if (p) {
        setPrecioUnit(Number(p.producto_precio_unitario));
        // Solo sobreescribe si el producto tiene tarifa explícita asignada;
        // si no, se conserva la tarifa general activa por defecto
        if (p.configuracion_iva) {
          setTarifaSel(Number(p.configuracion_iva.iva_porcentaje));
        }
      }
    }
  };

  return (
    <div className="container-fluid pt-3">
      <div className="mb-4">
        <h2>Facturación</h2>
        <p className="text-muted">Emite recibos y consulta el historial de comprobantes.</p>
      </div>

      <Tabs defaultActiveKey={canEmit ? "pos" : "history"} className="mb-4">
        
        {/* PESTAÑA PUNTO DE VENTA - Solo visible para Recepcionista */}
        {canEmit && (
        <Tab eventKey="pos" title="Punto de Venta">
          {canEmit && (
            <Row className="g-4">
              <Col lg={4}>
                {/* Cliente */}
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <Card.Title className="d-flex align-items-center mb-3">
                      <FontAwesomeIcon icon={faUser} className="text-primary me-2" />
                      Cliente
                    </Card.Title>
                    {!cliente ? (
                      <>
                        <div className="d-flex gap-2">
                          <Form.Control
                            list="lista-pacientes"
                            placeholder="Buscar por cédula o nombre..."
                            value={busquedaCedula}
                            onChange={(e) => setBusquedaCedula(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
                            autoComplete="off"
                          />
                          <datalist id="lista-pacientes">
                            {clientes.map((c) => (
                              <option
                                key={c.persona_id}
                                value={`${[
                                  c.persona_primer_nombre,
                                  c.persona_segundo_nombre,
                                  c.persona_primer_apellido,
                                  c.persona_segundo_apellido,
                                ]
                                  .filter(Boolean)
                                  .join(" ")} — ${c.persona_cedula}`}
                              />
                            ))}
                          </datalist>
                          <Button variant="primary" onClick={buscarCliente}>
                            <FontAwesomeIcon icon={faSearch} />
                          </Button>
                        </div>
                        {errCliente && <Alert variant="warning" className="mt-3 py-2">{errCliente}</Alert>}
                      </>
                    ) : (
                      <div className="p-3 bg-light border rounded position-relative">
                        <h5 className="text-primary mb-1">
                          {cliente.persona_primer_nombre} {cliente.persona_primer_apellido}
                        </h5>
                        <p className="mb-2 text-muted small">
                          <strong>CI:</strong> {cliente.persona_cedula} <br/>
                          <strong>Correo:</strong> {cliente.persona_correo || 'N/A'}
                        </p>
                        <Button variant="outline-secondary" size="sm" onClick={() => { setCliente(null); setBusquedaCedula(""); }}>
                          Cambiar Cliente
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Resumen / Totales */}
                <Card className="shadow-sm">
                  <Card.Body>
                    <Card.Title className="d-flex align-items-center mb-3">
                      <FontAwesomeIcon icon={faReceipt} className="text-success me-2" />
                      Resumen
                    </Card.Title>
                    
                    <div className="border-bottom pb-3 mb-3">
                      {Object.keys(totales.subtotalesPorTarifa).map(tar => (
                        totales.subtotalesPorTarifa[Number(tar)] > 0 && (
                          <div key={`sub-${tar}`} className="d-flex justify-content-between mb-1 text-muted small">
                            <span>Subtotal {tar}%</span>
                            <span>${fmt(totales.subtotalesPorTarifa[Number(tar)])}</span>
                          </div>
                        )
                      ))}
                      {Object.keys(totales.ivasPorTarifa).map(tar => (
                        totales.ivasPorTarifa[Number(tar)] > 0 && (
                          <div key={`iva-${tar}`} className="d-flex justify-content-between mb-1 text-info fw-bold small">
                            <span>IVA {tar}%</span>
                            <span>${fmt(totales.ivasPorTarifa[Number(tar)])}</span>
                          </div>
                        )
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="m-0 text-muted">Total</h5>
                      <h3 className="m-0 text-primary">${fmt(totales.total)}</h3>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted mb-1">Método de Pago</Form.Label>
                      <Form.Select size="sm" value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPago)}>
                        {METODOS.map((m) => <option key={m}>{m}</option>)}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted mb-1">Notas (Opcional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        placeholder="Ej. Abono, observaciones..."
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      className="w-100 py-2"
                      disabled={emitiendo || carrito.length === 0 || !cliente}
                      onClick={emitirFactura}
                    >
                      {emitiendo ? (
                        <><Spinner size="sm" className="me-2" /> Emitiendo...</>
                      ) : (
                        <><FontAwesomeIcon icon={faReceipt} className="me-2" /> Emitir Factura</>
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                {/* Artículos en carrito */}
                <Card className="shadow-sm h-100">
                  <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="m-0">
                      <FontAwesomeIcon icon={faBox} className="text-secondary me-2" />
                      Artículos
                    </h5>
                    <Button variant="success" size="sm" onClick={abrirModal}>
                      <FontAwesomeIcon icon={faPlus} className="me-1" /> Añadir
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {carrito.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        El carrito está vacío. Empieza añadiendo artículos.
                      </div>
                    ) : (
                      <Table responsive hover className="m-0 align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th className="px-3 border-0">Concepto</th>
                            <th className="text-center border-0" style={{ width: '100px' }}>Cant.</th>
                            <th className="text-end border-0">Precio</th>
                            <th className="text-center border-0">IVA</th>
                            <th className="text-end border-0">Subtotal</th>
                            <th className="border-0"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {carrito.map((item) => {
                            const sub = item.detalle_cantidad * item.detalle_precio_unit;
                            return (
                              <tr key={item._key}>
                                <td className="px-3 fw-medium text-dark">{item.detalle_concepto}</td>
                                <td className="text-center">
                                  <Form.Control
                                    type="number"
                                    min={1}
                                    value={item.detalle_cantidad}
                                    onChange={(e) => actualizarCantidad(item._key, Number(e.target.value))}
                                    size="sm"
                                  />
                                </td>
                                <td className="text-end text-muted">${fmt(item.detalle_precio_unit)}</td>
                                <td className="text-center">
                                  <Badge bg="secondary">{item.detalle_tarifa_iva}%</Badge>
                                </td>
                                <td className="text-end fw-bold">${fmt(sub)}</td>
                                <td className="text-center">
                                  <Button variant="link" className="text-danger p-0 m-0" onClick={() => eliminarItem(item._key)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>
        )}

        {/* PESTAÑA HISTORIAL */}
        <Tab eventKey="history" title="Últimas Facturas">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0"><FontAwesomeIcon icon={faReceipt} className="me-2 text-primary"/> Historial de Emisión</h5>
                <Button variant="outline-secondary" size="sm" onClick={cargarHistorial} disabled={cargandoHistorial}>
                  Actualizar
                </Button>
              </div>

              {cargandoHistorial ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : historial.length === 0 ? (
                <div className="text-center py-5 text-muted">No se han emitido facturas.</div>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Factura</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Método</th>
                      <th className="text-end">Total</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((f) => (
                      <tr 
                        key={f.factura_id} 
                        onClick={() => setFacturaDetalle(f)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="fw-bold">{f.factura_numero}</td>
                        <td>{f.cliente?.persona_primer_nombre} {f.cliente?.persona_primer_apellido}</td>
                        <td className="text-muted">{new Date(f.factura_fecha).toLocaleDateString("es-EC")}</td>
                        <td className="text-muted">{f.metodo_pago}</td>
                        <td className="text-end fw-bold text-primary">${fmt(f.total)}</td>
                        <td className="text-center">
                          <Badge bg={f.factura_estado === "A" ? "success" : "secondary"}>
                            {f.factura_estado === "A" ? "Activa" : "Anulada"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* ── Modal: agregar ítem ── */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Ítem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-2 mb-4">
            <Button
              variant={tipoItem === "producto" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setTipoItem("producto")}
            >
              <FontAwesomeIcon icon={faBox} className="me-1" /> Producto
            </Button>
            <Button
              variant={tipoItem === "libre" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setTipoItem("libre")}
            >
              <FontAwesomeIcon icon={faPenToSquare} className="me-1" /> Concepto Libre
            </Button>
          </div>

          {tipoItem === "producto" ? (
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Select
                value={productoSelId}
                onChange={(e) => onProductoChange(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">— Selecciona un producto —</option>
                {productos
                  .filter((p) => p.producto_estado === "A" && p.producto_stock_actual > 0)
                  .map((p) => (
                    <option key={p.producto_id} value={p.producto_id}>
                      {p.producto_nombre} (Stock: {p.producto_stock_actual})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Descripción del Concepto</Form.Label>
              <Form.Control
                placeholder="Ej. Consulta optométrica..."
                value={conceptoLibre}
                onChange={(e) => setConceptoLibre(e.target.value)}
              />
            </Form.Group>
          )}

          <Row className="g-2">
            <Col>
              <Form.Group>
                <Form.Label>Precio Unitario</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step={0.01}
                  value={precioUnit}
                  onChange={(e) => setPrecioUnit(Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>

          {tipoItem === "libre" ? (
            <Form.Group className="mt-3">
              <Form.Label>Tarifa IVA</Form.Label>
              <Form.Select
                value={tarifaSel}
                onChange={(e) => setTarifaSel(Number(e.target.value))}
              >
                {configuracionesIva.map((c) => (
                  <option key={c.iva_id} value={c.iva_porcentaje}>
                    {c.iva_descripcion} ({c.iva_porcentaje}%)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          ) : (
            <Form.Group className="mt-3">
              <Form.Label>Tarifa IVA (definida por el producto)</Form.Label>
              <p className="form-control-plaintext mb-0">
                <Badge bg="secondary">IVA {tarifaSel}%</Badge>
              </p>
            </Form.Group>
          )}

          {/* Preview */}
          {(precioUnit > 0 && cantidad > 0) && (
            <div className="mt-4 p-3 bg-light border rounded">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Subtotal:</span>
                <span>${fmt(precioUnit * cantidad)}</span>
              </div>
              <div className="d-flex justify-content-between small text-info mb-2">
                <span>IVA {tarifaSel}%:</span>
                <span>${fmt(precioUnit * cantidad * (tarifaSel / 100))}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold pt-2 border-top">
                <span>Total ítem:</span>
                <span className="text-primary">${fmt(precioUnit * cantidad * (1 + tarifaSel / 100))}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={confirmarItem}
            disabled={
              tipoItem === "producto"
                ? !productoSelId
                : !conceptoLibre.trim() || precioUnit <= 0
            }
          >
            Añadir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: detalle de factura ── */}
      <Modal show={!!facturaDetalle} onHide={() => setFacturaDetalle(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faReceipt} className="me-2 text-primary" />
            {facturaDetalle?.factura_numero}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {facturaDetalle && (
            <>
              <Row className="mb-4">
                <Col>
                  <div className="text-muted small text-uppercase">Cliente</div>
                  <div className="fw-bold">
                    {facturaDetalle.cliente?.persona_primer_nombre} {facturaDetalle.cliente?.persona_primer_apellido}
                  </div>
                  <div className="text-muted small">{facturaDetalle.cliente?.persona_cedula}</div>
                </Col>
                <Col className="text-end">
                  <div className="text-muted small text-uppercase">Fecha</div>
                  <div className="fw-bold mb-1">{new Date(facturaDetalle.factura_fecha).toLocaleString("es-EC")}</div>
                  <Badge bg={facturaDetalle.factura_estado === "A" ? "success" : "secondary"}>
                    {facturaDetalle.factura_estado === "A" ? "Vigente" : "Anulada"}
                  </Badge>
                </Col>
              </Row>
              <Table bordered size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Concepto</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-end">P. Unit</th>
                    <th className="text-center">IVA</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaDetalle.detalles?.map((d) => (
                    <tr key={d.detalle_id}>
                      <td>{d.detalle_concepto}</td>
                      <td className="text-center">{d.detalle_cantidad}</td>
                      <td className="text-end">${fmt(d.detalle_precio_unit)}</td>
                      <td className="text-center"><Badge bg="secondary">{d.detalle_tarifa_iva}%</Badge></td>
                      <td className="text-end fw-bold">${fmt(d.detalle_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="d-flex flex-column align-items-end mt-3 border-top pt-3">
                {Number(facturaDetalle.iva_5)  > 0 && <div className="text-muted small mb-1">IVA 5%: <strong className="text-dark">${fmt(facturaDetalle.iva_5)}</strong></div>}
                {Number(facturaDetalle.iva_8)  > 0 && <div className="text-muted small mb-1">IVA 8%: <strong className="text-dark">${fmt(facturaDetalle.iva_8)}</strong></div>}
                {Number(facturaDetalle.iva_15) > 0 && <div className="text-muted small mb-1">IVA 15%: <strong className="text-dark">${fmt(facturaDetalle.iva_15)}</strong></div>}
                <div className="fs-5 fw-bold text-primary mt-2">TOTAL: ${fmt(facturaDetalle.total)}</div>
              </div>

              {facturaDetalle.factura_notas && (
                <Alert variant="info" className="mt-4 mb-0 py-2">
                  <strong>Notas:</strong> {facturaDetalle.factura_notas}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {canEmit && facturaDetalle?.factura_estado === "A" && (
            <Button variant="danger" onClick={() => { handleAnular(facturaDetalle!); setFacturaDetalle(null); }}>
              Anular Factura
            </Button>
          )}
          <Button variant="secondary" onClick={() => setFacturaDetalle(null)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
