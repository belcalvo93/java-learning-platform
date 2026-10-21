'use strict';
// C-18 validator-structural, lote 11 (ids 152-161: streams).
// Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Nombres libres (la consigna no los nombra, renombrado consistente):
// `n` en 152/160/161, `s` en 153/154. El resto fijo: variables,
// etapas del pipeline (`filter` vs `map` vs `forEach`, `anyMatch` vs
// `allMatch`, `count` vs `size`), condiciones y `collect`.

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
const oneLine = (s) => s.replace(/\s+/g, ' ').trim();

const IDS = [152, 153, 154, 155, 156, 157, 158, 159, 160, 161];

describe('c-18 lote 11: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  // `n` libre: vale renombrada si se usa siempre igual.
  152: ['List<Integer> pares = nums.stream().filter(k -> k % 2 == 0).collect(Collectors.toList());',
    'List<Integer> pares=nums.stream()\n.filter(n->n%2==0)\n.collect(Collectors.toList());'],
  153: ['List<Integer> longitudes = nombres.stream().map(x -> x.length()).collect(Collectors.toList());',
    'List<Integer>longitudes=nombres.stream().map(s->s.length()).collect(Collectors.toList());'],
  154: ['lista.stream().forEach(e -> System.out.println(e));', 'lista . stream( ) . forEach( s -> System.out.println( s ) );'],
  155: ['long cantidad=nums.stream().count();', 'final long cantidad = nums.stream().count();'],
  156: ['int suma=nums.stream().reduce(0,(a,b)->a+b);', 'final int suma = nums.stream().reduce(0, (a, b) -> (a + b));'],
  157: ['List<Integer>ordenados=nums.stream().sorted().collect(Collectors.toList());',
    'final List<Integer> ordenados = nums.stream().sorted().collect(Collectors.toList());'],
  158: ['List<Integer>unicos=nums.stream().distinct().collect(Collectors.toList());',
    'final List<Integer> unicos = nums.stream().distinct().collect(Collectors.toList());'],
  159: ['List<Integer>primeros=nums.stream().limit(3).collect(Collectors.toList());',
    'final List<Integer> primeros = nums.stream().limit(3).collect(Collectors.toList());'],
  160: ['boolean hayPar=nums.stream().anyMatch(k->k%2==0);', 'final boolean hayPar = nums.stream().anyMatch(n -> (n % 2 == 0));'],
  161: ['boolean todosPares=nums.stream().allMatch(k->k%2==0);', 'final boolean todosPares = nums.stream().allMatch(n -> (n % 2 == 0));'],
};

describe('c-18 lote 11: variantes válidas aceptadas', () => {
  for (const id of IDS) {
    for (const [n, code] of VALID[id].entries()) {
      it(`id ${id}: variante válida ${n + 1}`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, true, `id ${id} var ${n + 1} rechazado: ${JSON.stringify(r.errors)}`);
      });
    }
    it(`id ${id}: en una línea (espacios libres)`, () => {
      const r = check(id, oneLine(solutionOf(id)));
      assert.strictEqual(r.isValid, true, `id ${id} una-línea rechazado: ${JSON.stringify(r.errors)}`);
    });
    it(`id ${id}: con código extra válido`, () => {
      const r = check(id, `${solutionOf(id)}\nint aparte${id} = ${id};`);
      assert.strictEqual(r.isValid, true, `id ${id} extra-código rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const INVALID = {
  // renombrado a medias: el parámetro no coincide con su uso.
  152: ['List<Integer> pares = nums.stream().filter(k -> n % 2 == 0).collect(Collectors.toList());',
    'List<Integer> pares = nums.stream().map(n -> n % 2 == 0).collect(Collectors.toList());'],
  153: ['List<Integer> longitudes = nombres.stream().filter(s -> s.length()).collect(Collectors.toList());',
    'List<Integer> longitudes = nombres.stream().map(s -> s.size()).collect(Collectors.toList());'],
  // referencia a método en vez de lambda: otra construcción.
  154: ['lista.stream().forEach(System.out::println);', 'lista.stream().map(s -> System.out.println(s));'],
  // size() no es count(): otro concepto.
  155: ['long cantidad = nums.size();', 'int cantidad = nums.stream().count();'],
  156: ['int suma = nums.stream().reduce(1, (a, b) -> a + b);', 'int suma = nums.stream().reduce(0, (a, b) -> a * b);'],
  157: ['List<Integer> ordenados = nums.stream().collect(Collectors.toList());',
    'List<Integer> ordenados = nums.stream().distinct().collect(Collectors.toList());'],
  158: ['List<Integer> unicos = nums.stream().sorted().collect(Collectors.toList());',
    'List<Integer> unicos = nums.stream().distinct().collect(Collectors.toSet());'],
  159: ['List<Integer> primeros = nums.stream().limit(2).collect(Collectors.toList());',
    'List<Integer> primeros = nums.stream().skip(3).collect(Collectors.toList());'],
  // anyMatch no es allMatch: el concepto del ejercicio.
  160: ['boolean hayPar = nums.stream().allMatch(n -> n % 2 == 0);',
    'boolean hayPar = nums.stream().anyMatch(n -> n % 2 != 0);'],
  161: ['boolean todosPares = nums.stream().anyMatch(n -> n % 2 == 0);',
    'boolean todosPares = nums.stream().allMatch(n -> n % 2 == 1);'],
};

describe('c-18 lote 11: trampas rechazadas', () => {
  for (const id of IDS) {
    for (const [n, code] of INVALID[id].entries()) {
      it(`id ${id}: trampa ${n + 1} rechazada`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, false, `id ${id} trampa ${n + 1} aceptada como válida`);
      });
    }
    it(`id ${id}: respuesta en comentario nunca aprueba`, () => {
      const r = check(id, `// ${solutionOf(id).replace(/\n/g, '\n// ')}`);
      assert.strictEqual(r.isValid, false, `id ${id}: comentario-con-respuesta aceptado`);
    });
    it(`id ${id}: código vacío rechazado`, () => {
      const r = check(id, '');
      assert.strictEqual(r.isValid, false, `id ${id}: vacío aceptado`);
    });
    it(`id ${id}: comillas sin cerrar rechazadas`, () => {
      const r = check(id, `${solutionOf(id)}\nSystem.out.println("oops);`);
      assert.strictEqual(r.isValid, false, `id ${id}: comillas-sin-cerrar aceptado`);
    });
    const sol = solutionOf(id);
    if (sol.includes(';')) {
      it(`id ${id}: sin punto y coma rechazado`, () => {
        const r = check(id, sol.slice(0, sol.indexOf(';')));
        assert.strictEqual(r.isValid, false, `id ${id}: sin-punto-y-coma aceptado`);
      });
    }
    it(`id ${id}: nombre no declarado rechazado`, () => {
      const r = check(id, `${solutionOf(id)}\nSystem.out.println(zz_noexiste);`);
      assert.strictEqual(r.isValid, false, `id ${id}: nombre-no-declarado aceptado`);
    });
  }
});
