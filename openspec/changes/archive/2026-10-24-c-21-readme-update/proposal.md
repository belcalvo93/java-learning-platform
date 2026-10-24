# Proposal: c-21-readme-update (C-21 readme-update)

## Why

El `README.md` del proyecto no refleja con precisión el estado consolidado de la plataforma tras los cambios completados en el frontend (`C-07` publicación en GitHub Pages, `C-11`/`C-11b` navegación y editor UX, `C-12`/`C-12b`/`C-12c` rediseño visual, temas día/noche y paleta verde, y `C-16`/`C-18` paquete de contenido y motor de validación estructural). Siguiendo la regla de oro del proyecto establecida en `C-03 readme-truth`, el README debe documentar con estricta veracidad lo que la plataforma hace hoy, con cada afirmación verificable en el repositorio, sin prometer funcionalidades inexistentes y delimitando con claridad los planes futuros.

## What Changes

- **Título y público objetivo**: Presentar JavaMaster como plataforma gratuita en español para aprender Java, publicada en `https://java.belencalvo.me` en GitHub Pages.
- **Contenido e invariantes**: Describir los 4 niveles (Principiante 15, Intermedio 15, Avanzado 12, Experto 10), 52 lecciones, 208 ejercicios, 4 lecciones de lectura teórica (22, 25, 40, 42), las 4 guías descargables/imprimibles y las evaluaciones por nivel con temporizador.
- **Mecanismo de validación y progreso**: Explicar la validación offline en el navegador mediante reglas estructurales (`validator.js`), señalando que no hay compilación Java real en producción y que el progreso se almacena localmente en `localStorage`.
- **Experiencia de usuario**: Reseñar el soporte responsive, selector de tema claro/oscuro persistente, navegación entre lecciones/ejercicios y editor con numeración y guías de indentación.
- **Seguridad y backend**: Confirmar la ausencia de secretos o claves en el repo, el estado endurecido pero no desplegado de `backend/server.js` (C-06) y la necesidad de aislamiento en contenedor antes de cualquier reactivación.
- **Stack y arquitectura de archivos**: Listar la arquitectura vanilla (HTML, CSS y JavaScript sin frameworks) y el rol de cada archivo principal (`index.html`, `styles.css`, `script.js`, `script-enhanced.js`, `data.js`, `validator.js`, `lesson-nav.js`, etc.).
- **Instrucciones locales y ejecución de pruebas**: Detallar cómo servir la plataforma con un servidor HTTP simple (`python -m http.server`) y los comandos reales para ejecutar los tests (`node --test "tools/*.test.js"`, `node tools/browser-check.js`, `node tools/audit-validator.js`).
- **Metodología y planes futuros**: Describir el flujo OpenSpec, `CHANGES.md` y `knowledge-base/`, listando los próximos pasos (C-20 auditoría con ejecución real, C-08/C-13 login opcional con progreso en cuenta, C-09/C-14 paneles admin) explícitamente rotulados como planes.
- **Estructura de carpetas y proyecto**: Detallar el árbol resumido del repositorio, issues en GitHub y licencia MIT confirmada en `LICENSE`.
- **Actualización de roadmap en CHANGES.md**: Registrar `C-21` completado y registrar `C-20 real-execution-audit` como pendiente.

## Capabilities

### New Capabilities
<!-- Ninguna: el change actualiza documentación y metadata operativa (skip_specs: true). -->

### Modified Capabilities
<!-- Ninguna: el change actualiza documentación y metadata operativa (skip_specs: true). -->

## Impact

- Archivos modificados: `README.md`, `CHANGES.md`.
- No modifica código de producción, lógica de validación, estilos ni datos de ejercicios.
- No introduce librerías externas ni dependencias nuevas.
