'use strict';
// c-11-editor-ux, tarea 1.1 (RED): tests del cálculo puro del aviso de
// llaves. Patrón `vm` de C-10 (`node --test`, cero deps). NUNCA toca
// validator.js, script-enhanced.js ni data.js.
//
// Contrato de `braceNotice(code)` (vive junto a la validación en
// validator.js, scope global):
//   - devuelve `null` si `{` y `}` están balanceadas (ignorando el
//     contenido entre comillas simples/dobles y los comentarios `//`);
//   - si hay más `{` que `}`: texto con "falta una llave de cierre";
//   - si hay más `}` que `{` y hay al menos una `{`: "sobra una llave de cierre";
//   - si hay `}` pero ninguna `{`: "falta una llave de apertura".
// Solo texto para el estudiante (español simple); el veredicto `success`
// NUNCA depende de este helper (ver describe de veredicto-inmutable abajo).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.join(__dirname, '..');

// Carga validator.js + script-enhanced.js en el MISMO sandbox (orden igual
// al de index.html: validator.js antes que script-enhanced.js), con stubs
// mínimos de DOM para las líneas de carga de script-enhanced.js
// (`window.openLesson`, `document.addEventListener`).
function loadApp() {
  const sandbox = {
    console,
    window: {},
    document: { addEventListener() {} },
    exercisesData: [],
  };
  vm.createContext(sandbox);
  const validatorSrc = fs.readFileSync(path.join(REPO_ROOT, 'validator.js'), 'utf8');
  vm.runInContext(
    `${validatorSrc}\nthis.__braceNotice = (typeof braceNotice === 'function') ? braceNotice : undefined;`,
    sandbox,
    { filename: 'validator.js' }
  );
  const enhancedSrc = fs.readFileSync(path.join(REPO_ROOT, 'script-enhanced.js'), 'utf8');
  vm.runInContext(
    `${enhancedSrc}\nthis.__validateByRules = (typeof validateByRules === 'function') ? validateByRules : undefined;`,
    sandbox,
    { filename: 'script-enhanced.js' }
  );
  return sandbox;
}

const app = loadApp();
const braceNotice = app.__braceNotice;
const validateByRules = app.__validateByRules;

// Ejercicio falso de solo-indentación (lección 1): evita leer data.js y
// prueba la rama exacta que el change toca en validateByRules.
const INDENT_EXERCISE = {
  id: 9001,
  lessonId: 1,
  validation: { checkIndentation: true },
  solution: 'class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}',
};

describe('c-11 braceNotice: cálculo puro del aviso de llaves', () => {
  it('existe como función global junto a la validación', () => {
    assert.strictEqual(typeof braceNotice, 'function');
  });

  it('balanceado → null (sin aviso)', () => {
    assert.strictEqual(braceNotice('class A {\n    void m() {\n    }\n}'), null);
  });

  it('vacío → null', () => {
    assert.strictEqual(braceNotice(''), null);
  });

  it('falta cierre (más { que }): avisa que falta una llave de cierre', () => {
    const msg = braceNotice('class A {\n    void m() {\n        System.out.println("x");\n');
    assert.ok(typeof msg === 'string' && /falta una llave de cierre/.test(msg), `inesperado: ${msg}`);
  });

  it('sobra cierre (más } que {): avisa que sobra una llave de cierre', () => {
    const msg = braceNotice('class A {\n    void m() {\n    }\n}\n}');
    assert.ok(typeof msg === 'string' && /sobra una llave de cierre/.test(msg), `inesperado: ${msg}`);
  });

  it('falta apertura (hay } pero ninguna {): avisa que falta apertura', () => {
    const msg = braceNotice('System.out.println("hola");\n}');
    assert.ok(typeof msg === 'string' && /falta una llave de apertura/.test(msg), `inesperado: ${msg}`);
  });

  it('llaves dentro de strings se ignoran', () => {
    assert.strictEqual(braceNotice('String a = "{";\nString b = "}";'), null);
    assert.strictEqual(braceNotice("char c = '{';\nclass A {\n}"), null);
  });

  it('llaves dentro de comentarios // se ignoran', () => {
    assert.strictEqual(braceNotice('// }\nclass A {\n}'), null);
    assert.strictEqual(braceNotice('class A {\n} // {'), null);
  });

  it('triangulación: comillas escapadas dentro de strings no rompen el conteo', () => {
    assert.strictEqual(braceNotice('String s = "a \\" { b";\nclass A {\n}'), null);
    assert.strictEqual(braceNotice("char c = '\\'';\nclass A {\n}"), null);
  });

  it('triangulación: strings balanceados no ocultan un desbalance real', () => {
    const msg = braceNotice('String s = "{}";\nclass A {\n    void m() {\n');
    assert.ok(typeof msg === 'string' && /falta una llave de cierre/.test(msg), `inesperado: ${msg}`);
  });
});

describe('c-11 veredicto-inmutable: el aviso no cambia success', () => {
  it('validateByRules existe (rama real de script-enhanced.js)', () => {
    assert.strictEqual(typeof validateByRules, 'function');
  });

  it('solución canónica: éxito sin aviso de llaves', () => {
    const r = validateByRules(INDENT_EXERCISE.solution, INDENT_EXERCISE);
    assert.strictEqual(r.success, true);
    assert.strictEqual(r.errors.length, 0);
  });

  it('mal indentado con llaves balanceadas: fallo con mensaje genérico, sin aviso', () => {
    const bad = 'class Hola {\n   public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}';
    const r = validateByRules(bad, INDENT_EXERCISE);
    assert.strictEqual(r.success, false, 'el veredicto cambió: antes era fallo');
    assert.ok(/indentación no coincide/.test(r.errors[0].message));
    assert.ok(!/llave/.test(r.errors[0].message), `aviso inesperado: ${r.errors[0].message}`);
  });

  it('falta cierre: fallo (igual que antes) + aviso de llave de más/menos', () => {
    const missing = 'class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n';
    const r = validateByRules(missing, INDENT_EXERCISE);
    assert.strictEqual(r.success, false, 'el veredicto cambió: antes era fallo');
    assert.ok(/indentación no coincide/.test(r.errors[0].message), 'el mensaje base se perdió');
    assert.ok(/falta una llave de cierre/.test(r.errors[0].message), `sin aviso: ${r.errors[0].message}`);
  });

  it('sobra cierre: fallo (igual que antes) + aviso de sobra', () => {
    const extra = `${INDENT_EXERCISE.solution}\n}`;
    const r = validateByRules(extra, INDENT_EXERCISE);
    assert.strictEqual(r.success, false, 'el veredicto cambió: antes era fallo');
    assert.ok(/sobra una llave de cierre/.test(r.errors[0].message), `sin aviso: ${r.errors[0].message}`);
  });

  it('triangulación: cierre sin apertura: fallo (igual que antes) + aviso de apertura', () => {
    const r = validateByRules('System.out.println("hola");\n}', INDENT_EXERCISE);
    assert.strictEqual(r.success, false, 'el veredicto cambió: antes era fallo');
    assert.ok(/falta una llave de apertura/.test(r.errors[0].message), `sin aviso: ${r.errors[0].message}`);
  });
});
