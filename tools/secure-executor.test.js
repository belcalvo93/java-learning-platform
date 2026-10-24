const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');

const SERVER_PATH = path.join(__dirname, '..', 'backend', 'server.js');

/**
 * Helper para hacer requests HTTP a una instancia de createApp(options).
 */
function requestJson(app, { method = 'POST', url = '/api/execute', headers = {}, body = null }) {
    return new Promise((resolve, reject) => {
        const server = http.createServer(app);
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            const payload = body === null
                ? ''
                : (typeof body === 'string' ? body : JSON.stringify(body));
            const reqHeaders = {
                ...(body !== null ? {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                } : {}),
                ...headers
            };
            const req = http.request(
                { hostname: '127.0.0.1', port, path: url, method, headers: reqHeaders },
                (res) => {
                    let raw = '';
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => { raw += chunk; });
                    res.on('end', () => {
                        server.close(() => {
                            let json = null;
                            try {
                                json = JSON.parse(raw);
                            } catch (_) {
                                json = null;
                            }
                            resolve({ status: res.statusCode, headers: res.headers, json, raw });
                        });
                    });
                }
            );
            req.on('error', (err) => {
                server.close(() => reject(err));
            });
            if (body !== null) {
                req.write(payload);
            }
            req.end();
        });
    });
}

