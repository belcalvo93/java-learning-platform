# Proposal — c-06-secure-executor (C-06 secure-executor)

> Nota de nombre: el roadmap la llama `C-06 secure-executor`; el CLI exige kebab-case en minúsculas, por eso el change vive como `c-06-secure-executor`.

## Why

Aunque la decisión `DD-02` final firmada en `C-05` (`docs/execution-options.md`) mantiene el sitio publicado en GitHub Pages operando 100 % con validación por reglas (`BACKEND_URL = ''`), el archivo `backend/server.js` sigue en el repositorio con vulnerabilidades críticas de inyección de comandos en shell (`exec` en líneas 60 y 78), *path traversal* (`className` sin validar en línea 56), herencia de `process.env` hacia el código del usuario, ausencia de tope de memoria JVM (`-Xmx`) y de concurrencia, CORS abierto (`*`), limpieza diferida insegura (`setTimeout`) y ausencia de *rate-limiting*. Endurecer `backend/server.js` y cubrirlo con una suite de tests de seguridad (`RN-SEG-01`, `RN-SEG-02`, `RN-SEG-04`) elimina el código vulnerable del repositorio, **dejando el backend SIN desplegar y Render suspendido** porque el aislamiento real de red y sistema de archivos exige un contenedor (`Docker`/`nsjail`).

## What Changes

- **Endurecimiento de `backend/server.js` (`RN-SEG-01`, `RN-SEG-02`, `RN-SEG-04`)**:
  - Validar `className` contra la allowlist estricta `^[A-Z][A-Za-z0-9_]{0,31}$` (rechazo por defecto con HTTP 400 antes de escribir en disco o lanzar subprocesos).
  - Reemplazar `child_process.exec` por `child_process.execFile` con `shell: false`, **entorno vacío (`env: {}`, sin heredar `process.env`)** y argumentos explícitos en arreglo (`['-encoding', 'UTF-8', javaFile]` para `javac` y `[`-Xmx${maxMemory}`, '-Dfile.encoding=UTF-8', '-cp', workDir, className]` para `java`).
  - Limitar la memoria heap de `java` mediante **`-Xmx64m`** (configurable vía `JAVA_MAX_MEMORY`) y limitar la **cantidad máxima de ejecuciones simultáneas** (`MAX_CONCURRENT = 2` por defecto), respondiendo con HTTP `503` (o `429`) si se supera el cupo de ejecuciones activas.
  - Aislar cada ejecución en un directorio temporal único bajo `TEMP_DIR` verificando que la ruta resuelta permanezca dentro de `TEMP_DIR`, con timeout de 5 segundos (configurable), truncado de salida (`stdout` y `stderr`) a `10000` caracteres (`MAX_OUTPUT = 10000`) y limpieza garantizada e inmediata (`await fs.rm(workDir, { recursive: true, force: true })`) en el bloque `finally` (eliminando el `setTimeout` de 1 segundo).
  - Sanitizar `stderr` y los mensajes de error para no filtrar rutas internas del servidor (`workDir`, `TEMP_DIR`) hacia el cliente.
  - Unificar el contrato `POST /api/execute { code, className }` devolviendo `{ success, stage, stdout, stderr, output, errors, executionTime }` con `stage` en `'compilation'` o `'execution'`.
  - Restringir CORS a una lista explícita de orígenes permitidos (`ALLOWED_ORIGINS` o defaults locales + `https://java.belencalvo.me`), rechazando orígenes no autorizados con HTTP `403` (`RN-SEG-04`).
  - Reducir el límite de body JSON a `64kb` (devolviendo HTTP `413` ante bodies mayores, bajo el techo de `1mb` de `RN-SEG-04`) y agregar un *rate-limiter* básico por IP en memoria (HTTP `429`).
- **Actualización de `backend/.env.example`**:
  - Documentar `ALLOWED_ORIGINS`, `JAVA_MAX_MEMORY`, `MAX_CONCURRENT`, `RATE_LIMIT_WINDOW_MS` y `RATE_LIMIT_MAX`, retirando `GEMINI_API_KEY` activa y dejando nota explícita de que el aislamiento de red y archivos requiere contenedor.
- **Suite de tests TDD `tools/secure-executor.test.js` (`node --test`)**:
  - Rechazo de `className` inválido / inyección (HTTP 400).
  - Prohibición de `exec` con shell y verificación de `env: {}` (el proceso hijo NO recibe variables de entorno de `process.env` del servidor).
  - Límite de memoria `-Xmx` en `java` y bloqueo de ejecuciones simultáneas sobre `MAX_CONCURRENT` (HTTP 429/503).
  - Ejecución exitosa y fallo de compilación con `stage: 'compilation' | 'execution'` y paths internos sanitizados.
  - Timeout que mata el proceso hijo ante bucle infinito.
  - Truncado de salida masiva a `10000` caracteres (`10KB`).
  - Limpieza inmediata del directorio temporal `workDir` tras éxito, error de compilación y timeout.
  - Rechazo CORS de orígenes no listados (HTTP 403), rechazo de body > `64kb` (HTTP 413) y bloqueo por *rate-limit* (HTTP 429).
- **Explícito NO-alcance**: ningún paso de despliegue, ninguna URL pública en `config.js` (`BACKEND_URL` permanece `''`), ningún cambio en `validator.js`, `data.js` ni en el frontend.

## Capabilities

### New Capabilities

- `secure-executor`: Ejecución aislada y segura de código Java en el backend (`POST /api/execute`) con validación allowlist de `className`, invocación `execFile` sin shell y con `env: {}`, tope de memoria `-Xmx` y de concurrencia, sandbox temporal con timeout de 5s, salida truncada a 10KB, limpieza determinística en `finally`, CORS de origen explícito, límite de body de 64kb, rate-limit y sanitización de rutas internas.

### Modified Capabilities

<!-- Ninguna capacidad existente cambia sus requisitos; frontend-no-backend se mantiene intacto con BACKEND_URL vacío. -->

## Impact

- **Toca**: `backend/server.js`, `backend/.env.example`, `docs/execution-options.md`, `tools/secure-executor.test.js` (nuevo) y spec `openspec/changes/c-06-secure-executor/specs/secure-executor/spec.md`.
- **No toca**: `config.js` (`BACKEND_URL` sigue vacío), `validator.js`, `data.js`, `index.html`, `script.js`, `script-enhanced.js`, ni despliegues en Render/GitHub Pages.
- **Governance CRÍTICO**: plan aprobado por Belén con freno obligatorio antes de archivar para revisión del reporte y del diff de `backend/server.js`.
