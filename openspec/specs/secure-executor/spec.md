# secure-executor Specification

## Purpose
Ejecución aislada y segura de código Java en el backend (`POST /api/execute`) con validación allowlist de `className`, invocación `execFile` sin shell y con entorno vacío (`env: {}`), tope de memoria `-Xmx` y concurrencia, sandbox temporal con timeout (`SIGKILL`), manejo de `maxBuffer`, salida truncada a 10KB, limpieza inmediata en `finally`, CORS explícito, límite de body de 64KB, rate-limit con vaciado de entradas vencidas y sanitización de rutas internas.

## Requirements

### Requirement: Allowlist validation for Java className
The backend executor SHALL validate `className` against the strict regular expression `^[A-Z][A-Za-z0-9_]{0,31}$` before creating any directory, writing any file, or spawning any subprocess. Any `className` that is not a string or does not match the allowlist MUST be rejected with HTTP status `400` and a Spanish error message without touching the filesystem or invoking `javac`/`java`.

#### Scenario: Valid className is accepted
- **WHEN** a client sends `POST /api/execute` with `className: "Main"` or `"MiClase_1"` and non-empty `code`
- **THEN** the server accepts `className` and proceeds to isolated compilation

#### Scenario: Command injection or path traversal in className is rejected
- **WHEN** a client sends `POST /api/execute` with `className` set to `"A; rm -rf /"`, `"../Hack"`, `` "`id`" ``, `"$(whoami)"`, `"main"`, or a name longer than 32 characters
- **THEN** the server responds with HTTP `400`, `stage: "compilation"`, and spawns zero child processes and creates zero temporary directories

### Requirement: Shell-free subprocess execution with empty environment and JVM memory cap
The backend executor SHALL invoke `javac` and `java` exclusively via `child_process.execFile` with `shell: false`, an explicit argument array, and an empty environment (`env: {}`) so child processes never inherit `process.env` secrets or server variables, and SHALL pass a heap memory limit (`-Xmx`, default `-Xmx64m`) to `java`.

#### Scenario: Child process runs with empty environment and cannot read server process.env
- **WHEN** the server has an environment variable set in `process.env` (e.g., `SECRET_SERVER_KEY`) and executes user Java code that prints `System.getenv("SECRET_SERVER_KEY")`
- **THEN** the child process runs with `env: {}` and receives `null` for `System.getenv("SECRET_SERVER_KEY")`

#### Scenario: Java runtime receives heap memory limit flag
- **WHEN** the executor invokes `java` after successful compilation
- **THEN** the argument array includes `-Xmx64m` (or the configured `maxMemory` flag) and `execFile` is called with `shell: false` and `env: {}`

### Requirement: Isolated sandbox with timeout (SIGKILL), maxBuffer handling, 10KB output cap, concurrency limit, and deterministic cleanup
Each `POST /api/execute` request SHALL enforce a maximum number of concurrent executions, run inside a unique temporary directory under `TEMP_DIR`, enforce a subprocess timeout using `killSignal: 'SIGKILL'`, distinguish `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` from timeouts with a clear excessive-output error and `exitCode: 1`, cap `stdout` and `stderr` to `10000` characters (`10KB`), and remove `workDir` via `await fs.rm` in `finally` before returning the HTTP response.

#### Scenario: Infinite loop with infinite shutdown hook is terminated by SIGKILL timeout
- **WHEN** a client submits Java code that registers a `Runtime.getRuntime().addShutdownHook` containing `while (true) {}` and then enters `while (true) {}`
- **THEN** the execution subprocess is killed with `SIGKILL` upon reaching the timeout (leaving zero orphan `java` processes) and the server responds with `success: false`, `stage: "execution"`, and a Spanish timeout message in `stderr` / `errors`

#### Scenario: Program exceeding 1MB maxBuffer is reported as excessive output (not timeout) with 10KB truncated stdout
- **WHEN** a Java program prints more than `1 MB` to `stdout` (triggering `ERR_CHILD_PROCESS_STDIO_MAXBUFFER`)
- **THEN** the server does not classify the error as a timeout, returns `success: false`, `stage: "execution"`, `stdout` truncated to `10000` characters (`10KB`), and a clear Spanish excessive-output message in `stderr` / `errors`

#### Scenario: Excessive output under maxBuffer is truncated to 10KB
- **WHEN** a Java program prints more than `10000` characters (and less than `maxBuffer`) to `stdout`
- **THEN** the returned `stdout` and `output` fields have length `<= 10000`

#### Scenario: Temporary work directory is removed immediately in finally
- **WHEN** `POST /api/execute` finishes (whether by successful execution, compilation failure, excessive output, or runtime timeout)
- **THEN** the per-request `workDir` no longer exists on disk when the response is received

#### Scenario: Concurrent execution cap prevents resource exhaustion
- **WHEN** the number of in-flight executions reaches `maxConcurrent`
- **THEN** an additional concurrent `POST /api/execute` request is rejected immediately with HTTP `429` or `503` without spawning `javac` or `java`

### Requirement: Execution contract and internal path sanitization
`POST /api/execute` SHALL return a JSON object containing `{ success, stage, stdout, stderr, output, errors, executionTime }` where `stage` is `"compilation"` or `"execution"`, and MUST strip or replace internal filesystem paths (`workDir`, `TEMP_DIR`) from `stderr` and `errors`.

#### Scenario: Compilation error reports stage compilation without internal paths
- **WHEN** a client submits Java code with a syntax error
- **THEN** the response has `success: false`, `stage: "compilation"`, non-empty `stderr` and `errors`, and neither `stderr` nor `errors` contains the absolute path of `TEMP_DIR` or `workDir`

### Requirement: Restrictive CORS, 64KB body limit, and rate limiting
The backend executor SHALL enforce an explicit allowlist of origins for CORS (never wildcard `*`), limit JSON request bodies to at most `64kb` (returning HTTP `413` when exceeded), and apply per-IP rate limiting that returns HTTP `429` when exceeded.

#### Scenario: Unlisted Origin is rejected by CORS
- **WHEN** a request to `/api/execute` includes header `Origin: https://malicious.example.com`
- **THEN** the server rejects the request with HTTP `403` and does not set `Access-Control-Allow-Origin: *`

#### Scenario: Payload larger than 64KB is rejected
- **WHEN** a client sends `POST /api/execute` with a JSON body exceeding `64kb`
- **THEN** the server rejects the request with HTTP `413` before reaching the execution handler

#### Scenario: Rate limit blocks burst abuse and purges expired buckets
- **WHEN** a client exceeds the configured maximum number of requests per rate-limit window on `/api/execute`
- **THEN** subsequent requests within the window receive HTTP `429` without spawning `javac` or `java`, and expired entries in `rateBuckets` are automatically purged on subsequent checks without leaving active timers that block process exit
