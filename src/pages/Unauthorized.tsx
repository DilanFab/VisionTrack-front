import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Unauthorized = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleVolver = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-on-surface transition-colors duration-300 px-6">
      <div className="text-center max-w-md">
        <span className="material-symbols-outlined text-error text-7xl mb-4 block">
          block
        </span>
        <h1 className="text-3xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-on-surface-variant mb-6">
          No tienes permisos para acceder a esta sección. Contacta al administrador del sistema si necesitas acceso.
        </p>
        <button
          onClick={handleVolver}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:bg-primary-container transition-colors shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined">login</span>
          Volver al Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
