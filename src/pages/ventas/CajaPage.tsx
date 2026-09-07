import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { abrirCaja, cerrarCaja, getCajaAbierta, getCajas, type Caja } from "../../api/cajaService";
import { mostrarError, mostrarExito } from "../../lib/alerts";

const n = (v: number | string | null | undefined) => Number(v ?? 0).toFixed(2);

export default function CajaPage() {
  const [abierta, setAbierta] = useState<Caja | null>(null);
  const [historial, setHistorial] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [montoInicial, setMontoInicial] = useState(0);
  const [efectivoContado, setEfectivoContado] = useState(0);
  const [montoVueltos, setMontoVueltos] = useState(0);
  const [montoBanco, setMontoBanco] = useState(0);
  const [observacion, setObservacion] = useState("");
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [actual, todas] = await Promise.all([getCajaAbierta(), getCajas()]);
      setAbierta(actual);
      setHistorial(todas);
    } catch { mostrarError("No se pudo cargar la información de caja."); }
    finally { setLoading(false); }
  };
  // La carga inicial sincroniza el estado con la API al montar la pantalla.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void cargar(); }, []);

  const abrir = async () => {
    try { setSaving(true); await abrirCaja({ monto_inicial: montoInicial, observacion }); mostrarExito("Caja abierta correctamente."); setObservacion(""); await cargar(); }
    catch { mostrarError("No se pudo abrir la caja."); }
    finally { setSaving(false); }
  };
  const cerrar = async () => {
    if (!abierta || !observacion.trim()) { mostrarError("La observación de cierre es obligatoria."); return; }
    try { setSaving(true); await cerrarCaja(abierta.caja_id, { efectivo_contado: efectivoContado, monto_vueltos: montoVueltos, monto_banco: montoBanco, observacion }); mostrarExito("Caja cerrada correctamente."); setObservacion(""); await cargar(); }
    catch { mostrarError("No se pudo cerrar la caja."); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner animation="border" />;
  return <div className="container-fluid pt-3">
    <h2>Cierre y arqueo de caja</h2>
    <Alert variant="info">Registra el efectivo inicial, ventas por método de pago, dinero para vueltos, retiro al banco y diferencias.</Alert>
    {!abierta ? <Card className="mb-4"><Card.Body><Card.Title>Abrir caja</Card.Title><Row><Col md={4}><Form.Label>Monto inicial</Form.Label><Form.Control type="number" min="0" value={montoInicial} onChange={e => setMontoInicial(Number(e.target.value))} /></Col><Col md={8}><Form.Label>Observación</Form.Label><Form.Control value={observacion} onChange={e => setObservacion(e.target.value)} /></Col></Row><Button className="mt-3" onClick={abrir} disabled={saving}>Abrir caja</Button></Card.Body></Card> : <Card className="mb-4"><Card.Body><Card.Title>Caja abierta #{abierta.caja_id}</Card.Title><p>Monto inicial: <strong>${n(abierta.caja_monto_inicial)}</strong></p><Row><Col md={4}><Form.Label>Efectivo contado</Form.Label><Form.Control type="number" min="0" value={efectivoContado} onChange={e => setEfectivoContado(Number(e.target.value))} /></Col><Col md={4}><Form.Label>Dinero para vueltos</Form.Label><Form.Control type="number" min="0" value={montoVueltos} onChange={e => setMontoVueltos(Number(e.target.value))} /></Col><Col md={4}><Form.Label>Retiro al banco</Form.Label><Form.Control type="number" min="0" value={montoBanco} onChange={e => setMontoBanco(Number(e.target.value))} /></Col></Row><Form.Label className="mt-3">Observación obligatoria</Form.Label><Form.Control value={observacion} onChange={e => setObservacion(e.target.value)} /><Button className="mt-3" variant="danger" onClick={cerrar} disabled={saving}>Cerrar y guardar arqueo</Button></Card.Body></Card>}
    <Table striped bordered responsive><thead><tr><th>ID</th><th>Estado</th><th>Apertura</th><th>Ventas</th><th>Efectivo contado</th><th>Diferencia</th><th>Banco</th></tr></thead><tbody>{historial.map(c => <tr key={c.caja_id}><td>{c.caja_id}</td><td>{c.caja_estado}</td><td>{new Date(c.caja_fecha_apertura).toLocaleString()}</td><td>${n(c.caja_total_ventas)}</td><td>${n(c.caja_efectivo_contado)}</td><td>${n(c.caja_diferencia)}</td><td>${n(c.caja_monto_banco)}</td></tr>)}</tbody></Table>
  </div>;
}
