## Why

VisionTrack ya cuenta con una base visual moderna, pero la experiencia se percibe más tecnológica que clínica y mezcla textos/estados en español e inglés, lo que puede reducir claridad, confianza y facilidad de uso para pacientes y personal médico. Esta mejora busca alinear la interfaz con principios de diseño centrado en el usuario: claridad de tareas, jerarquía visual, accesibilidad, consistencia y feedback oportuno.

## What Changes

- Redefinir la experiencia visual principal con una paleta más acorde al propósito del sistema: salud visual, gestión clínica, confianza, precisión y calma.
- Mejorar la interacción en flujos clave: navegación lateral, búsqueda superior, formularios, estados de carga/vacío/error/éxito, acciones rápidas y confirmaciones.
- Estandarizar jerarquía visual, componentes, microcopy y patrones de interacción para vistas administrativas y portal del paciente.
- Revisar el uso de modo claro/oscuro para asegurar contraste, legibilidad y consistencia con tokens existentes en `src/index.css` y `ThemeContext`.
- Priorizar diseño centrado en usuario: tareas frecuentes visibles, lenguaje comprensible, feedback inmediato, navegación predecible y reducción de carga cognitiva.
- No se introducen cambios incompatibles ni cambios en contratos de API.

### Objetivo

Lograr una interfaz más coherente, accesible y orientada a las necesidades de usuarios reales de VisionTrack: administradores, médicos, recepcionistas y pacientes.

### Alcance

- Layouts compartidos: `AdminLayout`, `PatientLayout`, `Sidebar`, `Topbar`.
- Tokens visuales globales, tema claro/oscuro y puente Bootstrap/DataTables.
- Login, dashboard administrativo, portal del paciente y páginas CRUD con tablas/formularios.
- Estados de interacción: hover, focus, active, disabled, loading, empty, error y success.
- Guía interna de UI (`UiGuide`) como referencia de componentes y tokens.

### Fuera de alcance

- Cambios en endpoints, modelos de datos, autenticación o reglas de roles.
- Rediseño completo de arquitectura de frontend.
- Implementación de nuevas funcionalidades clínicas no relacionadas con UX/UI.
- Sustitución de librerías principales como React, Bootstrap, DataTables o FullCalendar.

### Riesgos

- Cambiar la paleta sin validar contraste puede afectar accesibilidad.
- Ajustes visuales amplios pueden generar inconsistencias si no se centralizan en tokens y componentes compartidos.
- Interacciones nuevas pueden romper patrones existentes si no se prueban en roles administrativos y portal de paciente.

### Preguntas abiertas

- ¿Debe la experiencia priorizar modo claro por defecto para entornos clínicos o mantener modo oscuro como predeterminado?
- ¿Existe identidad visual institucional definida para VisionTrack que limite colores, logo o tono de comunicación?
- ¿Se requiere validación con usuarios reales antes de cerrar el rediseño?

## Capabilities

### New Capabilities
- `experiencia-visual-centrada-usuario`: Define los requisitos de una interfaz coherente, accesible y centrada en el usuario para VisionTrack, incluyendo paleta, navegación, feedback, estados y consistencia visual.

### Modified Capabilities

## Impact

- Código afectado: `src/index.css`, `src/context/ThemeContext.tsx`, `src/components/Sidebar.tsx`, `src/components/Topbar.tsx`, `src/layouts/AdminLayout.tsx`, `src/layouts/PatientLayout.tsx`, `src/pages/Login.tsx`, `src/pages/UiGuide.tsx`, dashboards, portal de paciente y páginas CRUD.
- APIs: sin cambios previstos.
- Dependencias: sin cambios previstos; se reutilizan React, Tailwind CSS, Bootstrap, DataTables y FullCalendar.
- Sistemas: solo frontend de VisionTrack.
