# Design — c-06-secure-executor

## Context

Ver `proposal.md` — Why y `docs/execution-options.md` §4.2.
El archivo actual `backend/server.js` (173 líneas) contiene vulnerabilidades documentadas en `DD-01`, `RN-SEG-01`, `RN-SEG-02` y `RN-SEG-04`:
1. `className` se toma de `req.body` sin validar (`server.js:38`) y se concatena en `path.join(workDir, `${className}.java`)` (`server.js:56`).
2. `executeCommand` usa `exec(command, ...)` con interpolación de strings (`server.js:60,78,115`) y hereda por defecto `process.env` hacia el proceso hijo.
3. No hay límite de memoria en `java` (`-Xmx`) ni tope de ejecuciones simultáneas (`maxConcurrent`).
4. `app.use(cors())` habilita `Access-Control-Allow-Origin: *` sin restricción (`server.js:12`), el límite de body es `1mb` y no existe *rate-limit*.
5. El bloque `finally` borra `workDir` dentro de un `setTimeout(..., 1000)` (`server.js:100`) y `formatCompileError` filtra rutas absolutas del servidor (`workDir`/`TEMP_DIR`).

## Goals / Non-Goals

**Goals:**

- Cumplir el gate `RN-SEG-02` mediante TDD estricto en `tools/secure-executor.test.js` y refactorización segura de `backend/server.js`.
- Ejecutar subprocesos (`javac` y `java`) con `execFile`, `shell: false` y `env: {}` (resolviendo la ruta absoluta de `javac` y `java` una sola vez al iniciar el módulo en Node para que el hijo corra con `env: {}` absolutamente vacío sin necesitar `PATH` ni heredar `process.env`).
- Aplicar `-Xmx64m` en `java` y un semáforo/contador de concurrencia (`maxConcurrent = 2` por defecto) que devuelva HTTP `429`/`503` cuando se alcance el tope.
- Mantener compatibilidad con `java-executor.js` (`{ success, output, errors, executionTime, stage }`) junto con el contrato canónico `{ stage, stdout, stderr }`.

**Non-Goals:**

- **Aislamiento de red y de sistema de archivos a nivel de sistema operativo**: este código NO provee contenedorización (`Docker`, `nsjail`, `cgroups`). Por eso el backend **queda SIN desplegar y Render permanece suspendido** hasta contar con aislamiento de contenedor probado (`RN-SEG-02`).
- Modificar `config.js` (`BACKEND_URL` permanece `''`), `java-executor.js`, `validator.js`, `data.js` o cualquier archivo del frontend.

## Decisions

1. **Resolución previa del binario `javac`/`java` + `env: {}` estricto en el proceso hijo**:
   - En Windows y Linux, si se llama `execFile('java', args, { env: {} })` con nombre corto, el sistema operativo puede buscar `PATH` dentro de `env`. Para garantizar que `env` sea literalmente `{}` (cero variables en el proceso hijo) y a la vez encuentre `javac` y `java` en cualquier SO, el servidor resuelve al arrancar la ruta absoluta del ejecutable (`resolveJavaBinary('javac')` y `resolveJavaBinary('java')` inspeccionando `JAVA_HOME` o `PATH` desde Node una sola vez) e invoca `execFile(resolvedBinary, args, { cwd, timeout, maxBuffer: 1024 * 1024, windowsHide: true, shell: false, env: {} })`.
   - Así, dentro de la JVM del código del estudiante, `System.getenv()` no contiene ninguna variable del proceso Node (`process.env`).

2. **Límite de memoria `-Xmx` y límite de ejecuciones simultáneas (`maxConcurrent`)**:
   - `java` se invoca con `[`-Xmx${maxMemory}`, '-Dfile.encoding=UTF-8', '-cp', workDir, className]` donde `maxMemory` es `'64m'` por defecto (validado contra `/^\d+[mMgG]$/`).
   - Un contador `activeExecutions` en `createApp` controla cuántas ejecuciones están en curso; si `activeExecutions >= maxConcurrent` (default `2`), `POST /api/execute` responde inmediatamente con HTTP `503` (o `429`) y mensaje en español sin tocar el disco ni lanzar subprocesos, decrementando `activeExecutions` de forma garantizada en `finally`.

3. **Limpieza determinística (`await fs.rm`) en `finally` y sanitización de rutas**:
   - Se elimina `setTimeout(..., 1000)` y se ejecuta `await fs.rm(workDir, { recursive: true, force: true })` directamente dentro del bloque `finally` antes de enviar la respuesta HTTP.
   - `sanitizeOutput(text, workDir, tempDir)` reemplaza todas las ocurrencias de `workDir` y `tempDir` (con `\`, `/` y barra escapada) para que ni `stderr` ni `errors` filtren jamás rutas internas del host.

4. **CORS con lista blanca explícita, body `64kb` y Rate-Limit en memoria**:
   - Orígenes permitidos por defecto: `['https://java.belencalvo.me', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:3000', 'http://127.0.0.1:3000']`. Si viene header `Origin` fuera de la lista, responde HTTP `403`.
   - `express.json({ limit: '64kb' })` con middleware de manejo de `entity.too.large` (`status === 413`) que responde JSON `{ success: false, stage: 'compilation', stdout: '', stderr: 'El código enviado supera el tamaño máximo permitido (64 KB).', output: '', errors: [...] }`.
   - Rate-limiter por IP en `/api/execute` (`windowMs = 60000`, `max = 30` por defecto), respondiendo HTTP `429` cuando se supera.

## Risks / Trade-offs

- **[Limitación conocida y documentada] Sin contenedor (`Docker`/`nsjail`), el proceso `java` corre bajo el usuario del proceso Node y aún tiene acceso a la pila de red y lectura de archivos públicos del host** → Mitigación: documentado explícitamente en `docs/execution-options.md`, `backend/server.js` y `backend/.env.example`; el backend permanece **sin desplegar** y Render suspendido (`RN-SEG-02`).

## Migration Plan

Sin impacto en producción (`BACKEND_URL` en `config.js` sigue vacío y Render sigue suspendido).
