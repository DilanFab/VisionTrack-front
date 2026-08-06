## 1. Auditoría inicial y contrato API

- [x] 1.1 Revisar rutas actuales en `src/App.tsx` y documentar qué rutas reales o placeholders usa cada rol.
- [x] 1.2 Revisar `Sidebar`, `ProtectedRoute` y `useAuth` para identificar puntos de control de rol y navegación.
- [x] 1.3 Verificar en runtime o código si la API entrega citas filtradas para el rol técnico `Médico`; si no lo garantiza, registrar bloqueo/deuda backend antes de exponer datos sensibles.
- [x] 1.4 Confirmar forma exacta de payload/respuesta de `/api/examenes-optometricos` y `/api/historias-clinicas/:id/examenes-optometricos` contra el API local o documentación disponible.

## 2. Base de roles y permisos frontend

- [x] 2.1 Crear helpers centralizados para roles técnicos (`Administrador`, `Médico`, `Recepcionista`, `Paciente`) y etiquetas funcionales de UI.
- [x] 2.2 Crear matriz de capacidades frontend para navegación y acciones por rol.
- [x] 2.3 Ajustar `ProtectedRoute` para redirecciones coherentes por rol y sección.
- [x] 2.4 Ajustar `Sidebar` para ocultar opciones fuera del rol/sección y mostrar Doctor/Optómetra cuando el rol técnico sea `Médico`.

## 3. Servicios y tipos de exámenes optométricos

- [x] 3.1 Crear tipos TypeScript para examen optométrico, estados `B/F/I`, payloads y secciones clínicas JSON.
- [x] 3.2 Crear servicio API para listar exámenes por historia clínica.
- [x] 3.3 Crear servicio API para crear examen manual y examen desde cita.
- [x] 3.4 Crear servicio API para obtener, actualizar borrador, finalizar e inactivar examen.
- [x] 3.5 Centralizar manejo de errores API para conflictos, permisos y validaciones clínicas.

## 4. Historias clínicas para staff

- [x] 4.1 Crear página de listado/búsqueda de historias clínicas permitida para Doctor/Optómetra y supervisión de Administrador.
- [x] 4.2 Crear página de detalle de historia clínica con datos básicos, citas relacionadas y sección de exámenes optométricos.
- [x] 4.3 Reemplazar la ruta placeholder `/admin/historial` por la página clínica correspondiente.
- [x] 4.4 Asegurar que Recepcionista no pueda editar datos clínicos desde historias clínicas.

## 5. Exámenes optométricos UI

- [x] 5.1 Crear listado de exámenes optométricos por historia con estado, fecha, cita relacionada y acciones por rol.
- [x] 5.2 Crear flujo para nuevo examen manual desde historia clínica.
- [x] 5.3 Crear flujo para nuevo examen desde cita asignada.
- [x] 5.4 Crear formulario de edición de borrador por secciones clínicas sin perder datos no modificados.
- [x] 5.5 Crear acción de finalizar examen con confirmación y transición visual a solo lectura.
- [x] 5.6 Crear vista de detalle solo lectura para exámenes finalizados o inactivos.
- [x] 5.7 Crear acción de inactivar/eliminar lógico solo para Doctor/Optómetra autorizado y con confirmación explícita.
- [x] 5.8 Ocultar o bloquear acciones de examen para Administrador supervisor y Recepcionista.

## 6. Citas, disponibilidad y pacientes por rol

- [x] 6.1 Ajustar vista de citas para Doctor/Optómetra mostrando solo citas asignadas cuando la API lo permita de forma segura.
- [x] 6.2 Ajustar vista de citas para Recepcionista con agendar, confirmar, editar, cancelar y ver disponibilidad.
- [x] 6.3 Mantener para Paciente el portal actual de citas, agendamiento, historial visible y perfil.
- [x] 6.4 Permitir a Recepcionista crear y editar datos básicos de pacientes para agendamiento.
- [x] 6.5 Impedir a Recepcionista acceder a edición clínica o acciones de exámenes.
- [x] 6.6 Mantener Administrador en configuración y supervisión, sin operación clínica.

## 7. UX, estados y accesibilidad

- [x] 7.1 Añadir estados vacíos para historias sin exámenes y citas sin resultados.
- [x] 7.2 Añadir estados de carga y error recuperable en historias, citas y exámenes.
- [x] 7.3 Asegurar que botones deshabilitados o escondidos tengan explicación visible cuando aplique.
- [x] 7.4 Validar contraste, foco visible y navegación por teclado en formularios de examen.

## 8. Validación

- [x] 8.1 Ejecutar `npm run lint` y corregir errores.
- [x] 8.2 Ejecutar `npx tsc -b --pretty false` y corregir errores de tipos.
- [x] 8.3 Ejecutar `npm run build` y revisar advertencias relevantes.
- [x] 8.4 Validar manualmente rutas principales con roles Administrador, Paciente, Médico y Recepcionista.
- [x] 8.5 Ejecutar `openspec validate "asignar-funciones-por-rol" --type change --strict`.
