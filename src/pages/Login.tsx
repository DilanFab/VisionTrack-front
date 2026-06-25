import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logoImg from "../assets/logo.svg"; // Cambia a .png si convertiste a PNG


const Login: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
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

  // Subtle Mouse parallax/tilt effect for premium feeling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const xAxis = (window.innerWidth / 2 - e.clientX) / 70;
      const yAxis = (window.innerHeight / 2 - e.clientY) / 70;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus("submitting");
    setErrorMsg(null);

    try {
      await login(email, password);
      setStatus("success");
      
      // Save remember setting if desired (optional placeholder functionality)
      if (remember) {
        localStorage.setItem("remember_workstation", "true");
      }

      // Small delay for the "Access Granted" animation to complete
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
        setErrorMsg("Error de conexión. Verifique que el servidor backend esté corriendo.");
      }
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center animated-gradient-bg overflow-hidden relative transition-colors duration-300 px-6"
      style={{ perspective: "1000px" }}
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

      {/* UI Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main Login Container */}
      <main className="z-10 w-full max-w-md py-12">
        <div
          ref={cardRef}
          className="glass-card rounded-xl p-8 md:p-10 relative overflow-hidden transition-transform duration-100 ease-out shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Reticle Decorations */}
          <div className="reticle top-0 left-0 border-r-0 border-b-0 rounded-tl-xl"></div>
          <div className="reticle top-0 right-0 border-l-0 border-b-0 rounded-tr-xl"></div>
          <div className="reticle bottom-0 left-0 border-r-0 border-t-0 rounded-bl-xl"></div>
          <div className="reticle bottom-0 right-0 border-l-0 border-t-0 rounded-br-xl"></div>

          {/* Header Section */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-5">
              <img src={logoImg} alt="VisionTrack Logo" className="h-26 w-auto object-contain" />
            </div>
            <h1 className="font-bold text-4xl text-primary tracking-tight"></h1>
            <p className="text-sm font-medium text-on-surface-variant mt-1 tracking-wide uppercase opacity-85">
              Clinical Precision. Patient Centricity.
            </p>
          </header>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-center gap-2.5 animate-fadeIn text-sm">
              <span className="material-symbols-outlined text-error">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                className="block text-xs font-bold text-on-surface-variant tracking-wider uppercase ml-1" 
                htmlFor="email"
              >
                ADMINISTRATOR EMAIL
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                    alternate_email
                  </span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@visiontrack.health"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-normal placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label 
                  className="block text-xs font-bold text-on-surface-variant tracking-wider uppercase" 
                  htmlFor="password"
                >
                  PASSWORD
                </label>
                <a 
                  className="text-xs font-semibold text-primary hover:text-primary-container transition-colors" 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Por favor, póngase en contacto con el administrador del sistema para restablecer su contraseña.");
                  }}
                >
                  FORGOT?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  className="block w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-normal placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all glow-input disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={status === "submitting" || status === "success"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Workstation Checkbox */}
            <div className="flex items-center space-x-2.5">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={status === "submitting" || status === "success"}
                className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary cursor-pointer"
              />
              <label 
                className="text-xs font-medium text-on-surface-variant cursor-pointer select-none" 
                htmlFor="remember"
              >
                Remember this workstation for 24 hours
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "submitting" || status === "success" || !email || !password}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg active:scale-[0.98] group cursor-pointer ${
                status === "success"
                  ? "bg-secondary text-on-secondary shadow-secondary/20"
                  : "bg-primary text-on-primary hover:bg-primary-container shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              }`}
            >
              {status === "submitting" && (
                <>
                  <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                  <span>Verificando credenciales...</span>
                </>
              )}
              {status === "success" && (
                <>
                  <span className="material-symbols-outlined mr-2">check_circle</span>
                  <span>Acceso Concedido</span>
                </>
              )}
              {status === "idle" && (
                <>
                  <span>Login</span>
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

          {/* Footer / Security Message */}
          <footer className="mt-8 pt-5 border-t border-outline-variant/20 text-center">
            <div className="flex items-center justify-center space-x-4 text-outline mb-3.5">
              <div className="flex items-center space-x-1 bg-surface-container-high/40 px-2 py-0.5 rounded text-xs">
                <span className="material-symbols-outlined text-xs">security</span>
                <span className="font-semibold uppercase">AES-256</span>
              </div>
              <div className="flex items-center space-x-1 bg-surface-container-high/40 px-2 py-0.5 rounded text-xs">
                <span className="material-symbols-outlined text-xs">verified_user</span>
                <span className="font-semibold uppercase text-secondary">HIPAA COMPLIANT</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant/60 leading-relaxed max-w-[280px] mx-auto mb-4">
              Proprietary system for authorized medical personnel only. Unauthorized access is strictly prohibited and monitored.
            </p>
            <p className="text-xs text-on-surface-variant">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </footer>
        </div>

        {/* System Status Bar (Ambient) */}
        <div className="mt-6 flex justify-center items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
              Server Operational
            </span>
          </div>
          <div className="flex items-center space-x-2 opacity-65">
            <span className="text-[10px] text-on-surface-variant font-mono font-bold">
              v4.2.1-stable
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
