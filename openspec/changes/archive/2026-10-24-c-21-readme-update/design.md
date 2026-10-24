# Design: c-21-readme-update (C-21 readme-update)

## Context

El `README.md` original fue saneado en `C-03` para remover promesas falsas iniciales. Desde entonces, el proyecto completó la publicación del frontend (`C-07`), el rediseño y tematización visual (`C-12`, `C-12b`, `C-12c`), la auditoría y depuración de contenido (`C-16`), el motor de validación estructural (`C-18`), el diseño del sistema de autenticación (`C-08`) y la estabilización del ejecutor seguro (`C-06`). El README actual requiere reflejar esta realidad consolidada sin desviarse de la regla de oro: documentar únicamente lo que el repositorio sostiene.

## Goals / Non-Goals

**Goals:**
- Producir un `README.md` estructurado, técnico y sobrio, con tabla de contenidos compacta.
- Verificar empíricamente cada afirmación contra el código, tests y archivos presentes en el repo.
- Detallar los 10 puntos requeridos: identidad, contenido (52/208, 4 lecturas, guías y evaluaciones), validador estructural en cliente, interfaz (temas claro/oscuro y editor), backend offline endurecido (RN-SEG-02), stack vanilla y mapa de archivos, ejecución local y pruebas, metodología OpenSpec y roadmap, árbol de directorios, e issues/licencia MIT.
- Registrar `C-21` completado y `C-20 real-execution-audit` pendiente en `CHANGES.md`.

**Non-Goals:**
- No modificar archivos de código de producción (`styles.css`, `index.html`, `script*.js`, `data.js`, `validator.js`).
- No agregar dependencias ni alterar la configuración de pruebas.
- No crear cuentas externas ni publicar endpoints de backend.

## Decisions

- **D-01: Separación estricta entre realidad actual y roadmap**: Las características operativas hoy (validación offline, progreso en localStorage, 4 guías, 4 evaluaciones) se documentan en tiempo presente; las características futuras (auth multi-dispositivo C-13, exámenes con gating C-15, panel admin C-14, ejecutor en contenedor) se listan bajo "Hoja de ruta (planes)", sin ambigüedades.
- **D-02: Comandos de ejecución y prueba verificados**: Se documentan únicamente comandos reales que han sido ejecutados con éxito en la sesión:
  - Servidor estático: `python -m http.server 8000`.
  - Suite de tests unitarios: `node --test "tools/*.test.js"` (o con `--test-concurrency=1`).
  - Verificación responsive y visual con navegador: `node tools/browser-check.js`.
  - Auditoría de validador: `node tools/audit-validator.js`.
  - Verificación de especificaciones: `npx openspec validate --specs`.
- **D-03: Mapeo de archivos y responsabilidades**: El README provee un mapa directo entre archivos y funciones del sistema para que cualquier desarrollador comprenda la arquitectura vanilla en minutos.
- **D-04: Licencia**: El repositorio cuenta con el archivo `LICENSE` (Licencia MIT, Copyright 2026 Belén Calvo); se referencia de forma directa.

## Risks / Trade-offs

- *[Riesgo de confusión sobre ejecución de código Java]*: Un usuario podría suponer que el editor compila código Java real en el navegador o en servidores remotos.
  → *Mitigación*: Se aclara explícitamente en la descripción y en la sección de funcionamiento que la validación se realiza mediante análisis de reglas en JavaScript dentro del navegador del usuario.
- *[Riesgo de exposición o ataque a backend]*: Documentar `backend/server.js` podría incitar a intentar invocarlo si se expusieran credenciales o URLs.
  → *Mitigación*: Se subraya que el backend está suspendido, no tiene URL pública, no contiene secretos y requiere infraestructura de contenedor antes de cualquier despliegue.
