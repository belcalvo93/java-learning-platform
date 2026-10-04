'use strict';
// c-11-editor-ux, ajuste 6.3 (RED): sin salidas simuladas. Ningún ejercicio
// (ids 1–8 ni rama común) devuelve texto de salida inventado; el bloque
// "Salida del programa" solo aparece con ejecución real (C-06). Veredictos
// intactos + UI robusta sin output. Patrón `vm` (`node --test`, cero deps).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.join(__dirname, '..');
const VALIDATOR_SRC = () => fs.readFileSync(path.join(REPO_ROOT, 'validator.js'), 'utf8');
const ENHANCED_SRC = () => fs.readFileSync(path.join(REPO_ROOT, 'script-enhanced.js'), 'utf8');

const EXERCISES = [
  { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 },
  { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 },
  {
    id: 100, lessonId: 10, title: 'Común', hint: 'probá de nuevo',
    solution: 'class A {\n    void m() {\n    }\n}',
  },
];

function loadValidator() {
  const sandbox = { console, exercisesData: EXERCISES };
  vm.createContext(sandbox);
  vm.runInContext(
    `${VALIDATOR_SRC()}\nthis.__V = { JavaValidator, javaValidator };`,
    sandbox,
    { filename: 'validator.js' }
  );
  return sandbox.__V;
}

// Casos válidos por ejercicio (pasan los chequeos generales: indentación
// múltiplos de 4, llaves balanceadas, punto y coma). Actualizados a las
// reglas estructurales del lote 1 (C-18): nombres fijos por consigna
// (Ejemplo, P, Hola, e), condición y límites estrictos.
const VALID = {
  1: 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println("hola");\n    }\n}',
  2: 'if (edad >= 18) {\n    System.out.println("una");\n} else {\n    System.out.println("dos");\n}',
  3: 'class P {\n    void a() {\n        System.out.println("hola");\n    }\n\n    void b() {\n        System.out.println("chau");\n    }\n}',
  4: 'class Main {\n    void m() {\n        for (int i = 0; i < 5; i++) {\n            if (i % 2 == 0) {\n                System.out.println(i);\n            }\n        }\n    }\n}',
  5: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n    }\n}',
  6: 'class Main {\n    void m() {\n        System.out.println("Línea 1");\n        System.out.println("Línea 2");\n    }\n}',
  7: 'class Main {\n    void m() {\n        System.out.print("a");\n        System.out.println("b");\n    }\n}',
  8: 'class Main {\n    void m() {\n        int e = 25;\n        System.out.printf("Edad: %d", e);\n    }\n}',
  100: 'class A {\n    void m() {\n    }\n}',
};
const INVALID = {
  1: 'class Main {\n}',
  2: 'class Main {\n    void m() {\n        System.out.println("una");\n    }\n}',
  3: 'class Main {\n    void a() {\n        System.out.println("hola");\n    }\n}',
  4: 'class Main {\n    void m() {\n        System.out.println("hola");\n    }\n}',
  5: 'class Main {\n    void m() {\n        System.out.println("chau");\n    }\n}',
  6: 'class Main {\n    void m() {\n        System.out.println("Línea 1");\n    }\n}',
  7: 'class Main {\n    void m() {\n        System.out.println("b");\n    }\n}',
  8: 'class Main {\n    void m() {\n        System.out.println("hola");\n    }\n}',
  100: 'class A {\n    void m() {\n    }\n}\n}',
};

const { javaValidator } = loadValidator();

describe('c-11 6.3 sin salidas simuladas en validator.js', () => {
  for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 100]) {
    it(`id ${id}: válido no trae output`, () => {
      const r = javaValidator.validate(VALID[id], id);
      assert.strictEqual(r.isValid, true, `veredicto cambió: ${JSON.stringify(r.errors)}`);
      assert.strictEqual(r.output, '', `output simulado aún: ${JSON.stringify(r.output)}`);
    });

    it(`id ${id}: inválido tampoco trae output (y sigue inválido)`, () => {
      const r = javaValidator.validate(INVALID[id], id);
      assert.strictEqual(r.isValid, false, 'veredicto cambió a válido');
      assert.strictEqual(r.output, '', `output simulado aún: ${JSON.stringify(r.output)}`);
    });
  }

  it('fuente sin rastros de simulación', () => {
    const src = VALIDATOR_SRC();
    // Helpers que solo fabricaban salida (nota: "Hola, Java!" sigue en
    // validateHolaMundo como REGLA —qué debe imprimir el estudiante—, no
    // como salida; por eso no se lista acá).
    for (const token of ['extractOutput', 'simulateIfElse', 'simulateComparison', 'Edad: 25', 'Código ejecutado']) {
      assert.ok(!src.includes(token), `simulación aún presente: ${token}`);
    }
    // `output` nunca se asigna: solo se declara vacío y se devuelve.
    const assignments = src.match(/^\s*output\s*=/gm) || [];
    assert.deepStrictEqual(assignments, [], `asignación de output aún presente: ${assignments}`);
  });
});

describe('c-11 6.3 la UI no muestra salida sin ejecución real', () => {
  function loadDisplay() {
    const els = {
      'exercise-result': { innerHTML: '', className: '' },
      'exercise-hint': { style: {}, textContent: '' },
    };
    const sandbox = {
      console,
      window: {},
      document: {
        addEventListener() {},
        getElementById: (id) => els[id] || null,
        body: { style: {} },
      },
      lessonsData: [],
      progressManager: { markAsCompleted() {} },
      exercisesData: [{ id: 100, lessonId: 10, hint: 'probá de nuevo' }],
    };
    vm.createContext(sandbox);
    vm.runInContext(
      `${ENHANCED_SRC()}\nthis.__D = { displayValidationResult };`,
      sandbox,
      { filename: 'script-enhanced.js' }
    );
    return { display: sandbox.__D.displayValidationResult, els };
  }

  const okValidation = { success: true, output: '', errors: [], suggestions: [] };
  const badValidation = {
    success: false, output: '',
    errors: [{ message: 'La indentación no coincide', severity: 'error' }],
    suggestions: [],
  };

  it('éxito sin output: sin bloque de salida, sin errores', () => {
    const { display, els } = loadDisplay();
    assert.doesNotThrow(() => display(okValidation, { success: true, output: '' }, 100, {}));
    assert.ok(!els['exercise-result'].innerHTML.includes('Salida del programa'));
    assert.ok(els['exercise-result'].innerHTML.includes('Excelente'));
  });

  it('fallo con execution sin campo output: sin bloque, sin errores', () => {
    const { display, els } = loadDisplay();
    assert.doesNotThrow(() => display(badValidation, { success: true }, 100, {}));
    assert.ok(!els['exercise-result'].innerHTML.includes('Salida del programa'));
    assert.ok(els['exercise-result'].innerHTML.includes('Necesita Correcciones'));
  });

  it('salida genuina futura (backend real) sigue mostrándose', () => {
    const { display, els } = loadDisplay();
    display(okValidation, { success: true, output: 'línea real' }, 100, {});
    assert.ok(els['exercise-result'].innerHTML.includes('Salida del programa'));
  });
});
