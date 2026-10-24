/**
 * JavaMaster Backend — Executor Java endurecido (C-06 secure-executor)
 *
 * Controles implementados en este módulo (RN-SEG-01, RN-SEG-02, RN-SEG-04):
 * 1. Validación allowlist de `className` (`^[A-Z][A-Za-z0-9_]{0,31}$`) con rechazo HTTP 400 por defecto.
 * 2. Ejecución de subprocesos exclusivamente vía `child_process.execFile` con `shell: false` (prohibido `exec`).
 * 3. Entorno de subproceso vacío (`env: {}`), sin heredar `process.env`, evitando filtración de secretos/variables.
 * 4. Límite de memoria heap en la JVM (`-Xmx64m` por defecto) y tope de ejecuciones simultáneas (`maxConcurrent`, HTTP 503).
 * 5. Sandbox en directorio temporal aislado por sesión, timeout (5s) con `killSignal: 'SIGKILL'`, manejo explícito de
 *    `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` (sin confundirlo con timeout), salida truncada a 10KB (`10000` chars)
 *    y limpieza determinística inmediata (`await fs.rm`) en `finally`.
 * 6. Sanitización de `stderr` y errores para no exponer rutas internas del servidor (`workDir` / `TEMP_DIR`).
 * 7. CORS con lista blanca explícita de orígenes (nunca `*`), límite de body JSON de 64KB (HTTP 413) y rate-limit por IP
 *    con purga periódica de entradas vencidas en cada request (`rateBuckets`).
 *
 * LIMITACIÓN IMPORTANTE (QUÉ NO RESUELVE ESTE CÓDIGO Y REQUISITOS DE DESPLIEGUE FUTURO):
 * - Aislamiento de red y archivos: este archivo endurece el proceso Node, pero NO provee aislamiento real de red
 *   ni de sistema de archivos a nivel de sistema operativo. Para bloquear sockets salientes y aislar el sistema de archivos
 *   se requiere ejecutar dentro de un contenedor/sandbox de SO (Docker con `--network none`, `--read-only`, `pids-limit`, `cgroups` / `nsjail`).
 * - Cero secretos en disco dentro del contenedor: el contenedor debe correr sin ningún archivo con secretos en disco
 *   (ni `.env`), porque `env: {}` impide leer variables de entorno en memoria pero NO impide leer archivos legibles en disco.
 * - IP real detrás de proxy para rate-limit: para desplegar detrás de un proxy reverso hay que configurar la obtención de la IP
 *   real (`X-Forwarded-For` únicamente de un proxy confiable) para el rate-limit, SIN activarlo ahora (aceptar `X-Forwarded-For`
 *   sin proxy confiable delante permitiría falsificar la IP y eludir el rate-limit).
 * - Sin soporte de `stdin` actual: hoy el programa ejecutado no recibe `stdin`; los ejercicios con `Scanner` (ids 33–40)
 *   necesitarán un campo de entrada en una versión futura.
 * Por todo lo anterior, el backend permanece SIN DESPLEGAR y Render sigue SUSPENDIDO hasta que eso esté resuelto y probado (RN-SEG-02).
 */

const http = require('http');
const { execFile } = require('child_process');
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const CLASS_NAME_REGEX = /^[A-Z][A-Za-z0-9_]{0,31}$/;
const MEMORY_FLAG_REGEX = /^\d+[mMgG]$/;

const DEFAULT_TEMP_DIR = path.join(__dirname, 'temp');
const DEFAULT_TIMEOUT = Number(process.env.TIMEOUT) > 0 ? Number(process.env.TIMEOUT) : 5000;
const DEFAULT_MAX_OUTPUT = Number(process.env.MAX_OUTPUT) > 0 ? Number(process.env.MAX_OUTPUT) : 10000;
const DEFAULT_MAX_BODY_BYTES = 64 * 1024; // 64 KB (techo RN-SEG-04 <= 1 MB)
const DEFAULT_MAX_MEMORY = MEMORY_FLAG_REGEX.test(process.env.JAVA_MAX_MEMORY || '')
    ? process.env.JAVA_MAX_MEMORY
    : '64m';
