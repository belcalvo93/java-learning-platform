'use strict';
// C-18 ajuste 1 (lote 1): el atajo de igualdad exacta de ids 1-4 en
// script-enhanced.js (validateByRules) dejaba fuera las reglas nuevas de
// validator.js. Estos tests prueban el CAMINO REAL del navegador
// (validateByRules de script-enhanced.js con los ejercicios reales de
// data.js, mismo orden de carga que index.html: validator.js antes que
// script-enhanced.js, stubs mínimos de DOM). TDD: escritos en RED contra
// el atajo (fallan), en verde tras enrutar ids 1-4 por
// javaValidator.validate. Español simple, sin jerga.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.join(__dirname, '..');

function loadApp() {
  const dataSrc = fs.readFileSync(path.join(REPO_ROOT, 'data.js'), 'utf8');
  const box = {};
  vm.createContext(box);
  vm.runInContext(`${dataSrc}\nthis.__exercises = exercisesData;`, box, { filename: 'data.js' });
  const exercises = Array.from(box.__exercises, (e) => ({ ...e }));
  const sandbox = {
    console,
    window: {},
    document: { addEventListener() {} },
    exercisesData: exercises,
  };
  vm.createContext(sandbox);
  const validatorSrc = fs.readFileSync(path.join(REPO_ROOT, 'validator.js'), 'utf8');
  vm.runInContext(validatorSrc, sandbox, { filename: 'validator.js' });
  const enhancedSrc = fs.readFileSync(path.join(REPO_ROOT, 'script-enhanced.js'), 'utf8');
  vm.runInContext(
    `${enhancedSrc}\nthis.__validateByRules = (typeof validateByRules === 'function') ? validateByRules : undefined;`,
    sandbox,
    { filename: 'script-enhanced.js' }
  );
  return { exercises, validateByRules: sandbox.__validateByRules };
}

const { exercises, validateByRules } = loadApp();
const exerciseOf = (id) => exercises.find((e) => e.id === id);

describe('c-18 ajuste 1: ids 1-4 por el camino real del navegador', () => {
  it('validateByRules existe (rama real de script-enhanced.js)', () => {
    assert.strictEqual(typeof validateByRules, 'function');
  });

  it('id 1: texto distinto aceptado (misma estructura)', () => {
    const code = 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println("hola mama");\n    }\n}';
    const r = validateByRules(code, exerciseOf(1));
    assert.strictEqual(r.success, true, `el atajo exacto rechaza una variante válida: ${JSON.stringify(r.errors)}`);
  });

  it('id 1: texto distinto + espaciado distinto válido aceptado', () => {
    const code = '    public class Ejemplo {\n        public static void main(String[] args) {\n            System.out.println("otra cosa");\n        }\n    }';
    const r = validateByRules(code, exerciseOf(1));
    assert.strictEqual(r.success, true, `el atajo exacto rechaza una variante válida: ${JSON.stringify(r.errors)}`);
  });

  it('id 1: respuesta pegada en comentario se rechaza', () => {
    const code = '// public class Ejemplo {\n// public static void main(String[] args) {\n// System.out.println("Hola");\n// }\n// }';
    const r = validateByRules(code, exerciseOf(1));
    assert.strictEqual(r.success, false, 'la respuesta en comentario no puede aprobar');
  });

  it('id 2: variante válida aceptada por el camino real', () => {
    const code = 'if (edad >= 18) {\n    System.out.println("Grande");\n} else {\n    System.out.println("Chico");\n}';
    const r = validateByRules(code, exerciseOf(2));
    assert.strictEqual(r.success, true, `el atajo exacto rechaza una variante válida: ${JSON.stringify(r.errors)}`);
  });

  it('id 3: variante válida aceptada por el camino real', () => {
    const code = 'class P {\n    void a() {\n        System.out.println("uno");\n    }\n\n    void b() {\n        System.out.println("dos");\n    }\n}';
    const r = validateByRules(code, exerciseOf(3));
    assert.strictEqual(r.success, true, `el atajo exacto rechaza una variante válida: ${JSON.stringify(r.errors)}`);
  });

  it('id 4: variante válida con contador renombrado aceptada por el camino real', () => {
    const code = 'for (int k = 0; k < 5; k++) {\n    if (k % 2 == 0) {\n        System.out.println(k);\n    }\n}';
    const r = validateByRules(code, exerciseOf(4));
    assert.strictEqual(r.success, true, `el atajo exacto rechaza una variante válida: ${JSON.stringify(r.errors)}`);
  });
});
