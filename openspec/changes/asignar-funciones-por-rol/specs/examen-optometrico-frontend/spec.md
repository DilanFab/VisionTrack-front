## Purpose

Integra en el frontend la gestión de exámenes optométricos para que Doctor/Optómetra pueda documentar la atención clínica desde historias y citas usando el contrato disponible en la API.

## ADDED Requirements

### Requirement: Listado de exámenes por historia clínica
El sistema SHALL permitir consultar los exámenes optométricos asociados a una historia clínica, mostrando estado, fecha, relación con cita y acciones disponibles según rol.

#### Scenario: Doctor/Optómetra consulta exámenes de una historia
- **WHEN** un Doctor/Optómetra abre la sección de exámenes dentro de una historia clínica permitida
- **THEN** el sistema MUST listar los exámenes devueltos por `/api/historias-clinicas/:id/examenes-optometricos`

#### Scenario: Historia sin exámenes
- **WHEN** la historia clínica no tiene exámenes optométricos activos o visibles
- **THEN** el sistema MUST mostrar un estado vacío con opción de crear examen si el rol tiene permiso

### Requirement: Crear examen manual
El sistema SHALL permitir que Doctor/Optómetra cree un examen optométrico manual asociado obligatoriamente a una historia clínica y sin requerir cita.

#### Scenario: Crear examen manual desde historia clínica
- **WHEN** Doctor/Optómetra inicia un examen desde una historia clínica sin seleccionar cita
- **THEN** el sistema MUST enviar `historia_clinica_id` y MUST omitir o dejar vacío `cita_id`

#### Scenario: Intento de crear sin historia clínica
- **WHEN** el usuario intenta crear un examen sin historia clínica asociada
- **THEN** el sistema MUST impedir el envío y mostrar una validación visible

### Requirement: Crear examen desde cita
El sistema SHALL permitir que Doctor/Optómetra cree un examen optométrico desde una cita asignada, vinculando la cita con la historia clínica correspondiente.

#### Scenario: Crear desde cita asignada
- **WHEN** Doctor/Optómetra inicia examen desde una cita permitida
- **THEN** el sistema MUST enviar `historia_clinica_id` y `cita_id` correspondientes a la misma atención

#### Scenario: Cita ya tiene examen activo o finalizado
- **WHEN** la API informa que ya existe un examen activo o finalizado para la cita
- **THEN** el sistema MUST informar el conflicto y ofrecer abrir el examen existente si está disponible

### Requirement: Editar borrador
El sistema SHALL permitir editar exámenes optométricos en estado borrador y conservar secciones clínicas JSON sin perder información no modificada.

#### Scenario: Editar examen en borrador
- **WHEN** Doctor/Optómetra abre un examen en estado `B`
- **THEN** el sistema MUST mostrar campos editables y permitir guardar cambios

#### Scenario: Guardado parcial de secciones clínicas
- **WHEN** el usuario modifica una sección del examen y guarda
- **THEN** el sistema MUST preservar las demás secciones clínicas existentes salvo que el usuario las modifique explícitamente

### Requirement: Finalizar examen
El sistema SHALL permitir finalizar un examen en borrador y, después de finalizarlo, tratarlo como registro clínico de solo lectura.

#### Scenario: Finalización exitosa
- **WHEN** Doctor/Optómetra confirma la finalización de un examen en borrador
- **THEN** el sistema MUST solicitar confirmación, enviar la acción de finalización y actualizar el estado visual a `F`

#### Scenario: Error al finalizar
- **WHEN** la API rechaza la finalización por validación o permisos
- **THEN** el sistema MUST mantener el examen como borrador y mostrar el motivo del error

### Requirement: Ver examen finalizado en solo lectura
El sistema SHALL mostrar exámenes finalizados o inactivos sin controles de edición clínica.

#### Scenario: Abrir examen finalizado
- **WHEN** un usuario autorizado abre un examen con estado `F`
- **THEN** el sistema MUST mostrar el contenido en solo lectura y ocultar acciones de guardar o finalizar

#### Scenario: Administrador abre examen para supervisión
- **WHEN** un Administrador abre un examen optométrico
- **THEN** el sistema MUST mostrarlo en modo supervisión o solo lectura, sin permitir operación clínica

### Requirement: Inactivar o eliminar lógico examen
El sistema SHALL permitir inactivar o eliminar lógicamente un examen solo a roles autorizados y con confirmación explícita.

#### Scenario: Inactivar examen permitido
- **WHEN** un rol autorizado solicita inactivar un examen permitido
- **THEN** el sistema MUST pedir confirmación y, si la API responde correctamente, actualizar el estado a `I` o removerlo de listados activos

#### Scenario: Recepcionista intenta operar examen
- **WHEN** una Recepcionista abre una ruta o acción de examen optométrico
- **THEN** el sistema MUST impedir crear, editar, finalizar o inactivar exámenes
