'use strict';
// C-18 validator-structural, lote 4 (ids 41-58: arrays, matrices,
// strings, StringBuilder). Patrón vm de C-10. NO toca validator.js
// ni data.js.
//
// Nombres libres (renombrado consistente): solo `n` en 47-48 (la
// consigna no la nombra). El resto es fijo por consigna o contexto.
// `length` sin paréntesis (array) vs `length()` con paréntesis (String)
// es concepto y se exige exacto.

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

const IDS = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];

describe('c-18 lote 4: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  41: ['int[] nums=new int[5];', 'int [] nums = new int[5];'],
  42: ['int[] nums={1,2,3};', 'int[] nums = new int[]{1, 2, 3};'],
  43: ['System.out.println(nums[ 0 ]);', 'System.out.println((nums[0]));'],
  44: ['nums[1]=50;', 'nums[ 1 ] = 50;'],
  45: ['System.out.println(nums.length );', 'System.out.println( nums.length );'],
  46: ['for(int i=0;i<nums.length;i++){System.out.println(nums[i]);}',
    'for (int i = 0; i < nums.length; i++)\n{\nSystem.out.println(nums[i]);\n}'],
  // `n` es libre en 47-48: vale renombrada si se usa siempre igual.
  47: ['int suma = 0;\nfor (int x : nums) {\n    suma += x;\n}\nSystem.out.println(suma);',
    'int suma=0;for(int n:nums){suma+=n;}System.out.println(suma);'],
  48: ['int max = nums[0];\nfor (int v : nums) {\n    if (v > max) max = v;\n}\nSystem.out.println(max);',
    'int max=nums[0];for(int n:nums){if(n>max)max=n;}System.out.println(max);'],
  49: ['int[][] matriz=new int[2][2];', 'int [][] matriz = new int[2][2];'],
  50: ['int[][] matriz={{1,2},{3,4}};', 'int[][] matriz = { { 1, 2 }, { 3, 4 } };'],
  51: ['System.out.println(m[ 1 ][ 0 ]);', 'System.out.println((m[1][0]));'],
  52: ['for(int i=0;i<m.length;i++){for(int j=0;j<m[i].length;j++){System.out.print(m[i][j]+" ");}System.out.println();}',
    'for (int i = 0; i < m.length; i++) {\n    for (int j = 0; j < m[i].length; j++)\n    {\n        System.out.print(m[i][j] + " ");\n    }\n    System.out.println();\n}'],
  53: ['System.out.println(texto.length( ));', 'System.out.println((texto.length()));'],
  54: ['String c=a+" "+b;System.out.println(c);', 'String c = a + " " + b;\nSystem.out.println( c );'],
  55: ['String mayus=texto.toUpperCase();System.out.println(mayus);',
    'String mayus = texto.toUpperCase( );\nSystem.out.println(mayus);'],
  56: ['String sub=texto.substring(0,4);System.out.println(sub);',
    'String sub = texto.substring( 0, 4 );\nSystem.out.println( sub );'],
  57: ['if (a.equals(b)) System.out.println("Iguales");', 'if(a.equals(b)){System.out.println("Iguales");}'],
  58: ['StringBuilder sb=new StringBuilder();sb.append("Hola");sb.append(" ");sb.append("Mundo");System.out.println(sb.toString());',
    'StringBuilder sb = new StringBuilder( );\nsb.append( "Hola" );\nsb.append( " " );\nsb.append( "Mundo" );\nSystem.out.println( sb.toString( ) );'],
};

describe('c-18 lote 4: variantes válidas aceptadas', () => {
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
  41: ['int[] nums = new int[6];', 'int[] numeros = new int[5];'],
  42: ['int[] nums = {1, 2, 4};', 'int[] nums = {1, 3, 2};'],
  43: ['System.out.println(nums[1]);', 'System.out.println(nums);'],
  44: ['nums[1] = 5;', 'nums[0] = 50;'],
  // `length()` con paréntesis es otro concepto (String): se rechaza.
  45: ['System.out.println(nums.length());', 'System.out.println(nums.size());'],
  46: ['for (int i = 0; i <= nums.length; i++) {\n    System.out.println(nums[i]);\n}',
    'for (int i = 0; i < 5; i++) {\n    System.out.println(nums[i]);\n}'],
  // renombrado inconsistente: se usa siempre el mismo nombre.
  47: ['int suma = 0;\nfor (int x : nums) {\n    suma += n;\n}\nSystem.out.println(suma);',
    'int suma = 0;\nfor (int n : nums) {\n    suma = suma + n;\n}\nSystem.out.println(suma);'],
  48: ['int max = 0;\nfor (int n : nums) {\n    if (n > max) max = n;\n}\nSystem.out.println(max);',
    'int max = nums[0];\nfor (int n : nums) {\n    if (n < max) max = n;\n}\nSystem.out.println(max);'],
  49: ['int[][] matriz = new int[3][3];', 'int[][] matrix = new int[2][2];'],
  50: ['int[][] matriz = {{1, 2}, {3, 5}};', 'int[][] matriz = {{1, 3}, {2, 4}};'],
  51: ['System.out.println(m[0][1]);', 'System.out.println(m[1]);'],
  // print (misma línea) vs println (salto): es el concepto del ejercicio.
  52: ['for (int i = 0; i < m.length; i++) {\n    for (int j = 0; j < m[i].length; j++) {\n        System.out.println(m[i][j]);\n    }\n    System.out.println();\n}',
    'for (int i = 0; i < m.length; i++) {\n    for (int j = 0; j < m[i].length; j++) {\n        System.out.print(m[i][j]);\n    }\n    System.out.println();\n}'],
  53: ['System.out.println(texto.length);', 'System.out.println(texto.size());'],
  54: ['String c = a + b;\nSystem.out.println(c);', 'String c = b + " " + a;\nSystem.out.println(c);'],
  55: ['String mayus = texto.toLowerCase();\nSystem.out.println(mayus);',
    'System.out.println(texto.toUpperCase());'],
  56: ['String sub = texto.substring(0, 3);\nSystem.out.println(sub);',
    'String sub = texto.substring(1, 4);\nSystem.out.println(sub);'],
  // `==` está prohibido por la consigna: solo equals.
  57: ['if (a == b) {\n    System.out.println("Iguales");\n}',
    'if (a.equals(b)) {\n    System.out.println("Distintos");\n}'],
  // appends encadenados o en otro orden cambian la forma pedida.
  58: ['StringBuilder sb = new StringBuilder();\nsb.append("Hola").append(" ").append("Mundo");\nSystem.out.println(sb.toString());',
    'StringBuilder sb = new StringBuilder();\nsb.append("Mundo");\nsb.append(" ");\nsb.append("Hola");\nSystem.out.println(sb.toString());'],
};

describe('c-18 lote 4: trampas rechazadas', () => {
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
