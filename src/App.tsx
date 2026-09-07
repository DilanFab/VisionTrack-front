import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { PatientLayout } from "./layouts/PatientLayout";
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
import HistoriasClinicas from "./pages/historias/HistoriasClinicas";
import HistoriaClinicaDetalle from "./pages/historias/HistoriaClinicaDetalle";
import ExamenOptometricoForm from "./pages/examenes/ExamenOptometricoForm";
import ExamenOptometricoDetalle from "./pages/examenes/ExamenOptometricoDetalle";
import PatientDashboard from "./pages/portal/PatientDashboard";
import PatientAppointments from "./pages/portal/PatientAppointments";
import PatientScheduleAppointment from "./pages/portal/PatientScheduleAppointment";
import PatientHistory from "./pages/portal/PatientHistory";
import PatientProfile from "./pages/portal/PatientProfile";
import CategoriasPage from "./pages/inventario/CategoriasPage";
import ProductosPage from "./pages/inventario/ProductosPage";
import MovimientosPage from "./pages/inventario/MovimientosPage";
import Facturacion from "./pages/ventas/Facturacion";
import ConfiguracionIva from "./pages/admin/ConfiguracionIva";
import CajaPage from "./pages/ventas/CajaPage";
import ComprasReportesPage from "./pages/ventas/ComprasReportesPage";


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
            <Route path="/portal" element={<PatientLayout />}>
              <Route index element={<Navigate to="/portal/dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="citas" element={<PatientAppointments />} />
              <Route path="agendar" element={<PatientScheduleAppointment />} />
              <Route path="historial" element={<PatientHistory />} />
              <Route path="perfil" element={<PatientProfile />} />
            </Route>
          </Route>

          {/* Admin Section routes wrapped under ProtectedRoute and AdminLayout */}
          <Route element={<ProtectedRoute allowedRoles={["Administrador", "Médico", "Recepcionista"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
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
                <Route path="configuracion-iva" element={<ConfiguracionIva />} />
              </Route>
              
              {/* Historias y supervisión clínica para Administrador y Doctor/Optómetra */}
              <Route element={<ProtectedRoute allowedRoles={["Administrador", "Médico"]} />}>
                <Route path="historial" element={<HistoriasClinicas />} />
                <Route path="historial/:historiaId" element={<HistoriaClinicaDetalle />} />
                <Route path="historial/:historiaId/examenes/:examenId" element={<ExamenOptometricoDetalle />} />
                <Route path="ui-guide" element={<UiGuide />} />
              </Route>

              {/* Operación clínica solo para Doctor/Optómetra */}
              <Route element={<ProtectedRoute allowedRoles={["Médico"]} />}>
                <Route path="historial/:historiaId/examenes/nuevo" element={<ExamenOptometricoForm />} />
                <Route path="historial/:historiaId/examenes/:examenId/editar" element={<ExamenOptometricoForm />} />
                <Route path="citas/:citaId/examen/nuevo" element={<ExamenOptometricoForm />} />
              </Route>

              {/* Recepción y operación administrativa de citas */}
              <Route element={<ProtectedRoute allowedRoles={["Administrador", "Recepcionista"]} />}>
                <Route path="usuarios/pacientes" element={<Pacientes />} />
                <Route path="inventario/categorias" element={<CategoriasPage />} />
                <Route path="inventario/productos" element={<ProductosPage />} />
                <Route path="inventario/movimientos" element={<MovimientosPage />} />
                <Route path="facturacion" element={<Facturacion />} />
                <Route path="caja" element={<CajaPage />} />
                <Route path="compras-reportes" element={<ComprasReportesPage />} />
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
