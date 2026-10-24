# Tasks: C-12b UI Polish (`c-12b-ui-polish`)

## 1. Integridad UTF-8 y Tests de Codificación
- [x] 1.1 Crear `tools/encoding-integrity.test.js` que verifique ausencia de BOM, `U+FFFD`, secuencias de mojibake (`Ã³`, `Ã±`, `ðŸ`, `â€`) y `"??"` o `?` rotos en palabras con tilde en todos los archivos del frontend (`index.html`, `script.js`, `script-enhanced.js`, `lesson-nav.js`, `data.js`, `validator.js`, `styles.css`, `colors-feminine.css`, `modules-view.css`) y presencia de `<meta charset="utf-8">` en `index.html`.
- [x] 1.2 Corregir los textos rotos en `script-enhanced.js` (`Descargar Material de Estudio`, `Tomar Evaluación` y comentarios en líneas 407, 430-431) preservando UTF-8 sin BOM, y capitalizar `"Tu progreso se guarda solo en este navegador"` en `script.js` e `index.html`.
- [x] 1.3 Verificar que `data.js` y `validator.js` tengan cero diff en `git diff` y que `node --test tools/encoding-integrity.test.js` pase en verde.

## 2. Identidad Visual, Tipografía, Iconografía SVG y Modo Día/Noche
- [x] 2.1 Actualizar `index.html`: cargar `Plus Jakarta Sans`, `Inter` y `Fira Code` por `<link>`, inyectar script inicial de tema (`data-theme="dark|light"` según `localStorage` o `prefers-color-scheme`) en `<head>`, reemplazar el emoji `☕` por un logo SVG geométrico propio (`{;}`), agregar el botón `#theme-toggle` con íconos SVG de sol y luna en `.header`, alinear el hero y encabezados a la izquierda con decoración técnica SVG sutil, y reemplazar emojis de UI por íconos SVG inline de trazo fino.
- [x] 2.2 Actualizar `script.js` y `script-enhanced.js`: implementar `initThemeToggle()` con persistencia en `localStorage` (`try/catch`) y actualización de `aria-pressed` / `aria-label`, y reemplazar los emojis de interfaz en botones, tarjetas de nivel, lista de ejercicios y notificaciones por íconos SVG inline coherentes.
- [x] 2.3 Actualizar `styles.css`, `colors-feminine.css` y `modules-view.css` aplicando `/critique` y `/polish` de Impeccable: fondo oscuro pizarra más suave (`#171b24`) y tema claro cálido (`#f6f7f9`), acento primario sólido sobrio (`#d95b72` / `#b8324f`) sin gradientes rosa→púrpura, colores de nivel desaturados (bajando la intensidad del azul en Intermedio a `#6c96b3` / `#3d6682`), patrón técnico sutil en `.hero` y lienzo, y tarjetas sin franjas gruesas ni cajas anidadas.

## 3. Guías Verticales de Indentación en el Editor
- [x] 3.1 Corregir `renderGuides()` en `script-enhanced.js` para que las líneas con espacios de indentación (incluyendo líneas recién indentadas con `Tab` que aún solo contienen espacios) dibujen inmediatamente las guías de los niveles usados (`4` espacios por nivel) y las líneas sin indentar (`level === 0`) no dibujen ninguna guía.
- [x] 3.2 Ajustar `--editor-guide` y `.indent-guide` en `styles.css` para que las guías de `1px` sean nítidas y sutiles tanto en `data-theme="dark"` como en `data-theme="light"`.

## 4. Verificación en Navegador, Capturas y Cierre OpenSpec
- [x] 4.1 Ampliar `tools/browser-check.js` con chequeos de: (a) botones de nivel con `"Tomar Evaluación"` y `"Descargar Material de Estudio"` sin `?`, (b) funcionamiento y accesibilidad de `#theme-toggle` alternando `data-theme="dark"` y `data-theme="light"`, y (c) guías de indentación en `#code-editor` al escribir código con `Tab` en ambos temas.
- [x] 4.2 Ejecutar `node --test "tools/*.test.js"`, `node tools/browser-check.js` y `node tools/audit-validator.js` (`52/52` lecciones, `208/208` ejercicios, `ok=198, real=9, cheat=1`).
- [x] 4.3 Tomar capturas con Playwright a `360`, `390` y `1280 px` en modo claro y modo oscuro de: inicio (hero + niveles), Mi progreso, lección abierta, ejercicio con código indentado y Ver Todos; inspeccionarlas visualmente y eliminar cualquier script temporal.
- [x] 4.4 Marcar tareas completadas, archivar `c-12b-ui-polish` en `openspec/changes/archive/2026-10-21-c-12b-ui-polish/`, validar con `openspec validate --specs` y actualizar `CHANGES.md`.
