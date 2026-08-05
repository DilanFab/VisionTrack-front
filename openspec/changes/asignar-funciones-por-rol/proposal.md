## Why

VisionTrack necesita alinear la navegación y las acciones disponibles con las responsabilidades reales de cada rol. Hoy algunas rutas administrativas son compartidas o usan pantallas placeholder, mientras que el nuevo módulo de exámenes optométricos de la API requiere una experiencia clínica clara para Doctor/Optómetra sin exponer acciones clínicas a Administración o Recepción.

El cambio permite reducir errores operativos, separar configuración de operación clínica y preparar el frontend para consumir los endpoints de exámenes optométricos recientemente incorporados en la API.

## What Changes

- Reorganizar las funciones visibles y permitidas por rol:
  - **Administrador**: configuración y supervisión del sistema; no opera exámenes clínicos.
  - **Paciente**: conserva el portal actual para citas, historial visible y perfil.
  - **Doctor/Optómetra**: operación clínica sobre sus propias citas, historias clínicas relacionadas y exámenes optométricos.
  - **Recepcionista**: gestión operativa de citas, disponibilidad y datos básicos de pacientes; sin edición clínica ni exámenes.
- Mantener el rol técnico `Médico` para compatibilidad con backend, mostrando en UI la etiqueta funcional Doctor/Optómetra.
- Integrar el módulo frontend de exámenes optométricos usando el contrato de API existente:
  - listar por historia clínica,
  - crear examen manual,
  - crear examen desde cita,
  - editar borrador,
  - finalizar,
  - ver finalizado en solo lectura,
  - inactivar/eliminar lógico cuando aplique.
- Sustituir placeholders de historial clínico por rutas/páginas reales o por pantallas explícitas de módulo pendiente, según alcance de implementación.
- Ajustar rutas, protección de rutas y menú lateral para que las acciones disponibles coincidan con el rol activo.

### Fuera de alcance

- Cambiar el nombre técnico del rol en backend de `Médico` a `Optómetra`.
- Modificar el esquema o endpoints de VisionTrack-api, salvo que durante implementación se detecte un contrato faltante.
- Generar PDF del examen optométrico.
- Implementar facturación o inventario, aunque existan rutas placeholder.

### Riesgos

- La base de datos de menús/permisos puede no estar alineada con las rutas del frontend, por lo que el sidebar dinámico podría requerir datos semilla o ajustes backend.
- Si la API no expone endpoints filtrados por doctor autenticado, el frontend solo podrá ocultar información visualmente, pero la seguridad real deberá quedar reforzada en backend.
- Puede existir inconsistencia entre `Médico`, `Medico`, Doctor y Optómetra en datos históricos o seeds.

### Preguntas abiertas

- ¿La supervisión del Administrador sobre exámenes debe ser solo lectura total o incluir auditoría/exportación?
- ¿La eliminación lógica de exámenes debe estar disponible para Doctor/Optómetra, Administrador supervisor o ambos?
- ¿El filtrado “solo sus citas” ya viene garantizado por la API para `Médico` o debe solicitarse como cambio backend separado?

## Capabilities

### New Capabilities

- `funciones-por-rol`: define la matriz de responsabilidades, rutas y acciones permitidas para Administrador, Paciente, Doctor/Optómetra y Recepcionista.
- `examen-optometrico-frontend`: cubre la experiencia frontend para consultar, crear, editar, finalizar, visualizar e inactivar exámenes optométricos desde historias clínicas y citas.

### Modified Capabilities

- Ninguna. El ajuste visual por rol se cubre dentro de las nuevas capacidades porque no existe todavía una spec principal archivada para `experiencia-visual-centrada-usuario`.

## Impact

- `src/App.tsx`: rutas y agrupación de permisos por rol.
- `src/routes/ProtectedRoute.tsx`: validación y redirección por rol.
- `src/components/Sidebar.tsx`: navegación dinámica por sección y rol.
- `src/layouts/AdminLayout.tsx` y `src/layouts/PatientLayout.tsx`: separación de experiencias.
- `src/api/**`: nuevos servicios para exámenes optométricos y posibles consultas filtradas.
- `src/types/**`: tipos para examen optométrico y secciones clínicas JSON.
- `src/pages/**`: nuevas páginas o reemplazo de placeholders para historias clínicas, citas por rol y exámenes optométricos.
- VisionTrack-api: dependencia funcional de endpoints `/api/examenes-optometricos` y `/api/historias-clinicas/:id/examenes-optometricos`.
