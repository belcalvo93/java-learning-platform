'use strict';
// C-18 validator-structural: tests del motor (tokenizer, normalizaciones,
// matcher) + meta-tests de mensajes. Patrón vm de C-10. NO toca
// validator.js ni data.js.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.join(__dirname, '..');

function loadValidator(exercises) {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'validator.js'), 'utf8');
  const sandbox = { exercisesData: exercises, console };
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__JV = JavaValidator;`, sandbox, { filename: 'validator.js' });
  return sandbox.__JV;
}

function loadExercises() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__exercises = exercisesData;`, sandbox, { filename: 'data.js' });
  return Array.from(sandbox.__exercises, (e) => ({ ...e }));
}

const exercises = loadExercises();
const JavaValidator = loadValidator(exercises);
const S = JavaValidator._struct;
const T = (code) => S.tokenizeJava(code);
const kinds = (toks) => toks.map((t) => `${t.k}:${t.v}`);
// Comparar por texto unido: los arrays vienen del realm vm y
// deepStrictEqual de arrays cruza mal el borde del sandbox.
const K = (toks) => kinds(toks).join('|');

describe('c-18 motor: tokenizer', () => {
  it('texto con escape no se corta', () => {
    assert.strictEqual(K(T('String a = "x\\"y";')), 'id:String|id:a|op:=|str:x\\"y|sym:;');
  });
  it('texto sin cerrar da token malo', () => {
    const toks = T('println("oops);');
    assert.ok(toks.some((t) => t.k === 'bad'));
  });
  it('// dentro de texto no es comentario', () => {
    assert.strictEqual(K(T('String u = "http://x";')), 'id:String|id:u|op:=|str:http://x|sym:;');
  });
  it('bloque de texto es un solo token con contenido recortado', () => {
    const toks = T('String j = """\n  { \n  "a" \n} \n""";');
    assert.strictEqual(toks.filter((t) => t.k === 'str').length, 1);
    assert.strictEqual(toks.find((t) => t.k === 'str').v, '\n{\n"a"\n}\n');
  });
  it('operadores multi-caracter y :: -> ...', () => {
    const toks = T('a -> b :: c ... d && e || f == g;');
    assert.strictEqual(toks.filter((t) => t.k === 'op').map((t) => t.v).join('|'), '->|::|...|&&||||==');
  });
  it('números con decimales y palabra clave', () => {
    assert.strictEqual(K(T('final double PI = 3.14159;')), 'kw:final|kw:double|id:PI|op:=|num:3.14159|sym:;');
  });
  it('identificador con ñ es una sola palabra', () => {
    assert.strictEqual(K(T('int tamaño = 1;')), 'kw:int|id:tamaño|op:=|num:1|sym:;');
  });
});

describe('c-18 motor: normalizaciones', () => {
  it('paréntesis del ternario se quitan en ambos lados', () => {
    const a = K(S.stripTernaryParens(T('(e >= 18) ? "A" : "M"')));
    const b = K(S.stripTernaryParens(T('e >= 18 ? "A" : "M"')));
    assert.strictEqual(a, b);
  });
  it('paréntesis con otro sentido no se tocan', () => {
    const toks = T('println((a + b) * c);');
    assert.strictEqual(K(S.stripTernaryParens(toks)), K(toks));
  });
  it('llaves de una sola instrucción en if se quitan; las de método no', () => {
    const a = K(S.stripOptionalBraces(T('if (c) { x(); }')));
    const b = K(S.stripOptionalBraces(T('if (c) x();')));
    assert.strictEqual(a, b);
    const m = K(S.stripOptionalBraces(T('void a() { x(); }')));
    assert.strictEqual(m, K(T('void a() { x(); }')));
  });
  it('llaves de do, try y cuerpos múltiples no se tocan', () => {
    for (const code of ['do { x(); } while (c);', 'try { x(); } catch (E e) { }', 'if (c) { x(); y(); }']) {
      assert.strictEqual(K(S.stripOptionalBraces(T(code))), K(T(code)), code);
    }
  });
  it('modificadores en otro orden quedan igual', () => {
    const a = kinds(S.sortModifierRuns(T('static public final double PI'))).join(' ');
    const b = kinds(S.sortModifierRuns(T('public static final double PI'))).join(' ');
    assert.strictEqual(a, b);
  });
  it('for con y sin tipo en el init quedan igual con dropForInitType', () => {
    const a = kinds(S.dropForInitType(T('for (int i = 0; i < 5; i++)'))).join(' ');
    const b = kinds(T('for (i = 0; i < 5; i++)')).join(' ');
    assert.strictEqual(a, b);
  });
});

