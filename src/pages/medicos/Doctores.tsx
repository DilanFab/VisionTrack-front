import { useEffect, useRef, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import {
  getDoctoresCompletos,
  createDoctorCompleto,
  updateDoctorCompleto,
  deleteDoctorCompleto,
} from "../../api/medicos/doctorCompletoService";
import { uploadImagenUsuario } from "../../api/usuarios/uploadService";
import { getGeneros } from "../../api/usuarios/generoService";
import { getEspecialidadesMedicas } from "../../api/medicos/especialidadMedicaService";
import type { Doctor, DoctorPayload } from "../../types/medicos/Doctor";
import type { Persona } from "../../types/usuarios/Persona";
import type { Genero } from "../../types/usuarios/Genero";
import type { EspecialidadMedica } from "../../types/medicos/EspecialidadMedica";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faPlus,
  faUpload,
  faCamera,
  faCircleUser,
  faCalendarWeek,
} from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";
import { resolveUsuarioImagenUrl } from "../../lib/imagenUsuario";
import HorarioDoctorModal from "../../components/medicos/HorarioDoctorModal";

const initialForm = {
  genero_id: "",
  persona_cedula: "",
  persona_primer_nombre: "",
  persona_segundo_nombre: "",
  persona_primer_apellido: "",
  persona_segundo_apellido: "",
  persona_fecha_nacimiento: "",
  persona_direccion: "",
  persona_telefono: "",
  persona_correo: "",
  usuario_nombre: "",
  usuario_contrasena: "",
  usuario_imagen: "",
  especialidad_medica_id: "",
  doctor_estado: "A",
};

const nombreCompleto = (p: Persona) =>
  [p.persona_primer_nombre, p.persona_segundo_nombre, p.persona_primer_apellido, p.persona_segundo_apellido]
    .filter(Boolean)
    .join(" ");