const DEFAULT_MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT) > 0 ? Number(process.env.MAX_CONCURRENT) : 2;
const DEFAULT_RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) > 0
    ? Number(process.env.RATE_LIMIT_WINDOW_MS)
    : 60000;
const DEFAULT_RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) > 0
    ? Number(process.env.RATE_LIMIT_MAX)
    : 30;
const DEFAULT_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : [
        'https://java.belencalvo.me',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ]);
const PORT = Number(process.env.PORT) || 3000;

/**
 * Valida que el nombre de la clase cumpla estrictamente la allowlist RN-SEG-01.
 * @param {unknown} className
 * @returns {boolean}
 */
function isValidClassName(className) {
    return typeof className === 'string' && CLASS_NAME_REGEX.test(className);
}

/**
 * Resuelve la ruta absoluta de un binario del JDK (`javac` o `java`) una sola vez desde Node
 * para que `execFile` pueda invocarse con `env: {}` (sin depender de `PATH` en el entorno hijo).
 * @param {'javac' | 'java'} binaryName
 * @returns {string}
 */
function resolveJavaBinary(binaryName) {
    const isWin = process.platform === 'win32';
    const exeName = isWin ? `${binaryName}.exe` : binaryName;

    if (process.env.JAVA_HOME) {
        const candidate = path.join(process.env.JAVA_HOME, 'bin', exeName);
        if (fsSync.existsSync(candidate)) {
            return candidate;
        }
    }

    if (isWin) {
        const javaRoot = 'C:\\Program Files\\Java';
        if (fsSync.existsSync(javaRoot)) {
            const latestCandidate = path.join(javaRoot, 'latest', 'bin', exeName);
            if (fsSync.existsSync(latestCandidate)) {
                return latestCandidate;
            }
            try {
                const entries = fsSync.readdirSync(javaRoot).filter((d) => /^jdk/i.test(d)).sort().reverse();
                for (const dir of entries) {
                    const jdkCandidate = path.join(javaRoot, dir, 'bin', exeName);
                    if (fsSync.existsSync(jdkCandidate)) {
                        return jdkCandidate;
                    }
                }
            } catch (_) {
                // Continuar con búsqueda en PATH
            }
        }
    }

    const pathEnv = process.env.PATH || process.env.Path || '';
    const dirs = pathEnv.split(path.delimiter).filter(Boolean);
    for (const dir of dirs) {
        const candidate = path.join(dir, exeName);
        if (fsSync.existsSync(candidate)) {
            return candidate;
        }
    }

    return binaryName;
}

const JAVAC_BINARY = resolveJavaBinary('javac');
const JAVA_BINARY = resolveJavaBinary('java');

/**
 * Elimina cualquier ruta interna (`workDir` y `tempDir`) de salidas de error.
 * @param {string} text
 * @param {string} workDir
 * @param {string} tempDir
 * @returns {string}
 */
function sanitizeOutput(text, workDir, tempDir) {
    if (typeof text !== 'string' || text.length === 0) {
        return '';
    }
    let result = text;
    const pathsToStrip = [workDir, tempDir].filter(Boolean);
    for (const rawPath of pathsToStrip) {
        const resolved = path.resolve(rawPath);
        const variants = [
            resolved + path.sep,
            resolved.replace(/\\/g, '/') + '/',
            resolved,
            resolved.replace(/\\/g, '/')
        ];
        for (const variant of variants) {
            if (variant) {
                result = result.split(variant).join('');
            }
        }
    }
    return result;
}

/**
 * Formatea errores de compilación de `javac` sanitizando rutas internas.
 * @param {string} stderr
 * @param {string} workDir
 * @param {string} tempDir
 * @returns {string}
 */
function formatCompileError(stderr, workDir, tempDir) {
    const clean = sanitizeOutput(stderr, workDir, tempDir);
    const lines = clean.split(/\r?\n/);
    const relevantLines = lines.filter((line) => line.trim().length > 0);
    return relevantLines.join('\n') || clean;
}

/**
 * Ejecuta un binario sin shell (`shell: false`) y con entorno vacío (`env: {}`).
 * @param {string} file
 * @param {string[]} args
 * @param {{ cwd: string, timeout: number }} options
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string, time: number, timedOut: boolean }>}
 */
