# Tasks: c-21-readme-update (C-21 readme-update)

## 1. Verificación de fuentes y redacción de README.md

- [x] 1.1 Comprobar la existencia y consistencia de todos los archivos y rutas a documentar (`LICENSE`, `index.html`, `styles.css`, `script.js`, `script-enhanced.js`, `data.js`, `validator.js`, `lesson-nav.js`, `guia-*.html`, `backend/server.js`, `docs/`, `tools/`).
- [x] 1.2 Escribir `README.md` estructurado con tabla de contenidos, cubriendo los 10 puntos solicitados en español rioplatense, con comandos reales y sin promesas de funcionalidades no implementadas ni secretos.

## 2. Actualización de roadmap en CHANGES.md

- [x] 2.1 Registrar `[C-20] real-execution-audit` como change pendiente en `CHANGES.md`.
- [x] 2.2 Registrar `[C-21] readme-update` en `CHANGES.md`.

## 3. Verificación de calidad y suites

- [x] 3.1 Ejecutar `node --test-concurrency=1 --test "tools/*.test.js"`.
- [x] 3.2 Ejecutar `node tools/browser-check.js`.
- [x] 3.3 Ejecutar `node tools/audit-validator.js`.
- [x] 3.4 Validar especificaciones con `npx openspec validate --specs` y validar change con `npx openspec validate c-21-readme-update`.
