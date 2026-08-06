## 1. Base visual y tokens

- [x] 1.1 Actualizar la paleta semántica en `src/index.css` para modo claro y oscuro con enfoque clínico/visual y contraste suficiente.
- [x] 1.2 Ajustar variables `--bs-*` para que Bootstrap, DataTables, inputs, paginación y enlaces respeten la nueva paleta.
- [x] 1.3 Revisar utilidades globales de foco, hover, active, disabled, `glass-card`, `glow-input`, fondos atmosféricos y tarjetas para coherencia visual.
- [x] 1.4 Decidir y aplicar el tema predeterminado en `ThemeContext` si no existe valor persistido en `localStorage`, priorizando legibilidad clínica.

## 2. Componentes compartidos de navegación e interacción

- [x] 2.1 Mejorar `Sidebar` para que estados activos, grupos expandidos, vista colapsada, iconos faltantes y accesibilidad por teclado sean claros.
- [x] 2.2 Mejorar `Topbar` para que búsqueda, cambio de tema, notificaciones y perfil tengan foco visible, nombres accesibles y espaciado consistente.
- [x] 2.3 Ajustar `AdminLayout` y `PatientLayout` para mantener jerarquía visual, superficies, espaciado y contexto de rol consistentes.
- [x] 2.4 Revisar navegación y layout en tamaños pequeños, documentando o corrigiendo cualquier bloqueo crítico de acceso al menú.

## 3. Microcopy y jerarquía centrada en usuario

- [x] 3.1 Localizar textos visibles pendientes en `Login`, `UiGuide`, dashboards, botones, etiquetas, placeholders y estados al español profesional.
- [x] 3.2 Estandarizar encabezados de página con título, descripción breve y acción principal cuando aplique.
- [x] 3.3 Revisar tarjetas de métricas, acciones rápidas y módulos del portal del paciente para priorizar información clínica útil.
- [x] 3.4 Asegurar que acciones primarias, secundarias, destructivas y de confirmación tengan etiquetas y estilos consistentes.

## 4. Estados de UI y formularios

- [x] 4.1 Aplicar patrones verificables para loading, empty, error, success y disabled en vistas representativas con formularios y tablas.
- [x] 4.2 Mejorar validaciones y ayudas visibles en formularios de autenticación, usuarios, pacientes, doctores, citas y roles/permisos donde corresponda.
- [x] 4.3 Confirmar que acciones sensibles de crear, actualizar, cancelar o eliminar información muestren confirmación o feedback suficiente.
- [x] 4.4 Revisar mensajes de error de red/autenticación/datos para que estén en español y orienten recuperación.

## 5. Páginas representativas

- [x] 5.1 Refinar `Login` para comunicar confianza, propósito clínico, estado de envío, error recuperable y etiquetas en español.
- [x] 5.2 Refinar `Dashboard` administrativo para jerarquía, métricas, acciones rápidas y textos acordes a VisionTrack.
- [x] 5.3 Refinar portal del paciente (`PatientDashboard`, citas, historial, perfil y agenda) para tareas frecuentes, estados vacíos y acciones claras.
- [x] 5.4 Revisar páginas CRUD con DataTables para consistencia de controles, estados, tabla, paginación, búsqueda y botones.
- [x] 5.5 Revisar vistas con calendario/citas para que disponibilidad, selección, errores y confirmaciones sean comprensibles.

## 6. Accesibilidad y guía visual

- [x] 6.1 Añadir o corregir `aria-label`, `title`, etiquetas asociadas y foco visible en acciones solo con icono o controles personalizados.
- [x] 6.2 Verificar navegación por teclado en login, navegación lateral, topbar, formularios, tablas y acciones principales.
- [x] 6.3 Actualizar `UiGuide` con nueva paleta, tipografía, botones, formularios, tarjetas, alertas, estados vacíos/carga y reglas de uso.
- [x] 6.4 Validar que la interfaz no dependa únicamente del color para comunicar estado o prioridad.

## 7. Validación

- [x] 7.1 Ejecutar `npm run build` y corregir errores introducidos por la implementación.
- [x] 7.2 Ejecutar `npm run lint` y documentar si permanecen errores preexistentes no relacionados con este cambio.
- [x] 7.3 Revisar manualmente rutas principales por rol: `/login`, `/admin/dashboard`, páginas CRUD clave y `/portal/dashboard`.
- [x] 7.4 Validar visualmente modo claro y modo oscuro en pantallas representativas.
- [x] 7.5 Ejecutar `openspec validate mejorar-ux-ui-diseno --strict` y corregir problemas de los artefactos o specs.

### Notas de validación

- `npm run build` pasa. Vite mantiene warning de chunk >500 kB ya conocido.
- `npm run lint` mantiene 24 errores conocidos/preexistentes registrados en Engram (reglas de hooks en efectos/top-level, `any`, fast refresh). No se corrigieron por estar fuera del alcance UX/UI.
- Revisión visual local realizada con Chrome headless en `/login`: desktop claro, móvil claro y desktop oscuro.
- La iconografía se migró a `SymbolIcon` con FontAwesome para no depender de la fuente remota Material Symbols durante validación/offline.