function runExecFile(file, args, { cwd, timeout }) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const childOpts = {
            cwd,
            timeout,
            maxBuffer: 1024 * 1024,
            killSignal: 'SIGKILL',
            windowsHide: true,
            shell: false,
            env: {}
        };

        execFile(file, args, childOpts, (error, stdout, stderr) => {
            const elapsed = Date.now() - startTime;
            const outStr = stdout ? stdout.toString() : '';
            const errStr = stderr ? stderr.toString() : '';

            if (error && error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
                return resolve({
                    exitCode: 1,
                    stdout: outStr,
                    stderr: 'Error: Salida excesiva. El programa superó el límite máximo de salida permitida.',
                    time: elapsed,
                    timedOut: false
                });
            }

            const timedOut = Boolean(
                error && (
                    error.killed === true ||
                    error.signal === 'SIGKILL' ||
                    error.signal === 'SIGTERM' ||
                    error.code === 'ETIMEDOUT' ||
                    (elapsed >= timeout && error.code !== 0)
                )
            );

            if (timedOut) {
                return resolve({
                    exitCode: 124,
                    stdout: outStr,
                    stderr: 'Error: El programa excedió el tiempo límite de ejecución (timeout).',
                    time: elapsed,
                    timedOut: true
                });
            }

            const exitCode = error ? (typeof error.code === 'number' ? error.code : 1) : 0;
            resolve({
                exitCode,
                stdout: outStr,
                stderr: errStr || (error && !errStr ? String(error.message || '') : ''),
                time: elapsed,
                timedOut: false
            });
        });
    });
}

/**
 * Envía una respuesta JSON con código HTTP.
 */
function sendJson(res, statusCode, payload) {
    if (res.writableEnded) {
        return;
    }
    const body = JSON.stringify(payload);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(body);
}

/**
 * Lee y parsea el body JSON imponiendo el techo estricto `maxBodyBytes` (64 KB).
 */
function readJsonBody(req, maxBodyBytes) {
    return new Promise((resolve, reject) => {
        const contentLength = Number(req.headers['content-length'] || 0);
        if (contentLength > maxBodyBytes) {
            const err = new Error('Payload Too Large');
            err.statusCode = 413;
            return reject(err);
        }

        const chunks = [];
        let totalBytes = 0;
        let aborted = false;

        req.on('data', (chunk) => {
            if (aborted) return;
            totalBytes += chunk.length;
            if (totalBytes > maxBodyBytes) {
                aborted = true;
                const err = new Error('Payload Too Large');
                err.statusCode = 413;
                reject(err);
                return;
            }
            chunks.push(chunk);
        });

        req.on('end', () => {
            if (aborted) return;
            const raw = Buffer.concat(chunks).toString('utf8');
            if (!raw.trim()) {
                return resolve({});
            }
            try {
                resolve(JSON.parse(raw));
            } catch (_) {
                const err = new Error('JSON inválido');
                err.statusCode = 400;
                reject(err);
            }
        });

        req.on('error', (err) => {
            if (!aborted) {
                reject(err);
            }
        });
    });
}

/**
 * Crea una instancia configurada del servidor executor seguro.
 * @param {object} [options]
 */
