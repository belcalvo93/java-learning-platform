# Design — C-12 `ui-redesign`

## Context
JavaMaster es una plataforma gratuita de estudio y práctica de Java en español creada por Belén Calvo. Según las guías de Impeccable (`mode-read.md`, `mode-operate.md`, `typeset.md`, `colorize.md`, `layout.md`, `craft-floor.md`), la plataforma combina dos modos de uso:
- **Read (Lecciones y guías)**: el estudiante lee explicaciones conceptuales, ejemplos comentados y reglas de oro. Necesita medida de línea controlada (60–72 ch), cuerpo ≥ 16 px (`1.05rem` en lectura), interlineado generoso (`1.7`) y márgenes laterales amplios en móvil (≥ 20 px).
- **Operate (Editor de ejercicios y navegador de curso)**: el estudiante escribe código Java, verifica su solución y recorre 52 lecciones y 208 ejercicios. Necesita jerarquía escaneable, estados semánticos claros y controles táctiles ≥ 44 px.

## Direcciones Visuales Evaluadas

### Dirección A — *Atelier Nocturno Editorial* (Elegida)
- **Descripción**: Evolución madura y serena de la identidad original de JavaMaster. Sustituye el fondo púrpura saturado y los bloques fucsias estridentes por una pizarra índigo profunda (`#0d1021`), superficies elevadas con tinte frío (`#151932` / `#1c2242`) y un acento principal ciruela-coral refinado (`#e85d88` → `#8b5cf6`) reservado para acciones primarias. Incluye tema claro automático (`#f7f8fc` / `#ffffff`) vía `prefers-color-scheme: light`.
- **Paleta base y niveles**:
  - Canvas oscuro: `#0d1021` · Superficie tarjeta: `#151932` · Superficie elevada/modal: `#181d38`
  - Texto primario: `#f3f5fb` (contraste 16.4:1) · Texto secundario: `#cbd2e6` (contraste 10.8:1) · Texto sutil: `#94a0b8` (contraste 5.7:1, pasa WCAG AA)
  - Acento primario: `#e15b85` / `#7c5dfa` · Foco accesible: `#60a5fa`
  - Identidad de los 4 niveles (sobria y semántica):
    - 🌱 **Principiante**: Esmeralda sereno `#34d399` (claro: `#059669`)
    - 🚀 **Intermedio**: Azul cielo `#38bdf8` (claro: `#0284c7`)
    - ⚡ **Avanzado**: Violeta amatista `#a78bfa` (claro: `#7c3aed`)
    - 👑 **Experto**: Ámbar dorado `#fbbf24` (claro: `#d97706`)
- **Tipografía**: `Inter` (400, 500, 600, 700) para interfaz y lectura larga (`16px` base, `1.0625rem` en lectura con `line-height: 1.72` y medida máx. `68ch`); `Fira Code` (400, 500, 600) con ligaduras y `font-variant-numeric: tabular-nums` para el editor Java, bloques de código y contadores.

### Dirección B — *Cuaderno Técnico Helvético*
- **Descripción**: Estética de manual impreso suizo con fondo papel cálido (`#f5f3ef`), bordes negros de 1 px sin radios y acento bermellón.
- **Paleta**: `#f5f3ef`, `#141413`, `#d94e34`, `#2563eb`.
- **Tipografía**: `Plus Jakarta Sans` + `JetBrains Mono`.
- **Descarte**: Rompe por completo con la identidad reconocible de JavaMaster y cae en el cliché de "papel crema + terracota" desaconsejado por `frontend-design`.

### Dirección C — *Terminal Cyber-Neon*
- **Descripción**: Negro puro (`#07070a`) con bordes cian/verde ácido brillantes y estética de consola hacker.
- **Paleta**: `#07070a`, `#11131a`, `#00f5d4`, `#ffbe0b`.
- **Tipografía**: `Space Grotesk` + `Fira Code`.
- **Descarte**: Genera fatiga visual en lectura prolongada de teoría (modo *Read*) y resulta intimidante para quienes están dando sus primeros pasos en Java.

### Justificación de la elección (Dirección A)
1. **Calma y legibilidad (WCAG AA+)**: eleva el contraste del texto secundario y sutil por encima de 5.7:1, elimina el fondo fucsia saturado de "Mi Progreso" y da un entorno de lectura descansado tanto en oscuro como en claro.
2. **Continuidad con identidad propia**: conserva el carácter acogedor de la autora (guiños rosa-ciruela e índigo) pero con disciplina editorial, sin gradientes de texto decorativos ni tarjetas anidadas.
3. **Claridad funcional en los 4 niveles**: cada nivel (Principiante, Intermedio, Avanzado, Experto) tiene su propio token de color, borde e indicador de progreso consistente en tarjetas de nivel, acordeones de módulos, barras de "Mi Progreso" y grupos de "Ver Todos".

