# Design — c-05-execution-alternatives

## Context

Ver `proposal.md` — Why. El estado actual relevado en el repositorio es:

- **Vulnerabilidad en `backend/server.js`**:
  - `server.js:38` recibe `className` de `req.body` sin validar.
  - `server.js:56` construye `path.join(workDir, `${className}.java`)` permitiendo *path traversal*.
  - `server.js:60,78` invoca `exec(\`javac "${javaFile}"\`)` y `exec(\`java -cp "${workDir}" ${className}\`)` con shell → inyección directa de comandos (`RN-SEG-01`).
  - `server.js:12` usa `app.use(cors())` abierto (`*`) y no tiene rate-limiting (`RN-SEG-04`).
  - `server.js:100` limpia el directorio temporal con `setTimeout(..., 1000)` no determinístico.
- **Evolución de la matriz de auditoría (`docs/validator-audit.md`)**:
  - **Hallazgo inicial `C-01` (validador por subcadenas)**: `192/208 rules-cheatable` (`92,3 %`), `16 needs-real-execution` (`7,7 %`), `0 rules-only-ok`.
  - **Estado actual post-`C-18` (validador estructural por tokens)**: `198/208 rules-only-ok` (`95,2 %`), `9 needs-real-execution` (`4,3 %`: ids `33–40` de `Scanner` en lección 5 e id `148` de `Supplier`/`ThreadLocalRandom` en lección 35) y `1 rules-cheatable` (`0,5 %`: id `208`, excepción documentada porque pide escribir únicamente comentarios).
- **Restricciones de negocio (`05_reglas_de_negocio.md`)**:
  - `RN-COS-01`: el MVP debe sostenerse en free-tier (\$0/mes).
  - `RN-COS-02`: toda alternativa de ejecución Java se evalúa primero por **costo y mantenimiento**, y después por **fidelidad de compilación**.
  - Excepción global: `Seguridad > costo > mantenibilidad > velocidad`.

## Goals / Non-Goals

**Goals:**

- Documentar en `docs/execution-options.md` la comparativa rigurosa entre:
  1. Solo reglas (`validator.js` estructural post-`C-18`)
  2. Parche sandbox propio (`backend/server.js` con allowlist + `execFile` + timeout + output cap + cleanup + CORS + rate-limit)
  3. Piston (API pública `emkc.org` vs Self-Hosted Docker)
  4. Judge0 CE (RapidAPI Cloud vs Self-Hosted Docker)
  5. WASM / JVM en el navegador (CheerpJ 3.0 / TeaVM / DoppioJVM)
- Incluir para cada opción las 6 dimensiones obligatorias: costo mensual free-tier (con supuestos y fuentes enlazadas), mantenimiento, fidelidad de compilación JDK 21, superficie de ataque, latencia y subset de los 208 ejercicios cubierto (comparando antes y después de `C-18`).
- Dejar asentada la decisión `DD-02` final con opción ganadora, alcance concreto para `C-06` y criterio explícito de reversión, lista para la firma de Belén.

**Non-Goals:**

- Modificar `backend/server.js` o escribir los tests del executor (eso corresponde a `C-06 secure-executor`).
- Reactivar Render o cambiar `BACKEND_URL` en `config.js`.
- Tocar `validator.js`, `data.js` o cualquier archivo del frontend.

## Decisions

1. **Separar la decisión de producción (`DD-02` en vivo) del endurecimiento del código en el repositorio (`C-06`)**:
   - **En producción (GitHub Pages)**: gana **"Solo reglas (`validator.js` estructural post-C-18)"**. Con `198/208` ejercicios en `rules-only-ok` (`95,2 %`), `0,5 %` engañable y los 9 ejercicios `needs-real-execution` aceptando sus soluciones canónicas y variantes estructurales por tokens, el costo \$0, mantenimiento nulo, latencia `< 5 ms` y superficie de ataque cero superan ampliamente a cualquier backend remoto en free-tier.
   - **En el código del repositorio (`C-06 secure-executor`)**: se mantiene el alcance de endurecer `backend/server.js` localmente (allowlist `^[A-Z][A-Za-z0-9_]{0,31}$`, `execFile` sin shell, timeout 5s, tope 10KB, limpieza determinística en `finally`, CORS explícito y rate-limit básico) con su suite de tests de seguridad en verde (`RN-SEG-01`, `RN-SEG-02`), **sin desplegar ni reactivar Render**. Esto elimina el código vulnerable del repositorio y deja listo el motor local para desarrollo y para `C-17` (`console-output`).

2. **Descartar Piston público y Judge0 Cloud en free-tier por restricciones reales de cuota y seguridad de API keys**:
   - La API pública de Piston (`emkc.org`) dejó de ser de acceso libre sin token el 15/02/2026.
   - Judge0 CE en RapidAPI Basic limita el plan gratuito a 50 ejecuciones/día (insuficiente incluso para 2 alumnos practicando) y exige `X-RapidAPI-Key`, que no puede exponerse en el frontend estático (`RN-SEG-03`).
   - El self-hosting de Piston o Judge0 requiere un VPS con Docker privilegiado (`isolate` / cgroups), con costo mensual fijo (\$4–\$12/mes) y mantenimiento de infraestructura Linux.

3. **Descartar WASM (CheerpJ / TeaVM) para v1.0**:
   - CheerpJ llega hasta Java 17 (no cubre sintaxis de JDK 21 presente en el curso), descarga ~15–40 MB en el navegador (penalizando conexiones móviles) y requiere licencia comercial o dependencia de CDN propietario externo.

## Risks / Trade-offs

- **[Trade-off] Los 9 ejercicios `needs-real-execution` (ids 33–40 de `Scanner` e id 148 de `Supplier`/`ThreadLocalRandom`) siguen validándose por estructura de tokens en producción** → Mitigación: el validador estructural de `C-18` ya verifica que el estudiante use los tokens y llamadas correctas (`new Scanner(System.in)`, `nextInt()`, `nextLine()`, `try (...)`, `ThreadLocalRandom.current()`) sin bloquear su avance y sin exponer infraestructura vulnerable ni incurrir en costos.
- **[Riesgo] Mantener `backend/server.js` vulnerable en el árbol de git aunque no esté desplegado** → Mitigación: `C-06` corrige `backend/server.js` con TDD estricto inmediatamente después de `C-05`, cerrando `RN-SEG-01` y `RN-SEG-02` sin necesidad de publicarlo en Render.

## Migration Plan

No requiere migración de datos ni despliegue: agrega `docs/execution-options.md`. Una vez firmado por Belén, destraba `C-06` (`secure-executor`).
