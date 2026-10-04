'use strict';
// c-11-editor-ux, ajuste 6.2 (RED): `checkBraces` usa `braceNotice` para que
// TODOS los ejercicios reciban mensajes concretos de llaves en vez del
// genérico "Llaves desbalanceadas (N aperturas, M cierres)".
// Solo texto: ningún veredicto válido/inválido cambia (prueba oráculo abajo).
// Patrón `vm` de C-10/C-11 (`node --test`, cero deps). NO toca data.js.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.join(__dirname, '..');

// Ejercicio 3: validador propio (validateTwoMethods). Ejercicio 100: rama
// común por defecto (compara contra solution). Evita leer data.js.
const EXERCISES = [
  { id: 3, lessonId: 2, title: 'Dos métodos', solution: '' },
  {
    id: 100, lessonId: 10, title: 'Común',
    solution: 'class A {\n    void m() {\n    }\n}',
  },
];

function loadValidator() {
  const sandbox = { console, exercisesData: EXERCISES };
  vm.createContext(sandbox);
  const src = fs.readFileSync(path.join(REPO_ROOT, 'validator.js'), 'utf8');
  vm.runInContext(
    `${src}\nthis.__V = { JavaValidator, javaValidator, braceNotice };`,
    sandbox,
    { filename: 'validator.js' }
  );
  return sandbox.__V;
}

const { JavaValidator, javaValidator, braceNotice } = loadValidator();

// Regla vieja (oráculo): había error si y solo si los conteos crudos diferían.
// La decisión NO puede cambiar; solo el texto del mensaje.
const oldWouldError = (code) => {
  const open = (code.match(/{/g) || []).length;
  const close = (code.match(/}/g) || []).length;
  return open !== close;
};

const checkBracesError = (code) => {
  const v = new JavaValidator();
  v.checkBraces(code);
  assert.ok(v.errors.length <= 1, 'checkBraces agrega a lo sumo un error');
  return v.errors.length === 1 ? v.errors[0] : null;
};

const VALID_TWO_METHODS = 'class P {\n'
  + '    void a() {\n'
  + '        System.out.println("hola");\n'
  + '    }\n'
  + '\n'
  + '    void b() {\n'
  + '        System.out.println("chau");\n'
  + '    }\n'
  + '}';

describe('c-11 6.2 checkBraces usa braceNotice (texto concreto)', () => {
  it('falta cierre: mensaje concreto de cierre (no genérico)', () => {
    const err = checkBracesError('class A {\n    void m() {\n');
    assert.ok(err, 'esperaba error de llaves');
    assert.ok(/falta una llave de cierre/.test(err), `genérico aún: ${err}`);
    assert.ok(!/desbalanceadas/.test(err), `genérico aún: ${err}`);
  });

  it('sobra cierre: mensaje concreto de sobra', () => {
    const err = checkBracesError('class A {\n    void m() {\n    }\n}\n}');
    assert.ok(err, 'esperaba error de llaves');
    assert.ok(/sobra una llave de cierre/.test(err), `genérico aún: ${err}`);
  });

  it('falta apertura (} sin {): mensaje concreto de apertura', () => {
    const err = checkBracesError('System.out.println("hola");\n}');
    assert.ok(err, 'esperaba error de llaves');
    assert.ok(/falta una llave de apertura/.test(err), `genérico aún: ${err}`);
  });

  it('balanceado: sin error', () => {
    assert.strictEqual(checkBracesError('class A {\n    void m() {\n    }\n}'), null);
  });

  it('oráculo veredicto-inmutable: hay error si y solo si la regla vieja lo pedía', () => {
    const cases = [
      '',
      'class A {\n}',
      'class A {\n    void m() {\n',
      'class A {\n}\n}',
      '}',
      'String a = "{";',
      'String a = "{";\nString b = "}";',
      '// }\nclass A {',
      'class A {\n} // {',
      'String s = "a \\" { b";',
      'if (x) { foo(); } else { bar(); }',
      '{{{',
      '}}}',
    ];
    for (const code of cases) {
      const err = checkBracesError(code);
      assert.strictEqual(
        err !== null, oldWouldError(code),
        `veredicto cambió para ${JSON.stringify(code)}`
      );
      // Cuando braceNotice no ve dirección (llaves solo en strings),
      // se conserva el mensaje genérico anterior: el error sigue existiendo.
      if (err && braceNotice(code) === null) {
        assert.ok(/desbalanceadas/.test(err), `fallback perdido: ${err}`);
      }
    }
  });
});

describe('c-11 6.2 veredictos intactos: ejercicio 3 (validador propio) y 100 (rama común)', () => {
  it('id 3 válido sigue válido', () => {
    const r = javaValidator.validate(VALID_TWO_METHODS, 3);
    assert.strictEqual(r.isValid, true);
  });

  it('id 3 con cierre de menos sigue inválido + aviso concreto', () => {
    const r = javaValidator.validate(VALID_TWO_METHODS.replace(/\n\}$/, ''), 3);
    assert.strictEqual(r.isValid, false);
    assert.ok(r.errors.some((m) => /falta una llave de cierre/.test(m)));
  });

  it('id 3 con cierre de más sigue inválido + aviso concreto', () => {
    const r = javaValidator.validate(`${VALID_TWO_METHODS}\n}`, 3);
    assert.strictEqual(r.isValid, false);
    assert.ok(r.errors.some((m) => /sobra una llave de cierre/.test(m)));
  });

  it('id 100 (rama común) válido sigue válido', () => {
    const r = javaValidator.validate(EXERCISES[1].solution, 100);
    assert.strictEqual(r.isValid, true);
  });

  it('id 100 con cierre de más sigue inválido + aviso concreto', () => {
    const r = javaValidator.validate(`${EXERCISES[1].solution}\n}`, 100);
    assert.strictEqual(r.isValid, false);
    assert.ok(r.errors.some((m) => /sobra una llave de cierre/.test(m)));
  });

  it('id 100 con cierre de menos sigue inválido + aviso concreto', () => {
    const r = javaValidator.validate('class A {\n    void m() {\n    }', 100);
    assert.strictEqual(r.isValid, false);
    assert.ok(r.errors.some((m) => /falta una llave de cierre/.test(m)));
  });
});