function createApp(options = {}) {
    const tempDir = path.resolve(options.tempDir || DEFAULT_TEMP_DIR);
    const timeout = Number(options.timeout) > 0 ? Number(options.timeout) : DEFAULT_TIMEOUT;
    const maxOutput = Number(options.maxOutput) > 0 ? Number(options.maxOutput) : DEFAULT_MAX_OUTPUT;
    const maxBodyBytes = Number(options.maxBodyBytes) > 0 ? Number(options.maxBodyBytes) : DEFAULT_MAX_BODY_BYTES;
    const maxMemory = MEMORY_FLAG_REGEX.test(options.maxMemory || '') ? options.maxMemory : DEFAULT_MAX_MEMORY;
    const maxConcurrent = Number(options.maxConcurrent) > 0 ? Number(options.maxConcurrent) : DEFAULT_MAX_CONCURRENT;
    const rateLimitWindowMs = Number(options.rateLimitWindowMs) > 0
        ? Number(options.rateLimitWindowMs)
        : DEFAULT_RATE_LIMIT_WINDOW_MS;
    const rateLimitMax = Number(options.rateLimitMax) > 0
        ? Number(options.rateLimitMax)
        : DEFAULT_RATE_LIMIT_MAX;
    const allowedOrigins = Array.isArray(options.allowedOrigins)
        ? options.allowedOrigins
        : DEFAULT_ALLOWED_ORIGINS;
    const runner = typeof options.runner === 'function' ? options.runner : runExecFile;

    let activeExecutions = 0;
    const rateBuckets = new Map();

    function purgeExpiredRateBuckets(now) {
        for (const [key, entry] of rateBuckets.entries()) {
            if (!entry || now - entry.windowStart >= rateLimitWindowMs) {
                rateBuckets.delete(key);
            }
        }
    }

    function checkRateLimit(clientKey) {
        const now = Date.now();
        purgeExpiredRateBuckets(now);
        const entry = rateBuckets.get(clientKey);
        if (!entry || now - entry.windowStart >= rateLimitWindowMs) {
            rateBuckets.set(clientKey, { windowStart: now, count: 1 });
            return true;
        }
        if (entry.count >= rateLimitMax) {
            return false;
        }
        entry.count += 1;
        return true;
    }

    const app = async function appHandler(req, res) {
        const origin = req.headers.origin;
        if (origin) {
            if (!allowedOrigins.includes(origin)) {
                return sendJson(res, 403, {
                    success: false,
                    stage: 'connection',
                    stdout: '',
                    stderr: 'Origen no permitido por la política CORS.',
                    output: '',
                    errors: ['Origen no permitido por la política CORS.']
                });
            }
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        }

        const reqUrl = (req.url || '/').split('?')[0];

        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            return res.end();
        }

        if (req.method === 'GET' && reqUrl === '/health') {
            return sendJson(res, 200, {
                status: 'ok',
                message: 'Java executor backend is running'
            });
        }

        if (req.method === 'POST' && reqUrl === '/api/execute') {
            const clientIp = req.socket && req.socket.remoteAddress
                ? req.socket.remoteAddress
                : 'unknown';

            if (!checkRateLimit(clientIp)) {
                return sendJson(res, 429, {
                    success: false,
                    stage: 'connection',
                    stdout: '',
                    stderr: 'Demasiadas solicitudes en poco tiempo. Intentá nuevamente en unos segundos.',
                    output: '',
                    errors: ['Demasiadas solicitudes en poco tiempo. Intentá nuevamente en unos segundos.']
                });
            }

            let body;
            try {
                body = await readJsonBody(req, maxBodyBytes);
            } catch (err) {
                const status = err && err.statusCode === 413 ? 413 : 400;
                const msg = status === 413
                    ? 'El código enviado supera el tamaño máximo permitido (64 KB).'
                    : 'Cuerpo JSON inválido en la solicitud.';
                return sendJson(res, status, {
                    success: false,
                    stage: 'compilation',
                    stdout: '',
                    stderr: msg,
                    output: '',
                    errors: [msg]
                });
            }

            const code = body && typeof body.code === 'string' ? body.code : '';
            const className = body && Object.prototype.hasOwnProperty.call(body, 'className')
                ? body.className
                : 'Main';

            if (!isValidClassName(className)) {
                const msg = 'Nombre de clase inválido. Debe comenzar con mayúscula y contener solo letras, números o guion bajo (máx. 32 caracteres).';
                return sendJson(res, 400, {
                    success: false,
                    stage: 'compilation',
                    stdout: '',
                    stderr: msg,
                    output: '',
                    errors: [msg]
                });
            }

            if (!code || code.trim().length === 0) {
                const msg = 'No se proporcionó código para ejecutar.';
                return sendJson(res, 400, {
                    success: false,
                    stage: 'compilation',
                    stdout: '',
                    stderr: msg,
                    output: '',
                    errors: [msg]
                });
            }

            if (activeExecutions >= maxConcurrent) {
                const msg = 'El servidor alcanzó el límite de ejecuciones simultáneas. Intentá nuevamente en unos segundos.';
                return sendJson(res, 503, {
                    success: false,
                    stage: 'execution',
                    stdout: '',
                    stderr: msg,
                    output: '',
                    errors: [msg]
                });
            }

            activeExecutions += 1;
            const sessionId = crypto.randomBytes(16).toString('hex');
            const workDir = path.resolve(tempDir, sessionId);

            // Defensa en profundidad contra path traversal
            if (!workDir.startsWith(tempDir + path.sep)) {
                activeExecutions -= 1;
                const msg = 'Ruta de sesión inválida.';
                return sendJson(res, 400, {
                    success: false,
                    stage: 'compilation',
                    stdout: '',
                    stderr: msg,
                    output: '',
                    errors: [msg]
                });
            }

            const javaFile = path.resolve(workDir, `${className}.java`);
            if (!javaFile.startsWith(workDir + path.sep)) {
                activeExecutions -= 1;
                const msg = 'Ruta de archivo Java inválida.';
                return sendJson(res, 400, {
                    success: false,
                    stage: 'compilation',
                    stdout: '',
                    stderr: msg,
                    output: '',
                    errors: [msg]
                });
            }

            let responsePayload = null;

            try {
                await fs.mkdir(workDir, { recursive: true });
                await fs.writeFile(javaFile, code, 'utf8');

                const compileResult = await runner(
                    JAVAC_BINARY,
                    ['-encoding', 'UTF-8', javaFile],
                    { cwd: workDir, timeout, shell: false, env: {} }
                );

                if (compileResult.exitCode !== 0) {
                    const cleanErr = formatCompileError(compileResult.stderr, workDir, tempDir).substring(0, maxOutput);
                    responsePayload = {
                        success: false,
                        stage: 'compilation',
                        stdout: '',
                        stderr: cleanErr,
                        output: '',
                        errors: [cleanErr],
                        executionTime: compileResult.time
                    };
                } else {
                    const runResult = await runner(
                        JAVA_BINARY,
                        [`-Xmx${maxMemory}`, '-Dfile.encoding=UTF-8', '-cp', workDir, className],
                        { cwd: workDir, timeout, shell: false, env: {} }
                    );

                    const cleanStdout = (runResult.stdout || '').substring(0, maxOutput);
                    const cleanStderr = sanitizeOutput(runResult.stderr || '', workDir, tempDir).substring(0, maxOutput);

                    responsePayload = {
                        success: runResult.exitCode === 0,
                        stage: 'execution',
                        stdout: cleanStdout,
                        stderr: cleanStderr,
                        output: cleanStdout,
                        errors: runResult.exitCode !== 0 ? [cleanStderr] : [],
                        executionTime: runResult.time
                    };
                }
            } catch (error) {
                const safeMsg = sanitizeOutput(
                    error && error.message ? error.message : 'Error interno de ejecución.',
                    workDir,
                    tempDir
                ).substring(0, maxOutput);
                responsePayload = {
                    success: false,
                    stage: 'execution',
                    stdout: '',
                    stderr: safeMsg,
                    output: '',
                    errors: [safeMsg],
                    executionTime: 0
                };
            } finally {
                activeExecutions -= 1;
                try {
                    await fs.rm(workDir, {
                        recursive: true,
                        force: true,
                        maxRetries: 5,
                        retryDelay: 50
                    });
                } catch (_) {
                    // Ignorar error de limpieza si el directorio no llegó a crearse
                }
            }

            return sendJson(res, 200, responsePayload);
        }

        return sendJson(res, 404, {
            success: false,
            error: 'Ruta no encontrada'
        });
    };

    app.listen = function listen(...args) {
        const server = http.createServer(app);
        return server.listen(...args);
    };

    app.getRateBucketSize = function getRateBucketSize() {
        return rateBuckets.size;
    };

    app._seedRateBucketForTest = function _seedRateBucketForTest(key, windowStart, count = 1) {
        rateBuckets.set(key, { windowStart, count });
    };

    return app;
}

const app = createApp();

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`JavaMaster Backend (secure-executor) escuchando en puerto ${PORT}`);
    });
}

module.exports = {
    app,
    createApp,
    isValidClassName,
    sanitizeOutput,
    formatCompileError,
    resolveJavaBinary
};
