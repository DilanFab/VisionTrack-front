import { useEffect, useMemo, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import { getCitas, createCita, updateCita, deleteCita } from "../../api/citas/citaService";
import { getDoctoresCompletos } from "../../api/medicos/doctorCompletoService";
import { getPacientesCompletos } from "../../api/citas/pacienteCompletoService";
import { getEstadosCita } from "../../api/citas/estadoCitaService";
import { getHorariosPorDoctor } from "../../api/medicos/horarioDoctorService";
import CitaCalendario from "../../components/citas/CitaCalendario";
import type { Cita, CitaPayload } from "../../types/citas/Cita";
import type { Doctor } from "../../types/medicos/Doctor";
import type { Paciente } from "../../types/citas/Paciente";
import type { EstadoCita } from "../../types/citas/EstadoCita";
import type { HorarioDoctor } from "../../types/medicos/HorarioDoctor";
import type { Persona } from "../../types/usuarios/Persona";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";

const initialForm = {
  historia_clinica_id: "",
  horario_doctor_id: "",
  cita_fecha: "",
  cita_motivo: "",
  estado_cita_id: "",
};

const nombreCompleto = (p: Persona) =>
  [p.persona_primer_nombre, p.persona_segundo_nombre, p.persona_primer_apellido, p.persona_segundo_apellido]
    .filter(Boolean)
    .join(" ");

const formatFechaHora = (cita: Cita) => {
  const fecha = new Date(cita.cita_fecha).toLocaleDateString("es-EC", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const inicio = new Date(cita.horario_doctor.horario_doctor_inicio);
  const fin = new Date(cita.horario_doctor.horario_doctor_fin);
  const horaInicio = `${String(inicio.getHours()).padStart(2, "0")}:${String(inicio.getMinutes()).padStart(2, "0")}`;
  const horaFin = `${String(fin.getHours()).padStart(2, "0")}:${String(fin.getMinutes()).padStart(2, "0")}`;
  return `${fecha} ${horaInicio} - ${horaFin}`;
};

export default function Citas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [estadosCita, setEstadosCita] = useState<EstadoCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [pacienteInfo, setPacienteInfo] = useState<{ id: number; label: string } | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<{ id: number; label: string } | null>(null);
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [buscarDoctor, setBuscarDoctor] = useState("");
  const [horariosDoctor, setHorariosDoctor] = useState<HorarioDoctor[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const [citasData, doctoresData, pacientesData, estadosData] = await Promise.all([
        getCitas(),
        getDoctoresCompletos(),
        getPacientesCompletos(),
        getEstadosCita(),
      ]);
      setCitas(citasData);
      setDoctores(doctoresData);
      setPacientes(pacientesData);
      setEstadosCita(estadosData);
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const q = buscarPaciente.trim().toLowerCase();
    if (!q) return [];
    return pacientes
      .filter((p) => {
        if (p.historia_clinica_estado !== "A") return false;
        const persona = p.perfil.usuario.persona;
        return (
          nombreCompleto(persona).toLowerCase().includes(q) ||
          persona.persona_cedula.toLowerCase().includes(q) ||
          p.historia_clinica_numero.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [buscarPaciente, pacientes]);

  const doctoresFiltrados = useMemo(() => {
    const q = buscarDoctor.trim().toLowerCase();
    if (!q) return [];
    return doctores
      .filter((d) => {
        if (d.doctor_estado !== "A") return false;
        const persona = d.perfil.usuario.persona;
        return (
          nombreCompleto(persona).toLowerCase().includes(q) ||
          persona.persona_cedula.toLowerCase().includes(q) ||
          d.especialidad_medica.especialidad_medica_nombre.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [buscarDoctor, doctores]);

  const citasOcupadas = useMemo(() => {
    if (!doctorInfo) return [];
    return citas
      .filter(
        (c) =>
          c.horario_doctor.doctor.doctor_id === doctorInfo.id &&
          c.estado_cita.estado_cita_nombre !== "Cancelada" &&
          c.cita_id !== editingId
      )
      .map((c) => ({ horario_doctor_id: c.horario_doctor_id, cita_fecha: c.cita_fecha.slice(0, 10) }));
  }, [citas, doctorInfo, editingId]);

  const cargarHorariosDoctor = async (doctorId: number) => {
    try {
      setCargandoHorarios(true);
      setHorariosDoctor(await getHorariosPorDoctor(doctorId));
    } catch {
      mostrarError("No se pudo cargar la disponibilidad del doctor.");
    } finally {
      setCargandoHorarios(false);
    }
  };

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setPacienteInfo(null);
    setDoctorInfo(null);
    setHorariosDoctor([]);
    setBuscarPaciente("");
    setBuscarDoctor("");
    setShowModal(true);
  };

  const handleEditar = async (row: Cita) => {
    const pacientePersona = row.historia_clinica.perfil.usuario.persona;
    const doctorPersona = row.horario_doctor.doctor.perfil.usuario.persona;

    setEditingId(row.cita_id);
    setForm({
      historia_clinica_id: String(row.historia_clinica_id),
      horario_doctor_id: String(row.horario_doctor_id),
      cita_fecha: row.cita_fecha.slice(0, 10),
      cita_motivo: row.cita_motivo,
      estado_cita_id: String(row.estado_cita_id),
    });
    setPacienteInfo({
      id: row.historia_clinica_id,
      label: `${nombreCompleto(pacientePersona)} — ${row.historia_clinica.historia_clinica_numero} — ${pacientePersona.persona_cedula}`,
    });
    setDoctorInfo({
      id: row.horario_doctor.doctor.doctor_id,
      label: `${nombreCompleto(doctorPersona)} — ${row.horario_doctor.doctor.especialidad_medica.especialidad_medica_nombre} — ${doctorPersona.persona_cedula}`,
    });
    setBuscarPaciente("");
    setBuscarDoctor("");
    setShowModal(true);
    await cargarHorariosDoctor(row.horario_doctor.doctor.doctor_id);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("La cita se cancelará.");
    if (!confirmado) return;

    try {
      await deleteCita(id);
      mostrarExito("Cita cancelada correctamente.");
      await cargarDatos();
    } catch {
      mostrarError("No se pudo cancelar la cita.");
    }
  };

  const seleccionarPaciente = (p: Paciente) => {
    const persona = p.perfil.usuario.persona;
    setForm((f) => ({ ...f, historia_clinica_id: String(p.historia_clinica_id) }));
    setPacienteInfo({
      id: p.historia_clinica_id,
      label: `${nombreCompleto(persona)} — ${p.historia_clinica_numero} — ${persona.persona_cedula}`,
    });
    setBuscarPaciente("");
  };

  const seleccionarDoctor = async (d: Doctor) => {
    const persona = d.perfil.usuario.persona;
    setForm((f) => ({ ...f, horario_doctor_id: "", cita_fecha: "" }));
    setDoctorInfo({
      id: d.doctor_id,
      label: `${nombreCompleto(persona)} — ${d.especialidad_medica.especialidad_medica_nombre} — ${persona.persona_cedula}`,
    });
    setBuscarDoctor("");
    await cargarHorariosDoctor(d.doctor_id);
  };

  const handleSeleccionarHorario = (fecha: string, horarioDoctorId: number) => {
    setForm((f) => ({ ...f, cita_fecha: fecha, horario_doctor_id: String(horarioDoctorId) }));
  };

  const handleGuardar = async () => {
    if (
      !form.historia_clinica_id ||
      !form.horario_doctor_id ||
      !form.cita_fecha ||
      !form.cita_motivo.trim()
    ) {
      mostrarError("Selecciona un paciente, un doctor, un horario disponible y describe el motivo.");
      return;
    }

    const payload: CitaPayload = {
      historia_clinica_id: Number(form.historia_clinica_id),
      horario_doctor_id: Number(form.horario_doctor_id),
      cita_fecha: form.cita_fecha,
      cita_motivo: form.cita_motivo,
      ...(editingId ? { estado_cita_id: Number(form.estado_cita_id) } : {}),
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateCita(editingId, payload);
        mostrarExito("Cita actualizada correctamente.");
      } else {
        await createCita(payload);
        mostrarExito("Cita creada correctamente.");
      }
      setShowModal(false);
      await cargarDatos();
    } catch {
      mostrarError("No se pudo guardar la cita.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { data: null, title: "Doctor" },
    { data: null, title: "Paciente" },
    { data: null, title: "Fecha y Hora" },
    { data: null, title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Citas</h3>
        <Button variant="primary" onClick={handleNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Agregar Cita
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
          data={citas}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            0: (_data: unknown, row: Cita) => nombreCompleto(row.horario_doctor.doctor.perfil.usuario.persona),
            1: (_data: unknown, row: Cita) => nombreCompleto(row.historia_clinica.perfil.usuario.persona),
            2: (_data: unknown, row: Cita) => formatFechaHora(row),
            3: (_data: unknown, row: Cita) => (
              <Badge bg={row.estado_cita.estado_cita_nombre === "Cancelada" ? "secondary" : "success"}>
                {row.estado_cita.estado_cita_nombre}
              </Badge>
            ),
            4: (_data: unknown, row: Cita) => (
              <>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleEliminar(row.cita_id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </>
            ),
          }}
        >
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Paciente</th>
              <th>Fecha y Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Cita" : "Nueva Cita"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Paciente</Form.Label>
              {pacienteInfo ? (
                <div className="d-flex align-items-center justify-content-between border rounded p-2">
                  <span>{pacienteInfo.label}</span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => {
                      setPacienteInfo(null);
                      setForm((f) => ({ ...f, historia_clinica_id: "" }));
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, cédula o N° historia clínica..."
                    value={buscarPaciente}
                    onChange={(e) => setBuscarPaciente(e.target.value)}
                  />
                  {buscarPaciente.trim() && (
                    <div className="border rounded mt-1" style={{ maxHeight: 200, overflowY: "auto" }}>
                      {pacientesFiltrados.map((p) => (
                        <button
                          key={p.historia_clinica_id}
                          type="button"
                          className="d-block w-100 text-start btn btn-light btn-sm"
                          onClick={() => seleccionarPaciente(p)}
                        >
                          {nombreCompleto(p.perfil.usuario.persona)} — {p.historia_clinica_numero} —{" "}
                          {p.perfil.usuario.persona.persona_cedula}
                        </button>
                      ))}
                      {pacientesFiltrados.length === 0 && (
                        <div className="p-2 text-muted small">Sin resultados</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              {doctorInfo ? (
                <div className="d-flex align-items-center justify-content-between border rounded p-2">
                  <span>{doctorInfo.label}</span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => {
                      setDoctorInfo(null);
                      setHorariosDoctor([]);
                      setForm((f) => ({ ...f, horario_doctor_id: "", cita_fecha: "" }));
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, cédula o especialidad..."
                    value={buscarDoctor}
                    onChange={(e) => setBuscarDoctor(e.target.value)}
                  />
                  {buscarDoctor.trim() && (
                    <div className="border rounded mt-1" style={{ maxHeight: 200, overflowY: "auto" }}>
                      {doctoresFiltrados.map((d) => (
                        <button
                          key={d.doctor_id}
                          type="button"
                          className="d-block w-100 text-start btn btn-light btn-sm"
                          onClick={() => seleccionarDoctor(d)}
                        >
                          {nombreCompleto(d.perfil.usuario.persona)} —{" "}
                          {d.especialidad_medica.especialidad_medica_nombre} —{" "}
                          {d.perfil.usuario.persona.persona_cedula}
                        </button>
                      ))}
                      {doctoresFiltrados.length === 0 && (
                        <div className="p-2 text-muted small">Sin resultados</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Disponibilidad del Doctor</Form.Label>
              {cargandoHorarios ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <CitaCalendario
                  horarios={horariosDoctor}
                  ocupados={citasOcupadas}
                  seleccion={
                    form.cita_fecha && form.horario_doctor_id
                      ? { cita_fecha: form.cita_fecha, horario_doctor_id: Number(form.horario_doctor_id) }
                      : null
                  }
                  onSeleccionar={handleSeleccionarHorario}
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Motivo de la Cita</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                maxLength={500}
                value={form.cita_motivo}
                onChange={(e) => setForm({ ...form, cita_motivo: e.target.value })}
                placeholder="Describe el motivo de la consulta..."
              />
            </Form.Group>

            {editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={form.estado_cita_id}
                  onChange={(e) => setForm({ ...form, estado_cita_id: e.target.value })}
                >
                  {estadosCita.map((e) => (
                    <option key={e.estado_cita_id} value={e.estado_cita_id}>
                      {e.estado_cita_nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
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