export default function Doctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [especialidades, setEspecialidades] = useState<EspecialidadMedica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImagen, setUploadingImagen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [doctorHorario, setDoctorHorario] = useState<Doctor | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const [doctoresData, generosData, especialidadesData] = await Promise.all([
        getDoctoresCompletos(),
        getGeneros(),
        getEspecialidadesMedicas(),
      ]);
      setDoctores(doctoresData);
      setGeneros(generosData);
      setEspecialidades(especialidadesData);
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  const detenerCamara = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const handleCerrarModal = () => {
    detenerCamara();
    setShowModal(false);
  };

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEditar = (row: Doctor) => {
    const persona = row.perfil.usuario.persona;
    setEditingId(row.doctor_id);
    setForm({
      genero_id: String(persona.genero_id),
      persona_cedula: persona.persona_cedula,
      persona_primer_nombre: persona.persona_primer_nombre,
      persona_segundo_nombre: persona.persona_segundo_nombre ?? "",
      persona_primer_apellido: persona.persona_primer_apellido,
      persona_segundo_apellido: persona.persona_segundo_apellido ?? "",
      persona_fecha_nacimiento: persona.persona_fecha_nacimiento.slice(0, 10),
      persona_direccion: persona.persona_direccion,
      persona_telefono: persona.persona_telefono,
      persona_correo: persona.persona_correo,
      usuario_nombre: row.perfil.usuario.usuario_nombre,
      usuario_contrasena: "",
      usuario_imagen: row.perfil.usuario.usuario_imagen,
      especialidad_medica_id: String(row.especialidad_medica_id),
      doctor_estado: row.doctor_estado,
    });
    setShowModal(true);
  };

  const handleVerHorario = (row: Doctor) => {
    setDoctorHorario(row);
    setShowHorarioModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("El doctor se eliminará permanentemente.");
    if (!confirmado) return;

    try {
      await deleteDoctorCompleto(id);
      mostrarExito("Doctor eliminado correctamente.");
      await cargarDatos();
    } catch {
      mostrarError("No se pudo eliminar el doctor.");
    }
  };

  const subirImagen = async (archivo: Blob, nombre?: string) => {
    try {
      setUploadingImagen(true);
      const url = await uploadImagenUsuario(archivo, nombre);
      setForm((prev) => ({ ...prev, usuario_imagen: url }));
    } catch {
      mostrarError("No se pudo subir la imagen.");
    } finally {
      setUploadingImagen(false);
    }
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) subirImagen(file, file.name);
  };

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowCamera(true);
    } catch {
      mostrarError("No se pudo acceder a la cámara.");
    }
  };

  const capturarFoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    detenerCamara();
    canvas.toBlob(
      (blob) => {
        if (blob) subirImagen(blob, "captura.jpg");
      },
      "image/jpeg",
      0.9
    );
  };

  const handleGuardar = async () => {
    if (
      !form.persona_cedula.trim() ||
      !form.persona_primer_nombre.trim() ||
      !form.persona_primer_apellido.trim() ||
      !form.genero_id ||
      !form.usuario_nombre.trim() ||
      !form.especialidad_medica_id
    ) {
      mostrarError("Completa los campos obligatorios de la persona, el usuario y la especialidad.");
      return;
    }
    if (!editingId && !form.usuario_contrasena.trim()) {
      mostrarError("La contraseña es obligatoria para un doctor nuevo.");
      return;
    }

    const payload: DoctorPayload = {
      genero_id: Number(form.genero_id),
      persona_cedula: form.persona_cedula,
      persona_primer_nombre: form.persona_primer_nombre,
      persona_segundo_nombre: form.persona_segundo_nombre || null,
      persona_primer_apellido: form.persona_primer_apellido,
      persona_segundo_apellido: form.persona_segundo_apellido || null,
      persona_fecha_nacimiento: form.persona_fecha_nacimiento,
      persona_direccion: form.persona_direccion,
      persona_telefono: form.persona_telefono,
      persona_correo: form.persona_correo,
      usuario_nombre: form.usuario_nombre,
      usuario_imagen: form.usuario_imagen,
      especialidad_medica_id: Number(form.especialidad_medica_id),
      doctor_estado: form.doctor_estado,
      ...(form.usuario_contrasena.trim() ? { usuario_contrasena: form.usuario_contrasena } : {}),
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateDoctorCompleto(editingId, payload);
        mostrarExito("Doctor actualizado correctamente.");
      } else {
        await createDoctorCompleto(payload);
        mostrarExito("Doctor creado correctamente.");
      }
      handleCerrarModal();
      await cargarDatos();
    } catch {
      mostrarError("No se pudo guardar el doctor.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { data: "doctor_id", title: "Id" },
    { data: null, title: "Cédula" },
    { data: null, title: "Nombre Completo" },
    { data: null, title: "Especialidad" },
    { data: "doctor_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  const imagenPreviewUrl = resolveUsuarioImagenUrl(form.usuario_imagen);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Doctores</h3>
        <Button variant="primary" onClick={handleNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Agregar Doctor
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
          data={doctores}
          columns={columns}
          className="table table-striped table-bordered"
          options={{ language: idiomaEspanol }}
          slots={{
            1: (_data: unknown, row: Doctor) => row.perfil.usuario.persona.persona_cedula,
            2: (_data: unknown, row: Doctor) => nombreCompleto(row.perfil.usuario.persona),
            3: (_data: unknown, row: Doctor) => row.especialidad_medica.especialidad_medica_nombre,
            4: (_data: unknown, row: Doctor) => (
              <Badge bg={row.doctor_estado === "A" ? "success" : "secondary"}>
                {row.doctor_estado === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            5: (_data: unknown, row: Doctor) => (
              <>
                <Button
                  size="sm"
                  variant="info"
                  className="me-2"
                  title="Disponibilidad"
                  onClick={() => handleVerHorario(row)}
                >
                  <FontAwesomeIcon icon={faCalendarWeek} />
                </Button>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditar(row)}>
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleEliminar(row.doctor_id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </>
            ),
          }}
        >
          <thead>
            <tr>
              <th>Id</th>
              <th>Cédula</th>
              <th>Nombre Completo</th>
              <th>Especialidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      <Modal show={showModal} onHide={handleCerrarModal} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Doctor" : "Nuevo Doctor"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle overflow-hidden border border-outline-variant d-flex align-items-center justify-content-center bg-surface-variant flex-shrink-0"
                style={{ width: 80, height: 80 }}
              >
                {imagenPreviewUrl ? (
                  <img
                    src={imagenPreviewUrl}
                    alt="Foto del doctor"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faCircleUser} size="3x" className="text-outline" />
                )}
              </div>
              <div className="d-flex flex-column gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleArchivoChange}
                />
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImagen}
                >
                  <FontAwesomeIcon icon={faUpload} className="me-2" />
                  {uploadingImagen ? "Subiendo..." : "Subir archivo"}
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={iniciarCamara}
                  disabled={uploadingImagen}
                >
                  <FontAwesomeIcon icon={faCamera} className="me-2" />
                  Tomar foto
                </Button>
              </div>
            </div>

            {showCamera && (
              <div className="mb-3 text-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-100 rounded"
                  style={{ maxHeight: 240, background: "#000" }}
                />
                <div className="d-flex gap-2 justify-content-center mt-2">
                  <Button size="sm" variant="primary" onClick={capturarFoto}>
                    Capturar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={detenerCamara}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <hr />

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cédula</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={10}
                    value={form.persona_cedula}
                    onChange={(e) => setForm({ ...form, persona_cedula: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Nacimiento</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.persona_fecha_nacimiento}
                    onChange={(e) => setForm({ ...form, persona_fecha_nacimiento: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primer Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={50}
                    value={form.persona_primer_nombre}
                    onChange={(e) => setForm({ ...form, persona_primer_nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Segundo Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={50}
                    value={form.persona_segundo_nombre}
                    onChange={(e) => setForm({ ...form, persona_segundo_nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primer Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={50}
                    value={form.persona_primer_apellido}
                    onChange={(e) => setForm({ ...form, persona_primer_apellido: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Segundo Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={50}
                    value={form.persona_segundo_apellido}
                    onChange={(e) => setForm({ ...form, persona_segundo_apellido: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={10}
                    value={form.persona_telefono}
                    onChange={(e) => setForm({ ...form, persona_telefono: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.persona_correo}
                    onChange={(e) => setForm({ ...form, persona_correo: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={500}
                    value={form.persona_direccion}
                    onChange={(e) => setForm({ ...form, persona_direccion: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Género</Form.Label>
                  <Form.Select
                    value={form.genero_id}
                    onChange={(e) => setForm({ ...form, genero_id: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    {generos.map((g) => (
                      <option key={g.genero_id} value={g.genero_id}>
                        {g.genero_nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={100}
                    value={form.usuario_nombre}
                    onChange={(e) => setForm({ ...form, usuario_nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.usuario_contrasena}
                    onChange={(e) => setForm({ ...form, usuario_contrasena: e.target.value })}
                    placeholder={editingId ? "Dejar en blanco para no cambiarla" : ""}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={editingId ? 6 : 12}>
                <Form.Group className="mb-3">
                  <Form.Label>Especialidad Médica</Form.Label>
                  <Form.Select
                    value={form.especialidad_medica_id}
                    onChange={(e) => setForm({ ...form, especialidad_medica_id: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    {especialidades.map((esp) => (
                      <option key={esp.especialidad_medica_id} value={esp.especialidad_medica_id}>
                        {esp.especialidad_medica_nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {editingId && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={form.doctor_estado}
                      onChange={(e) => setForm({ ...form, doctor_estado: e.target.value })}
                    >
                      <option value="A">Activo</option>
                      <option value="I">Inactivo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCerrarModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving || uploadingImagen}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>

      <HorarioDoctorModal
        show={showHorarioModal}
        doctor={doctorHorario}
        onHide={() => setShowHorarioModal(false)}
      />
    </div>
  );
}
