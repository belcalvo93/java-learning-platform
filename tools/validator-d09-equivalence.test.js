'use strict';
// C-18 cierre, D-09: `X++` vale igual que `X += 1` y que `X = X + 1`
// (solo con 1 literal), salvo donde la consigna exige la forma `++`/`--`
// (ids 21, 22, 23). Paréntesis de más pero válidos en Java (p. ej.
// `((a + b))`) se aceptan. TDD: estos tests se escribieron ANTES del
// cambio en validator.js (RED primero). NO toca data.js.

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
const solutionOf = (id) => exercises.find((e) => e.id === id).solution;
const check = (id, code) => new JavaValidator().validate(code, id);

describe('c-18 D-09: incremento equivalente aceptado donde ++ no es el concepto', () => {
  const ACCEPT = {
    // 174: el concepto es synchronized, `contador++` es incidental.
    174: ['public synchronized void incrementar() {\n    contador += 1;\n}',
      'public synchronized void incrementar() {\n    contador = contador + 1;\n}'],
    // 27: la consigna nombra `+=` para suma, pero el `i++` es incidental.
    27: ['int suma = 0;\nint i = 1;\nwhile (i <= 100) {\n    suma += i;\n    i += 1;\n}\nSystem.out.println(suma);',
      'int suma = 0;\nint i = 1;\nwhile (i <= 100) {\n    suma += i;\n    i = i + 1;\n}\nSystem.out.println(suma);'],
    24: ['for (int i = 1; i <= 10; i += 1) {\n    if (i == 5) break;\n    System.out.println(i);\n}',
      'for (int i = 1; i <= 10; i = i + 1) {\n    if (i == 5) break;\n    System.out.println(i);\n}'],
    25: ['for (int i = 1; i <= 5; i += 1) {\n    if (i % 2 == 0) continue;\n    System.out.println(i);\n}',
      'for (int i = 1; i <= 5; i = i + 1) {\n    if (i % 2 == 0) continue;\n    System.out.println(i);\n}'],
    // 26: la consigna dice "recorre", no nombra `++`.
    26: ['for (int i = 2; i <= 3; i += 1) {\n    for (int j = 1; j <= 5; j += 1) {\n        System.out.println(i + " x " + j + " = " + (i * j));\n    }\n}',
      'for (int i = 2; i <= 3; i = i + 1) {\n    for (int j = 1; j <= 5; j = j + 1) {\n        System.out.println(i + " x " + j + " = " + (i * j));\n    }\n}'],
    46: ['for (int i = 0; i < nums.length; i += 1) {\n    System.out.println(nums[i]);\n}',
      'for (int i = 0; i < nums.length; i = i + 1) {\n    System.out.println(nums[i]);\n}'],
    52: ['for (int i = 0; i < m.length; i += 1) {\n    for (int j = 0; j < m[i].length; j += 1) {\n        System.out.print(m[i][j] + " ");\n    }\n    System.out.println();\n}'],
    // 4: ya aceptaba las 3 formas por regex (regresión).
    4: ['for (int k = 0; k < 5; k += 1) {\n    if (k % 2 == 0) {\n        System.out.println(k);\n    }\n}',
      'for (int k = 0; k < 5; k = k + 1) {\n    if (k % 2 == 0) {\n        System.out.println(k);\n    }\n}'],
  };
  for (const [id, codes] of Object.entries(ACCEPT)) {
    for (const [n, code] of codes.entries()) {
      it(`id ${id}: incremento equivalente ${n + 1} aceptado`, () => {
        const r = check(Number(id), code);
        assert.strictEqual(r.isValid, true, `id ${id} variante ${n + 1} rechazada: ${JSON.stringify(r.errors)}`);
      });
    }
  }

  // Solo el 1 literal equivale: con otro valor se rechaza (D-06).
  it('id 24: i += 2 rechazado (solo el 1 equivale a ++)', () => {
    const r = check(24, 'for (int i = 1; i <= 10; i += 2) {\n    if (i == 5) break;\n    System.out.println(i);\n}');
    assert.strictEqual(r.isValid, false);
  });
  it('id 24: i = i + 2 rechazado', () => {
    const r = check(24, 'for (int i = 1; i <= 10; i = i + 2) {\n    if (i == 5) break;\n    System.out.println(i);\n}');
    assert.strictEqual(r.isValid, false);
  });
  // `suma = suma + i` NO es `suma++`: la acumulación con otra variable
  // sigue exigiendo `+=` (decisión del lote 2 + trampa del browser-check).
  it('id 27: suma = suma + i rechazado (no equivale a +=)', () => {
    const r = check(27, 'int suma = 0;\nint i = 1;\nwhile (i <= 100) {\n    suma = suma + i;\n    i++;\n}\nSystem.out.println(suma);');
    assert.strictEqual(r.isValid, false);
  });
});

