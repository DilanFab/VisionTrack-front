## Context

Ver `proposal.md` para la motivación y `specs/experiencia-visual-centrada-usuario/spec.md` para el contrato de comportamiento. El frontend actual es una SPA React + TypeScript + Vite que combina Tailwind CSS v4 tokens, variables CSS en `src/index.css`, Bootstrap/DataTables mediante variables `--bs-*`, `ThemeContext` para modo claro/oscuro, y componentes compartidos como `Sidebar`, `Topbar`, `AdminLayout` y `PatientLayout`.

Restricciones relevantes:

- Mantener los contratos de API y modelos existentes.
- Reutilizar dependencias actuales; no introducir librerías de diseño nuevas.
- Mantener nombres técnicos existentes para archivos, componentes, hooks, servicios y tipos.
- Escribir textos visibles para usuarios en español claro.
- Trabajar principalmente desde tokens globales y componentes compartidos para evitar cambios visuales fragmentados.

## Goals / Non-Goals

**Goals:**

- Centralizar la mejora visual en tokens semánticos y patrones compartidos para que modo claro/oscuro, Bootstrap, DataTables y componentes propios se mantengan coherentes.
- Ajustar la paleta hacia una identidad clínica y visual: confianza, calma, precisión, accesibilidad y salud ocular.
- Hacer que cada pantalla tenga intención clara: encabezado, contexto, acción principal, estados y feedback.
- Reducir inconsistencias de idioma, estilos de botones, foco, estados vacíos y mensajes de error.
- Mejorar interacción sin alterar reglas de negocio ni endpoints.

**Non-Goals:**

- Reescribir la aplicación con un nuevo design system externo.
- Reemplazar Bootstrap, DataTables, FullCalendar o SweetAlert2.
- Cambiar autenticación, permisos, rutas o estructura de datos del backend.
- Crear funcionalidades clínicas nuevas que no estén relacionadas con UX/UI.

## Decisions

### 1. Evolucionar la paleta desde tokens CSS existentes

**Decisión:** Actualizar `:root`, `.light` y `.dark` en `src/index.css` usando tokens semánticos ya expuestos a Tailwind (`--primary`, `--secondary`, `--surface`, `--error`, etc.) y conservar el puente Bootstrap mediante `--bs-*`.

**Rationale:** El proyecto ya depende de tokens CSS para Tailwind y Bootstrap/DataTables. Cambiar la paleta en un punto central reduce riesgo, permite consistencia entre componentes y evita refactors masivos.

**Alternativas consideradas:**

- Crear clases Tailwind ad hoc por página: descartado porque aumenta deuda visual e inconsistencia.
- Introducir una librería UI nueva: descartado porque cambia demasiados patrones y dependencias para una mejora UX/UI.

### 2. Usar una paleta clínica con acento de visión

**Decisión:** Orientar la identidad hacia tonos base azul petróleo/índigo suave para confianza y precisión, verde/teal para salud y confirmaciones, ámbar moderado para advertencias, rojo controlado para errores, y superficies claras/oscuro-marino con alto contraste.

**Rationale:** VisionTrack mezcla gestión clínica y enfoque visual. Una paleta calmada y médica comunica seguridad mejor que una estética excesivamente futurista, sin perder identidad tecnológica.

**Alternativas consideradas:**

- Mantener la paleta púrpura intensa actual: descartado como base dominante porque puede percibirse menos clínica y generar contrastes agresivos.
- Usar verde médico como color primario único: descartado porque reduce diferenciación entre acción primaria y estados de éxito.

### 3. Mejorar primero componentes compartidos antes que páginas individuales

**Decisión:** Implementar ajustes en `Sidebar`, `Topbar`, `AdminLayout`, `PatientLayout`, estilos globales y utilidades comunes antes de refinar páginas específicas.

**Rationale:** Navegación, búsqueda, fondo, foco, footer, estados activos y espaciado afectan todas las vistas. Resolverlos primero evita duplicar correcciones en cada página.

**Alternativas consideradas:**

- Rediseñar solo login y dashboard: descartado porque dejaría CRUDs, tablas y portal del paciente con experiencia inconsistente.

### 4. Crear patrones reutilizables de estados de UI

**Decisión:** Documentar y aplicar patrones para loading, empty, error, success, disabled, hover, focus-visible y active usando clases utilitarias consistentes, alertas existentes y componentes/patrones ligeros cuando el código lo justifique.

