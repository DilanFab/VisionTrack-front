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
              <Route path="pacientes" element={<Generos />} />
              {/* Using Generos as placeholders for other sections until pages are built */}
              <Route path="citas" element={<Generos />} />

              {/* Personal (Staff) only for Administrador */}
              <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
                <Route path="personal" element={<Generos />} />
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