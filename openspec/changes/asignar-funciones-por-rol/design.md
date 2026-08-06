## Context

Ver `proposal.md` para la motivación. El frontend actual ya separa `/portal` para Paciente y `/admin` para Administrador, `Médico` y Recepcionista, pero varias rutas bajo `/admin` comparten pantallas genéricas o placeholders. La navegación depende de `tbl_menu`/permisos vía `getNavigationMenus`, mientras que `src/App.tsx` define una segunda capa de protección con `ProtectedRoute`.

Engram de VisionTrack-api indica que el backend ya incorporó el módulo de examen optométrico con endpoints `/api/examenes-optometricos` y `/api/historias-clinicas/:id/examenes-optometricos`, usando `historia_clinica_id` obligatorio, `cita_id` opcional, secciones clínicas JSON y estados `B`, `F`, `I`.

## Goals / Non-Goals

**Goals:**

- Convertir la matriz funcional acordada en rutas, navegación y acciones claras por rol.
- Mantener compatibilidad con el rol técnico `Médico` mientras la UI muestra Doctor/Optómetra.
- Integrar el módulo de exámenes optométricos en frontend sin modificar el contrato backend existente.
- Reducir placeholders donde afectan directamente el flujo de citas, historias clínicas y exámenes.
- Diseñar acciones por rol en la UI para evitar botones que el usuario no debe ejecutar.

**Non-Goals:**

- Renombrar roles en base de datos o backend.
- Implementar seguridad real únicamente en frontend; la API sigue siendo la autoridad de permisos.
- Crear PDF del examen optométrico.
- Resolver módulos de inventario/facturación fuera del flujo de citas/historias/exámenes.

## Decisions

### 1. Mantener `/admin` como shell operativo para staff

**Decisión:** Usar `/admin` para Administrador, Doctor/Optómetra y Recepcionista, diferenciando navegación y acciones internas por rol.

**Rationale:** Ya existe `AdminLayout`, `Sidebar` y `ProtectedRoute` para staff. Crear shells separados ahora duplicaría estructura visual y aumentaría riesgo de inconsistencias.

**Alternativas consideradas:**

- Crear `/doctor` y `/recepcion` como secciones separadas. Más claro semánticamente, pero exige duplicar layout, sidebar y redirecciones.
- Mantener todas las rutas compartidas sin distinción. Menor esfuerzo, pero perpetúa errores de permisos y experiencia.

### 2. Usar matriz de capacidades en frontend además del menú dinámico

**Decisión:** Centralizar una matriz de capacidades por rol para decidir rutas, acciones y etiquetas visibles, sin depender únicamente de `tbl_menu`.

Ejemplo conceptual:

```txt
Administrador
├─ configuracion: write
├─ supervisionClinica: read
└─ operacionClinica: none

Médico -> UI Doctor/Optómetra
├─ citasPropias: read/write
├─ historiasRelacionadas: read
└─ examenesOptometricos: create/edit/finalize/inactivate según estado

Recepcionista
├─ citas: create/edit/confirm/cancel
├─ disponibilidad: read
├─ pacientesBasicos: create/edit
└─ examenesOptometricos: none

Paciente
└─ portalPaciente: self-service
```

**Rationale:** La BD controla menú, pero la UI necesita también ocultar botones y validar rutas no necesariamente representadas como menús.

**Alternativas consideradas:**

- Solo confiar en `getNavigationMenus`. Insuficiente para acciones dentro de pantallas.
- Hardcodear validaciones dispersas en cada componente. Funciona al inicio, pero escala mal.

### 3. Tratar `Médico` como rol técnico y Doctor/Optómetra como etiqueta funcional

**Decisión:** No cambiar verificaciones técnicas (`hasRole("Médico")`), pero encapsular presentación con helpers de etiqueta para UI.

**Rationale:** Evita romper compatibilidad con backend, seed de roles y permisos ya existentes.

**Alternativas consideradas:**

- Cambiar todo a `Optómetra`. Requiere migraciones/backfill y coordinación backend.
- Aceptar `Medico` sin tilde como rol equivalente en frontend. Puede agregarse como tolerancia si aparecen datos legacy, pero no debe reemplazar el canónico actual sin confirmar backend.

