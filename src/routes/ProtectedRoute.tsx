import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-on-surface transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-semibold tracking-wider animate-pulse text-primary">
            Cargando sesión segura...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const hasAllowedRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasAllowedRole) {
      // If user is a Patient, redirect them to the Patient Portal
      if (user.roles.includes("Paciente")) {
        return <Navigate to="/portal" replace />;
      }
      
      // If user has administrative access, redirect to the Admin Dashboard
      const hasAdminAccess = user.roles.some(
        (r) => r === "Administrador" || r === "Médico" || r === "Recepcionista"
      );
      if (hasAdminAccess) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
