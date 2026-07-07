import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UiGuide from "./pages/UiGuide";
import Dashboard from "./pages/admin/Dashboard";
import Generos from "./pages/usuarios/Generos";
import Menus from "./pages/rolesPermisos/Menus";
import Roles from "./pages/rolesPermisos/Roles";
import Administradores from "./pages/usuarios/Administradores";
import Recepcionistas from "./pages/usuarios/Recepcionistas";
import EspecialidadesMedicas from "./pages/medicos/EspecialidadesMedicas";
import Doctores from "./pages/medicos/Doctores";
import EstadoCitas from "./pages/citas/EstadoCitas";
import Pacientes from "./pages/citas/Pacientes";
import Citas from "./pages/citas/Citas";
import PatientDashboard from "./pages/portal/PatientDashboard";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Redirect from Root to Dashboard (which will trigger ProtectedRoute logic if unauthorized) */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Secure login screen */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Portal Section */}
          <Route element={<ProtectedRoute allowedRoles={["Paciente"]} />}>
            <Route path="/portal" element={<PatientDashboard />} />
          </Route>

          {/* Admin Section routes wrapped under ProtectedRoute and AdminLayout */}
          <Route element={<ProtectedRoute allowedRoles={["Administrador", "Médico", "Recepcionista"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="usuarios/pacientes" element={<Pacientes />} />
              {/* Using Generos as placeholders for other sections until pages are built */}
              <Route path="citas" element={<Citas />} />

              {/* Personal (Staff) and Roles y Permisos only for Administrador */}
              <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
                <Route path="personal" element={<Generos />} />
                <Route path="roles-permisos/menus" element={<Menus />} />
                <Route path="roles-permisos/roles" element={<Roles />} />
                <Route path="usuarios/generos" element={<Generos />} />
                <Route path="usuarios/administradores" element={<Administradores />} />
                <Route path="usuarios/recepcionistas" element={<Recepcionistas />} />
                <Route path="medicos/especialidades" element={<EspecialidadesMedicas />} />
                <Route path="medicos/doctores" element={<Doctores />} />
                <Route path="citas/estados" element={<EstadoCitas />} />
              </Route>
              
              {/* Diagnósticos and Style Guide only for Administrador & Médico */}
              <Route element={<ProtectedRoute allowedRoles={["Administrador", "Médico"]} />}>
                <Route path="historial" element={<Generos />} />
                <Route path="ui-guide" element={<UiGuide />} />
              </Route>

              {/* Inventario and Facturación only for Administrador & Recepcionista */}
              <Route element={<ProtectedRoute allowedRoles={["Administrador", "Recepcionista"]} />}>
                <Route path="inventario" element={<Generos />} />
                <Route path="facturacion" element={<Generos />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback wildcard redirect */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;