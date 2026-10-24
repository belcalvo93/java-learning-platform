# Proposal — c-05-execution-alternatives (C-05 execution-alternatives)

> Nota de nombre: el roadmap la llama `C-05 execution-alternatives`; el CLI exige kebab-case en minúsculas, por eso el change vive como `c-05-execution-alternatives`.

## Why

El backend original de compilación y ejecución Java (`backend/server.js:56,78`) permanece suspendido por vulnerabilidad crítica de inyección de comandos y path traversal (`DD-01`, `RN-SEG-01`, `RN-SEG-02`). Antes de escribir o modificar código en `C-06` (`secure-executor`), es necesario cerrar la pregunta abierta `PA-02` y la decisión `DD-02` final evaluando objetivamente las alternativas de ejecución Java bajo la jerarquía de reglas del proyecto (`Seguridad > costo > mantenibilidad > velocidad`, `RN-COS-01`, `RN-COS-02`), tomando como entrada tanto el hallazgo inicial de `C-01` (92,3 % engañable con regex) como el estado actual post-`C-18` (`docs/validator-audit.md`: 198/208 `rules-only-ok` = 95,2 %, 9 `needs-real-execution` = 4,3 %, 1 `rules-cheatable` = 0,5 %).

## What Changes

- Crear el documento de análisis y decisión técnica `docs/execution-options.md` con:
  - **Contexto y línea base cuantitativa (`C-01` → `C-18`)**: evolución desde el validador por subcadenas (`192/208 rules-cheatable`, `16 needs-real-execution`, `0 rules-only-ok`) hasta el validador estructural por tokens de `C-18` (`198/208 rules-only-ok`, `9 needs-real-execution` en ids `33–40` y `148`, `1 rules-cheatable` en id `208` por excepción documentada).
  - **Matriz comparativa completa** de las 5 alternativas exigidas en `CHANGES.md`:
    1. **Solo reglas (`validator.js` estructural post-C-18)**
    2. **Parche sandbox propio (`backend/server.js` con allowlist + `execFile` + timeout 5s + output cap 10KB + cleanup + CORS + rate-limit)**
    3. **Piston (API pública `emkc.org` vs Self-Hosted Docker)**
    4. **Judge0 CE (RapidAPI Cloud vs Self-Hosted Docker)**
    5. **WASM / JVM en navegador (CheerpJ / TeaVM / DoppioJVM)**
  - **Columnas evaluadas**: costo mensual free-tier (con supuestos y fuentes enlazadas), mantenimiento, fidelidad de compilación JDK 21, superficie de ataque, latencia y qué subset de los 208 ejercicios cubre cada opción.
  - **Decisión `DD-02` final (a firmar por Belén)**: opción ganadora para producción (`Solo reglas` en GitHub Pages a costo \$0) + alcance exacto de `C-06` (endurecer `backend/server.js` en el repositorio con tests de seguridad pasando per `RN-SEG-01`/`RN-SEG-02`, **sin desplegar ni reactivar Render**) + criterio explícito de reversión.
- **Alcance atómico**: únicamente `docs/execution-options.md` (y artefactos de OpenSpec / `CHANGES.md` al archivar). Cero cambios en código productivo (`backend/`, `validator.js`, `data.js`, frontend).

## Capabilities

### New Capabilities

<!-- Sin capacidades nuevas: este change es de análisis y decisión de arquitectura (documento docs/execution-options.md) sin cambios en el comportamiento en tiempo de ejecución. -->

### Modified Capabilities

<!-- Sin capacidades modificadas: no cambia ningún requisito de las specs existentes. -->

Este change no crea ni modifica specs de producto: es un documento de evaluación y decisión arquitectónica con verificación manual y firma de Belén. Por eso `.openspec.yaml` declara `skip_specs: true`.

## Impact

- **Toca**: `docs/execution-options.md` (archivo nuevo de documentación técnica).
- **No toca**: `backend/server.js`, `validator.js`, `data.js`, `script.js`, `script-enhanced.js`, `index.html` ni configuración de despliegue.
- **Costo**: \$0.
- **Governance MEDIO**: documento de análisis con checkpoint de revisión y firma de Belén sobre la decisión `DD-02` final antes de archivar.
