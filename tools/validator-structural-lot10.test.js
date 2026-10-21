'use strict';
// C-18 validator-structural, lote 10 (ids 135-151: Optional, lambdas,
// interfaces funcionales, method references). Patrón vm de C-10. NO
// toca validator.js ni data.js.
//
// Todo fijo por consigna: nombres de variables, parámetros lambda
// (`s`, `n`, `a`, `b`, `valor`: la consigna los escribe), llamadas
// (`of` vs `ofNullable`, `accept` vs `apply`, `->` vs `::`) y textos.
// Id 148 (Math.random): la presencia se valida por estructura; el valor
// real solo se comprueba ejecutando (C-05/C-06).

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

const IDS = [135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151];

describe('c-18 lote 10: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  135: ['Optional<String>opt=Optional.empty();', 'final Optional<String> opt = Optional.empty();'],
  136: ['Optional<String>opt=Optional.of("Hola");', 'final Optional<String> opt = Optional.of("Hola");'],
  137: ['Optional<String>opt=Optional.ofNullable(texto);', 'final Optional<String> opt = Optional.ofNullable(texto);'],
  138: ['if(opt.isPresent()){System.out.println(opt.get());}', 'if (opt.isPresent()) System.out.println(opt.get());'],
  139: ['String valor=opt.orElse("Defecto");', 'final String valor = opt.orElse("Defecto");'],
  140: ['opt.ifPresent(valor->System.out.println(valor));', 'opt.ifPresent((valor) -> System.out.println(valor));'],
  141: ['()->System.out.println("Hola");', '( ) -> System.out.println( "Hola" );'],
  // paréntesis alrededor del único parámetro: dicen lo mismo.
  142: ['(s)->System.out.println(s);', 's -> System.out.println( s );'],
  143: ['(a,b)->a+b;', '( a, b ) -> (a + b);'],
  144: ['s->{String mayus=s.toUpperCase();System.out.println(mayus);};',
    's -> {\n    String mayus = s.toUpperCase();\n    System.out.println(mayus);\n};'],
  145: ['Predicate<Integer>esPar=n->n%2==0;boolean resultado=esPar.test(4);',
    'final Predicate<Integer> esPar = n -> n % 2 == 0;\nfinal boolean resultado = esPar.test(4);'],
  146: ['Function<String,Integer>longitud=s->s.length();int len=longitud.apply("Hola");',
    'final Function<String, Integer> longitud = s -> s.length();\nfinal int len = longitud.apply("Hola");'],
  147: ['Consumer<String>imprimir=s->System.out.println(s);imprimir.accept("Hola");',
    'final Consumer<String> imprimir = s -> System.out.println(s);\nimprimir.accept("Hola");'],
  148: ['Supplier<Double>random=()->Math.random();double num=random.get();',
    'final Supplier<Double> random = () -> Math.random();\nfinal double num = random.get();'],
  149: ['Integer::parseInt;', 'Integer :: parseInt;'],
  150: ['System.out::println;', 'System . out :: println;'],
  151: ['ArrayList::new;', 'ArrayList :: new;'],
};

describe('c-18 lote 10: variantes válidas aceptadas', () => {
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
  135: ['Optional<String> opt = Optional.of();', 'Optional<String> o = Optional.empty();'],
  136: ['Optional<String> opt = Optional.of("Adiós");', 'Optional<String> opt = Optional.ofNullable("Hola");'],
  // of revienta con null: ofNullable es el concepto.
  137: ['Optional<String> opt = Optional.of(texto);', 'Optional<String> opt = Optional.ofNullable("texto");'],
  138: ['if (opt.isEmpty()) {\n    System.out.println(opt.get());\n}',
    'if (opt.isPresent()) {\n    System.out.println(opt.orElse("x")); \n}'],
  139: ['String valor = opt.orElse("Otro");', 'String value = opt.orElse("Defecto");'],
  // referencia a método en vez de lambda: otra construcción.
  140: ['opt.ifPresent(System.out::println);', 'opt.ifPresent(valor -> System.out.print(valor));'],
  141: ['(x) -> System.out.println("Hola");', '() -> System.out.print("Hola");'],
  142: ['x -> System.out.println(x);', 's -> System.out.print(s);'],
  143: ['(a, b) -> a - b;', '(x, y) -> x + y;'],
  // lambda de expresión en vez de bloque con intermedia: otra forma.
  144: ['s -> s.toUpperCase();', 's -> {\n    String mayus = s.toLowerCase();\n    System.out.println(mayus);\n};'],
  145: ['Predicate<Integer> esPar = n -> n % 2 == 0;\nboolean resultado = esPar.test(5);',
    'Predicate<Integer> esPar = n -> n % 2 != 0;\nboolean resultado = esPar.test(4);'],
  146: ['Function<String, Integer> longitud = s -> s.length();\nlongitud.apply("Hola");',
    'Function<String, Integer> longitud = s -> s.length();\nint len = longitud.apply("Adiós");'],
  147: ['Consumer<String> imprimir = s -> System.out.println(s);\nimprimir.apply("Hola");',
    'Consumer<String> imprimir = s -> System.out.println(s);\nimprimir.accept("Adiós");'],
  148: ['Supplier<Double> random = () -> Math.random;\ndouble num = random.get();',
    'Supplier<Double> random = () -> 0.5;\ndouble num = random.get();'],
  149: ['Integer::valueOf;', 'Integer.parseInt;'],
  150: ['System.out::print;', 'System.out.println;'],
  151: ['ArrayList::create;', 'new ArrayList<>();'],
};

describe('c-18 lote 10: trampas rechazadas', () => {
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
