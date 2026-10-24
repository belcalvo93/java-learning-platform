# Design — C-12b `ui-polish`

## 1. Pase `/critique` de Impeccable sobre el estado previo (C-12)

Siguiendo `critique.md` y `craft-floor.md` de Impeccable, se evaluaron las 4 superficies principales (**Home**, **Mi Progreso**, **Lección abierta** y **Ejercicio / Ver Todos**):

1. **Home (Hero + Niveles + Lecciones)**:
   - *[P0 — Encoding]*: Los botones inyectados por `script-enhanced.js` en `.level-card` muestran `"?? Descargar Material de Estudio"` y `"?? Tomar Evaluaci?n"`.
   - *[P1 — Craft Floor: Clichés de IA]*: Botones y barras usan `linear-gradient(135deg, #ec4899, #8b5cf6)` con `box-shadow` de resplandor (`--shadow-glow`); las tarjetas de nivel y lección usan una banda gruesa superior/lateral de 4 px (`::before`), el hero centra absolutamente todo y usa una caja de métricas gigante (`52 / 4 / 208`), y los íconos de interfaz son emojis (`☕`, `🌱`, `🚀`, `⚡`, `👑`, `📚`, `🔲`, `⏱️`, `💻`).
   - *[P1 — Colorize]*: El fondo oscuro `#0b0d17` es excesivamente negro (alto cansancio visual por halación con texto blanco), y el color del nivel Intermedio (`#0284c7` / `#38bdf8`) es un celeste eléctrico que rompe la armonía.
2. **Sección "Mi Progreso" (`#progreso`)**:
   - *[P1 — Layout / Cards-in-cards]*: Hay tres cajas grises `.stat` dentro de `.total-progress-card`, y debajo 4 tarjetas con borde lateral de 3 px. El encabezado está centrado y el aviso `#local-only-notice` empieza con minúscula (`"ℹ️ tu progreso se guarda solo en este navegador."`).
   - *Corrección*: Composición editorial alineada a la izquierda, métricas separadas por filetes finos de `1px` (`border-right` / `border-top`) en lugar de cajas dentro de cajas, y tabla/grilla limpia de progreso por nivel con indicadores sobrios.
3. **Ventana de Lección (`#lesson-viewer`)**:
   - *[P2 — Craft Floor: Side-stripe & Emojis]*: `.info-box` usa borde izquierdo de 3 px azul brillante; los botones del pie usan emojis (`💻 Practicar`) y gradiente brillante en móvil.
   - *Corrección*: `.info-box` con superficie cálida sutil y borde fino uniforme de `1px`, íconos SVG inline en los botones del pie y acento sólido.
4. **Ventana de Ejercicio y "Ver Todos" (`#exercise-viewer`)**:
   - *[P0 — Editor Indent Guides]*: Al presionar `Tab` en una línea nueva (`"    "`), `if (!line.trim()) return -1` descarta la línea y no dibuja la guía vertical hasta que se escribe otro carácter.
   - *[P2 — Craft Floor: Nested boxes]*: En las tarjetas de lección, `.lesson-exercises-summary` es una caja con fondo y borde dentro de otra caja `.lesson-card`; debe integrarse con una línea divisoria fina superior (`1px solid var(--border-subtle)`) sin encerrar en otra sub-caja.

---

## 2. Sistema Tipográfico (`typeset.md`)

- **Familias cargadas vía `<link>` en `index.html`**:
  - **Display / Títulos (`--font-display`)**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` (`weights: 600, 700, 800`, `letter-spacing: -0.025em`, `text-wrap: balance`). Aporta carácter geométrico editorial y diferencia claramente los titulares del cuerpo.
  - **Cuerpo y UI (`--font-sans`)**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` (`weights: 400, 500, 600`, `16px` base, `line-height: 1.68` en claro / `1.72` compensado en oscuro, medida `62–70ch`).
  - **Código y datos tabulares (`--font-mono`)**: `'Fira Code', Consolas, monospace` (`font-variant-numeric: tabular-nums`).

---

## 3. Paleta y Modo Día/Noche (`colorize.md`)

Se reemplaza el negro profundo `#0b0d17` por un **pizarra azulado suave** (`#171b24`) y se eliminan los degradados rosa→violeta y los azules saturados:

