# Tasks — C-11b lesson-exercise-nav

> Strict TDD con `node --test`, sin framework nuevo. Navegador: `tools/browser-check.js`.
> No tocar `data.js`, `script.js`, validación ni consignas. No archivar sin orden de Belén.

## 1. Lógica pura de navegación (TDD)

- [x] 1.1 RED: `tools/lesson-nav.test.js` con casos de orden dentro de la lección (primero/medio/último, lección con varios ejercicios) y fin de lección; verificar que falla sin `lesson-nav.js`
- [x] 1.2 GREEN: `lesson-nav.js` (`getLessonExercises`, `getLessonNav`) hasta pasar; verificar suite en verde
- [x] 1.3 Tests y código de `readingLessonIds` (= [22, 25, 40, 42] derivado de los datos) y `groupExercisesByLesson` (208 ejercicios sin omitir ni duplicar, orden de lecciones); verificar en verde
- [x] 1.4 Tests y código de `isAvailable` (siempre `true` hoy) y de que `getLessonNav` la consulta (con regla reemplazada, el avance se deshabilita); verificar en verde

## 2. Integración en la UI

- [x] 2.1 Cargar `lesson-nav.js` en `index.html` antes de `script-enhanced.js`; verificar con `browser-check` sin errores de consola
- [x] 2.2 `openExercise`: Siguiente/Anterior dentro de la lección, "Siguiente Lección →" en el último ejercicio, estado vía `isAvailable`; verificar con casos de navegador
- [x] 2.3 Decorar tarjetas (grilla y módulos): cantidad + nombres, "lección de lectura" para 22/25/40/42, marca de bloqueo si no disponible; verificar con casos de navegador
- [x] 2.4 `showExercisesMenu` agrupado por lección; verificar total 208 y grupos con casos de navegador

## 3. Responsive de las ventanas de ejercicio, lección y Ver Todos (CSS)

- [x] 3.1 Reglas ≤ 768 px y ≤ 480 px para `#exercise-content` (acciones 1+2, navegación en columna, 44 px, nowrap, consigna ≥ 16 px del borde, editor ≥ 8 px, paneles anchos ≥ 85 %) y `#lesson-content` (texto de lectura ≥ 16 px del borde, botones del pie ≥ 12 px; a ≤ 480 px: "Practicar" arriba en fila completa con gradiente primario, "Marcar como completada" debajo, y "Anterior"/"Siguiente" mitad y mitad; en lecciones de lectura 22/25/40/42 sin "Practicar"; entre 481 y 768 px grilla 2×2); verificar a 360/390/424/768
- [x] 3.2 Botón "X" (`.lesson-close`) en su propio renglón sticky arriba a la derecha a ≤ 768 px (44×44 px, sin superponerse con título ni primer párrafo y visible/tocable al hacer scroll en lección, ejercicio y Ver Todos) + `minmax(0, 1fr)` y `overflow-wrap` para códigos inline largos
- [x] 3.3 Escritorio (> 768 px) sin cambios visibles

## 4. Pruebas de navegador y cierre

- [x] 4.1 Casos en `tools/browser-check.js`: navegación, responsive de ejercicio, pie de lección (4 botones y lecciones de lectura), márgenes horizontales en móvil (texto/consigna ≥ 16 px, botones del pie ≥ 12 px, editor ≥ 8 px), botón "X" sin superposición y sticky al hacer scroll en las 3 ventanas; verificar corrida completa en verde (147/147)
- [x] 4.2 Suite completa (`node --test`: 2741/2741) + `node tools/audit-validator.js` (52/208 PASA) + `git diff` vacío en `data.js` y `script.js`; verificar en verde
- [x] 4.3 Actualizar `CHANGES.md` y archivar `c-11b-lesson-exercise-nav`

## 5. Evidencia (2026-10-21)

- `node --test`: **2741/2741** en verde (incluye 21 tests en `tools/lesson-nav.test.js`).
- `node tools/browser-check.js`: **147/147** en verde (45 de validación + 102 de navegación, márgenes y responsive a 360, 390, 424 y 768 px en ventana de ejercicio, lección y Ver Todos), **0 errores JS propios en consola**.
- `node tools/audit-validator.js`: **208 ejercicios, invariante 52/208 PASA** (`ok=198, real=9, cheat=1`).
- `git diff -- data.js script.js`: vacío.