### 4. Separar páginas clínicas de páginas administrativas

**Decisión:** Crear páginas/módulos explícitos para historias clínicas y exámenes optométricos, en lugar de reutilizar `Generos` como placeholder.

Estructura sugerida:

```txt
src/pages/historias/
├─ HistoriasClinicas.tsx
└─ HistoriaClinicaDetalle.tsx

src/pages/examenes/
├─ ExamenesOptometricosPorHistoria.tsx
├─ ExamenOptometricoForm.tsx
└─ ExamenOptometricoDetalle.tsx

src/api/examenes/examenOptometricoService.ts
src/types/examenes/ExamenOptometrico.ts
```

**Rationale:** Historias y exámenes son dominio clínico; mezclarlo con páginas de configuración complica permisos y mantenimiento.

**Alternativas consideradas:**

- Expandir `PatientHistory` para staff. No aplica porque el portal paciente tiene alcance y datos distintos.
- Agregar todo dentro de `Citas.tsx`. Haría muy grande una pantalla ya compleja y mezclaría agenda con documentación clínica.

### 5. Los estados del examen controlan la UI

**Decisión:** Mapear estado backend a comportamiento visual:

```txt
B = Borrador    -> editable para Doctor/Optómetra autorizado
F = Finalizado  -> solo lectura para todos los roles autorizados
I = Inactivo    -> visible solo donde aplique, sin edición
```

**Rationale:** La API bloquea cambios en finalizados/inactivos; la UI debe anticiparlo y no ofrecer acciones imposibles.

**Alternativas consideradas:**

- Mostrar siempre formularios editables y confiar en errores API. Mala experiencia y riesgo de pérdida de trabajo.

### 6. El filtro “solo sus citas” debe validarse contra API

**Decisión:** Implementar el frontend esperando un contrato seguro para citas de Doctor/Optómetra. Si el endpoint existente devuelve todas las citas, la tarea debe identificarlo como bloqueo o deuda backend antes de afirmar seguridad completa.

**Rationale:** El frontend puede filtrar visualmente, pero no garantiza privacidad ni seguridad si la API entrega datos de otros doctores.

**Alternativas consideradas:**

- Filtrar solo en cliente. Aceptable como mejora visual temporal, no como control de acceso.
- Bloquear módulo médico hasta que backend filtre. Más seguro, pero puede retrasar demasiado si existe endpoint suficiente.

## Risks / Trade-offs

- **Menú BD desalineado con rutas frontend** → Mitigar con fallback de rutas protegidas y documentar seeds/menús requeridos.
- **API no filtra citas por doctor autenticado** → Mitigar detectándolo en implementación y creando tarea/deuda backend antes de exponer datos sensibles.
- **Formulario de examen muy grande por secciones JSON** → Mitigar con componentes por sección y guardado de borrador por partes.
- **Roles con tildes o variantes inconsistentes** → Mitigar con helpers centralizados de rol y etiqueta; no dispersar strings.
- **Administrador supervisor necesita más que solo lectura en el futuro** → Mantener acciones de auditoría/exportación fuera de este cambio para no mezclar supervisión con operación clínica.

## Migration Plan

1. Agregar capacidades/tipos/helpers de roles sin retirar rutas existentes.
2. Crear servicios y tipos de examen optométrico.
3. Crear páginas clínicas nuevas y conectarlas a rutas protegidas.
4. Ajustar sidebar/menús para mostrar opciones por rol.
5. Reemplazar placeholders clínicos por páginas reales.
6. Validar lint, TypeScript, build y flujos principales por rol.

Rollback: revertir rutas nuevas y servicios frontend no afecta esquema backend. Si una ruta clínica falla, mantener fallback de acceso a citas/pacientes existente mientras se corrige.

## Open Questions

No quedan preguntas abiertas que cambien el alcance o la descomposición de tareas. Durante implementación se debe verificar si la API garantiza el filtro de citas por `Médico` autenticado; si no lo garantiza, se documentará como bloqueo/deuda backend y no se presentará como control de seguridad completo desde frontend.