| Token | Modo Oscuro (`data-theme="dark"`) | Modo Claro (`data-theme="light"`) | Uso y contraste WCAG AA |
|---|---|---|---|
| `--bg-primary` | `#171b24` (pizarra suave) | `#f6f7f9` (papel técnico frío) | Fondo principal de página |
| `--bg-secondary` | `#1c212c` | `#eef0f4` | Secciones alternas (`#progreso`, etc.) |
| `--bg-card` | `#212734` | `#ffffff` | Superficie de tarjetas y modales |
| `--bg-surface` | `#282f3e` | `#f1f3f7` | Controles secundarios, píldoras, barra de código |
| `--bg-editor` | `#141820` | `#f8f9fb` | Fondo del editor y bloques `<pre>` (adaptado a ambos temas) |
| `--text-primary` | `#e6eaf2` (11.8:1) | `#161a22` (14.6:1) | Texto principal y títulos |
| `--text-secondary` | `#a6b0c3` (6.4:1) | `#454f63` (7.5:1) | Párrafos secundarios y descripciones |
| `--text-muted` | `#7e899f` (4.6:1) | `#636e82` (4.9:1) | Metadatos, números de línea y notas al pie |
| `--accent-primary` | `#d95b72` (rosa carmín sobrio) | `#b8324f` (carmín editorial sólido) | Acción primaria (botones, foco, progreso activo) |
| `--accent-primary-hover` | `#e36d83` | `#9e2842` | Hover de acción primaria |
| `--level-beginner` | `#5ea88a` (salvia) | `#2f7a5e` (salvia profundo) | Nivel Principiante |
| `--level-intermediate` | `#6c96b3` (acero desaturado) | `#3d6682` (acero pizarra) | Nivel Intermedio (sin azul eléctrico) |
| `--level-advanced` | `#9c80be` (malva) | `#684b8c` (ciruela sobrio) | Nivel Avanzado |
| `--level-expert` | `#c28e5c` (ocre bronce) | `#8f5b2d` (bronce cálido) | Nivel Experto |
| `--editor-guide` | `rgba(166, 176, 195, 0.24)` | `rgba(69, 79, 99, 0.22)` | Guías verticales de indentación en ambos temas |

### Mecanismo del Selector Sol/Luna
- En `<head>` de `index.html`, un script inline mínimo resuelve el tema inicial:
  1. Lee `localStorage.getItem('javamaster_theme')` dentro de `try/catch`.
  2. Si es `'light'` o `'dark'`, lo asigna a `document.documentElement.dataset.theme`.
  3. Si no hay preferencia guardada, consulta `window.matchMedia('(prefers-color-scheme: light)').matches` y asigna `'light'` o `'dark'`.
- En el `.header` (arriba a la derecha, junto a `.nav-links`), el botón `#theme-toggle` (`min-width: 44px; min-height: 44px`) alterna entre `'dark'` y `'light'`, persiste en `localStorage` (con `try/catch`), actualiza `data-theme` en `<html>`, `aria-pressed` (`"true"` en modo oscuro, `"false"` en claro) y `aria-label` en español (`"Cambiar a modo claro"` / `"Cambiar a modo oscuro"`), mostrando el ícono SVG de **sol** cuando está en modo oscuro y de **luna** cuando está en modo claro.

---

## 4. Logo Geométrico Propio y Fondo Técnico Sutil

- **Logo SVG inline**: un monograma técnico de `28×28 px` con un marco octogonal de esquina recortada y el símbolo `{;}` en trazo geométrico preciso (`stroke-width="2"`), seguido de `JavaMaster` en `Plus Jakarta Sans` (`font-weight: 800`). No usa ni imita la taza de café de Java.
- **Fondo técnico sutil**: en `.hero` (con opacidad `0.045` en oscuro y `0.035` en claro) y en `body` (mitad de intensidad), una retícula de micro-puntos cada `24 px` combinada con un SVG de líneas de circuito/nodos estáticos en las esquinas del hero, sin animaciones molestas y respetando `prefers-reduced-motion`.

---

## 5. Restauración de Guías Verticales de Indentación (`editor-ux`)

En `script-enhanced.js` (`openExercise` → `renderGuides`):
- Antes: `if (!line.trim()) return -1;` hacía que cualquier línea compuesta solo por espacios (como la que resulta inmediatamente después de presionar `Tab`: `"    "`) devolviera `-1` y tomara `level = 0` si debajo no había otra línea indentada.
- Ahora:
  ```js
  const expanded = line.replace(/\t/g, '    ');
  const spaces = (expanded.match(/^ */) || [''])[0].length;
  if (!expanded.trim() && spaces === 0) return -1;
  return Math.floor(spaces / 4);
  ```
- De este modo:
  - En líneas sin indentación (`spaces < 4` y con texto, o vacías fuera de un bloque): `level = 0` → **0 guías**.
  - Al presionar `Tab` en una línea (`spaces = 4`), `raw[i] = 1` → se dibuja inmediatamente la guía vertical de ese nivel (`k = 0`), y con un segundo `Tab` (`spaces = 8`, `raw[i] = 2`) se dibujan las de nivel 1 y 2 (`k = 0, 1`).
  - Las líneas completamente vacías (`spaces === 0` y sin texto) dentro de un bloque indentado continúan la guía solo si tanto el bloque anterior como el siguiente están indentados (`Math.min(prev, nextLevel[i])`), evitando colas de guías debajo de la última línea.
