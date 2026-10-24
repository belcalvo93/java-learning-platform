# Tasks — c-06-secure-executor

> **Strict TDD Mode + Governance CRÍTICO**: Seguir el ciclo RED → GREEN → TRIANGULATE → REFACTOR en `tools/secure-executor.test.js` y `backend/server.js`. Frenar antes de archivar para que Belén revise el reporte y el diff de `backend/server.js`.

## 1. Validación allowlist de `className`, prohibición de `exec` con shell, `env: {}` y límite `-Xmx` (`RN-SEG-01`)

- [x] 1.1 Escribir tests TDD en `tools/secure-executor.test.js` (RED) y luego implementar en `backend/server.js` (GREEN + TRIANGULATE) para verificar:
  - que `backend/server.js` usa exclusivamente `execFile` con `shell: false` (y nunca `exec(`),
  - que `POST /api/execute` rechaza con HTTP `400` cualquier `className` inválido (`"A; rm -rf /"`, `"../Hack"`, `` "`id`" ``, `"$(whoami)"`, `"main"`, `""`, `> 32` chars) sin tocar el disco ni lanzar procesos,
  - que los subprocesos corren con **entorno vacío (`env: {}`)** y un programa Java real no puede leer variables de `process.env` del servidor (`System.getenv("SECRET_SERVER_KEY")` devuelve `null`),
  - y que `java` recibe el argumento de límite de memoria `-Xmx64m`.

## 2. Sandbox temporal, contrato `{ stage, stdout, stderr }`, timeout, tope 10KB, límite de concurrencia y limpieza en `finally` (`RN-SEG-02`)

- [x] 2.1 Escribir tests TDD en `tools/secure-executor.test.js` y luego implementar en `backend/server.js` para verificar:
  - compilación fallida (`stage: "compilation"`, `stderr` legible y paths internos de `workDir`/`TEMP_DIR` sanitizados),
  - ejecución exitosa (`stage: "execution"`, `stdout` con salida real),
  - timeout que mata el proceso hijo ante bucle infinito y reporta `stage: "execution"`,
  - salida mayor a `10000` caracteres truncada exactamente a `10000` (`10KB`),
  - limpieza inmediata (`await fs.rm`) del directorio `workDir` en `finally` tras éxito, error de compilación y timeout,
  - y rechazo con HTTP `429`/`503` cuando se supera el límite de ejecuciones simultáneas (`maxConcurrent`).

## 3. CORS explícito, límite de body de 64KB, rate-limit y verificación integral (`RN-SEG-04`)

- [x] 3.1 Escribir tests TDD en `tools/secure-executor.test.js` y luego implementar en `backend/server.js` y `backend/.env.example` para verificar:
  - rechazo CORS (HTTP `403`) ante un `Origin` no listado y aceptación de `https://java.belencalvo.me`,
  - rechazo con HTTP `413` cuando el body supera `64kb`,
  - y rechazo con HTTP `429` cuando se supera el *rate-limit* por ventana.
- [x] 3.2 Correr la suite completa (`node --test "tools/*.test.js"`), `node tools/audit-validator.js` y `npx openspec validate --changes`, y verificar con `git status` y `git diff --stat` que `config.js`, `data.js`, `validator.js` y el frontend tienen cero cambios.

## 4. Ajustes finales de revisión: `killSignal: 'SIGKILL'`, manejo de `ERR_CHILD_PROCESS_STDIO_MAXBUFFER`, vaciado de `rateBuckets` y notas operativas

- [x] 4.1 Escribir tests TDD en `tools/secure-executor.test.js` (RED) e implementar en `backend/server.js` y `docs/execution-options.md` (GREEN + TRIANGULATE):
  - `runExecFile` con `killSignal: 'SIGKILL'`, verificado con un programa Java que registra un *shutdown hook* con bucle infinito y entra en `while (true) {}` terminando dentro del timeout sin dejar procesos `java` huérfanos.
  - Manejo explícito de `error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER'` (sin clasificarlo como timeout), devolviendo la salida truncada a `10000` caracteres (`10KB`) con `exitCode: 1` (`success: false`) y mensaje claro de salida excesiva; verificado con un programa Java que imprime más de 1 MB.
  - Limpieza periódica en cada request de las entradas vencidas de `rateBuckets` (sin timers que bloqueen el cierre del proceso), con test TDD del vaciado.
  - Documentación en `docs/execution-options.md` y en el comentario de cabecera de `backend/server.js` de: (a) configuración de IP real detrás de proxy (`X-Forwarded-For` de proxy confiable) sin activarlo ahora, (b) contenedor sin archivos con secretos en disco (ni `.env`), y (c) ausencia actual de `stdin` para ejercicios con `Scanner`.

## Workflow follow-up

- Presentar reporte y diff de `backend/server.js` a Belén y esperar su OK antes de archivar `c-06-secure-executor`.