describe('C-06 1.1: Allowlist className, execFile sin shell, env vacío y límite -Xmx (RN-SEG-01)', () => {
    it('backend/server.js usa execFile con shell: false y env: {}, y nunca usa exec( con shell', () => {
        const source = fs.readFileSync(SERVER_PATH, 'utf8');
        assert.match(source, /\bexecFile\b/, 'Debe importar y usar execFile');
        assert.doesNotMatch(source, /\bexec\s*\(/, 'Prohibido usar exec() con shell');
        assert.match(source, /shell\s*:\s*false/, 'Debe fijar explícitamente shell: false');
        assert.match(source, /env\s*:\s*\{\s*\}/, 'Debe fijar explícitamente env: {}');
    });

    it('rechaza con HTTP 400 cualquier className fuera de ^[A-Z][A-Za-z0-9_]{0,31}$ sin tocar disco ni lanzar subprocesos', async () => {
        const { createApp, isValidClassName } = require(SERVER_PATH);
        assert.equal(typeof createApp, 'function', 'server.js debe exportar createApp');
        assert.equal(typeof isValidClassName, 'function', 'server.js debe exportar isValidClassName');

        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-1-1');
        await fsp.rm(tempDir, { recursive: true, force: true });

        const calls = [];
        const app = createApp({
            tempDir,
            runner: async (cmd, args, opts) => {
                calls.push({ cmd, args, opts });
                return { exitCode: 0, stdout: '', stderr: '', time: 1, timedOut: false };
            }
        });

        const invalidClassNames = [
            'A; rm -rf /',
            '../Hack',
            '..\\Hack',
            '`id`',
            '$(whoami)',
            'main',
            '1Main',
            '',
            'A'.repeat(33),
            'Main.java',
            'Main" && calc "'
        ];

        for (const badName of invalidClassNames) {
            assert.equal(isValidClassName(badName), false, `isValidClassName debe rechazar: ${badName}`);
            const res = await requestJson(app, {
                body: { code: 'public class Main {}', className: badName }
            });
            assert.equal(res.status, 400, `Debe devolver 400 para className=${badName}`);
            assert.equal(res.json.success, false);
            assert.equal(res.json.stage, 'compilation');
        }

        assert.equal(calls.length, 0, 'No debe haber invocado ningún subproceso');
        const entries = fs.existsSync(tempDir) ? await fsp.readdir(tempDir) : [];
        assert.equal(entries.length, 0, 'No debe haber creado ningún directorio de sesión');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('triangulación: acepta nombres válidos en los bordes (1 y 32 chars) y rechaza tipos no-string o código vacío con HTTP 400', async () => {
        const { createApp, isValidClassName } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-triang-1-1');
        const app = createApp({
            tempDir,
            runner: async () => ({ exitCode: 0, stdout: 'OK', stderr: '', time: 1, timedOut: false })
        });

        assert.equal(isValidClassName('A'), true);
        assert.equal(isValidClassName('A'.repeat(32)), true);
        assert.equal(isValidClassName('Mi_Clase_99'), true);
        assert.equal(isValidClassName(null), false);
        assert.equal(isValidClassName(12345), false);
        assert.equal(isValidClassName(['Main']), false);

        const nonStringRes = await requestJson(app, {
            body: { code: 'public class Main {}', className: ['Main'] }
        });
        assert.equal(nonStringRes.status, 400);

        const emptyCodeRes = await requestJson(app, {
            body: { code: '   ', className: 'Main' }
        });
        assert.equal(emptyCodeRes.status, 400);
        assert.equal(emptyCodeRes.json.success, false);
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('invoca javac y java con shell: false, env: {} (vacío) y pasa -Xmx64m a java', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-env');
        const calls = [];
        const app = createApp({
            tempDir,
            maxMemory: '64m',
            runner: async (cmd, args, opts) => {
                calls.push({ cmd, args, opts });
                return { exitCode: 0, stdout: 'OK\n', stderr: '', time: 5, timedOut: false };
            }
        });

        const res = await requestJson(app, {
            body: {
                className: 'MiClase_1',
                code: 'public class MiClase_1 { public static void main(String[] a) {} }'
            }
        });

        assert.equal(res.status, 200);
        assert.equal(calls.length, 2, 'Debe invocar javac y luego java');
        for (const call of calls) {
            assert.equal(call.opts.shell, false, 'shell debe ser false');
            assert.deepEqual(call.opts.env, {}, 'env debe ser exactamente un objeto vacío {}');
        }
        assert.ok(
            calls[1].args.includes('-Xmx64m'),
            `Los argumentos de java deben incluir -Xmx64m, recibido: ${JSON.stringify(calls[1].args)}`
        );
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('ejecución real con JDK: el proceso hijo NO recibe variables de process.env del servidor', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-real-env');
        process.env.SECRET_SERVER_KEY = 'CLAVE_SECRETA_DEL_SERVIDOR_12345';

        try {
            const app = createApp({ tempDir });
            const code = [
                'public class EnvProbe {',
                '    public static void main(String[] args) {',
                '        String leak = System.getenv("SECRET_SERVER_KEY");',
                '        System.out.println("LEAK=" + leak);',
                '    }',
                '}'
            ].join('\n');

            const res = await requestJson(app, {
                body: { className: 'EnvProbe', code }
            });

            assert.equal(res.status, 200);
            assert.equal(res.json.success, true, `Fallo inesperado: ${JSON.stringify(res.json)}`);
            assert.equal(res.json.stage, 'execution');
            assert.match(res.json.stdout, /LEAK=null/);
            assert.doesNotMatch(res.json.stdout, /CLAVE_SECRETA_DEL_SERVIDOR_12345/);
        } finally {
            delete process.env.SECRET_SERVER_KEY;
            await fsp.rm(tempDir, { recursive: true, force: true });
        }
    });
});

describe('C-06 2.1: Sandbox temporal, contrato { stage, stdout, stderr }, paths sanitizados, timeout, truncado 10KB, concurrencia y cleanup (RN-SEG-02)', () => {
    it('ejecución exitosa real con JDK devuelve stage="execution", stdout real, stderr vacío y limpia workDir', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-success');
        await fsp.rm(tempDir, { recursive: true, force: true });

        const app = createApp({ tempDir });
        const res = await requestJson(app, {
            body: {
                className: 'HolaSegura',
                code: 'public class HolaSegura { public static void main(String[] a) { System.out.println("Hola JDK 21"); } }'
            }
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, true);
        assert.equal(res.json.stage, 'execution');
        assert.match(res.json.stdout, /Hola JDK 21/);
        assert.equal(res.json.stderr, '');

        const remaining = fs.existsSync(tempDir) ? await fsp.readdir(tempDir) : [];
        assert.equal(remaining.length, 0, 'workDir eliminado inmediatamente tras ejecución exitosa');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('error de compilación devuelve stage="compilation", stderr legible sin filtrar paths internos y limpia workDir en finally', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-compile-err');
        await fsp.rm(tempDir, { recursive: true, force: true });

        const app = createApp({ tempDir });
        const res = await requestJson(app, {
            body: {
                className: 'BrokenClass',
                code: 'public class BrokenClass { public static void main(String[] a) { int x = ; } }'
            }
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, false);
        assert.equal(res.json.stage, 'compilation');
        assert.equal(res.json.stdout, '');
        assert.ok(res.json.stderr.length > 0, 'stderr debe contener el error de compilación');
        assert.ok(!res.json.stderr.includes(tempDir), `stderr no debe filtrar tempDir (${tempDir}): ${res.json.stderr}`);
        assert.ok(!res.json.stderr.includes(tempDir.replace(/\\/g, '/')), 'stderr no debe filtrar tempDir con barras /');
        assert.match(res.json.stderr, /BrokenClass\.java/, 'Debe conservar el nombre del archivo Java');

        const remaining = fs.existsSync(tempDir) ? await fsp.readdir(tempDir) : [];
        assert.equal(remaining.length, 0, 'El directorio temporal de la sesión debe haberse eliminado en finally');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('timeout mata el proceso hijo ante bucle infinito, devuelve stage="execution" y limpia workDir', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-timeout');
        await fsp.rm(tempDir, { recursive: true, force: true });

        const app = createApp({ tempDir, timeout: 600 });
        const res = await requestJson(app, {
            body: {
                className: 'InfiniteLoop',
                code: 'public class InfiniteLoop { public static void main(String[] a) { while (true) {} } }'
            }
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, false);
        assert.equal(res.json.stage, 'execution');
        assert.match(res.json.stderr, /tiempo límite/i, 'stderr debe informar exceso de tiempo límite');

        const remaining = fs.existsSync(tempDir) ? await fsp.readdir(tempDir) : [];
        assert.equal(remaining.length, 0, 'El directorio temporal debe limpiarse tras timeout');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('salida gigante (> 10KB) se trunca exactamente a 10000 caracteres y limpia workDir', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-maxoutput');
        const hugeText = 'X'.repeat(25000);

        const app = createApp({
            tempDir,
            maxOutput: 10000,
            runner: async (cmd, args) => {
                const isJavac = String(cmd).toLowerCase().includes('javac');
                if (isJavac) {
                    return { exitCode: 0, stdout: '', stderr: '', time: 2, timedOut: false };
                }
                return { exitCode: 0, stdout: hugeText, stderr: '', time: 5, timedOut: false };
            }
        });

        const res = await requestJson(app, {
            body: {
                className: 'BigOutput',
                code: 'public class BigOutput { public static void main(String[] a) {} }'
            }
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, true);
        assert.equal(res.json.stage, 'execution');
        assert.equal(res.json.stdout.length, 10000);
        assert.equal(res.json.output.length, 10000);

        const remaining = fs.existsSync(tempDir) ? await fsp.readdir(tempDir) : [];
        assert.equal(remaining.length, 0, 'workDir eliminado inmediatamente en finally');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('límite de ejecuciones simultáneas (maxConcurrent) rechaza con HTTP 503/429 cuando se supera el cupo', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-concurrency');

        let releaseFirst;
        const firstBlocked = new Promise((resolve) => { releaseFirst = resolve; });
        let firstStartedResolve;
        const firstStarted = new Promise((resolve) => { firstStartedResolve = resolve; });

        const app = createApp({
            tempDir,
            maxConcurrent: 1,
            runner: async (cmd) => {
                if (String(cmd).toLowerCase().includes('javac')) {
                    firstStartedResolve();
                    await firstBlocked;
                }
                return { exitCode: 0, stdout: 'OK', stderr: '', time: 5, timedOut: false };
            }
        });

        const server = http.createServer(app);
        await new Promise((r) => server.listen(0, '127.0.0.1', r));
        const { port } = server.address();

        const sendToPort = (className) => new Promise((resolve, reject) => {
            const payload = JSON.stringify({
                className,
                code: `public class ${className} { public static void main(String[] a) {} }`
            });
            const req = http.request(
                {
                    hostname: '127.0.0.1',
                    port,
                    path: '/api/execute',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                },
                (res) => {
                    let raw = '';
                    res.setEncoding('utf8');
                    res.on('data', (c) => { raw += c; });
                    res.on('end', () => resolve({ status: res.statusCode, json: JSON.parse(raw) }));
                }
            );
            req.on('error', reject);
            req.write(payload);
            req.end();
        });

        try {
            const p1 = sendToPort('FirstJob');
            await firstStarted;
            const res2 = await sendToPort('SecondJob');
            assert.ok(
                res2.status === 503 || res2.status === 429,
                `Debe responder 503 o 429 al superar maxConcurrent, recibido: ${res2.status}`
            );
            assert.equal(res2.json.success, false);
            releaseFirst();
            const res1 = await p1;
            assert.equal(res1.status, 200);
            assert.equal(res1.json.success, true);
        } finally {
            await new Promise((r) => server.close(r));
            await fsp.rm(tempDir, { recursive: true, force: true });
        }
    });
});

describe('C-06 3.1: CORS explícito, límite de body de 64KB y rate-limit (RN-SEG-04)', () => {
    it('CORS rechaza con HTTP 403 un Origin no listado y acepta https://java.belencalvo.me sin usar *', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-cors');
        const app = createApp({
            tempDir,
            allowedOrigins: ['https://java.belencalvo.me'],
            runner: async () => ({ exitCode: 0, stdout: 'OK', stderr: '', time: 1, timedOut: false })
        });

        const badRes = await requestJson(app, {
            headers: { Origin: 'https://evil.example.com' },
            body: { className: 'Main', code: 'public class Main {}' }
        });
        assert.equal(badRes.status, 403);
        assert.notEqual(badRes.headers['access-control-allow-origin'], '*');

        const okRes = await requestJson(app, {
            headers: { Origin: 'https://java.belencalvo.me' },
            body: { className: 'Main', code: 'public class Main {}' }
        });
        assert.equal(okRes.status, 200);
        assert.equal(okRes.headers['access-control-allow-origin'], 'https://java.belencalvo.me');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('rechaza con HTTP 413 un body JSON mayor a 64KB', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-body-limit');
        let runnerCalled = false;
        const app = createApp({
            tempDir,
            runner: async () => {
                runnerCalled = true;
                return { exitCode: 0, stdout: '', stderr: '', time: 1, timedOut: false };
            }
        });

        const oversizedCode = 'public class Main { /* ' + 'A'.repeat(70 * 1024) + ' */ }';
        const res = await requestJson(app, {
            body: { className: 'Main', code: oversizedCode }
        });

        assert.equal(res.status, 413);
        assert.equal(runnerCalled, false, 'No debe invocar el runner si el body supera 64KB');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('rate-limit rechaza con HTTP 429 al superar el máximo de peticiones por ventana', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-ratelimit');
        const app = createApp({
            tempDir,
            rateLimitWindowMs: 60000,
            rateLimitMax: 2,
            runner: async () => ({ exitCode: 0, stdout: 'OK', stderr: '', time: 1, timedOut: false })
        });

        const r1 = await requestJson(app, { body: { className: 'Main', code: 'public class Main {}' } });
        const r2 = await requestJson(app, { body: { className: 'Main', code: 'public class Main {}' } });
        const r3 = await requestJson(app, { body: { className: 'Main', code: 'public class Main {}' } });

        assert.equal(r1.status, 200);
        assert.equal(r2.status, 200);
        assert.equal(r3.status, 429);
        assert.equal(r3.json.success, false);
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('triangulación: GET /health devuelve 200, OPTIONS preflight con Origin permitido devuelve 204 y JSON malformado devuelve 400', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-triang-3-1');
        const app = createApp({
            tempDir,
            allowedOrigins: ['https://java.belencalvo.me'],
            runner: async () => ({ exitCode: 0, stdout: 'OK', stderr: '', time: 1, timedOut: false })
        });

        const health = await requestJson(app, { method: 'GET', url: '/health' });
        assert.equal(health.status, 200);
        assert.equal(health.json.status, 'ok');

        const preflight = await requestJson(app, {
            method: 'OPTIONS',
            url: '/api/execute',
            headers: { Origin: 'https://java.belencalvo.me' }
        });
        assert.equal(preflight.status, 204);
        assert.equal(preflight.headers['access-control-allow-origin'], 'https://java.belencalvo.me');

        const badJson = await requestJson(app, {
            method: 'POST',
            url: '/api/execute',
            body: '{json_roto:'
        });
        assert.equal(badJson.status, 400);
        assert.equal(badJson.json.success, false);
        await fsp.rm(tempDir, { recursive: true, force: true });
    });
});

describe('C-06 4.1: killSignal SIGKILL, maxBuffer > 1MB sin falso timeout, limpieza de rateBuckets y notas operativas', () => {
    it('runExecFile configura killSignal: SIGKILL y termina un programa con shutdown hook en bucle infinito dentro del timeout sin dejar java huérfano', async () => {
        const source = fs.readFileSync(SERVER_PATH, 'utf8');
        assert.match(source, /killSignal\s*:\s*['"]SIGKILL['"]/, 'runExecFile debe especificar killSignal: "SIGKILL"');

        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-sigkill-hook');
        await fsp.rm(tempDir, { recursive: true, force: true });

        const app = createApp({ tempDir, timeout: 700 });
        const code = [
            'public class ShutdownHookLoop {',
            '    public static void main(String[] args) {',
            '        Runtime.getRuntime().addShutdownHook(new Thread(() -> {',
            '            while (true) {}',
            '        }));',
            '        while (true) {}',
            '    }',
            '}'
        ].join('\n');

        const start = Date.now();
        const res = await requestJson(app, {
            body: { className: 'ShutdownHookLoop', code }
        });
        const elapsed = Date.now() - start;

        assert.equal(res.status, 200);
        assert.equal(res.json.success, false);
        assert.equal(res.json.stage, 'execution');
        assert.match(res.json.stderr, /tiempo límite/i);
        assert.ok(elapsed < 4000, `Debe cortar dentro del margen del timeout con SIGKILL (tardó ${elapsed}ms)`);

        const remaining = fs.existsSync(tempDir) ? await fsp.readdir(tempDir) : [];
        assert.equal(remaining.length, 0, 'Sin procesos java huérfanos reteniendo workDir');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('programa que imprime más de 1 MB (ERR_CHILD_PROCESS_STDIO_MAXBUFFER) NO se clasifica como timeout: devuelve salida truncada a 10KB, exitCode 1 (success: false) y mensaje claro de salida excesiva', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-maxbuffer-real');
        await fsp.rm(tempDir, { recursive: true, force: true });

        const app = createApp({ tempDir, timeout: 5000, maxOutput: 10000 });
        const code = [
            'public class FloodOutput {',
            '    public static void main(String[] args) {',
            '        String chunk = "A".repeat(65536);',
            '        for (int i = 0; i < 20; i++) {',
            '            System.out.println(chunk);',
            '        }',
            '    }',
            '}'
        ].join('\n');

        const res = await requestJson(app, {
            body: { className: 'FloodOutput', code }
        });

        assert.equal(res.status, 200);
        assert.equal(res.json.success, false, 'exitCode 1 debe traducirse en success: false');
        assert.equal(res.json.stage, 'execution');
        assert.equal(res.json.stdout.length, 10000, 'stdout debe venir truncado exactamente a 10KB (10000 chars)');
        assert.equal(res.json.output.length, 10000, 'output debe venir truncado exactamente a 10KB (10000 chars)');
        assert.doesNotMatch(res.json.stderr, /tiempo límite|timeout/i, 'No debe clasificar maxBuffer como timeout');
        assert.match(res.json.stderr, /salida excesiva|límite máximo de salida/i, `Debe dar mensaje claro de salida excesiva, recibido: ${res.json.stderr}`);

        const remaining = fs.existsSync(tempDir) ? await fsp.readdir(tempDir) : [];
        assert.equal(remaining.length, 0, 'workDir debe limpiarse en finally tras maxBuffer');
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('rateBuckets limpia periódicamente las entradas vencidas al procesar requests sin dejar timers activos', async () => {
        const { createApp } = require(SERVER_PATH);
        const tempDir = path.join(__dirname, '..', 'backend', 'temp-test-ratebucket-purge');
        const app = createApp({
            tempDir,
            rateLimitWindowMs: 40,
            rateLimitMax: 5,
            runner: async () => ({ exitCode: 0, stdout: 'OK', stderr: '', time: 1, timedOut: false })
        });

        assert.equal(typeof app.getRateBucketSize, 'function', 'app debe exponer getRateBucketSize() para verificar limpieza de rateBuckets');

        // Sembrar entradas para múltiples clientes simulados y verificar purga tras vencer la ventana
        app._seedRateBucketForTest('10.0.0.1', Date.now() - 200);
        app._seedRateBucketForTest('10.0.0.2', Date.now() - 200);
        app._seedRateBucketForTest('10.0.0.3', Date.now() - 200);
        assert.equal(app.getRateBucketSize(), 3);

        const res = await requestJson(app, {
            body: { className: 'Main', code: 'public class Main {}' }
        });
        assert.equal(res.status, 200);
        assert.equal(
            app.getRateBucketSize(),
            1,
            'Las 3 entradas vencidas deben haberse eliminado al entrar el nuevo request, quedando solo la IP actual'
        );
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    it('docs/execution-options.md y la cabecera de backend/server.js documentan X-Forwarded-For, contenedor sin secretos/.env en disco y falta de stdin actual para Scanner', () => {
        const serverSource = fs.readFileSync(SERVER_PATH, 'utf8');
        const docsPath = path.join(__dirname, '..', 'docs', 'execution-options.md');
        const docsSource = fs.readFileSync(docsPath, 'utf8');

        for (const [label, content] of [['backend/server.js', serverSource], ['docs/execution-options.md', docsSource]]) {
            assert.match(content, /X-Forwarded-For/i, `${label} debe documentar X-Forwarded-For detrás de proxy confiable`);
            assert.match(content, /\.env/, `${label} debe documentar que el contenedor debe correr sin archivos con secretos ni .env en disco`);
            assert.match(content, /stdin/i, `${label} debe documentar que hoy no recibe stdin para Scanner`);
            assert.match(content, /Scanner/, `${label} debe mencionar los ejercicios con Scanner`);
        }
    });
});
