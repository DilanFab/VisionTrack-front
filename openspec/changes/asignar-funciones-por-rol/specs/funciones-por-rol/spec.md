## Purpose

Define la matriz funcional de VisionTrack para que cada rol vea y ejecute únicamente las acciones acordes a sus responsabilidades reales dentro del sistema.

## ADDED Requirements

### Requirement: Navegación y acciones por rol
El sistema SHALL mostrar navegación, rutas y acciones operativas según el rol autenticado, evitando que un rol acceda a funciones fuera de su responsabilidad funcional.

#### Scenario: Usuario con rol no autorizado intenta abrir una ruta protegida
- **WHEN** un usuario autenticado intenta acceder a una ruta que no corresponde a sus roles permitidos
- **THEN** el sistema MUST redirigirlo a una pantalla autorizada para su rol o a una pantalla de acceso no autorizado

#### Scenario: Menú lateral muestra solo opciones del rol actual
- **WHEN** el usuario ingresa a una sección del sistema
- **THEN** el menú lateral MUST ocultar opciones que no correspondan a su rol y sección funcional

### Requirement: Administrador configura y supervisa
El sistema SHALL permitir al Administrador gestionar configuración y supervisar información del sistema, pero MUST impedir que opere flujos clínicos como edición, finalización o inactivación de exámenes optométricos.

#### Scenario: Administrador accede a configuración del sistema
- **WHEN** un Administrador abre el panel administrativo
- **THEN** el sistema MUST mostrar opciones de usuarios, roles, permisos, menús, especialidades, Doctor/Optómetra, estados de cita y configuración relacionada

#### Scenario: Administrador supervisa un examen optométrico
- **WHEN** un Administrador abre el detalle de un examen optométrico
- **THEN** el sistema MUST mostrar la información en modo supervisión o solo lectura y MUST ocultar acciones clínicas operativas

### Requirement: Paciente conserva portal personal aislado
El sistema SHALL mantener al Paciente dentro del portal de paciente para consultar sus citas, agendar, revisar historial visible y actualizar su perfil, sin exponer navegación administrativa.

#### Scenario: Paciente abre su portal
- **WHEN** un Paciente autenticado accede a `/portal`
- **THEN** el sistema MUST mostrar inicio, mis citas, agendar, historial visible y perfil

#### Scenario: Paciente intenta acceder al dashboard administrativo
- **WHEN** un Paciente intenta abrir una ruta bajo `/admin`
- **THEN** el sistema MUST bloquear el acceso y redirigir a una ubicación permitida del portal del paciente

### Requirement: Doctor/Optómetra opera solo su trabajo clínico
El sistema SHALL presentar en UI el rol funcional como Doctor/Optómetra, manteniendo compatibilidad con el rol técnico `Médico`, y SHALL limitar sus citas y operación clínica a información asociada al doctor autenticado.

#### Scenario: Usuario técnico Médico ve etiqueta funcional
- **WHEN** un usuario con rol técnico `Médico` ingresa al sistema
- **THEN** la UI MUST presentarlo funcionalmente como Doctor/Optómetra donde corresponda

#### Scenario: Doctor/Optómetra consulta citas
- **WHEN** un Doctor/Optómetra abre el módulo de citas
- **THEN** el sistema MUST mostrar únicamente sus citas asignadas o informar si la API no permite garantizar ese filtro

#### Scenario: Doctor/Optómetra accede a historia clínica relacionada
- **WHEN** un Doctor/Optómetra abre una historia clínica desde una cita asignada o búsqueda permitida
- **THEN** el sistema MUST permitir consultar información clínica necesaria para la atención y acceder a exámenes optométricos relacionados

### Requirement: Recepcionista gestiona citas y datos básicos
El sistema SHALL permitir a la Recepcionista gestionar citas, disponibilidad y datos básicos de pacientes, pero MUST impedir edición de datos clínicos y operación de exámenes optométricos.

#### Scenario: Recepcionista registra paciente nuevo para agendar
- **WHEN** una Recepcionista necesita agendar a un paciente que no existe
- **THEN** el sistema MUST permitir crear el paciente con datos administrativos básicos antes de agendar la cita

#### Scenario: Recepcionista edita datos básicos del paciente
- **WHEN** una Recepcionista actualiza datos de contacto o identificación de un paciente
- **THEN** el sistema MUST permitir guardar datos básicos y MUST impedir cambios en historia clínica, diagnósticos o exámenes

#### Scenario: Recepcionista gestiona una cita
- **WHEN** una Recepcionista abre el módulo de citas
- **THEN** el sistema MUST permitir agendar, confirmar, editar, cancelar y revisar disponibilidad de Doctor/Optómetra

### Requirement: Acciones visibles deben coincidir con permisos reales
El sistema SHALL evitar mostrar botones o acciones que el rol actual no pueda completar exitosamente, y SHALL manejar respuestas de autorización de la API con mensajes claros.

#### Scenario: Acción no permitida por rol
- **WHEN** la API rechaza una acción por permisos insuficientes
- **THEN** el sistema MUST mostrar un mensaje claro y mantener la vista en un estado consistente sin pérdida de datos del formulario