## Decisiones Técnicas para los 8 Pendientes

1. **Márgenes laterales en móvil (≤ 480 px)**:
   - En `#lesson-viewer`: el modal usa contenedor con `margin: 0.375rem` (`6 px`) y `#lesson-content` usa `padding: 1.125rem 0.875rem` (`14 px` + `1 px` borde + `6 px` = **21 px** libres a cada lado del texto de lectura, superando el mínimo de ~20 px).
   - En `#exercise-viewer`: `#exercise-content` deja **≥ 20 px** laterales para el título y la consigna (`#exercise-content > h2, #exercise-content > p`), y **16 px** laterales para `.exercise-editor` (`6 px` margen de tarjeta + `1 px` borde + `9 px` padding/margen = `16 px` a cada borde de la ventana), manteniendo las cajas de error y pista ≥ 85 % del ancho de la tarjeta.
2. **Separación y rediseño de "Mi Progreso"**:
   - Se corrige el anidamiento HTML en `index.html`: `<section id="progreso" class="progress-section">` pasa a ser una sección hermana (fuera de `<section id="lecciones">`), con separación vertical explícita (`margin-top: 4.5rem`, `padding: 4rem 0`) y borde superior sutil.
   - Se reemplaza el fondo rosa plano de toda la sección por una superficie estructurada: tarjeta principal de resumen + grilla de 4 tarjetas de nivel con barra de progreso coloreada según la identidad de cada nivel (`--level-beginner`, `--level-intermediate`, `--level-advanced`, `--level-expert`) y porcentaje tabular.
3. **Integración limpia de tarjetas de lección sin wrappers**:
   - Se añade el helper `buildLessonExercisesSummary(lessonId)` directamente en `script.js` y se invoca dentro de `renderLessons` y `renderModulesView`.
   - Cada tarjeta incluye `data-lesson-id`, la clase `lesson-locked` según `LessonNav.isAvailable('lesson', lesson.id)`, el badge `📖 Lección de lectura` en las lecciones 22, 25, 40 y 42, o el contador `💻 N ejercicios` + lista `.lesson-exercise-list` donde cada `<li>` permite abrir ese ejercicio directamente (`event.stopPropagation(); openExercise(ex.id)`).
   - Se eliminan los wrappers `window.renderLessons = ...` y `window.renderModulesView = ...` de `script-enhanced.js`.
4. **Aviso discreto en lugar del banner "ejecución no disponible"**:
   - En `displayValidationResult` (`script-enhanced.js`), el aviso de modo local deja de renderizarse como un bloque de alerta azul prominente encima del veredicto y pasa a ser una nota discreta al pie del resultado (`.validation-mode-note`: *"Validado en tu navegador"* con `data-notice="${options.notice}"`), conservando intactas las constantes `DEGRADED_MESSAGE` para cumplir el contrato de `frontend-no-backend.test.js`.
5. **"Ver Todos" organizado por nivel y lección**:
   - `showExercisesMenu()` agrupa los 48 grupos de lección (`.exercise-group[data-lesson-id]`) bajo 4 bloques de nivel (`Principiante`, `Intermedio`, `Avanzado`, `Experto`) con barra de filtro rápido por nivel al inicio del modal.
   - Los ítems individuales usan `.exercise-item` (fila limpia, sin la clase `.lesson-card` anidada) evitando el anti-patrón de tarjetas anidadas.
6. **Navegación y botón `×` en móvil**:
   - Se preservan los botones de `min-height: 44px`, texto en una sola línea (`white-space: nowrap`) sin cortes, y el botón `.lesson-close` sticky (`44×44 px`) en su propio renglón superior derecho sin tapar títulos ni párrafos.
7. **Contención de código largo**:
   - Código inline (`code:not(pre code)`) con `overflow-wrap: anywhere` y bloques `pre` con `overflow-x: auto` contenido (`max-width: 100%`), garantizando `scrollWidth <= clientWidth` en toda la página.
8. **Punto único de disponibilidad por nivel (`C-19`)**:
   - En `lesson-nav.js`, se define `LessonNav.isLevelAvailable(level)` que hoy devuelve siempre `true`. `LessonNav.isAvailable(kind, id)` sigue siendo el punto de consulta de lecciones/ejercicios y delega en `isLevelAvailable` cuando recibe o resuelve el nivel.
