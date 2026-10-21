# Design

## Context

- La navegación del visor de ejercicio vive en `script-enhanced.js`
  (`openExercise`, `showExercisesMenu`): usa `exercisesData[index ± 1]`, o sea el
  orden global. Las tarjetas de lección las dibuja `script.js` (`renderLessons` y
  `renderModulesView`), que NO se puede tocar en este change.
- Los ejercicios ya traen `lessonId` (C-16). Las lecciones sin ejercicios son
  22, 25, 40 y 42 (se derivan de los datos, no se hardcodean).
- El visor de ejercicio reutiliza `.lesson-viewer`/`.lesson-content`; los
  botones usan `.btn-primary`, `.btn-secondary` y `.nav-btn` (este último, con
  `!important` en `colors-feminine.css`). Las cajas de errores/pista llevan estilos
  en línea (`padding: 1rem`, `margin-left: 1.5rem`).
- Las guías de indentación del editor se posicionan con `var(--spacing-md)`, el
  mismo valor que el relleno del textarea y del gutter.

## Goals / Non-Goals

**Goals:**
- Lógica de navegación pura y testeable en Node, separada del DOM.
- Una sola función de disponibilidad, consultada en un solo lugar de la UI.
- Cambios responsive solo a ≤ 480 px (y desborde seguro a ≤ 768 px), acotados al
  visor de ejercicio, sin alterar escritorio.

**Non-Goals:**
- No se implementa el bloqueo por nivel (C-19) ni exámenes (C-15).
- No se toca `data.js`, `script.js`, validación, consignas ni conteos.
- No se rediseña la identidad visual (eso es C-12).

## Decisions

1. **Módulo nuevo `lesson-nav.js` con funciones puras** (`getLessonExercises`,
   `getLessonNav`, `groupExercisesByLesson`, `readingLessonIds`, `isAvailable`),
   expuesto como `window.LessonNav` y por `module.exports` para Node.
   *Alternativa:* meter la lógica en `script-enhanced.js`; descartada porque no se
   puede probar sin navegador y mezcla lógica con DOM.
2. **No editar `script.js`:** las tarjetas se decoran envolviendo `renderLessons`
   y `renderModulesView` desde `script-enhanced.js` (mismo patrón que ya usa
   `openLesson`). La tarjeta se identifica por el `#id` de `.lesson-id`.
   *Alternativa:* editar `renderLessons` en `script.js`; descartada por la regla
   de no tocar ese archivo.
3. **`isAvailable(kind, id)` en `LessonNav`**, siempre `true` hoy. La UI la llama
   siempre a través del objeto (`LessonNav.isAvailable(...)`) para que activar C-19
   sea reemplazar esa única función. Se consulta para: botón de avance (siguiente
   ejercicio o siguiente lección) y marca de bloqueo en tarjetas.
4. **Fin de lección:** el botón de avance del último ejercicio se transforma en
   "Siguiente Lección →" (abre la lección siguiente en el visor de lecciones); si
   no hay lección siguiente queda deshabilitado. "Volver a Lecciones" ya existe.
5. **Listado agrupado:** `showExercisesMenu` itera `groupExercisesByLesson`
   (omite lecciones sin ejercicios y las menciona en una línea de aviso). Mantiene
   el título con el total (208) y el botón Cerrar.
6. **CSS responsive acotado con selectores `#exercise-content`** (la tarjeta del
   visor de ejercicio), para no alterar lecciones, evaluaciones ni certificado:
   - ≤ 768 px: `flex-wrap` en navegación y acciones (red de seguridad contra
     desborde).
   - ≤ 480 px: acciones en grilla de 2 columnas con "Verificar" ocupando ambas;
     navegación en una columna (los textos de 20–27 caracteres no entran en
     mitades de 150–190 px sin partirse), con "Siguiente" primero y destacado;
     `white-space: nowrap` y `min-height: 44px` en los siete botones.
   - Márgenes: tarjeta con margen `0.25rem` y relleno `0.5rem`; editor con
     relleno `0.375rem`; `--spacing-md` se redefine localmente en
     `.editor-with-gutter` para que textarea, gutter y guías de indentación sigan
     alineados al reducir el relleno.
   - Paneles de resultado/errores/pista: se pisa el estilo en línea con
     `!important` acotado a `#exercise-result` (menos relleno y menos sangría de
     lista). *Alternativa:* cambiar el HTML generado para usar clases; descartada
     para no tocar la lógica de resultados (mínima estructura).
7. **Verificación visual de escritorio por comparación de capturas** (antes/después
   a 1280, 1024 y 800 px) en vez de aserciones de estilos sueltas.

## Risks / Trade-offs

- [Envolver `renderLessons`/`renderModulesView` depende del orden de carga] →
  `lesson-nav.js` y `script-enhanced.js` se cargan después de `script.js`; el test
  de navegador comprueba que las tarjetas salen decoradas.
- [Tarjetas más altas por la lista de ejercicios] → es lo pedido; la lista se
  limita al ancho de la tarjeta y no cambia el grid.
- [`!important` sobre estilos en línea] → acotado a `#exercise-result` y solo a
  ≤ 480 px; escritorio no se afecta.
- [Redefinir `--spacing-md` en el editor] → solo dentro de `.editor-with-gutter` a
  ≤ 480 px; las guías de indentación usan la misma variable y siguen alineadas.
