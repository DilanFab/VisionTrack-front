import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import logoImg from "../assets/logo.svg";

interface Genero {
  genero_id: number;
  genero_nombre: string;
}

interface Especialidad {
  especialidad_medica_id: number;
  especialidad_medica_nombre: string;
  especialidad_medica_descripcion: string;
}

const Register: React.FC = () => {
  const { register, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Role: 'paciente' or 'doctor'
  const [tipo, setTipo] = useState<"paciente" | "doctor">("paciente");

  // Form Fields
  const [cedula, setCedula] = useState("");
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [generoId, setGeneroId] = useState<number | "">("");
  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [usuarioContrasena, setUsuarioContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [especialidadId, setEspecialidadId] = useState<number | "">("");

  // Dynamic lists from backend
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);

  // UX States
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user && status === "idle") {
      const hasAdminAccess = user.roles.some(
        (r) => r === "Administrador" || r === "Médico" || r === "Recepcionista"
      );
      if (hasAdminAccess) {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.roles.includes("Paciente")) {
        navigate("/portal", { replace: true });
      } else {
        navigate("/unauthorized", { replace: true });
      }
    }
  }, [isAuthenticated, user, status, navigate]);

  // Load genders and specialties
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [genRes, espRes] = await Promise.all([
          api.get<Genero[]>("/api/generos"),
          api.get<Especialidad[]>("/api/especialidades-medicas"),
        ]);
        setGeneros(genRes.data);
        setEspecialidades(espRes.data);
      } catch (err) {
        console.error("Error al cargar metadatos de registro:", err);
      }
    };
    loadMetadata();
  }, []);

  // Mouse tilt parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const xAxis = (window.innerWidth / 2 - e.clientX) / 80;
      const yAxis = (window.innerHeight / 2 - e.clientY) / 80;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (usuarioContrasena !== confirmarContrasena) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }

    if (usuarioContrasena.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!generoId) {
      setErrorMsg("Debe seleccionar un género");
      return;
    }

    if (tipo === "doctor" && !especialidadId) {
      setErrorMsg("Debe seleccionar una especialidad médica");
      return;
    }

    setStatus("submitting");

    try {
      await register({
        tipo,
        cedula,
        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        fecha_nacimiento: fechaNacimiento,
        direccion,
        telefono,
        correo,
        genero_id: Number(generoId),
        usuario_nombre: usuarioNombre,
        usuario_contrasena: usuarioContrasena,
        especialidad_medica_id: tipo === "doctor" ? Number(especialidadId) : undefined,
      });

      setStatus("success");
      setTimeout(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            const hasAdminAccess = parsedUser.roles.some(
              (r: string) => r === "Administrador" || r === "Médico" || r === "Recepcionista"
            );
            if (hasAdminAccess) {
              navigate("/admin/dashboard");
            } else if (parsedUser.roles.includes("Paciente")) {
              navigate("/portal");
            } else {
              navigate("/unauthorized");
            }
          } catch (e) {
            navigate("/admin/dashboard");
          }
        } else {
          navigate("/admin/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg("Error al registrarse. Verifique los datos o intente más tarde.");
      }
      setTimeout(() => {
        setStatus("idle");
      }, 4000);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center animated-gradient-bg overflow-hidden relative transition-colors duration-300 py-12 px-6"
      style={{ perspective: "1200px" }}
    >
      {/* Floating Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest/80 text-on-surface transition-all shadow-lg border border-outline-variant/30 backdrop-blur-md active:scale-95 cursor-pointer z-50"
        title="Cambiar Tema"
      >
        <span className="material-symbols-outlined flex items-center justify-center">
          {theme === "light" ? "dark_mode" : "light_mode"}
        </span>
      </button>

      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-secondary/10 blur-[110px] rounded-full pointer-events-none"></div>

      {/* Form Container */}
      <main className="z-10 w-full max-w-2xl py-6">
        <div
          ref={cardRef}
          className="glass-card rounded-xl p-6 md:p-8 relative overflow-hidden transition-transform duration-100 ease-out shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Reticle borders */}
          <div className="reticle top-0 left-0 border-r-0 border-b-0 rounded-tl-xl"></div>
          <div className="reticle top-0 right-0 border-l-0 border-b-0 rounded-tr-xl"></div>
          <div className="reticle bottom-0 left-0 border-r-0 border-t-0 rounded-bl-xl"></div>
          <div className="reticle bottom-0 right-0 border-l-0 border-t-0 rounded-br-xl"></div>

          {/* Header */}
          <header className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4 mx-auto">
              <img src={logoImg} alt="VisionTrack Logo" className="h-26 w-auto object-contain" />
            </div>
            <h1 className="font-bold text-3xl text-primary tracking-tight"></h1>
            <p className="text-xs font-semibold text-on-surface-variant mt-1.5 uppercase tracking-widest opacity-80">
              Crear Nueva Cuenta de Usuario
            </p>
          </header>

          {/* Role Tab Selector */}
          <div className="flex bg-surface-container/60 p-1 rounded-xl mb-6 border border-outline-variant/30 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => {
                setTipo("paciente");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tipo === "paciente"
                  ? "bg-primary text-on-primary shadow"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Soy Paciente
            </button>
            <button
              type="button"
              onClick={() => {
                setTipo("doctor");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tipo === "doctor"
                  ? "bg-primary text-on-primary shadow"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Soy Médico / Doctor
            </button>
          </div>

          {/* Alert Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-center gap-2.5 animate-fadeIn text-sm">
              <span className="material-symbols-outlined text-error">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid for Personal Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cedula */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Cédula de Identidad *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Ej: 1716072408"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Genero select */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Género *
                </label>
                <select
                  required
                  value={generoId}
                  onChange={(e) => setGeneroId(Number(e.target.value))}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                >
                  <option value="">Seleccione género...</option>
                  {generos.map((gen) => (
                    <option key={gen.genero_id} value={gen.genero_id}>
                      {gen.genero_nombre === "Masculinas" ? "Masculino" : gen.genero_nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primer Nombre */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Primer Nombre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Eduardo"
                  value={primerNombre}
                  onChange={(e) => setPrimerNombre(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Segundo Nombre */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Segundo Nombre (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Javier"
                  value={segundoNombre}
                  onChange={(e) => setSegundoNombre(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Primer Apellido */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Primer Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Robelly"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Segundo Apellido */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Segundo Apellido (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Vásquez"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Fecha Nacimiento */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Telefono */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Teléfono de Contacto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 0995540112"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Correo */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="paciente@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Direccion */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Dirección de Residencia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Av. Amazonas y Río Coca"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                />
              </div>

              {/* Specialty Dropdown (ONLY visible if doctor role selected) */}
              {tipo === "doctor" && (
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                    Especialidad Médica *
                  </label>
                  <select
                    required
                    value={especialidadId}
                    onChange={(e) => setEspecialidadId(Number(e.target.value))}
                    disabled={status === "submitting" || status === "success"}
                    className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                  >
                    <option value="">Seleccione especialidad médica...</option>
                    {especialidades.map((esp) => (
                      <option key={esp.especialidad_medica_id} value={esp.especialidad_medica_id}>
                        {esp.especialidad_medica_nombre} - {esp.especialidad_medica_descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Account Credentials */}
            <div className="border-t border-outline-variant/20 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-primary tracking-wider uppercase ml-1">
                Credenciales de Acceso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: eduardo.robelly"
                    value={usuarioNombre}
                    onChange={(e) => setUsuarioNombre(e.target.value.toLowerCase().replace(/\s/g, ""))}
                    disabled={status === "submitting" || status === "success"}
                    className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                  />
                </div>

                {/* Password fields */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                    Contraseña *
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={usuarioContrasena}
                      onChange={(e) => setUsuarioContrasena(e.target.value)}
                      disabled={status === "submitting" || status === "success"}
                      className="block w-full pl-3.5 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={status === "submitting" || status === "success"}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1 md:col-start-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repita la contraseña"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    disabled={status === "submitting" || status === "success"}
                    className="block w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "submitting" || status === "success"}
              className={`w-full flex items-center justify-center py-3.5 px-6 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg active:scale-[0.98] group cursor-pointer ${
                status === "success"
                  ? "bg-secondary text-on-secondary shadow-secondary/20"
                  : "bg-primary text-on-primary hover:bg-primary-container shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              }`}
            >
              {status === "submitting" && (
                <>
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                  <span>Registrando datos en Supabase...</span>
                </>
              )}
              {status === "success" && (
                <>
                  <span className="material-symbols-outlined mr-2">check_circle</span>
                  <span>¡Registro Exitoso! Iniciando sesión...</span>
                </>
              )}
              {status === "idle" && (
                <>
                  <span>Registrar Cuenta</span>
                  <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
              {status === "error" && (
                <>
                  <span className="material-symbols-outlined mr-2">error</span>
                  <span>Intente de nuevo</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <footer className="mt-6 pt-4 border-t border-outline-variant/20 text-center">
            <p className="text-xs text-on-surface-variant">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Register;
