import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Tab, Table, Tabs } from "react-bootstrap";
import {
  createCompra,
  createProveedor,
  getCompras,
  getProveedores,
  getReporte,
  type Compra,
  type Proveedor,
} from "../../api/comprasService";
import { getProductos } from "../../api/inventarioService";
import type { Producto } from "../../types/inventario";
import { mostrarError, mostrarExito } from "../../lib/alerts";
import { SymbolIcon } from "../../components/SymbolIcon";

const formatMoney = (val: number | string | undefined | null) => {
  const n = Number(val) || 0;
  return `$${n.toFixed(2)}`;
};

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-EC", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const getFirstDayOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const getToday = () => new Date().toISOString().slice(0, 10);

export default function ComprasReportesPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [reporte, setReporte] = useState<any>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  // Formulario de compras
  const [proveedorId, setProveedorId] = useState("");
  const [numero, setNumero] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState(0);

  // Formulario nuevo proveedor
  const [ruc, setRuc] = useState("");
  const [nombre, setNombre] = useState("");

  // Filtros de reportes
  const [tipoReporte, setTipoReporte] = useState("ventas");
  const [fechaDesde, setFechaDesde] = useState(getFirstDayOfMonth());
  const [fechaHasta, setFechaHasta] = useState(getToday());

  const cargar = async () => {
    try {
      const [p, pr, c] = await Promise.all([getProveedores(), getProductos(), getCompras()]);
      setProveedores(p);
      setProductos(pr);
      setCompras(c);
    } catch {
      mostrarError("No se pudieron cargar compras e inventario.");
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const proveedor = async () => {
    try {
      await createProveedor({ proveedor_ruc: ruc, proveedor_nombre: nombre });
      setRuc("");
      setNombre("");
      await cargar();
      mostrarExito("Proveedor creado con éxito.");
    } catch {
      mostrarError("No se pudo crear el proveedor.");
    }
  };

  const compra = async () => {
    try {
      if (!proveedorId || !numero || !productoId || cantidad <= 0 || precio <= 0) {
        mostrarError("Por favor completa todos los campos de la compra con valores válidos.");
        return;
      }
      await createCompra({
        proveedor_id: Number(proveedorId),
        compra_numero: numero,
        detalles: [
          {
            producto_id: Number(productoId),
            cantidad,
            precio_unitario: precio,
          },
        ],
      });
      setNumero("");
      setCantidad(1);
      setPrecio(0);
      await cargar();
      mostrarExito("Compra registrada y stock actualizado en inventario.");
    } catch {
      mostrarError("No se pudo registrar la compra.");
    }
  };

  const cargarReporte = async () => {
    try {
      setLoadingReporte(true);
      const params: Record<string, string> = {};
      if (tipoReporte !== "inventario") {
        if (fechaDesde) params.desde = fechaDesde;
        if (fechaHasta) params.hasta = fechaHasta;
      }
      const data = await getReporte(tipoReporte, params);
      setReporte(data);
    } catch {
      mostrarError("No se pudo cargar el reporte solicitado.");
    } finally {
      setLoadingReporte(false);
    }
  };

  // Cargar reporte automáticamente al cambiar de tipo
  useEffect(() => {
    void cargarReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoReporte]);

  return (
    <div className="container-fluid pt-3 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-outline-variant">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Gestión de Compras y Reportes Clínicos</h2>
          <p className="text-sm text-on-surface-variant">
            Administración de adquisiciones a proveedores y reportes consolidados del sistema.
          </p>
        </div>
      </div>

      <Tabs defaultActiveKey="compras" className="mb-4">
        {/* PESTAÑA 1: REGISTRAR COMPRAS */}
        <Tab eventKey="compras" title="Registrar Compras a Proveedores">
          <Row className="g-4">
            <Col lg={8}>
              <Card className="shadow-sm border-outline-variant">
                <Card.Header className="bg-surface-container font-bold text-on-surface flex items-center gap-2">
                  <SymbolIcon name="shopping_cart" /> Nueva Orden de Compra
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label className="font-semibold text-xs text-on-surface">Proveedor</Form.Label>
                      <Form.Select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
                        <option value="">Seleccione proveedor...</option>
                        {proveedores.map((p) => (
                          <option key={p.proveedor_id} value={p.proveedor_id}>
                            {p.proveedor_nombre} (RUC: {p.proveedor_ruc})
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="font-semibold text-xs text-on-surface">Número de Factura / Compra</Form.Label>
                      <Form.Control
                        placeholder="Ej: COMP-00123"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="font-semibold text-xs text-on-surface">Producto a Ingresar</Form.Label>
                      <Form.Select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
                        <option value="">Seleccione producto...</option>
                        {productos.map((p) => (
                          <option key={p.producto_id} value={p.producto_id}>
                            {p.producto_nombre} (Stock actual: {p.producto_stock_actual})
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Label className="font-semibold text-xs text-on-surface">Cantidad</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="font-semibold text-xs text-on-surface">Costo Unitario ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={precio}
                        onChange={(e) => setPrecio(Number(e.target.value))}
                      />
                    </Col>
                  </Row>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-bold text-on-surface">
                      Total Estimado: <span className="text-primary text-base">{formatMoney(cantidad * precio)}</span>
                    </span>
                    <Button variant="primary" onClick={compra} className="font-bold flex items-center gap-2">
                      <SymbolIcon name="add_shopping_cart" /> Registrar Compra e Ingresar a Stock
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm border-outline-variant">
                <Card.Header className="bg-surface-container font-bold text-on-surface flex items-center gap-2">
                  <SymbolIcon name="domain" /> Registrar Proveedor
                </Card.Header>
                <Card.Body className="space-y-3">
                  <div>
                    <Form.Label className="font-semibold text-xs text-on-surface">RUC / Identificación</Form.Label>
                    <Form.Control
                      placeholder="1790000000001"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value)}
                    />
                  </div>
                  <div>
                    <Form.Label className="font-semibold text-xs text-on-surface">Razón Social / Nombre</Form.Label>
                    <Form.Control
                      placeholder="Óptica Distribuciones S.A."
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                  <Button variant="outline-primary" className="w-full mt-2 font-bold" onClick={proveedor}>
                    Guardar Proveedor
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mt-4 shadow-sm border-outline-variant">
            <Card.Header className="bg-surface-container font-bold text-on-surface flex items-center justify-between">
              <span>Historial de Compras Registradas</span>
              <span className="text-xs text-outline font-normal">Total: {compras.length} compras</span>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle text-sm">
                <thead className="table-light">
                  <tr>
                    <th>N° Compra</th>
                    <th>Proveedor</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-outline">
                        No hay compras registradas en el sistema.
                      </td>
                    </tr>
                  ) : (
                    compras.map((c) => (
                      <tr key={c.compra_id}>
                        <td className="font-bold">{c.compra_numero}</td>
                        <td>{c.proveedor?.proveedor_nombre || "Proveedor General"}</td>
                        <td>{formatDate(c.compra_fecha)}</td>
                        <td>
                          <Badge bg="secondary">Efectivo / Transferencia</Badge>
                        </td>
                        <td className="text-end font-bold text-emerald-700 dark:text-emerald-400">
                          {formatMoney(c.compra_total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* PESTAÑA 2: REPORTES FORMALES */}
        <Tab eventKey="reportes" title="Reportes del Sistema">
          <Card className="shadow-sm border-outline-variant mb-4">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Label className="font-bold text-xs text-on-surface">Tipo de Reporte</Form.Label>
                  <Form.Select
                    value={tipoReporte}
                    onChange={(e) => setTipoReporte(e.target.value)}
                    className="font-medium"
                  >
                    <option value="ventas">📊 Reporte de Ventas</option>
                    <option value="compras">📦 Reporte de Compras a Proveedores</option>
                    <option value="inventario">📋 Reporte de Inventario y Stock</option>
                    <option value="citas">📅 Reporte de Citas Agendadas</option>
                    <option value="citas-estado">🔄 Reporte de Citas por Estado (Atendidas, Canceladas, etc.)</option>
                    <option value="atenciones-medico">👨‍⚕️ Reporte de Atenciones por Médico</option>
                  </Form.Select>
                </Col>

                {tipoReporte !== "inventario" && (
                  <>
                    <Col md={3}>
                      <Form.Label className="font-bold text-xs text-on-surface">Fecha Desde</Form.Label>
                      <Form.Control
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="font-bold text-xs text-on-surface">Fecha Hasta</Form.Label>
                      <Form.Control
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                      />
                    </Col>
                  </>
                )}

                <Col md={tipoReporte === "inventario" ? 8 : 2} className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={cargarReporte}
                    disabled={loadingReporte}
                    className="w-full font-bold flex items-center justify-center gap-2"
                  >
                    <SymbolIcon name="refresh" />
                    {loadingReporte ? "Cargando..." : "Actualizar"}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* VISTAS DE REPORTES FORMATEADOS */}
          {loadingReporte ? (
            <div className="p-8 text-center text-outline">
              <span className="spinner-border spinner-border-sm me-2" />
              Generando reporte consolidado...
            </div>
          ) : !reporte ? (
            <Alert variant="info">Haz clic en &quot;Actualizar&quot; para generar el reporte.</Alert>
          ) : (
            <div className="space-y-4">
              {/* REPORTE 1: VENTAS */}
              {tipoReporte === "ventas" && (
                <div>
                  <Row className="g-3 mb-4">
                    <Col sm={6} lg={4}>
                      <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400 block">
                            Total Ventas Facturadas
                          </span>
                          <span className="text-3xl font-black text-emerald-900 dark:text-emerald-200 mt-1 block">
                            {formatMoney(reporte.total)}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} lg={4}>
                      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                            Cantidad de Transacciones
                          </span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                            {reporte.cantidad || 0}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="shadow-sm border-outline-variant">
                    <Card.Header className="font-bold bg-surface-container flex justify-between items-center">
                      <span>Detalle de Facturas de Venta</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => window.print()}>
                        <SymbolIcon name="print" /> Imprimir
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table responsive hover className="mb-0 align-middle text-sm">
                        <thead className="table-light">
                          <tr>
                            <th>N° Factura</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Cédula</th>
                            <th>Método de Pago</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.datos?.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-4 text-outline">
                                No se encontraron ventas en el rango seleccionado.
                              </td>
                            </tr>
                          ) : (
                            reporte.datos?.map((v: any) => (
                              <tr key={v.factura_id || v.factura_numero}>
                                <td className="font-bold">{v.factura_numero}</td>
                                <td>{formatDate(v.factura_fecha)}</td>
                                <td>
                                  {v.cliente
                                    ? `${v.cliente.persona_primer_nombre || ""} ${v.cliente.persona_primer_apellido || ""}`.trim()
                                    : "Consumidor Final"}
                                </td>
                                <td>{v.cliente?.persona_cedula || "9999999999"}</td>
                                <td>
                                  <Badge bg="info" className="text-dark">
                                    {v.metodo_pago || "Efectivo"}
                                  </Badge>
                                </td>
                                <td className="text-end font-bold text-emerald-700 dark:text-emerald-400">
                                  {formatMoney(v.total)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* REPORTE 2: COMPRAS */}
              {tipoReporte === "compras" && (
                <div>
                  <Row className="g-3 mb-4">
                    <Col sm={6} lg={4}>
                      <Card className="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-indigo-800 dark:text-indigo-400 block">
                            Total Inversión en Compras
                          </span>
                          <span className="text-3xl font-black text-indigo-900 dark:text-indigo-200 mt-1 block">
                            {formatMoney(reporte.total)}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} lg={4}>
                      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                            Total Facturas de Compra
                          </span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                            {reporte.cantidad || 0}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="shadow-sm border-outline-variant">
                    <Card.Header className="font-bold bg-surface-container flex justify-between items-center">
                      <span>Detalle de Compras a Proveedores</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => window.print()}>
                        <SymbolIcon name="print" /> Imprimir
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table responsive hover className="mb-0 align-middle text-sm">
                        <thead className="table-light">
                          <tr>
                            <th>N° Compra</th>
                            <th>Proveedor</th>
                            <th>RUC Proveedor</th>
                            <th>Fecha</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.datos?.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-4 text-outline">
                                No se encontraron compras en el rango seleccionado.
                              </td>
                            </tr>
                          ) : (
                            reporte.datos?.map((c: any) => (
                              <tr key={c.compra_id}>
                                <td className="font-bold">{c.compra_numero}</td>
                                <td>{c.proveedor?.proveedor_nombre}</td>
                                <td>{c.proveedor?.proveedor_ruc || "-"}</td>
                                <td>{formatDate(c.compra_fecha)}</td>
                                <td className="text-end font-bold text-indigo-700 dark:text-indigo-400">
                                  {formatMoney(c.compra_total)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* REPORTE 3: INVENTARIO Y STOCK */}
              {tipoReporte === "inventario" && (
                <div>
                  <Row className="g-3 mb-4">
                    <Col sm={6} lg={4}>
                      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                            Total de Ítems en Catálogo
                          </span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                            {reporte.totalProductos || 0}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} lg={4}>
                      <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-red-800 dark:text-red-400 block">
                            Productos con Stock Crítico
                          </span>
                          <span className="text-3xl font-black text-red-700 dark:text-red-300 mt-1 block">
                            {reporte.totalBajoStock ?? reporte.bajoStock?.length ?? 0}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="shadow-sm border-outline-variant">
                    <Card.Header className="font-bold bg-surface-container flex justify-between items-center">
                      <span>Catálogo de Productos y Estado de Existencias</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => window.print()}>
                        <SymbolIcon name="print" /> Imprimir
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table responsive hover className="mb-0 align-middle text-sm">
                        <thead className="table-light">
                          <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th className="text-center">Stock Actual</th>
                            <th className="text-center">Stock Mínimo</th>
                            <th>Estado</th>
                            <th className="text-end">Precio Venta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.datos?.map((p: any) => {
                            const esCritico = p.producto_stock_actual <= p.producto_stock_minimo;
                            return (
                              <tr key={p.producto_id}>
                                <td className="font-mono text-xs font-bold">{p.producto_codigo}</td>
                                <td className="font-semibold">{p.producto_nombre}</td>
                                <td>{p.categoria?.categoria_nombre || "General"}</td>
                                <td className={`text-center font-bold ${esCritico ? "text-danger" : ""}`}>
                                  {p.producto_stock_actual}
                                </td>
                                <td className="text-center text-muted">{p.producto_stock_minimo}</td>
                                <td>
                                  {esCritico ? (
                                    <Badge bg="danger">Bajo Stock</Badge>
                                  ) : (
                                    <Badge bg="success">Óptimo</Badge>
                                  )}
                                </td>
                                <td className="text-end font-bold">{formatMoney(p.producto_precio)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* REPORTE 4: CITAS AGENDADAS */}
              {tipoReporte === "citas" && (
                <div>
                  <Row className="g-3 mb-4">
                    <Col sm={6} lg={4}>
                      <Card className="bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-sky-800 dark:text-sky-400 block">
                            Total Citas en Periodo
                          </span>
                          <span className="text-3xl font-black text-sky-900 dark:text-sky-200 mt-1 block">
                            {reporte.cantidad || 0}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="shadow-sm border-outline-variant">
                    <Card.Header className="font-bold bg-surface-container flex justify-between items-center">
                      <span>Listado de Citas Agendadas</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => window.print()}>
                        <SymbolIcon name="print" /> Imprimir
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table responsive hover className="mb-0 align-middle text-sm">
                        <thead className="table-light">
                          <tr>
                            <th>N° Cita</th>
                            <th>Fecha</th>
                            <th>Paciente</th>
                            <th>Identificación</th>
                            <th>Médico Asignado</th>
                            <th>Estado</th>
                            <th>Motivo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.datos?.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-4 text-outline">
                                No se encontraron citas en el rango seleccionado.
                              </td>
                            </tr>
                          ) : (
                            reporte.datos?.map((c: any) => {
                              const pac = c.historia_clinica?.perfil?.usuario?.persona;
                              const doc = c.horario_doctor?.doctor?.perfil?.usuario?.persona;
                              return (
                                <tr key={c.cita_id}>
                                  <td className="font-bold">#{c.cita_id}</td>
                                  <td>{formatDate(c.cita_fecha)}</td>
                                  <td>
                                    {pac
                                      ? `${pac.persona_primer_nombre || ""} ${pac.persona_primer_apellido || ""}`.trim()
                                      : "Paciente"}
                                  </td>
                                  <td>{pac?.persona_cedula || "-"}</td>
                                  <td>
                                    {doc
                                      ? `Dr(a). ${doc.persona_primer_nombre} ${doc.persona_primer_apellido}`
                                      : "Médico General"}
                                  </td>
                                  <td>
                                    <Badge bg="primary">{c.estado_cita?.estado_cita_nombre || "Programada"}</Badge>
                                  </td>
                                  <td className="text-truncate max-w-[200px]">{c.cita_motivo || "Consulta visual"}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* REPORTE 5: CITAS POR ESTADO */}
              {tipoReporte === "citas-estado" && (
                <div>
                  <h4 className="text-lg font-bold text-on-surface mb-3">
                    Distribución de Citas por Estado (Total: {reporte.totalCitas || 0})
                  </h4>

                  <Row className="g-3 mb-4">
                    {reporte.resumenPorEstado?.map((est: any) => (
                      <Col key={est.estado} sm={6} lg={3}>
                        <Card className="shadow-sm border" style={{ borderLeft: `5px solid ${est.color}` }}>
                          <Card.Body>
                            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                              {est.estado}
                            </span>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {est.cantidad}
                              </span>
                              <span className="text-xs font-bold text-slate-500">{est.porcentaje}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${est.porcentaje}%`, backgroundColor: est.color }}
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <Card className="shadow-sm border-outline-variant">
                    <Card.Header className="font-bold bg-surface-container flex justify-between items-center">
                      <span>Detalle Cronológico de Citas</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => window.print()}>
                        <SymbolIcon name="print" /> Imprimir
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table responsive hover className="mb-0 align-middle text-sm">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Paciente</th>
                            <th>Médico</th>
                            <th>Estado Actual</th>
                            <th>Motivo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.datos?.map((c: any) => {
                            const pac = c.historia_clinica?.perfil?.usuario?.persona;
                            const doc = c.horario_doctor?.doctor?.perfil?.usuario?.persona;
                            return (
                              <tr key={c.cita_id}>
                                <td className="font-bold">#{c.cita_id}</td>
                                <td>{formatDate(c.cita_fecha)}</td>
                                <td>{pac ? `${pac.persona_primer_nombre} ${pac.persona_primer_apellido}` : "-"}</td>
                                <td>{doc ? `${doc.persona_primer_nombre} ${doc.persona_primer_apellido}` : "-"}</td>
                                <td>
                                  <Badge bg="secondary">{c.estado_cita?.estado_cita_nombre}</Badge>
                                </td>
                                <td>{c.cita_motivo || "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* REPORTE 6: ATENCIONES POR MÉDICO */}
              {tipoReporte === "atenciones-medico" && (
                <div>
                  <Row className="g-3 mb-4">
                    <Col sm={6} lg={4}>
                      <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-purple-800 dark:text-purple-400 block">
                            Total Atenciones Médicas
                          </span>
                          <span className="text-3xl font-black text-purple-900 dark:text-purple-200 mt-1 block">
                            {reporte.totalAtenciones || 0}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} lg={4}>
                      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <Card.Body>
                          <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">
                            Doctores Activos Evaluados
                          </span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                            {reporte.totalDoctores || 0}
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="shadow-sm border-outline-variant">
                    <Card.Header className="font-bold bg-surface-container flex justify-between items-center">
                      <span>Rendimiento y Volumen de Atenciones por Profesional</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => window.print()}>
                        <SymbolIcon name="print" /> Imprimir
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table responsive hover className="mb-0 align-middle text-sm">
                        <thead className="table-light">
                          <tr>
                            <th>Médico / Profesional</th>
                            <th>Cédula</th>
                            <th>Especialidad</th>
                            <th className="text-center">Citas Asignadas</th>
                            <th className="text-center">Citas Atendidas</th>
                            <th className="text-center">Citas Canceladas</th>
                            <th className="text-center">Exámenes Realizados</th>
                            <th className="text-center font-bold text-primary">Total Atenciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.resumen?.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-4 text-outline">
                                No se encontraron registros de médicos.
                              </td>
                            </tr>
                          ) : (
                            reporte.resumen?.map((m: any) => (
                              <tr key={m.doctor_id}>
                                <td className="font-bold text-slate-900 dark:text-white">{m.nombre}</td>
                                <td className="font-mono text-xs">{m.cedula}</td>
                                <td>
                                  <Badge bg="secondary">{m.especialidad}</Badge>
                                </td>
                                <td className="text-center">{m.totalCitas}</td>
                                <td className="text-center font-semibold text-emerald-600 dark:text-emerald-400">
                                  {m.atendidas}
                                </td>
                                <td className="text-center font-semibold text-red-600 dark:text-red-400">
                                  {m.canceladas}
                                </td>
                                <td className="text-center font-semibold text-cyan-600 dark:text-cyan-400">
                                  {m.examenesRealizados}
                                </td>
                                <td className="text-center font-black text-primary text-base">
                                  {m.totalAtenciones}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
