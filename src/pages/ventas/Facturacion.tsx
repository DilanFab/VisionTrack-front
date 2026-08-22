import { useEffect, useState, useCallback } from "react";
import { Row, Col, Form, Button, Spinner, Badge, Table, Alert, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch, faPlus, faTrash, faReceipt, faUser,
  faBox, faPenToSquare, faCheckCircle, faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getProductos } from "../../api/inventarioService";
import { createFactura, anularFactura, getFacturas } from "../../api/facturacionService";
import type { Producto } from "../../types/inventario";
import type {
  Factura,
  DetalleInput,
  TarifaIva,
  MetodoPago,
} from "../../types/facturacion";
import api from "../../api/axios";
import { mostrarExito, mostrarError } from "../../lib/alerts";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number | string) =>
  Number(n).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TARIFAS: TarifaIva[] = [0, 5, 8, 15];
const METODOS: MetodoPago[] = ["Efectivo", "Tarjeta", "Transferencia"];

interface ItemCarrito extends DetalleInput {
  _key: number; // key única para React
}

export default function Facturacion() {
  // ─── Estado cliente ──────────────────────────────────────────────────────
  const [busquedaCedula, setBusquedaCedula] = useState("");
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [cliente, setCliente] = useState<any | null>(null);
  const [errCliente, setErrCliente] = useState("");

  // ─── Estado carrito ──────────────────────────────────────────────────────
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [notas, setNotas] = useState("");
  const [emitiendo, setEmitiendo] = useState(false);

  // ─── Estado para agregar item ────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  // Tipo de ítem: "producto" o "libre"
  const [tipoItem, setTipoItem] = useState<"producto" | "libre">("producto");
  const [productoSelId, setProductoSelId] = useState<number | "">("");
  const [conceptoLibre, setConceptoLibre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precioUnit, setPrecioUnit] = useState(0);
  const [tarifa, setTarifa] = useState<TarifaIva>(15);

  // ─── Historial reciente ──────────────────────────────────────────────────
  const [historial, setHistorial] = useState<Factura[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [facturaDetalle, setFacturaDetalle] = useState<Factura | null>(null);
  
  // ─── Personas para autocomplete ──────────────────────────────────────────
  const [personasBD, setPersonasBD] = useState<any[]>([]);

  const [_key, setKey] = useState(0); // para reset de carrito

  // Cargar productos y historial al montar
  useEffect(() => {
    getProductos().then(setProductos).catch(() => {});
    cargarHistorial();
    api.get(`/api/personas`).then(({ data }) => setPersonasBD(data.data ?? [])).catch(() => {});
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

  // ─── Buscar cliente ──────────────────────────────────────────────────────
  const buscarCliente = async () => {
    if (!busquedaCedula.trim()) return;
    setBuscandoCliente(true);
    setErrCliente("");
    setCliente(null);
    try {
      const search = busquedaCedula.trim().toLowerCase();
      
      const found = personasBD.find((p: any) => 
        p.persona_cedula === search ||
        p.persona_primer_nombre.toLowerCase().includes(search) ||
        p.persona_primer_apellido.toLowerCase().includes(search) ||
        `${p.persona_primer_nombre} ${p.persona_primer_apellido}`.toLowerCase().includes(search)
      );

      if (found) {
        setCliente(found);
      } else {
        // Fallback en caso de que la persona sea nueva y no esté en el estado inicial
        const { data } = await api.get(`/api/personas`);
        const personas: any[] = data.data ?? [];
        const foundApi = personas.find((p: any) => 
          p.persona_cedula === search ||
          p.persona_primer_nombre.toLowerCase().includes(search) ||
          p.persona_primer_apellido.toLowerCase().includes(search) ||
          `${p.persona_primer_nombre} ${p.persona_primer_apellido}`.toLowerCase().includes(search)
        );
        if (foundApi) {
          setCliente(foundApi);
          setPersonasBD(personas);
        } else {
          setErrCliente(`No se encontró ningún cliente con "${busquedaCedula}"`);
        }
      }
    } catch {
      setErrCliente("Error al buscar cliente");
    } finally {
      setBuscandoCliente(false);
    }
  };

  // ─── Cálculos del carrito ────────────────────────────────────────────────
  const calcTotales = useCallback(() => {
    let sub0 = 0, sub5 = 0, sub8 = 0, sub15 = 0;
    let iv5 = 0, iv8 = 0, iv15 = 0;
    carrito.forEach((i) => {
      const sub = i.detalle_cantidad * i.detalle_precio_unit;
      const iv = sub * (i.detalle_tarifa_iva / 100);
      if (i.detalle_tarifa_iva === 0)  sub0  += sub;
      if (i.detalle_tarifa_iva === 5)  { sub5  += sub; iv5  += iv; }
      if (i.detalle_tarifa_iva === 8)  { sub8  += sub; iv8  += iv; }
      if (i.detalle_tarifa_iva === 15) { sub15 += sub; iv15 += iv; }
    });
    return { sub0, sub5, sub8, sub15, iv5, iv8, iv15, total: sub0+sub5+sub8+sub15+iv5+iv8+iv15 };
  }, [carrito]);

  const totales = calcTotales();

  // ─── Agregar item al carrito ─────────────────────────────────────────────
  const abrirModal = () => {
    setTipoItem("producto");
    setProductoSelId("");
    setConceptoLibre("");
    setCantidad(1);
    setPrecioUnit(0);
    setTarifa(15);
    setShowAddModal(true);
  };

  const confirmarItem = () => {
    if (tipoItem === "producto") {
      if (!productoSelId) return;
      const prod = productos.find((p) => p.producto_id === Number(productoSelId));
      if (!prod) return;
      setCarrito((prev) => [
        ...prev,
        {
          _key: Date.now(),
          producto_id: prod.producto_id,
          detalle_concepto: prod.producto_nombre,
          detalle_cantidad: cantidad,
          detalle_precio_unit: Number(prod.producto_precio_unitario),
          detalle_tarifa_iva: tarifa,
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
          detalle_tarifa_iva: tarifa,
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
      if (p) setPrecioUnit(Number(p.producto_precio_unitario));
    }
  };

  return (
    <div className="facturacion-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Punto de Venta</h1>
        <p className="text-on-surface-variant text-sm">Emite recibos internos para ventas y servicios de la óptica</p>
      </div>

      <Row className="g-4">
        {/* ── Panel izquierdo: carrito ── */}
        <Col lg={7}>
          {/* Cliente */}
          <div className="card bg-surface-container rounded-2xl p-5 mb-4 border border-outline-variant">
            <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-primary" /> Cliente
            </h2>
            <div className="flex gap-2">
              <Form.Control
                list="lista-pacientes"
                placeholder="Buscar por cédula o nombres..."
                value={busquedaCedula}
                onChange={(e) => setBusquedaCedula(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
                className="flex-1"
                autoComplete="off"
              />
              <datalist id="lista-pacientes">
                {personasBD.map((p) => (
                  <option key={p.persona_id} value={p.persona_cedula}>
                    {p.persona_primer_nombre} {p.persona_primer_apellido}
                  </option>
                ))}
              </datalist>
              <Button variant="primary" onClick={buscarCliente} disabled={buscandoCliente}>
                {buscandoCliente ? <Spinner size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
              </Button>
            </div>
            {errCliente && <Alert variant="warning" className="mt-2 py-2 text-sm">{errCliente}</Alert>}
            {cliente && (
              <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="font-semibold text-on-surface">
                  {cliente.persona_primer_nombre} {cliente.persona_primer_apellido}
                </p>
                <p className="text-sm text-on-surface-variant">
                  CI: {cliente.persona_cedula} · {cliente.persona_correo}
                </p>
              </div>
            )}
          </div>

          {/* Carrito */}
          <div className="card bg-surface-container rounded-2xl p-5 border border-outline-variant">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-on-surface flex items-center gap-2 m-0">
                <FontAwesomeIcon icon={faBox} className="text-secondary" /> Artículos
              </h2>
              <Button variant="success" size="sm" onClick={abrirModal}>
                <FontAwesomeIcon icon={faPlus} className="me-1" /> Agregar
              </Button>
            </div>

            {carrito.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8 text-sm">
                El carrito está vacío. Agrega productos o conceptos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table size="sm" className="table-borderless align-middle">
                  <thead>
                    <tr className="text-on-surface-variant text-xs uppercase">
                      <th>Concepto</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-end">Precio</th>
                      <th className="text-center">IVA</th>
                      <th className="text-end">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item) => {
                      const sub = item.detalle_cantidad * item.detalle_precio_unit;
                      return (
                        <tr key={item._key}>
                          <td className="text-sm font-medium">{item.detalle_concepto}</td>
                          <td className="text-center">
                            <Form.Control
                              type="number"
                              min={1}
                              value={item.detalle_cantidad}
                              onChange={(e) => actualizarCantidad(item._key, Number(e.target.value))}
                              style={{ width: 60, display: "inline-block" }}
                              size="sm"
                            />
                          </td>
                          <td className="text-end text-sm">${fmt(item.detalle_precio_unit)}</td>
                          <td className="text-center">
                            <Badge bg="secondary">{item.detalle_tarifa_iva}%</Badge>
                          </td>
                          <td className="text-end text-sm font-medium">${fmt(sub)}</td>
                          <td>
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => eliminarItem(item._key)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Totales */}
            {carrito.length > 0 && (
              <div className="mt-4 border-t border-outline-variant pt-3 space-y-1 text-sm">
                {totales.sub0  > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal IVA 0%</span><span>${fmt(totales.sub0)}</span></div>}
                {totales.sub5  > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal IVA 5%</span><span>${fmt(totales.sub5)}</span></div>}
                {totales.sub8  > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal IVA 8%</span><span>${fmt(totales.sub8)}</span></div>}
                {totales.sub15 > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal IVA 15%</span><span>${fmt(totales.sub15)}</span></div>}
                {totales.iv5  > 0 && <div className="flex justify-between text-amber-400"><span>IVA 5%</span><span>${fmt(totales.iv5)}</span></div>}
                {totales.iv8  > 0 && <div className="flex justify-between text-amber-400"><span>IVA 8%</span><span>${fmt(totales.iv8)}</span></div>}
                {totales.iv15 > 0 && <div className="flex justify-between text-amber-400"><span>IVA 15%</span><span>${fmt(totales.iv15)}</span></div>}
                <div className="flex justify-between font-bold text-lg border-t border-outline-variant pt-2 mt-2">
                  <span>TOTAL</span><span className="text-primary">${fmt(totales.total)}</span>
                </div>
              </div>
            )}

            {/* Pie: método pago + notas + botón */}
            <div className="mt-4 space-y-3">
              <Row className="g-2">
                <Col sm={6}>
                  <Form.Label className="text-sm text-on-surface-variant mb-1">Método de Pago</Form.Label>
                  <Form.Select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPago)}>
                    {METODOS.map((m) => <option key={m}>{m}</option>)}
                  </Form.Select>
                </Col>
                <Col sm={6}>
                  <Form.Label className="text-sm text-on-surface-variant mb-1">Notas (opcional)</Form.Label>
                  <Form.Control
                    placeholder="Ej. Abono, observaciones..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </Col>
              </Row>
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                disabled={emitiendo || carrito.length === 0 || !cliente}
                onClick={emitirFactura}
              >
                {emitiendo ? (
                  <><Spinner size="sm" className="me-2" />Emitiendo...</>
                ) : (
                  <><FontAwesomeIcon icon={faReceipt} className="me-2" />Emitir Factura</>
                )}
              </Button>
            </div>
          </div>
        </Col>

        {/* ── Panel derecho: historial reciente ── */}
        <Col lg={5}>
          <div className="card bg-surface-container rounded-2xl p-5 border border-outline-variant">
            <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faReceipt} className="text-primary" /> Últimas Facturas
            </h2>
            {cargandoHistorial ? (
              <div className="text-center py-6"><Spinner /></div>
            ) : historial.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm py-6">No hay facturas aún</p>
            ) : (
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 600 }}>
                {historial.map((f) => (
                  <div
                    key={f.factura_id}
                    className="p-3 rounded-xl border border-outline-variant bg-surface-container-low cursor-pointer hover:border-primary transition-all"
                    onClick={() => setFacturaDetalle(f)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{f.factura_numero}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {f.cliente?.persona_primer_nombre} {f.cliente?.persona_primer_apellido}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(f.factura_fecha).toLocaleDateString("es-EC")} · {f.metodo_pago}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${fmt(f.total)}</p>
                        <Badge bg={f.factura_estado === "A" ? "success" : "secondary"} className="text-xs">
                          {f.factura_estado === "A" ? "Activa" : "Anulada"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* ── Modal: agregar ítem ── */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Ítem al Carrito</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Tipo de ítem */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={tipoItem === "producto" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setTipoItem("producto")}
            >
              <FontAwesomeIcon icon={faBox} className="me-1" /> Producto de Inventario
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
                placeholder="Ej. Consulta optométrica, Reparación de armazón..."
                value={conceptoLibre}
                onChange={(e) => setConceptoLibre(e.target.value)}
              />
            </Form.Group>
          )}

          <Row className="g-2">
            <Col>
              <Form.Group>
                <Form.Label>Precio Unitario ($)</Form.Label>
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

          <Form.Group className="mt-3">
            <Form.Label>Tarifa IVA</Form.Label>
            <Form.Select value={tarifa} onChange={(e) => setTarifa(Number(e.target.value) as TarifaIva)}>
              {TARIFAS.map((t) => (
                <option key={t} value={t}>
                  {t}% {t === 0 ? "(Exento)" : t === 15 ? "(General)" : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Preview */}
          {(precioUnit > 0 && cantidad > 0) && (
            <div className="mt-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>${fmt(precioUnit * cantidad)}</span></div>
              <div className="flex justify-between text-amber-400">
                <span>IVA {tarifa}%:</span>
                <span>${fmt(precioUnit * cantidad * (tarifa / 100))}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-outline-variant pt-1 mt-1">
                <span>Total ítem:</span>
                <span className="text-primary">${fmt(precioUnit * cantidad * (1 + tarifa / 100))}</span>
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
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Añadir al Carrito
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
              <Row className="mb-3">
                <Col>
                  <p className="text-sm text-on-surface-variant">Cliente</p>
                  <p className="font-semibold">
                    {facturaDetalle.cliente?.persona_primer_nombre} {facturaDetalle.cliente?.persona_primer_apellido}
                  </p>
                  <p className="text-sm text-on-surface-variant">{facturaDetalle.cliente?.persona_cedula}</p>
                </Col>
                <Col className="text-end">
                  <p className="text-sm text-on-surface-variant">Fecha</p>
                  <p className="font-semibold">{new Date(facturaDetalle.factura_fecha).toLocaleString("es-EC")}</p>
                  <Badge bg={facturaDetalle.factura_estado === "A" ? "success" : "secondary"}>
                    {facturaDetalle.factura_estado === "A" ? <><FontAwesomeIcon icon={faCheckCircle} className="me-1" />Activa</> : <><FontAwesomeIcon icon={faTimesCircle} className="me-1" />Anulada</>}
                  </Badge>
                </Col>
              </Row>
              <Table bordered size="sm">
                <thead>
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
                      <td className="text-end font-medium">${fmt(d.detalle_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="text-end space-y-1 text-sm">
                {Number(facturaDetalle.iva_5)  > 0 && <p>IVA 5%: <strong>${fmt(facturaDetalle.iva_5)}</strong></p>}
                {Number(facturaDetalle.iva_8)  > 0 && <p>IVA 8%: <strong>${fmt(facturaDetalle.iva_8)}</strong></p>}
                {Number(facturaDetalle.iva_15) > 0 && <p>IVA 15%: <strong>${fmt(facturaDetalle.iva_15)}</strong></p>}
                <p className="text-lg font-bold text-primary">TOTAL: ${fmt(facturaDetalle.total)}</p>
              </div>
              {facturaDetalle.factura_notas && (
                <Alert variant="info" className="mt-3 py-2 text-sm">
                  <strong>Notas:</strong> {facturaDetalle.factura_notas}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {facturaDetalle?.factura_estado === "A" && (
            <Button variant="danger" size="sm" onClick={() => { handleAnular(facturaDetalle!); setFacturaDetalle(null); }}>
              <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Anular Factura
            </Button>
          )}
          <Button variant="secondary" onClick={() => setFacturaDetalle(null)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
