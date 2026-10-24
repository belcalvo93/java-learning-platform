# Tasks — C-12 `ui-redesign`

> Flujo OpenSpec + TDD (`node --test`) + verificación automatizada con `tools/browser-check.js` y capturas con `playwright-cli`.
> Prohibido tocar `data.js`, `validator.js` o conteos 52/208. Prohibido hacer `git commit` o `git push`.

## 1. Disponibilidad por nivel y render limpio de tarjetas (TDD)

- [x] 1.1 RED: agregar tests en `tools/lesson-nav.test.js` para `LessonNav.isLevelAvailable(level)` (devuelve `true` hoy para los 4 niveles y bloquea lecciones/ejercicios del nivel cuando se reemplaza)
- [x] 1.2 GREEN: implementar `isLevelAvailable` en `lesson-nav.js` y conectarla con `isAvailable`; verificar `node --test tools/lesson-nav.test.js` en verde
- [x] 1.3 Integrar el resumen de ejercicios y estado de disponibilidad directamente en `renderLessons` y `renderModulesView` dentro de `script.js` (con clic directo a cada ejercicio) y eliminar los wrappers de `script-enhanced.js`

## 2. Estructura HTML, aviso discreto y "Ver Todos" por nivel y lección

- [x] 2.1 Pasar la carga de fuentes Google Fonts (`Inter` + `Fira Code`) a `<link>` en `index.html` y quitar `@import` de `styles.css`
- [x] 2.2 Desanidar `<section id="progreso">` fuera de `<section id="lecciones">` en `index.html` y estructurar las 4 tarjetas/barras por nivel con semántica clara
- [x] 2.3 Reemplazar el banner azul "ejecución no disponible" en `displayValidationResult` (`script-enhanced.js`) por un indicador discreto (`.validation-mode-note`), manteniendo el contrato de tests
- [x] 2.4 Organizar `showExercisesMenu()` ("Ver Todos") por nivel y por lección con filtro rápido por nivel y filas `.exercise-item` sin tarjetas anidadas

## 3. Sistema de diseño CSS y resolución de márgenes/responsive

- [x] 3.1 Consolidar tokens de diseño en `styles.css` (Dirección A *Atelier Nocturno Editorial*, modo oscuro base + modo claro `prefers-color-scheme: light`, colores de los 4 niveles, tipografía ≥ 16 px, `:focus-visible`, `prefers-reduced-motion`) y limpiar `colors-feminine.css` y `modules-view.css`
- [x] 3.2 Ajustar márgenes laterales en móvil (≤ 480 px): ≥ 20 px en lectura de lección y consigna, ≥ 15–16 px en editor de código, botones ≥ 44 px en 1 línea, botón `×` sticky sin superposición y contención de código largo
- [x] 3.3 Aplicar pase de `/critique` y `/polish` de Impeccable sobre inicio, lección, ejercicio, "Mi Progreso" y "Ver Todos"

## 4. Verificación automatizada, capturas y archivo OpenSpec

- [x] 4.1 Ampliar `tools/browser-check.js` con los casos de C-12 (márgenes ≥ 20 px en lección y ≥ 15 px en editor a ≤ 480 px, separación de "Mi Progreso" ≥ 48 px y 4 barras por nivel, tarjetas sin wrappers con clic a ejercicio, "Ver Todos" agrupado por nivel y lección sin overflow, `isLevelAvailable`, aviso discreto) y verificar en verde a 360, 390, 424 y 768 px
- [x] 4.2 Tomar capturas en 360, 390 y 1280 px (inicio, lección, ejercicio, "Mi Progreso" y "Ver Todos") en carpeta temporal fuera del repo, inspeccionarlas visualmente y verificar `node --test "tools/*.test.js"` + `node tools/audit-validator.js`
- [x] 4.3 Sincronizar specs, archivar `c-12-ui-redesign` en `openspec/changes/archive/` y actualizar `CHANGES.md` con C-12 en `[x]`
