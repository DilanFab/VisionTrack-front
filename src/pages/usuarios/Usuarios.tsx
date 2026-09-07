import { useEffect, useMemo, useRef, useState } from "react";
import DataTable from "datatables.net-react";
import { Button, Modal, Form, Badge, Spinner, Alert, Row, Col, ButtonGroup } from "react-bootstrap";
import {
  getUsuariosCompletos,
  createUsuarioCompleto,
  updateUsuarioCompleto,
  deleteUsuarioCompleto,
} from "../../api/usuarios/usuarioCompletoService";
import { uploadImagenUsuario } from "../../api/usuarios/uploadService";
import { getGeneros } from "../../api/usuarios/generoService";
import { getRoles } from "../../api/rolesPermisos/rolService";
import { getEspecialidadesMedicas } from "../../api/medicos/especialidadMedicaService";
import type { UsuarioCompleto, UsuarioCompletoPayload } from "../../types/usuarios/UsuarioCompleto";
import type { Persona } from "../../types/usuarios/Persona";
import type { Genero } from "../../types/usuarios/Genero";
import type { Rol } from "../../types/rolesPermisos/Rol";
import type { EspecialidadMedica } from "../../types/medicos/EspecialidadMedica";
import { idiomaEspanol } from "../../lib/datatableEsLang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faPlus,
  faUpload,
  faCamera,
  faUserShield,
  faUserDoctor,
  faUserNurse,
  faHospitalUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { confirmarEliminacion, mostrarExito, mostrarError } from "../../lib/alerts";
import { resolveUsuarioImagenUrl } from "../../lib/imagenUsuario";

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
  usuario_estado: "A",
  rol_ids: [] as number[],
  especialidad_medica_id: "1",
};

const nombreCompleto = (p: Persona) =>
  [p.persona_primer_nombre, p.persona_segundo_nombre, p.persona_primer_apellido, p.persona_segundo_apellido]
    .filter(Boolean)
    .join(" ");

