import { SymbolIcon } from "../components/SymbolIcon";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDefaultRouteForRoles, hasRoleMatch } from "../lib/roleCapabilities";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-on-surface transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <SymbolIcon name="progress_activity" className="text-primary text-5xl animate-spin" />
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
    const hasAllowedRole = user.roles.some((role) =>
      hasRoleMatch(allowedRoles, (allowedRole) => allowedRole === role || allowedRole.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === role.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
    );
    if (!hasAllowedRole) {
      return <Navigate to={getDefaultRouteForRoles(user.roles)} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
