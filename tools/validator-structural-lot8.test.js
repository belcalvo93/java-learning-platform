'use strict';
// C-18 validator-structural, lote 8 (ids 101-120: colecciones).
// Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Todo fijo por consigna: tipos, variables, llamadas y literales.
// El diamante `<>` es concepto (no vale el tipo explícito). El orden
// de los `add` en lista es concepto; en el mapa (put) no lo es.

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

const IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];

describe('c-18 lote 8: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  101: ['ArrayList<String>lista=new ArrayList<>();', 'final ArrayList<String> lista = new ArrayList<>();'],
  102: ['lista.add("Hola");lista.add("Mundo");', 'lista.add( "Hola" );\nlista.add( "Mundo" );'],
  103: ['String primero=lista.get(0);', 'final String primero = lista.get(0);'],
  104: ['lista.remove(0);', 'lista.remove( 0 );'],
  105: ['int tamaño=nums.size();', 'final int tamaño = nums.size();'],
  106: ['for(String item:lista){System.out.println(item);}', 'for (String item : lista)\n{\nSystem.out.println(item);\n}'],
  107: ['HashSet<String>set=new HashSet<>();', 'final HashSet<String> set = new HashSet<>();'],
  108: ['set.add("Hola");set.add("Hola");System.out.println(set.size());',
    'set.add( "Hola" );\nset.add( "Hola" );\nSystem.out.println( set.size( ) );'],
  109: ['boolean existe=set.contains("Java");', 'final boolean existe = set.contains("Java");'],
  110: ['HashMap<String,Integer>mapa=new HashMap<>();', 'final HashMap<String, Integer> mapa = new HashMap<>();'],
  // en el mapa, el orden de los put no es concepto.
  111: ['edades.put("Ana",25);edades.put("Luis",30);', 'edades.put("Luis", 30);\nedades.put("Ana", 25);'],
  112: ['int edad=edades.get("Ana");', 'final int edad = edades.get("Ana");'],
  113: ['if (mapa.containsKey("Ana")) System.out.println("Existe");',
    'if(mapa.containsKey("Ana")){System.out.println("Existe");}'],
  114: ['for(Map.Entry<String,Integer>entry:edades.entrySet()){System.out.println(entry.getKey()+": "+entry.getValue());}',
    'for (Map.Entry<String, Integer> entry : edades.entrySet())\n{\n    System.out.println(entry.getKey() + ": " + entry.getValue());\n}'],
  115: ['LinkedList<String>lista=new LinkedList<>();', 'final LinkedList<String> lista = new LinkedList<>();'],
  116: ['lista.addFirst("Primero");lista.addLast("Último");', 'lista.addFirst( "Primero" );\nlista.addLast( "Último" );'],
  117: ['TreeSet<Integer>set=new TreeSet<>();set.add(5);set.add(1);set.add(3);',
    'final TreeSet<Integer> set = new TreeSet<>();\nset.add(5);\nset.add(1);\nset.add(3);'],
  118: ['Collections.sort(nums);', 'Collections.sort( nums );'],
  119: ['Collections.reverse(lista);', 'Collections.reverse( lista );'],
  120: ['int max=Collections.max(nums);', 'final int max = Collections.max(nums);'],
};

describe('c-18 lote 8: variantes válidas aceptadas', () => {
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
  // el tipo explícito en vez del diamante: otra forma, se rechaza.
  101: ['ArrayList<String> lista = new ArrayList<String>();', 'ArrayList<String> otra = new ArrayList<>();'],
  // en la lista, el orden de los add es concepto.
  102: ['lista.add("Mundo");\nlista.add("Hola");', 'lista.add("Hola");'],
  103: ['String primero = lista.get(1);', 'lista.get(0);'],
  104: ['lista.remove(1);', 'lista.remove("A");'],
  105: ['int tamaño = nums.length;', 'int tamano = nums.size();'],
  106: ['for (String x : lista) {\n    System.out.println(x);\n}',
    'for (int i = 0; i < lista.size(); i++) {\n    System.out.println(lista.get(i));\n}'],
  107: ['HashSet<String> set = new HashSet<String>();', 'Set<String> set = new HashSet<>();'],
  108: ['set.add("Hola");\nSystem.out.println(set.size());\nset.add("Hola");',
    'set.add("Hola");\nset.add("Adiós");\nSystem.out.println(set.size());'],
  109: ['boolean existe = set.contains("Java ");', 'boolean existe = set.containsKey("Java");'],
  110: ['HashMap<String, Integer> mapa = new HashMap<String, Integer>();',
    'Map<String, Integer> mapa = new HashMap<>();'],
  111: ['edades.put("Ana", 25);', 'edades.put("Ana", 26);\nedades.put("Luis", 30);'],
  112: ['int edad = edades.get("Luis");', 'edades.get("Ana");'],
  113: ['if (mapa.containsKey("Luis")) {\n    System.out.println("Existe");\n}',
    'if (mapa.containsKey("Ana")) {\n    System.out.println("Falta");\n}'],
  114: ['for (String entry : edades.keySet()) {\n    System.out.println(entry);\n}',
    'for (Map.Entry<String, Integer> entry : edades.entrySet()) {\n    System.out.println(entry.getKey());\n}'],
  115: ['LinkedList<String> lista = new LinkedList<String>();', 'List<String> lista = new LinkedList<>();'],
  116: ['lista.addLast("Último");\nlista.addFirst("Primero");', 'lista.add("Primero");\nlista.add("Último");'],
  // "en este orden" lo fija la consigna: es concepto.
  117: ['TreeSet<Integer> set = new TreeSet<>();\nset.add(1);\nset.add(5);\nset.add(3);',
    'TreeSet<Integer> set = new TreeSet<>();\nset.add(5);\nset.add(1);'],
  118: ['nums.sort(null);', 'Collections.sort(lista);'],
  119: ['Collections.sort(lista);', 'Collections.reverse(numeros);'],
  120: ['int max = Collections.min(nums);', 'Collections.max(nums);'],
};

describe('c-18 lote 8: trampas rechazadas', () => {
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
