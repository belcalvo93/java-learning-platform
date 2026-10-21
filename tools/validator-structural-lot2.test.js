'use strict';
// C-18 validator-structural, lote 2 (ids 9-30): tests RED del validador
// estructural por tokens. Runner: node --test tools/*.test.js (cero deps,
// patrón vm de C-10/lote-1). NO toca validator.js ni data.js.
//
// Decisiones de Belén aplicadas (contrato, 11 preguntas del lote 2):
// - código extra válido APRUEBA si la estructura pedida está presente.
// - id 17: indentación NO exigida (el formato no es concepto).
// - id 16: paréntesis del ternario libres.
// - condición negada con ramas invertidas RECHAZADA (se keeps la forma pedida).
// - id 19: llaves opcionales. id 22: `i` predeclarada (sin `int`) vale.
// - id 24: if con o sin llaves vale. id 26: printf vale junto a print-concat.
// - id 27: `+=` EXIGIDO (la consigna lo nombra).
// - id 30: bloque compartido exigido (println repetido rechazado).
// - equivalencias aritméticas (`i < 101` por `i <= 100`) RECHAZADAS.

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

const IDS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

describe('c-18 lote 2: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

// Variantes válidas hechas a mano: formas de decisión del lote 2 + una
// variación de tolerancia (espaciado compacto, modificador de más, etc.).
const VALID = {
  9: ['int edad=25;', 'final int edad = 25;'],
  10: ['String nombre="Ana";', 'final String nombre = "Ana";'],
  11: ['int i=(int)d;', 'int i = (int) d;\nint aparte = 1;'],
  12: ['final double PI=3.14159;', 'public final double PI = 3.14159;'],
  13: ['int s=a+b;', 'int s = a + b;\nSystem.out.println(s);'],
  14: ['int r=17%2;', 'int r = 17 % 2;\nSystem.out.println(r);'],
  15: ['boolean result=a&&b;', 'boolean result = a && b;\nSystem.out.println(result);'],
  // id 16: paréntesis del ternario libres (decisión).
  16: ['String status = e >= 18 ? "A" : "M";', 'String status=(e>=18)?"A":"M";'],
  // id 17: indentación no exigida + formato libre dentro de la línea.
  17: ['if (x > 0) {\nSystem.out.println("P");\n}', 'if(x>0){System.out.println("P");}'],
  18: ['if(n%2==0){System.out.println("Par");}else{System.out.println("Impar");}',
    'if (n % 2 == 0)\n{\nSystem.out.println("Par");\n}\nelse\n{\nSystem.out.println("Impar");\n}'],
  // id 19: llaves opcionales (decisión).
  19: ['if (n >= 90) { s = "A"; } else if (n >= 70) { s = "B"; } else { s = "F"; }',
    'if(n>=90)s="A";else if(n>=70)s="B";else s="F";'],
  20: ['if(a&&(b||c)){}', 'if (a && (b || c)) {\n    System.out.println("ok");\n}'],
  21: ['while(i<=5){System.out.println(i);i++;}', 'while (i <= 5)\n{\nSystem.out.println(i);\ni++;\n}'],
  // id 22: `i` predeclarada sin `int` vale (decisión).
  22: ['for (i = 10; i >= 1; i--) {\n    System.out.println(i);\n}',
    'for(int i=10;i>=1;i--){System.out.println(i);}'],
  23: ['int i=0;do{System.out.println(i);i++;}while(i<3);',
    'int i = 0;\ndo {\n    System.out.println(i);\n    i++;\n} while (i < 3);'],
  // id 24: if con o sin llaves vale (decisión).
  24: ['for (int i = 1; i <= 10; i++) {\n    if (i == 5) { break; }\n    System.out.println(i);\n}',
    'for(int i=1;i<=10;i++){if(i==5)break;System.out.println(i);}'],
  25: ['for (int i = 1; i <= 5; i++) {\n    if (i % 2 == 0) { continue; }\n    System.out.println(i);\n}',
    'for(int i=1;i<=5;i++){if(i%2==0)continue;System.out.println(i);}'],
  // id 26: printf vale junto a print-concat (decisión).
  26: ['for (int i = 2; i <= 3; i++) {\n    for (int j = 1; j <= 5; j++) {\n        System.out.printf("%d x %d = %d%n", i, j, i * j);\n    }\n}',
    'for(int i=2;i<=3;i++){for(int j=1;j<=5;j++){System.out.println(i+" x "+j+" = "+(i*j));}}'],
  27: ['int suma=0;int i=1;while(i<=100){suma+=i;i++;}System.out.println(suma);',
    'int suma = 0;\nint i = 1;\nwhile (i <= 100) {\n    suma += i;\n    i++;\n}\nSystem.out.println(suma);'],
  28: ['for(int n:nums){System.out.println(n);}', 'for (int n : nums) {\n    System.out.println(n);\n}'],
  29: ['switch(dia){case 1:System.out.println("Lunes");break;case 2:System.out.println("Martes");break;case 3:System.out.println("Miércoles");break;default:System.out.println("Otro día");}',
    'switch (dia) {\n    case 1:\n        System.out.println("Lunes");\n        break;\n    case 2:\n        System.out.println("Martes");\n        break;\n    case 3:\n        System.out.println("Miércoles");\n        break;\n    default:\n        System.out.println("Otro día");\n}'],
  // id 30: bloque compartido en el orden de la consigna.
  30: ['int mes=2;switch(mes){case 12:case 1:case 2:System.out.println("Verano");break;default:System.out.println("Otra estación");}',
    'int mes = 2;\nswitch (mes) {\n    case 12:\n    case 1:\n    case 2:\n        System.out.println("Verano");\n        break;\n    default:\n        System.out.println("Otra estación");\n}'],
};

describe('c-18 lote 2: variantes válidas aceptadas', () => {
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

// Trampas hechas a mano: violan el concepto o la parte estricta.
const INVALID = {
  9: ['int edad = 26;', 'String edad = "25";'],
  10: ['String nombre = "Juan";', 'String name = "Ana";'],
  11: ['int i = (long) d;', 'int i = d;'],
  12: ['double PI = 3.14159;', 'final double PI = 3.14;'],
  13: ['int s = a - b;', 'int r = a + b;'],
  14: ['int r = 17 % 3;', 'int r = 17 / 2;'],
  15: ['boolean result = a || b;', 'boolean res = a && b;'],
  // condición negada con ramas invertidas: se rechaza aunque "dé lo mismo".
  16: ['String status = (e >= 18) ? "M" : "A";', 'String status = (e < 18) ? "M" : "A";'],
  17: ['if (x >= 0) {\n    System.out.println("P");\n}', 'if (x > 0) {\n    System.out.println("Q");\n}'],
  18: ['if (n % 2 == 0) {\n    System.out.println("Par");\n}', 'if (n % 2 == 1) {\n    System.out.println("Par");\n} else {\n    System.out.println("Impar");\n}'],
  19: ['if (n > 90) s = "A"; else if (n >= 70) s = "B"; else s = "F";',
    'if (n >= 90) s = "A"; else s = "F";'],
  20: ['if (a && b || c) { }', 'if (a || (b || c)) { }'],
  // equivalencia aritmética: se rechaza (números/operadores estrictos).
  21: ['while (i < 6) {\n    System.out.println(i);\n    i++;\n}',
    'while (i <= 5) {\n    i++;\n    System.out.println(i);\n}'],
  22: ['for (int i = 10; i > 1; i--) {\n    System.out.println(i);\n}',
    'for (int i = 1; i <= 10; i++) {\n    System.out.println(i);\n}'],
  23: ['int i = 0;\nwhile (i < 3) {\n    System.out.println(i);\n    i++;\n}',
    'int i = 0;\ndo {\n    System.out.println(i);\n    i++;\n} while (i <= 3);'],
  24: ['for (int i = 1; i <= 10; i++) {\n    if (i == 5) continue;\n    System.out.println(i);\n}',
    'for (int i = 1; i <= 10; i++) {\n    System.out.println(i);\n    if (i == 5) break;\n}'],
  25: ['for (int i = 1; i <= 5; i++) {\n    if (i % 2 == 0) break;\n    System.out.println(i);\n}',
    'for (int i = 1; i <= 5; i++) {\n    if (i % 2 != 0) continue;\n    System.out.println(i);\n}'],
  26: ['for (int i = 2; i <= 3; i++) {\n    for (int j = 1; j <= 5; j++) {\n        System.out.println(i + " x " + j + " = " + (i + j));\n    }\n}',
    'for (int i = 2; i <= 4; i++) {\n    for (int j = 1; j <= 5; j++) {\n        System.out.println(i + " x " + j + " = " + (i * j));\n    }\n}'],
  // `+=` exigido + equivalencia aritmética rechazada.
  27: ['int suma = 0;\nint i = 1;\nwhile (i <= 100) {\n    suma = suma + i;\n    i++;\n}\nSystem.out.println(suma);',
    'int suma = 0;\nint i = 1;\nwhile (i < 101) {\n    suma += i;\n    i++;\n}\nSystem.out.println(suma);'],
  28: ['for (int i : nums) {\n    System.out.println(i);\n}',
    'for (int i = 0; i < nums.length; i++) {\n    System.out.println(nums[i]);\n}'],
  29: ['switch (dia) {\n    case 1:\n        System.out.println("Lunes");\n    case 2:\n        System.out.println("Martes");\n        break;\n    case 3:\n        System.out.println("Miércoles");\n        break;\n    default:\n        System.out.println("Otro día");\n}',
    'switch (dia) {\n    case 1:\n        System.out.println("Lunes");\n        break;\n    case 2:\n        System.out.println("Martes");\n        break;\n    case 4:\n        System.out.println("Miércoles");\n        break;\n    default:\n        System.out.println("Otro día");\n}'],
  // bloque compartido exigido: println repetido o break entre casos, no vale.
  30: ['int mes = 2;\nswitch (mes) {\n    case 12:\n        System.out.println("Verano");\n        break;\n    case 1:\n        System.out.println("Verano");\n        break;\n    case 2:\n        System.out.println("Verano");\n        break;\n    default:\n        System.out.println("Otra estación");\n}',
    'int mes = 2;\nswitch (mes) {\n    case 12:\n        break;\n    case 1:\n    case 2:\n        System.out.println("Verano");\n        break;\n    default:\n        System.out.println("Otra estación");\n}'],
};

describe('c-18 lote 2: trampas rechazadas', () => {
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
