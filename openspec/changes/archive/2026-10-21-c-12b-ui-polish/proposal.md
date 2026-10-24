# Proposal — C-12b `ui-polish`

## Why

Tras revisar en el navegador el estado resultante de C-12, se detectaron 5 puntos de calidad visual y técnica que deben resolverse antes de cerrar el rediseño en la rama `c-12-ui-redesign`:

1. **Texto roto (`"??"`) y encoding**: en `script-enhanced.js` quedaron caracteres `?` y `??` reemplazando emojis y vocales acentuadas en los botones de las tarjetas de nivel (`"?? Descargar Material de Estudio"` y `"?? Tomar Evaluaci?n"`) y en comentarios internos, producto de haber ejecutado una sustitución inline desde PowerShell 5.1 que re-encodeó caracteres fuera de ASCII. Además, el aviso de progreso local (`"tu progreso se guarda solo en este navegador"`) empieza con minúscula.
2. **Clichés visuales de diseño generado por IA**: degradados rosa→violeta en botones y barras, uso de emojis como íconos de interfaz, tarjetas repetitivas con bordes gruesos coloreados (`border-left` / `border-top` > 1 px), cajas anidadas dentro de cajas, sombras de brillo (`shadow-glow`), exceso de centrado y un celeste/azul demasiado intenso en el nivel Intermedio y en el modo oscuro (que además tenía un fondo excesivamente negro `#0b0d17`).
3. **Falta de selector manual de modo día/noche**: el tema dependía únicamente de `@media (prefers-color-scheme: light)` sin botón sol/luna en el header ni persistencia en `localStorage` con `data-theme` en `<html>`.
4. **Logo de taza de café y falta de textura técnica sutil**: el emoji `☕` como logo debe reemplazarse por una marca geométrica propia en SVG inline (`{;}` / llaves y punto y coma técnicos de Java, sin usar ni imitar la taza oficial de Java) acompañada de un fondo con patrón técnico sutil (cuadrícula de precisión y nodos de circuito de muy baja opacidad).
5. **Guías verticales de indentación al presionar `Tab`**: cuando el usuario presiona `Tab` en una línea vacía del editor (`"    "`), `renderGuides()` descartaba la línea con `if (!line.trim()) return -1`, impidiendo que se dibuje la guía del nivel recién indentado hasta escribir un carácter visible.

## What Changes

- **Reparación de encoding UTF-8 sin BOM y test preventivo (`tools/encoding-integrity.test.js`)**:
  - Restaurar en `script-enhanced.js` los textos íntegros (`Descargar Material de Estudio`, `Tomar Evaluación`, comentarios con tildes) y capitalizar `"Tu progreso se guarda solo en este navegador"` en `script.js` e `index.html`.
  - Crear `tools/encoding-integrity.test.js` que verifica ausencia de BOM, `U+FFFD`, mojibake (`Ã³`, `Ã±`, `ðŸ`, `â€`) y `??` en los archivos del frontend, más aserción en `tools/browser-check.js` para `"Tomar Evaluación"`.
- **Refinamiento visual bajo las guías de Impeccable (`typeset`, `colorize`, `layout`, `critique`, `polish`, `craft-floor`)**:
  - **Sin degradados en botones ni barras**: acento principal sólido y sobrio (terracota/carmín editorial `#c24158` en claro / `#e05a70` en oscuro).
  - **Cero emojis como íconos de UI**: set de íconos SVG inline de trazo fino (`1.75px`, `stroke-linecap="round"`, `stroke-linejoin="round"`) para niveles, metadatos de lección, botones de acción, navegación, certificado y selector de tema (conservando emojis únicamente dentro del contenido pedagógico de `lessonsData` donde ya estaban).
  - **Sin cajas dentro de cajas ni rayas laterales gruesas**: jerarquía por tipografía (`Plus Jakarta Sans` para titulares + `Inter` para lectura + `Fira Code` para código, cargadas por `<link>`), líneas divisorias de `1px`, alineación a la izquierda en hero, encabezados de sección y bloques de progreso.
  - **Paleta de niveles desaturada y armónica** (bajando drásticamente la saturación del azul en Intermedio):
    - Principiante: salvia esmeralda desaturado (`#3d8b6e` / `#5ea88a`)
    - Intermedio: pizarra acero suave (`#4a7491` / `#6c96b3`, sin celestes brillantes)
    - Avanzado: ciruela malva sobrio (`#7a5c9e` / `#9c80be`)
    - Experto: bronce ocre cálido (`#9e6b3b` / `#c28e5c`)
- **Modo día/noche con botón sol/luna y fondo oscuro pizarra suave**:
  - Fondo oscuro pizarra azulado más claro y descansado (`#171b24` canvas, `#1e2430` superficie, `#242b38` elevada) y modo claro papel cálido (`#f6f7f9` canvas, `#ffffff` superficie, `#eef1f5` secundaria), ambos con contraste WCAG AA+.
  - Script inline mínimo en `<head>` que lee `localStorage.getItem('javamaster_theme')` (con `try/catch`) o `prefers-color-scheme` y aplica `data-theme="dark|light"` en `<html>` antes del primer pintado.
  - Botón `#theme-toggle` arriba a la derecha del `.header` con íconos SVG de sol y luna, `aria-label` en español, `aria-pressed`, foco visible y área táctil `≥ 44×44 px` en escritorio y móvil.
- **Logo propio en SVG inline y fondo técnico sutil**:
  - Marca geométrica en SVG inline basada en llaves y punto y coma (`{;}`) dentro de un octágono/retícula técnica + texto `JavaMaster`.
  - Patrón técnico sutil de cuadrícula de puntos y trazos de nodo en el hero (y atenuado en el lienzo), respetando `prefers-reduced-motion`.
- **Restauración de guías verticales de indentación en el editor**:
  - En `renderGuides()` (`script-enhanced.js`), calcular la indentación de toda línea que tenga espacios iniciales (`spaces >= 4`), incluso si aún no tiene texto detrás del `Tab`, y no dibujar guías en líneas sin indentación (`level === 0`).
  - Agregar pruebas en `tools/browser-check.js` que simulen `Tab` y verifiquen que las guías aparecen únicamente en los niveles usados y en ambos temas.

## Impact

- **Archivos modificados**: `index.html`, `styles.css`, `colors-feminine.css`, `modules-view.css`, `script.js`, `script-enhanced.js`, `tools/browser-check.js`, `tools/encoding-integrity.test.js` (nuevo).
- **Archivos intocados**: `data.js`, `validator.js`, `lesson-nav.js`, `.nojekyll`.
