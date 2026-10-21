'use strict';
// C-18 fix aviso de asignación (TDD): el aviso "Posible asignación (=) en
// lugar de comparación (==)" solo aparece ante una asignación (= solo)
// dentro de la CONDICIÓN de un if/while. Nunca ante `==`, `<=`, `>=`, `!=`,
// ni ante el `=` del init de un `for`, ni ante `=` dentro de textos o
// comentarios. Runner: node --test tools/*.test.js (cero deps, patrón vm).

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
const WARNING = 'Advertencia: Posible asignación (=) en lugar de comparación (==)';
// Array.from: el array cruza el borde del sandbox vm (otro prototipo de
// Array); se copia al reino local para que deepStrictEqual compare bien.
const warningsOf = (id, code) => Array.from(new JavaValidator().validate(code, id).warnings);

describe('c-18 fix aviso de asignación: sin falso aviso', () => {
  it('id 4 starter (for con int i=0) no avisa', () => {
    const starter = exercises.find((e) => e.id === 4).starterCode;
    assert.deepStrictEqual(warningsOf(4, starter), []);
  });

  it('id 4 canónica no avisa', () => {
    const solution = exercises.find((e) => e.id === 4).solution;
    assert.deepStrictEqual(warningsOf(4, solution), []);
  });

  it('for(int i=0;...) solo no avisa', () => {
    assert.deepStrictEqual(warningsOf(4, 'for(int i=0;i<5;i++){\n}'), []);
  });

  it('if con ==, <=, >=, != no avisa', () => {
    for (const cond of ['if (i % 2 == 0) {}', 'if (x <= 5) {}', 'if (x >= 5) {}', 'if (x != 5) {}']) {
      assert.deepStrictEqual(warningsOf(4, cond), [], `falso aviso ante: ${cond}`);
    }
  });

  it('= dentro de texto o comentario en la condición no avisa', () => {
    assert.deepStrictEqual(warningsOf(4, 'if (s.equals("a=b")) {}'), []);
    assert.deepStrictEqual(warningsOf(4, '// if (x = 5)\nif (x > 0) {}'), []);
  });
});

describe('c-18 fix aviso de asignación: avisa cuando corresponde', () => {
  it('if (x = 5) avisa', () => {
    assert.ok(warningsOf(4, 'if (x = 5) {}').includes(WARNING));
  });

  it('while (x = 5) avisa', () => {
    assert.ok(warningsOf(4, 'while (x = 5) { x++; }').includes(WARNING));
  });
});
