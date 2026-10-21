# Proposal — C-12 `ui-redesign`

## Why
JavaMaster cuenta hoy con tres hojas de estilo superpuestas (`styles.css`, `colors-feminine.css` con decenas de `!important`, y `modules-view.css`), un `@import` bloqueante de fuentes en CSS, contrastes insuficientes en textos secundarios (`#b899a8` sobre fondos oscuros translúcidos), márgenes laterales apretados en móvil (≤ 480 px), la sección "Mi Progreso" pegada al desplegable de "Nivel Experto" con un fondo rosa saturado que dificulta la lectura, wrappers sobre `renderLessons` y `renderModulesView` en `script-enhanced.js`, y un banner de alerta azul ("ejecución no disponible — validando por reglas") que parece un fallo del sistema en vez de un estado normal.

## What Changes
- **Sistema de diseño unificado en `styles.css`**: tokens semánticos en un solo lugar (superficies, texto con contraste WCAG AA ≥ 4.5:1, acentos sobrios, colores distintivos para los 4 niveles, escala tipográfica con cuerpo ≥ 16 px, espaciados, radios, sombras y foco visible `:focus-visible`), con soporte de tema oscuro (base) y claro (`prefers-color-scheme: light`), respetando `prefers-reduced-motion`. `colors-feminine.css` y `modules-view.css` se integran de forma limpia sin cascadas de `!important`.
- **Carga de fuentes no bloqueante**: el `@import` de `styles.css` pasa a `<link>` en `index.html` (`Inter` para lectura/UI y `Fira Code` para código).
- **Resolución de los 8 pendientes de C-12**:
  1. Márgenes laterales cómodos en móvil (≤ 480 px): mínimo ~20 px en lectura de lecciones y consignas, y ~16 px en el contenedor del editor, sin desborde horizontal.
  2. Sección "Mi Progreso": separada con espaciado vertical amplio respecto a "Todas las Lecciones / Nivel Experto", rediseñada con jerarquía calma, tarjeta de resumen total y 4 barras claras identificadas por nivel.
  3. Tarjetas de lección sin wrappers: la decoración de ejercicios por tarjeta (cantidad, nombres clicables hacia cada ejercicio y badge "📖 Lección de lectura" para 22, 25, 40 y 42) se integra directamente en `renderLessons` y `renderModulesView` dentro de `script.js`, eliminando los wrappers de `script-enhanced.js`.
  4. Banner "ejecución no disponible": se reemplaza el bloque de alerta llamativo por un indicador discreto e integrado en el resultado ("Validado en el navegador"), conservando la cadena contractual en `script-enhanced.js`.
  5. "Ver Todos los Ejercicios": organizado por nivel y por lección con navegación rápida por nivel y sin tarjetas anidadas ni desborde en móvil.
  6. Navegación de lección y ejercicios en móvil: botones completos en 1 línea (≥ 44 px de alto) y botón `×` sticky arriba a la derecha sin tapar títulos.
  7. Código inline y bloques largos contenidos con `overflow-wrap` / scroll propio sin ensanchar el viewport.
  8. Función única de disponibilidad por nivel `LessonNav.isLevelAvailable(level)` en `lesson-nav.js` (hoy siempre `true`), conectada a `LessonNav.isAvailable` para el futuro bloqueo por nivel (C-19).

## Capabilities

### New Capabilities
- `ui-redesign`: Sistema de diseño unificado, legibilidad editorial para estudio de Java, organización por nivel/lección y adaptación móvil sin desborde.

### Modified Capabilities
- `lesson-exercise-nav`: Renderizado nativo de ejercicios en tarjetas de lección sin wrappers y punto único `isLevelAvailable(level)` para C-19.
- `exercise-mobile-layout`: Márgenes laterales ampliados en móvil (≥ 20 px en lectura de lección, ≥ 12–16 px en editor) y separación estructural de "Mi Progreso".

## Impact
- **Archivos modificados**: `index.html`, `styles.css`, `colors-feminine.css`, `modules-view.css`, `script.js` (solo presentación en `renderLessons`/`renderModulesView`), `script-enhanced.js`, `lesson-nav.js`, `tools/lesson-nav.test.js`, `tools/browser-check.js`, `CHANGES.md`.
- **Invariantes intactos**: `data.js` y `validator.js` sin tocar; 52 lecciones (15/15/12/10) y 208 ejercicios (62/58/48/40); cero librerías de producción nuevas.