describe('c-18 motor: matcher con renombrado', () => {
  const sol = T('int suma = 0; for (int n : nums) { suma += n; }');
  it('renombrado consistente y declarado pasa', () => {
    const stu = T('int suma = 0; for (int k : nums) { suma += k; }');
    const o = { fixed: new Set(['suma', 'nums']), stringsFree: false, declared: new Set(['suma', 'k', 'nums']), context: new Set() };
    assert.strictEqual(S.structuralMatchTokens(stu, sol, o).ok, true);
  });
  it('renombrado a medias falla', () => {
    const stu = T('int suma = 0; for (int k : nums) { suma += n; }');
    const o = { fixed: new Set(['suma', 'nums']), stringsFree: false, declared: new Set(['suma', 'k', 'n', 'nums']), context: new Set() };
    assert.strictEqual(S.structuralMatchTokens(stu, sol, o).ok, false);
  });
  it('nombre libre no puede robar un nombre fijo', () => {
    const stu = T('int suma = 0; for (int suma : nums) { suma += suma; }');
    const o = { fixed: new Set(['suma', 'nums']), stringsFree: false, declared: new Set(['suma', 'nums']), context: new Set() };
    assert.strictEqual(S.structuralMatchTokens(stu, sol, o).ok, false);
  });
  it('nombre libre no declarado no liga', () => {
    const stu = T('int suma = 0; for (int k : nums) { suma += k; }');
    const o = { fixed: new Set(['suma', 'nums']), stringsFree: false, declared: new Set(['suma', 'nums']), context: new Set() };
    assert.strictEqual(S.structuralMatchTokens(stu, sol, o).ok, false);
  });
  it('números y operadores estrictos; espacios libres', () => {
    const o = { fixed: new Set(['i']), stringsFree: false, declared: new Set(['i']), context: new Set() };
    assert.strictEqual(S.structuralMatchTokens(T('while(i<=5){}'), T('while (i <= 5) { }'), o).ok, true);
    assert.strictEqual(S.structuralMatchTokens(T('while(i<6){}'), T('while (i <= 5) { }'), o).ok, false);
  });
  it('textos libres aceptan cualquier texto; fijos exigen el mismo', () => {
    const oFree = { fixed: new Set(['println']), stringsFree: true, declared: new Set(), context: new Set() };
    assert.strictEqual(S.structuralMatchTokens(T('println("otra cosa")'), T('println("Hola")'), oFree).ok, true);
    const oFixed = { fixed: new Set(['println']), stringsFree: false, declared: new Set(), context: new Set() };
    assert.strictEqual(S.structuralMatchTokens(T('println("otra cosa")'), T('println("Hola")'), oFixed).ok, false);
  });
});

describe('c-18 motor: vigilancias', () => {
  it('checkCallParens detecta llamada donde no hay', () => {
    const stu = T('println(nums.length());');
    const used = new Set([0, 1, 2, 3, 4]);
    assert.ok(S.checkCallParens(stu, used));
  });
  it('checkNoUndeclared deja pasar API, punto y llamadas', () => {
    const stu = T('int n = nums.length; System.out.println(n); foo(x);');
    const declared = new Set(['n', 'nums', 'x']);
    const msg = S.checkNoUndeclared(stu, new Set(['n', 'nums']), declared, new Set());
    assert.strictEqual(msg, null);
  });
  it('checkNoUndeclared frena el nombre inventado', () => {
    const stu = T('println(zz_noexiste);');
    const msg = S.checkNoUndeclared(stu, new Set(), new Set(), new Set());
    assert.ok(msg);
  });
  it('checkEmptyParens exige paréntesis vacíos', () => {
    const sol = T('() -> x;');
    const stuOk = T('() -> x;');
    const mOk = S.structuralMatchTokens(stuOk, sol, { fixed: new Set(['x']), stringsFree: false, declared: new Set(['x']), context: new Set() });
    assert.strictEqual(S.checkEmptyParens(stuOk, sol, mOk.align), null);
    const stuBad = T('(y) -> x;');
    const mBad = S.structuralMatchTokens(stuBad, sol, { fixed: new Set(['x']), stringsFree: false, declared: new Set(['x', 'y']), context: new Set() });
    assert.strictEqual(mBad.ok, true);
    assert.ok(S.checkEmptyParens(stuBad, sol, mBad.align));
  });
  it('parensBalanced cuenta sin mirar textos', () => {
    assert.strictEqual(S.parensBalanced(T('println("(");')), true);
    assert.strictEqual(S.parensBalanced(T('println("x";')), false);
  });
});

describe('c-18 meta: mensajes conceptuales sin respuesta', () => {
  it('ningún mensaje trae comillas ni System.out', () => {
    for (const [id, rule] of Object.entries(S.STRUCT_RULES)) {
      assert.ok(rule.missing && rule.missing.length > 0, `id ${id} sin mensaje`);
      assert.ok(!rule.missing.includes('"'), `id ${id} filtra texto: ${rule.missing}`);
      assert.ok(!rule.missing.includes('System.out'), `id ${id} filtra código: ${rule.missing}`);
    }
  });
  it('reglas para los 200 ids por tokens (9-208 menos 168)', () => {
    const ids = Object.keys(S.STRUCT_RULES).map(Number).sort((a, b) => a - b);
    const expected = [];
    for (let id = 9; id <= 208; id++) {
      if (id !== 168) expected.push(id);
    }
    assert.deepStrictEqual(ids, expected);
  });
});
