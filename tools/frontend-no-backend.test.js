'use strict';
// Tests TDD para el change c-04-frontend-no-backend.
// Runner: node --test tools/frontend-no-backend.test.js (sin dependencias nuevas).
// Grupos 1-2 (lógica de degradación + storage seguro). Grupos 3-4 son
// verificación manual visual (ver tasks.md) y solo aportan aquí
// chequeos de contrato sobre cadenas visibles exactas.

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEGRADED = 'ejecución no disponible — validando por reglas';
const LOCAL_ONLY = 'tu progreso se guarda solo en este navegador';

function readRepo(name) {
  return fs.readFileSync(path.join(REPO_ROOT, name), 'utf8');
}

function loadExecutor() {
  const p = path.join(REPO_ROOT, 'java-executor.js');
  delete require.cache[require.resolve(p)];
  return require(p);
}

// Carga script.js en una sandbox con localStorage real o que lanza.
function loadScriptSandbox({ storageThrows = false } = {}) {
  const src = readRepo('script.js');
  const mem = {};
  const throwing = {
    getItem() { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; },
    setItem() { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; },
    removeItem() { const e = new Error('SecurityError'); e.name = 'SecurityError'; throw e; },
  };
  const working = {
    getItem(k) { return Object.hasOwn(mem, k) ? mem[k] : null; },
    setItem(k, v) { mem[k] = String(v); },
    removeItem(k) { delete mem[k]; },
  };
  const sandbox = {
    console,
    localStorage: storageThrows ? throwing : working,
    document: {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      createElement: () => null,
    },
    lessonsData: [],
    window: { __storageNotices: [] },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__api = { ProgressManager, safeGet, safeSet, safeRemove, LOCAL_ONLY_NOTICE };`, sandbox, { filename: 'script.js' });
  return { api: sandbox.__api, sandbox };
}

function withFetch(stub, fn) {
  const prev = globalThis.fetch;
  globalThis.fetch = stub;
  return Promise.resolve()
    .then(fn)
    .finally(() => { globalThis.fetch = prev; });
}

function countingFetch(behavior) {
  let calls = 0;
  const stub = (...args) => { calls += 1; return behavior(...args, calls); };
  stub.calls = () => calls;
  return stub;
}

describe('1.1 backend ausente → mensaje exacto + sin fetch', () => {
  test('isBackendConfigured: ambos vacíos → false (sin red)', () => {
    const ex = loadExecutor();
    assert.equal(ex.isBackendConfigured('', ''), false);
  });

  test('isBackendConfigured triangula: configurado → true; parcial → false; indefinido → false', () => {
    const ex = loadExecutor();
    assert.equal(ex.isBackendConfigured('http://x', 'http://x/api/execute'), true);
    assert.equal(ex.isBackendConfigured('http://x', ''), false);
    assert.equal(ex.isBackendConfigured('', 'http://x/api/execute'), false);
    assert.equal(ex.isBackendConfigured(undefined, undefined), false);
  });

  test('resolveExecutionPlan: ausente → modo reglas con mensaje exacto; configurado → remoto', () => {
    const ex = loadExecutor();
    const absent = ex.resolveExecutionPlan({ backendUrl: '', executeEndpoint: '' });
    assert.equal(absent.mode, 'rules');
    assert.equal(absent.message, DEGRADED);
    const remote = ex.resolveExecutionPlan({ backendUrl: 'http://x', executeEndpoint: 'http://x/api/execute' });
    assert.equal(remote.mode, 'remote');
    const partial = ex.resolveExecutionPlan({ backendUrl: 'http://x', executeEndpoint: '' });
    assert.equal(partial.mode, 'rules');
    assert.equal(partial.message, DEGRADED);
  });

  test('execute con endpoint vacío: cero fetch y mensaje exacto de degradación', async () => {
    const ex = loadExecutor();
    const stub = countingFetch(() => { throw new Error('fetch no debería llamarse'); });
    await withFetch(stub, async () => {
      const executor = new ex.JavaExecutor('');
      const result = await executor.execute('class Main {}', 'Main');
      assert.equal(stub.calls(), 0);
      assert.equal(result.degraded, true);
      assert.ok((result.errors || []).concat([result.notice || '']).includes(DEGRADED));
    });
  });

  test('checkHealth con endpoint vacío: false sin fetch', async () => {
    const ex = loadExecutor();
    const stub = countingFetch(() => { throw new Error('fetch no debería llamarse'); });
    await withFetch(stub, async () => {
      const executor = new ex.JavaExecutor('');
      assert.equal(await executor.checkHealth(), false);
      assert.equal(stub.calls(), 0);
    });
  });
});

describe('1.3 backend caído/timeout → intento único + error legible con stage', () => {
  test('fetch rechaza → un solo intento, mensaje exacto, sin URL ni reintento', async () => {
    const ex = loadExecutor();
    const stub = countingFetch(() => Promise.reject(new Error('fetch failed')));
    await withFetch(stub, async () => {
      const executor = new ex.JavaExecutor('http://ejemplo/api/execute', 1000);
      const result = await executor.execute('class Main {}', 'Main');
      assert.equal(stub.calls(), 1);
      assert.equal(result.attempts, 1);
      assert.equal(result.degraded, true);
      const visible = JSON.stringify(result.errors) + (result.notice || '');
      assert.ok(visible.includes(DEGRADED));
      assert.ok(!visible.includes('http'), 'no debe exponer URLs internas');
    });
  });

  test('HTTP no-OK → un solo intento y error en español con stage, sin URL', async () => {
    const ex = loadExecutor();
    const stub = countingFetch(() => Promise.resolve({ ok: false, status: 500 }));
    await withFetch(stub, async () => {
      const executor = new ex.JavaExecutor('http://ejemplo/api/execute', 1000);
      const result = await executor.execute('class Main {}', 'Main');
      assert.equal(stub.calls(), 1);
      assert.equal(result.attempts, 1);
      const visible = JSON.stringify(result.errors);
      assert.ok(!visible.includes('http'));
      assert.ok(/compilaci|ejecuci|conexi|etapa/i.test(visible));
    });
  });

  test('timeout aborta con CONFIG.executionTimeout y rotula stage execution', async () => {
    const ex = loadExecutor();
    const stub = countingFetch(
      (_url, opts) => new Promise((_, reject) => {
        opts.signal.addEventListener('abort', () => {
          const e = new Error('aborted');
          e.name = 'AbortError';
          reject(e);
        });
      }),
    );
    await withFetch(stub, async () => {
      const executor = new ex.JavaExecutor('http://ejemplo/api/execute', 50);
      const result = await executor.execute('class Main {}', 'Main');
      assert.equal(stub.calls(), 1);
      assert.equal(result.attempts, 1);
      assert.equal(result.degraded, true);
      assert.equal(result.stage, 'execution');
      assert.ok(JSON.stringify(result.errors).includes('execution'));
    });
  });

  test('formatStageError es puro: español + stage, sin URL ni stacktrace (2 casos)', () => {
    const ex = loadExecutor();
    const timeout = ex.formatStageError('compilation', Object.assign(new Error('x'), { name: 'AbortError' }));
    assert.ok(timeout.includes('compilation'));
    assert.ok(/espa|tiempo|espera|completar/i.test(timeout));
    assert.ok(!timeout.includes('http'));
    assert.ok(!timeout.includes('cd backend'));
    assert.ok(!/at\s+\S+\s*\(/.test(timeout));
    const net = ex.formatStageError('execution', new Error('fetch failed http://interna:3000/x'));
    assert.ok(net.includes('execution'));
    assert.ok(!net.includes('http'));
  });

  test('éxito remoto intacto: respuesta OK se propaga con su stage', async () => {
    const ex = loadExecutor();
    const stub = countingFetch(() => Promise.resolve({
      ok: true,
      json: async () => ({ success: true, output: 'hola', stage: 'execution' }),
    }));
    await withFetch(stub, async () => {
      const executor = new ex.JavaExecutor('http://ejemplo/api/execute', 1000);
      const result = await executor.execute('class Main {}', 'Main');
      assert.equal(result.success, true);
      assert.equal(result.output, 'hola');
      assert.equal(result.stage, 'execution');
    });
  });
});

describe('2.1 safeStorage: storage bloqueado → aviso + app operativa en memoria', () => {
  test('safeSet/safeGet/safeRemove existen y son funciones', () => {
    const { api } = loadScriptSandbox();
    assert.equal(typeof api.safeGet, 'function');
    assert.equal(typeof api.safeSet, 'function');
    assert.equal(typeof api.safeRemove, 'function');
  });

  test('storage que lanza: no lanza, avisa en español sin jerga y sigue en memoria', () => {
    const { api } = loadScriptSandbox({ storageThrows: true });
    const notices = [];
    assert.equal(api.safeSet({}, 'k', 'v', (m) => notices.push(m)), false);
    assert.equal(notices.length, 1);
    assert.ok(!/localStorage|firebase|backend/i.test(notices[0]), 'aviso sin jerga interna');
    assert.equal(api.safeGet({}, 'k', null, () => {}), 'v');
    assert.equal(api.safeRemove({}, 'k', () => {}), false);
  });

  test('storage sano triangula: guarda y lee sin avisos', () => {
    const { api, sandbox } = loadScriptSandbox();
    const notices = [];
    assert.equal(api.safeSet(sandbox.localStorage, 'k', 'v', (m) => notices.push(m)), true);
    assert.equal(api.safeGet(sandbox.localStorage, 'k', null, (m) => notices.push(m)), 'v');
    assert.equal(notices.length, 0);
  });

  test('ProgressManager con storage bloqueado: no lanza, guarda en memoria y avisa', () => {
    const { api, sandbox } = loadScriptSandbox({ storageThrows: true });
    const pm = new api.ProgressManager();
    pm.markAsCompleted(3);
    assert.equal(pm.isCompleted(3), true);
    assert.ok(sandbox.window.__storageNotices.length >= 1);
    assert.ok(sandbox.window.__storageNotices.every((m) => !/localStorage|firebase|backend/i.test(m)));
  });
});

describe('contrato UI visible (cadenas exactas y prohibidas)', () => {
  test('script-enhanced degrada con mensaje exacto y loading por reglas', () => {
    const src = readRepo('script-enhanced.js');
    assert.ok(src.includes(DEGRADED));
    assert.ok(src.includes('Validando por reglas…'));
  });

  test('script-enhanced sin instrucciones de backend ni falsa IA', () => {
    const src = readRepo('script-enhanced.js');
    assert.ok(!src.includes('cd backend'));
    assert.ok(!src.includes('Feedback de IA'));
    assert.ok(!src.includes('Funcionalidad:'));
  });

  test('script.js mantiene aviso local-only persistente en lenguaje simple', () => {
    const src = readRepo('script.js');
    assert.ok(src.includes(LOCAL_ONLY));
    assert.ok(!/localStorage|firebase|backend/i.test(LOCAL_ONLY));
  });
});