**Rationale:** El requisito principal es mejorar interacción. Los estados de UI hacen visible qué ocurre y reducen errores, especialmente en formularios, tablas y agenda de citas.

**Alternativas consideradas:**

- Resolver estados de forma local en cada pantalla sin patrón: descartado por inconsistencia y mayor costo de mantenimiento.

### 5. Localizar microcopy visible sin tocar identificadores técnicos

**Decisión:** Revisar textos visibles en login, guía UI, dashboards, formularios, estados y botones para español profesional, manteniendo intactos nombres de archivos, rutas, variables, roles y tipos existentes.

**Rationale:** El proyecto usa español como idioma principal, pero aún aparecen textos como “ADMINISTRATOR EMAIL”, “PASSWORD”, “FORGOT?”, “Server Operational” y otros. Localizar textos mejora comprensión sin afectar contratos técnicos.

**Alternativas consideradas:**

- Crear infraestructura i18n completa: descartado por alcance; la app requiere coherencia en español, no multilenguaje.

### 6. Accesibilidad como criterio transversal mínimo

**Decisión:** Añadir o mejorar foco visible, `aria-label`/`title` en acciones solo con icono, etiquetas de formularios, estados deshabilitados claros y contraste de estados.

**Rationale:** Diseño centrado en el usuario requiere que la interfaz pueda usarse con teclado, baja visión o tecnologías de asistencia. Además, el dominio clínico requiere claridad y baja ambigüedad.

**Alternativas consideradas:**

- Hacer auditoría WCAG exhaustiva en esta fase: diferido; esta propuesta cubre requisitos básicos de interacción accesible y deja auditorías completas para cambios específicos si se solicitan.

### 7. Mantener `UiGuide` como contrato visual interno

**Decisión:** Actualizar `UiGuide` para reflejar tokens, componentes, estados y lenguaje definidos por esta mejora.

**Rationale:** La guía ya existe y es el mejor punto para validar visualmente la paleta y comunicar convenciones a futuras implementaciones.

**Alternativas consideradas:**

- Eliminar `UiGuide`: descartado porque ayuda a controlar consistencia en cambios futuros.

## Risks / Trade-offs

- Cambio de paleta rompe contraste en componentes de Bootstrap/DataTables → Mitigación: actualizar tokens `--bs-*` junto con tokens de la app y revisar tablas, formularios y paginación.
- Ajustes globales pueden afectar páginas CRUD existentes → Mitigación: implementar en capas pequeñas y validar rutas representativas de administrador, médico/recepcionista y paciente.
- Mejoras visuales amplias pueden quedar subjetivas → Mitigación: usar criterios verificables de la spec: contraste, foco visible, estado activo, mensajes en español y acción principal clara.
- Mantener dependencias actuales limita algunos componentes avanzados → Mitigación: priorizar CSS/Tailwind y patrones React simples sobre nuevas librerías.
- La decisión de modo por defecto puede depender del entorno real de uso → Mitigación: conservar persistencia de tema y decidir el default durante implementación; si no hay preferencia institucional, preferir legibilidad clínica en modo claro.

## Migration Plan

1. Actualizar tokens globales y puente Bootstrap/DataTables en `src/index.css`.
2. Revisar `ThemeContext` solo si se decide cambiar el tema predeterminado; mantener persistencia en `localStorage`.
3. Refinar `Sidebar`, `Topbar`, `AdminLayout` y `PatientLayout` para navegación, búsqueda, foco y consistencia entre roles.
4. Localizar microcopy visible en login, guía UI, dashboards y componentes compartidos.
5. Aplicar patrones de estados en vistas representativas: login, dashboard administrativo, portal del paciente, tablas CRUD y agenda/citas.
6. Actualizar `UiGuide` con paleta, botones, formularios, tarjetas, estados y recomendaciones de uso.
7. Ejecutar `npm run build` para validar compilación y revisar manualmente rutas principales.

Rollback:

- Revertir los cambios del change si la paleta o los patrones afectan severamente la usabilidad.
- Como los contratos de API no cambian, el rollback se limita al frontend.

## Open Questions

- Confirmar si VisionTrack debe usar modo claro por defecto para contexto clínico. Esta decisión puede responderse durante implementación sin cambiar requisitos ni tareas.
- Confirmar si existe una identidad institucional oficial para colores o tono; si aparece después, se incorporará ajustando tokens sin cambiar la arquitectura propuesta.
