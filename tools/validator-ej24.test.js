'use strict';
// Revisión ejercicio 24 (Break en Bucle) — Camino 1 (TDD en validator.js):
// - CA-1: límite equivalente `i < 11` aceptado (`alts` en STRUCT_RULES[24]).
// - CA-2: `System.out.println(i)` dentro de un `else` aceptado.
// - CA-3: `System.out.println(i)` dentro del bloque `{ ... }` del `if`
//   después de `break` rechazado (código inalcanzable, no imprime 1..4),
//   con mensaje conceptual en español sin filtrar la solución.
// - CA-4: no-regresión de variantes válidas y trampas del ejercicio 24.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.join(__dirname, '..');

function loadExercises() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__exercises = exercisesData;`, sandbox, { filename: 'data.js' });
  return Array.from(sandbox.__exercises, (e) => ({ ...e }));
}

function loadValidatorClass(exercises) {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'validator.js'), 'utf8');
  const sandbox = { exercisesData: exercises, console };
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__JavaValidator = JavaValidator;`, sandbox, { filename: 'validator.js' });
  return sandbox.__JavaValidator;
}

const exercises = loadExercises();
const JavaValidator = loadValidatorClass(exercises);
const ej24 = exercises.find((e) => e.id === 24);
const check24 = (code) => new JavaValidator().validate(code, 24);

describe('Ejercicio 24 (Break en Bucle) — CA-1: límite equivalente i < 11', () => {
  it('acepta for con i < 11 (equivalente a i <= 10 para enteros desde 1)', () => {
    const r = check24(
      'for (int i = 1; i < 11; i++) {\n    if (i == 5) break;\n    System.out.println(i);\n}'
    );
    assert.strictEqual(r.isValid, true, `i < 11 rechazado: ${JSON.stringify(r.errors)}`);
    assert.strictEqual(r.errors.length, 0);
  });

  it('triangula CA-1: acepta i < 11 combinado con llaves en el if e incremento i += 1', () => {
    const r = check24(
      'for (int i = 1; i < 11; i += 1) {\n    if (i == 5) {\n        break;\n    }\n    System.out.println(i);\n}'
    );
    assert.strictEqual(r.isValid, true, `i < 11 + llaves rechazado: ${JSON.stringify(r.errors)}`);
    assert.strictEqual(r.errors.length, 0);
  });
});

describe('Ejercicio 24 (Break en Bucle) — CA-2: println dentro de else', () => {
  it('acepta if (i == 5) { break; } else { System.out.println(i); }', () => {
    const r = check24(
      'for (int i = 1; i <= 10; i++) {\n    if (i == 5) {\n        break;\n    } else {\n        System.out.println(i);\n    }\n}'
    );
    assert.strictEqual(r.isValid, true, `else con llaves rechazado: ${JSON.stringify(r.errors)}`);
    assert.strictEqual(r.errors.length, 0);
  });

  it('triangula CA-2: acepta else sin llaves opcionales', () => {
    const r = check24(
      'for (int i = 1; i <= 10; i++) {\n    if (i == 5) break;\n    else System.out.println(i);\n}'
    );
    assert.strictEqual(r.isValid, true, `else sin llaves rechazado: ${JSON.stringify(r.errors)}`);
    assert.strictEqual(r.errors.length, 0);
  });
});

describe('Ejercicio 24 (Break en Bucle) — CA-3: println dentro del if tras break', () => {
  it('rechaza println dentro del bloque del if después de break con mensaje conceptual sin spoiler', () => {
    const r = check24(
      'for (int i = 1; i <= 10; i++) {\n    if (i == 5) {\n        break;\n        System.out.println(i);\n    }\n}'
    );
    assert.strictEqual(r.isValid, false, 'Aceptó println inalcanzable dentro del if tras break');
    assert.ok(r.errors.length > 0, 'Debe devolver al menos un mensaje de error');
    const msg = r.errors.join(' ');
    assert.ok(!msg.includes('System.out.println(i)'), `El error filtra código de la solución: ${msg}`);
    assert.ok(!msg.includes('i == 5'), `El error filtra la condición de la solución: ${msg}`);
  });

  it('triangula CA-3: rechaza println dentro del if tras break también con i < 11 y en una línea', () => {
    const r = check24(
      'for (int i = 1; i < 11; i++) { if (i == 5) { break; System.out.println(i); } }'
    );
    assert.strictEqual(r.isValid, false, 'Aceptó println inalcanzable en una línea con i < 11');
    assert.ok(r.errors.length > 0);
  });
});

describe('Ejercicio 24 (Break en Bucle) — CA-4: no-regresión de variantes válidas y trampas', () => {
  it('acepta la solución oficial de data.js', () => {
    const r = check24(ej24.solution);
    assert.strictEqual(r.isValid, true, `Canónica rechazada: ${JSON.stringify(r.errors)}`);
    assert.strictEqual(r.errors.length, 0);
  });

  it('acepta llaves en el if', () => {
    const r = check24(
      'for (int i = 1; i <= 10; i++) {\n    if (i == 5) {\n        break;\n    }\n    System.out.println(i);\n}'
    );
    assert.strictEqual(r.isValid, true);
  });

  it('acepta todo en una línea', () => {
    const r = check24('for (int i = 1; i <= 10; i++) { if (i == 5) break; System.out.println(i); }');
    assert.strictEqual(r.isValid, true);
  });

  it('acepta incrementos equivalentes i += 1 e i = i + 1', () => {
    assert.strictEqual(
      check24('for (int i = 1; i <= 10; i += 1) {\n    if (i == 5) break;\n    System.out.println(i);\n}').isValid,
      true
    );
    assert.strictEqual(
      check24('for (int i = 1; i <= 10; i = i + 1) {\n    if (i == 5) break;\n    System.out.println(i);\n}').isValid,
      true
    );
  });

  it('rechaza starterCode sin completar', () => {
    assert.strictEqual(check24(ej24.starterCode).isValid, false);
  });

  it('rechaza solución comentada con // o /* */', () => {
    assert.strictEqual(
      check24('for (int i = 1; i <= 10; i++) {\n    // if (i == 5) break;\n    // System.out.println(i);\n}').isValid,
      false
    );
    assert.strictEqual(
      check24('for (int i = 1; i <= 10; i++) {\n    /* if (i == 5) break;\n    System.out.println(i); */\n}').isValid,
      false
    );
  });

  it('rechaza println antes del if', () => {
    assert.strictEqual(
      check24('for (int i = 1; i <= 10; i++) {\n    System.out.println(i);\n    if (i == 5) break;\n}').isValid,
      false
    );
  });

  it('rechaza otro número en la condición o en el límite', () => {
    assert.strictEqual(
      check24('for (int i = 1; i <= 10; i++) {\n    if (i == 6) break;\n    System.out.println(i);\n}').isValid,
      false
    );
    assert.strictEqual(
      check24('for (int i = 1; i < 10; i++) {\n    if (i == 5) break;\n    System.out.println(i);\n}').isValid,
      false
    );
  });

  it('rechaza variable sin declarar', () => {
    assert.strictEqual(
      check24('for (int i = 1; i <= 10; i++) {\n    if (i == 5) break;\n    System.out.println(j);\n}').isValid,
      false
    );
  });
});