describe('c-18 D-09: ids estrictos (la consigna exige la forma ++/--)', () => {
  // 21: "lo incremente con `i++`". 23: "súmale 1 con `i++`".
  // 22: "baja con `i--`" (`--` fuera del alcance de la equivalencia).
  const STRICT = {
    21: ['while (i <= 5) {\n    System.out.println(i);\n    i += 1;\n}',
      'while (i <= 5) {\n    System.out.println(i);\n    i = i + 1;\n}'],
    23: ['int i = 0;\ndo {\n    System.out.println(i);\n    i += 1;\n} while (i < 3);',
      'int i = 0;\ndo {\n    System.out.println(i);\n    i = i + 1;\n} while (i < 3);'],
    22: ['for (int i = 10; i >= 1; i -= 1) {\n    System.out.println(i);\n}',
      'for (int i = 10; i >= 1; i = i - 1) {\n    System.out.println(i);\n}'],
  };
  for (const [id, codes] of Object.entries(STRICT)) {
    it(`id ${id}: canónica con ++/-- aceptada`, () => {
      const r = check(Number(id), solutionOf(Number(id)));
      assert.strictEqual(r.isValid, true, `id ${id} canónica rechazada: ${JSON.stringify(r.errors)}`);
    });
    for (const [n, code] of codes.entries()) {
      it(`id ${id}: forma equivalente ${n + 1} rechazada (consigna exige ++/--)`, () => {
        const r = check(Number(id), code);
        assert.strictEqual(r.isValid, false, `id ${id} variante ${n + 1} aceptada debiendo ser estricta`);
      });
    }
  }
});

describe('c-18 D-09: paréntesis de más pero válidos aceptados', () => {
  it('id 13: ((a + b)) aceptado (regresión: ya valía por subsecuencia)', () => {
    const r = check(13, 'int s = ((a + b));');
    assert.strictEqual(r.isValid, true, `rechazado: ${JSON.stringify(r.errors)}`);
  });
  it('id 20: condición con paréntesis dobles aceptada (regresión)', () => {
    const r = check(20, 'if ((a && (b || c))) { }');
    assert.strictEqual(r.isValid, true, `rechazado: ${JSON.stringify(r.errors)}`);
  });
  it('id 4: if con paréntesis dobles aceptado', () => {
    const r = check(4, 'for (int k = 0; k < 5; k++) {\n    if (((k % 2 == 0))) {\n        System.out.println(k);\n    }\n}');
    assert.strictEqual(r.isValid, true, `rechazado: ${JSON.stringify(r.errors)}`);
  });
  it('id 4: println con paréntesis dobles aceptado', () => {
    const r = check(4, 'for (int k = 0; k < 5; k++) {\n    if (k % 2 == 0) {\n        System.out.println(((k)));\n    }\n}');
    assert.strictEqual(r.isValid, true, `rechazado: ${JSON.stringify(r.errors)}`);
  });
  it('id 45: println((nums.length)) aceptado', () => {
    const r = check(45, 'System.out.println((nums.length));');
    assert.strictEqual(r.isValid, true, `rechazado: ${JSON.stringify(r.errors)}`);
  });
  // Los paréntesis con significado NO se quitan: sin ellos cambia la lógica.
  it('id 20: sin paréntesis en (b || c) rechazado', () => {
    const r = check(20, 'if (a && b || c) { }');
    assert.strictEqual(r.isValid, false);
  });
});
