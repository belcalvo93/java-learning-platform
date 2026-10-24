# Tasks

## 1. Actualización de tokens en styles.css

- [x] 1.1 Reemplazar variables CSS en `:root, html[data-theme="dark"]` con la nueva paleta verde (#021F1D base, #132E2B tarjetas, #27413E superficies elevadas, #011413 editor, #E5E7EB texto, #10B981 menta, #E57389 rosa, bordes y guías verdes).
- [x] 1.2 Ajustar variables en `html[data-theme="light"]` y `@media (prefers-color-scheme: light)` incorporando el verde menta (#0B7A57) para progreso, completado y éxito.
- [x] 1.3 Verificar que no queden valores de gris pizarra (#171b24, #1c212c, #212734, #282f3e y rgb/rgba asociados) en `styles.css`, `colors-feminine.css` y `modules-view.css`.

## 2. Ajuste de tests y browser-check

- [x] 2.1 Actualizar `tools/encoding-integrity.test.js` para reflejar el nuevo `--bg-primary: #021f1d`.
- [x] 2.2 Ampliar `tools/browser-check.js` con verificaciones de: (a) color de fondo del body en modo oscuro = `#021F1D` (rgb(2, 31, 29)), (b) contraste de texto principal >= 4.5:1 y (c) contraste de acento menta/rosa sobre superficies.

## 3. Verificación con suite, Playwright y capturas

- [x] 3.1 Ejecutar `node --test "tools/*.test.js"`, `node tools/browser-check.js` y `node tools/audit-validator.js`.
- [x] 3.2 Generar capturas con Playwright fuera del repositorio en modo oscuro y claro (360 px y 1280 px: inicio, niveles, Mi progreso, lección, ejercicio, Ver Todos).
- [x] 3.3 Revisar visualmente las capturas, eliminar el script helper de capturas y verificar que `openspec validate --specs` pase.