const normalizeRole = (role: string) =>
  role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [especialidades, setEspecialidades] = useState<EspecialidadMedica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("todos");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImagen, setUploadingImagen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const [usuariosData, generosData, rolesData, especialidadesData] = await Promise.all([
        getUsuariosCompletos(),
        getGeneros(),
        getRoles(),
        getEspecialidadesMedicas(),
      ]);
      setUsuarios(usuariosData);
      setGeneros(generosData);
      setRoles(rolesData.filter((r) => r.rol_estado === "A"));
      setEspecialidades(especialidadesData.filter((e) => e.especialidad_medica_estado === "A"));
    } catch {
      setError("No se pudo conectar con la API. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(cargarDatos);
  }, []);

  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleCerrarModal = () => {
    detenerCamara();
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleNuevo = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      especialidad_medica_id: especialidades[0]?.especialidad_medica_id ? String(especialidades[0].especialidad_medica_id) : "1",
    });
    setShowModal(true);
  };

  const handleEditar = (row: UsuarioCompleto) => {
    setEditingId(row.usuario_id);
    const doctorPerfil = row.perfiles.find((p) => normalizeRole(p.rol.rol_nombre) === "medico");
    const especialidadId = doctorPerfil?.doctor?.especialidad_medica_id
      ? String(doctorPerfil.doctor.especialidad_medica_id)
      : (especialidades[0]?.especialidad_medica_id ? String(especialidades[0].especialidad_medica_id) : "1");

    setForm({
      genero_id: String(row.persona.genero_id),
      persona_cedula: row.persona.persona_cedula,
      persona_primer_nombre: row.persona.persona_primer_nombre,
      persona_segundo_nombre: row.persona.persona_segundo_nombre ?? "",
      persona_primer_apellido: row.persona.persona_primer_apellido,
      persona_segundo_apellido: row.persona.persona_segundo_apellido ?? "",
      persona_fecha_nacimiento: row.persona.persona_fecha_nacimiento.slice(0, 10),
      persona_direccion: row.persona.persona_direccion,
      persona_telefono: row.persona.persona_telefono,
      persona_correo: row.persona.persona_correo,
      usuario_nombre: row.usuario_nombre,
      usuario_contrasena: "",
      usuario_imagen: row.usuario_imagen,
      usuario_estado: row.usuario_estado,
      rol_ids: row.perfiles.map((p) => p.rol_id),
      especialidad_medica_id: especialidadId,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    const confirmado = await confirmarEliminacion("El usuario será desactivado del sistema.");
    if (!confirmado) return;

    try {
      await deleteUsuarioCompleto(id);
      mostrarExito("Usuario desactivado correctamente.");
      await cargarDatos();
    } catch {
      mostrarError("No se pudo desactivar el usuario.");
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

  const toggleRol = (rolId: number) => {
    setForm((prev) => ({
      ...prev,
      rol_ids: prev.rol_ids.includes(rolId)
        ? prev.rol_ids.filter((id) => id !== rolId)
        : [...prev.rol_ids, rolId],
    }));
  };

  const tieneRolMedicoSeleccionado = useMemo(() => {
    return form.rol_ids.some((id) => {
      const rol = roles.find((r) => r.rol_id === id);
      return rol && normalizeRole(rol.rol_nombre) === "medico";
    });
  }, [form.rol_ids, roles]);

  const tieneRolPacienteSeleccionado = useMemo(() => {
    return form.rol_ids.some((id) => {
      const rol = roles.find((r) => r.rol_id === id);
      return rol && normalizeRole(rol.rol_nombre) === "paciente";
    });
  }, [form.rol_ids, roles]);

  const handleGuardar = async () => {
    if (
      !form.persona_cedula.trim() ||
      !form.persona_primer_nombre.trim() ||
      !form.persona_primer_apellido.trim() ||
      !form.genero_id ||
      !form.usuario_nombre.trim()
    ) {
      mostrarError("Completa los campos obligatorios de la persona y el usuario.");
      return;
    }
    if (!editingId && !form.usuario_contrasena.trim()) {
      mostrarError("La contraseña es obligatoria para un usuario nuevo.");
      return;
    }
    if (form.rol_ids.length === 0) {
      mostrarError("Selecciona al menos un rol para el usuario.");
      return;
    }

    const payload: UsuarioCompletoPayload = {
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
      usuario_estado: form.usuario_estado,
      rol_ids: form.rol_ids,
      especialidad_medica_id: tieneRolMedicoSeleccionado ? Number(form.especialidad_medica_id) : undefined,
      ...(form.usuario_contrasena.trim() ? { usuario_contrasena: form.usuario_contrasena } : {}),
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateUsuarioCompleto(editingId, payload);
        mostrarExito("Usuario actualizado y roles sincronizados correctamente.");
      } else {
        await createUsuarioCompleto(payload);
        mostrarExito("Usuario creado con roles vinculados exitosamente.");
      }
      handleCerrarModal();
      await cargarDatos();
    } catch (err: any) {
      const msg = err.response?.data?.error || "No se pudo guardar el usuario.";
      mostrarError(msg);
    } finally {
      setSaving(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    if (filtroRol === "todos") return usuarios;
    return usuarios.filter((u) =>
      u.perfiles.some((p) => normalizeRole(p.rol.rol_nombre) === filtroRol)
    );
  }, [usuarios, filtroRol]);

  const columns = [
    { data: null, title: "Usuario" },
    { data: null, title: "Cédula" },
    { data: null, title: "Nombre Completo" },
    { data: null, title: "Roles Asignados" },
    { data: null, title: "Contacto" },
    { data: "usuario_estado", title: "Estado" },
    { data: null, title: "Acciones", orderable: false },
  ];

  const getBadgeForRol = (p: UsuarioCompleto["perfiles"][0]) => {
    const norm = normalizeRole(p.rol.rol_nombre);
    if (norm === "administrador") {
      return (
        <Badge key={p.perfil_id} bg="primary" className="me-1">
          <FontAwesomeIcon icon={faUserShield} className="me-1" />
          Admin
        </Badge>
      );
    }
    if (norm === "medico") {
      const esp = p.doctor?.especialidad_medica?.especialidad_medica_nombre || "Optometrista";
      return (
        <Badge key={p.perfil_id} bg="info" text="dark" className="me-1">
          <FontAwesomeIcon icon={faUserDoctor} className="me-1" />
          Médico ({esp})
        </Badge>
      );
    }
    if (norm === "recepcionista") {
      return (
        <Badge key={p.perfil_id} bg="warning" text="dark" className="me-1">
          <FontAwesomeIcon icon={faUserNurse} className="me-1" />
          Recepción
        </Badge>
      );
    }
    if (norm === "paciente") {
      const hc = p.historias_clinicas?.[0]?.historia_clinica_numero;
      return (
        <Badge key={p.perfil_id} bg="secondary" className="me-1">
          <FontAwesomeIcon icon={faHospitalUser} className="me-1" />
          Paciente {hc ? `(${hc})` : ""}
        </Badge>
      );
    }
    return (
      <Badge key={p.perfil_id} bg="dark" className="me-1">
        {p.rol.rol_nombre}
      </Badge>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>Gestión General de Usuarios</h3>
          <p className="text-muted small mb-0">
            Administración centralizada de usuarios, asignación de roles y vinculación automática clínica y médica.
          </p>
        </div>
        <Button variant="primary" onClick={handleNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <span className="text-muted small font-weight-bold">Filtrar por rol:</span>
        <ButtonGroup size="sm">
          <Button
            variant={filtroRol === "todos" ? "primary" : "outline-primary"}
            onClick={() => setFiltroRol("todos")}
          >
            <FontAwesomeIcon icon={faUsers} className="me-1" /> Todos ({usuarios.length})
          </Button>
          <Button
            variant={filtroRol === "administrador" ? "primary" : "outline-primary"}
            onClick={() => setFiltroRol("administrador")}
          >
            Administradores
          </Button>
          <Button
            variant={filtroRol === "medico" ? "primary" : "outline-primary"}
            onClick={() => setFiltroRol("medico")}
          >
            Médicos / Doctores
          </Button>
          <Button
            variant={filtroRol === "recepcionista" ? "primary" : "outline-primary"}
            onClick={() => setFiltroRol("recepcionista")}
          >
            Recepcionistas
          </Button>
          <Button
            variant={filtroRol === "paciente" ? "primary" : "outline-primary"}
            onClick={() => setFiltroRol("paciente")}
          >
            Pacientes
          </Button>
        </ButtonGroup>
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
          data={usuariosFiltrados}
          columns={columns}
          className="table table-striped table-bordered align-middle"
          options={{ language: idiomaEspanol }}
          slots={{
            0: (_data: unknown, row: UsuarioCompleto) => (
              <div className="d-flex align-items-center gap-2">
                <img
                  src={resolveUsuarioImagenUrl(row.usuario_imagen) || undefined}
                  alt={row.usuario_nombre}
                  className="rounded-circle border"
                  style={{ width: 36, height: 36, objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
                <div>
                  <strong>{row.usuario_nombre}</strong>
                </div>
              </div>
            ),
            1: (_data: unknown, row: UsuarioCompleto) => <span>{row.persona.persona_cedula}</span>,
            2: (_data: unknown, row: UsuarioCompleto) => <span>{nombreCompleto(row.persona)}</span>,
            3: (_data: unknown, row: UsuarioCompleto) => (
              <div className="d-flex flex-wrap gap-1">
                {row.perfiles.map(getBadgeForRol)}
              </div>
            ),
            4: (_data: unknown, row: UsuarioCompleto) => (
              <div className="small">
                <div>{row.persona.persona_correo}</div>
                <div className="text-muted">{row.persona.persona_telefono}</div>
              </div>
            ),
            5: (data: string) => (
              <Badge bg={data === "A" ? "success" : "secondary"}>
                {data === "A" ? "Activo" : "Inactivo"}
              </Badge>
            ),
            6: (_data: unknown, row: UsuarioCompleto) => (
              <div className="d-flex gap-2">
                <Button size="sm" variant="warning" onClick={() => handleEditar(row)} title="Editar y gestionar roles">
                  <FontAwesomeIcon icon={faPen} />
                </Button>
                <Button
                  size="sm"
                  variant={row.usuario_estado === "A" ? "danger" : "outline-success"}
                  onClick={() => handleEliminar(row.usuario_id)}
                  title={row.usuario_estado === "A" ? "Desactivar" : "Reactivar"}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            ),
          }}
        >
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Cédula</th>
              <th>Nombre Completo</th>
              <th>Roles Asignados</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </DataTable>
      )}

      {/* Modal Crear / Editar */}
      <Modal show={showModal} onHide={handleCerrarModal} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Usuario y Roles" : "Nuevo Usuario"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h6 className="text-primary font-weight-bold mb-3 border-bottom pb-2">1. Datos Personales</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cédula *</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={10}
                    value={form.persona_cedula}
                    onChange={(e) => setForm({ ...form, persona_cedula: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Género *</Form.Label>
                  <Form.Select
                    value={form.genero_id}
                    onChange={(e) => setForm({ ...form, genero_id: e.target.value })}
                    required
                  >
                    <option value="">Selecciona género</option>
                    {generos.map((g) => (
                      <option key={g.genero_id} value={g.genero_id}>
                        {g.genero_nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primer Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.persona_primer_nombre}
                    onChange={(e) => setForm({ ...form, persona_primer_nombre: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Segundo Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.persona_segundo_nombre}
                    onChange={(e) => setForm({ ...form, persona_segundo_nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primer Apellido *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.persona_primer_apellido}
                    onChange={(e) => setForm({ ...form, persona_primer_apellido: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Segundo Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.persona_segundo_apellido}
                    onChange={(e) => setForm({ ...form, persona_segundo_apellido: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Nacimiento *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.persona_fecha_nacimiento}
                    onChange={(e) => setForm({ ...form, persona_fecha_nacimiento: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
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
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.persona_correo}
                    onChange={(e) => setForm({ ...form, persona_correo: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.persona_direccion}
                    onChange={(e) => setForm({ ...form, persona_direccion: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="text-primary font-weight-bold mt-4 mb-3 border-bottom pb-2">2. Cuenta de Usuario</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de Usuario *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.usuario_nombre}
                    onChange={(e) => setForm({ ...form, usuario_nombre: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{editingId ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.usuario_contrasena}
                    onChange={(e) => setForm({ ...form, usuario_contrasena: e.target.value })}
                    required={!editingId}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado de Usuario</Form.Label>
                  <Form.Select
                    value={form.usuario_estado}
                    onChange={(e) => setForm({ ...form, usuario_estado: e.target.value })}
                  >
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Foto de Perfil</Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImagen}
                    >
                      <FontAwesomeIcon icon={faUpload} className="me-1" />
                      Subir
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={iniciarCamara}
                      disabled={uploadingImagen}
                    >
                      <FontAwesomeIcon icon={faCamera} className="me-1" />
                      Cámara
                    </Button>
                    {uploadingImagen && <Spinner animation="border" size="sm" />}
                    {form.usuario_imagen && (
                      <img
                        src={resolveUsuarioImagenUrl(form.usuario_imagen) || undefined}
                        alt="Preview"
                        className="rounded-circle border ms-2"
                        style={{ width: 34, height: 34, objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleArchivoChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {showCamera && (
              <div className="border rounded p-3 mb-3 text-center bg-light">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="rounded w-100 mb-2"
                  style={{ maxHeight: 220, objectFit: "cover" }}
                />
                <div className="d-flex justify-content-center gap-2">
                  <Button size="sm" variant="success" onClick={capturarFoto}>
                    Capturar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={detenerCamara}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <h6 className="text-primary font-weight-bold mt-4 mb-3 border-bottom pb-2">3. Asignación de Roles y Vinculaciones</h6>
            <Form.Group className="mb-3">
              <Form.Label className="font-weight-bold">Selecciona los roles aplicables:</Form.Label>
              <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                {roles.map((r) => {
                  const checked = form.rol_ids.includes(r.rol_id);
                  return (
                    <Form.Check
                      key={r.rol_id}
                      type="checkbox"
                      id={`rol-${r.rol_id}`}
                      label={<strong>{r.rol_nombre}</strong>}
                      checked={checked}
                      onChange={() => toggleRol(r.rol_id)}
                    />
                  );
                })}
              </div>
            </Form.Group>

            {tieneRolMedicoSeleccionado && (
              <div className="alert alert-info py-2 px-3 mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faUserDoctor} />
                  <strong>Configuración de Médico:</strong>
                </div>
                <Form.Group>
                  <Form.Label className="small font-weight-bold">Especialidad Médica asignada:</Form.Label>
                  <Form.Select
                    size="sm"
                    value={form.especialidad_medica_id}
                    onChange={(e) => setForm({ ...form, especialidad_medica_id: e.target.value })}
                  >
                    {especialidades.map((esp) => (
                      <option key={esp.especialidad_medica_id} value={esp.especialidad_medica_id}>
                        {esp.especialidad_medica_nombre}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Al guardar con rol Médico, el sistema crea y actualiza automáticamente su registro en la tabla de doctores para permitirle configurar horarios de atención.
                  </Form.Text>
                </Form.Group>
              </div>
            )}

            {tieneRolPacienteSeleccionado && (
              <div className="alert alert-secondary py-2 px-3 mb-3 small">
                <FontAwesomeIcon icon={faHospitalUser} className="me-2 text-primary" />
                <strong>Atención:</strong> Al asignar el rol Paciente, el sistema asegurará automáticamente su apertura de historia clínica (código <code>HC-{form.persona_cedula || "..."}</code>) para que pueda acceder y gestionar citas en el portal.
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCerrarModal} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving || uploadingImagen}>
            {saving ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {editingId ? "Actualizar Usuario" : "Guardar Usuario"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
