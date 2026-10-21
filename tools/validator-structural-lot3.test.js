'use strict';
// C-18 validator-structural, lote 3 (ids 31-40: switch con String,
// switch expression, Scanner 33-40). Patrón vm de C-10. NO toca
// validator.js ni data.js.
//
// Scanner (33-40): la lectura real solo se comprueba ejecutando
// (C-05/C-06); acá se valida la estructura por tokens: crear el lector,
// mostrar el texto pedido y leer con la llamada que corresponde.

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

const IDS = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40];

describe('c-18 lote 3: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  31: ['switch (color) {\ncase "rojo": System.out.println("Peligro"); break;\ncase "verde": System.out.println("Seguro"); break;\ndefault: System.out.println("Desconocido");\n}',
    `${solutionOf(31)}\nSystem.out.println("fin");`],
  32: ['String resultado = switch (nota) { case 10,9 -> "Excelente"; case 8,7 -> "Bueno"; default -> "Regular"; };',
    `${solutionOf(32)}\nint aparte = 1;`],
  33: ['Scanner sc=new Scanner(System.in);System.out.print("Edad: ");int edad=sc.nextInt();',
    `${solutionOf(33)}\nSystem.out.println(edad);`],
  34: ['Scanner sc=new Scanner(System.in);System.out.print("Nombre: ");String nombre=sc.nextLine();',
    `${solutionOf(34)}\nSystem.out.println(nombre);`],
  35: ['Scanner sc = new Scanner(System.in);\nSystem.out.print("Nombre: ");\nString nombre = sc.nextLine();\nSystem.out.print("Edad: ");\nint edad = sc.nextInt();\nSystem.out.println(nombre + edad);',
    'Scanner sc=new Scanner(System.in);System.out.print("Nombre: ");String nombre=sc.nextLine();System.out.print("Edad: ");int edad=sc.nextInt();'],
  36: ['Scanner sc = new Scanner(System.in);\nif(sc.hasNextInt()){int num=sc.nextInt();System.out.println("Número: "+num);}else{System.out.println("No es número");}',
    'Scanner sc = new Scanner(System.in);\nif (sc.hasNextInt())\n{\nint num = sc.nextInt();\nSystem.out.println("Número: " + num);\n}\nelse\n{\nSystem.out.println("No es número");\n}'],
  37: ['Scanner sc=new Scanner(System.in);int num;do{System.out.print("Número (0 para salir): ");num=sc.nextInt();}while(num!=0);',
    'Scanner sc = new Scanner(System.in);\nint num;\ndo {\n    System.out.print("Número (0 para salir): ");\n    num = sc.nextInt();\n    System.out.println(num);\n} while (num != 0);'],
  38: ['Scanner sc = new Scanner(System.in);\nint num = sc.nextInt();\nsc.close();\nSystem.out.println("cerrado");',
    'Scanner sc=new Scanner(System.in);int num=sc.nextInt();sc.close();'],
  39: ['try (Scanner sc = new Scanner(System.in)) { System.out.print("Número: "); int num = sc.nextInt(); System.out.println("Leído: " + num); }',
    `${solutionOf(39)}\nSystem.out.println("listo");`],
  40: ['Scanner sc=new Scanner(System.in);System.out.print("Precio: ");double precio=sc.nextDouble();',
    `${solutionOf(40)}\nSystem.out.println(precio);`],
};

describe('c-18 lote 3: variantes válidas aceptadas', () => {
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
  31: ['switch (color) {\n    case "roja":\n        System.out.println("Peligro");\n        break;\n    case "verde":\n        System.out.println("Seguro");\n        break;\n    default:\n        System.out.println("Desconocido");\n}',
    'switch (color) {\n    case "rojo":\n        System.out.println("Peligro");\n    case "verde":\n        System.out.println("Seguro");\n        break;\n    default:\n        System.out.println("Desconocido");\n}'],
  32: ['String resultado = switch (nota) {\n    case 10, 9: "Excelente";\n    case 8, 7: "Bueno";\n    default: "Regular";\n};',
    'String resultado = switch (nota) {\n    case 10, 9 -> "Muy bien";\n    case 8, 7 -> "Bueno";\n    default -> "Regular";\n};'],
  33: ['Scanner sc = new Scanner(System.in);\nSystem.out.print("Edad: ");\nint edad = sc.nextLine();',
    'Scanner sc = new Scanner(System.in);\nint edad = sc.nextInt();'],
  34: ['Scanner sc = new Scanner(System.in);\nSystem.out.print("Nombre: ");\nString nombre = sc.nextInt();',
    'Scanner sc = new Scanner(System.in);\nSystem.out.print("Nombre");\nString nombre = sc.nextLine();'],
  35: ['Scanner sc = new Scanner(System.in);\nSystem.out.print("Edad: ");\nint edad = sc.nextInt();\nSystem.out.print("Nombre: ");\nString nombre = sc.nextLine();',
    'Scanner sc = new Scanner(System.in);\nSystem.out.print("Nombre: ");\nString nombre = sc.nextInt();\nSystem.out.print("Edad: ");\nint edad = sc.nextInt();'],
  36: ['Scanner sc = new Scanner(System.in);\nif (sc.hasNextDouble()) {\n    int num = sc.nextInt();\n    System.out.println("Número: " + num);\n} else {\n    System.out.println("No es número");\n}',
    'Scanner sc = new Scanner(System.in);\nif (sc.hasNextInt()) {\n    int num = sc.nextInt();\n    System.out.println("Número: " + num);\n}'],
  37: ['Scanner sc = new Scanner(System.in);\nint num;\nwhile (num != 0) {\n    System.out.print("Número (0 para salir): ");\n    num = sc.nextInt();\n}',
    'Scanner sc = new Scanner(System.in);\nint num;\ndo {\n    System.out.print("Número (0 para salir): ");\n    num = sc.nextInt();\n} while (num == 0);'],
  38: ['sc.close();',
    'Scanner sc = new Scanner(System.in);\nint num = sc.nextInt();\nsc.stop();'],
  39: ['try {\n    Scanner sc = new Scanner(System.in);\n    System.out.print("Número: ");\n    int num = sc.nextInt();\n    System.out.println("Leído: " + num);\n}',
    'try (Scanner sc = new Scanner(System.in)) {\n    System.out.print("Número: ");\n    int num = sc.nextLine();\n    System.out.println("Leído: " + num);\n}'],
  40: ['Scanner sc = new Scanner(System.in);\nSystem.out.print("Precio: ");\ndouble precio = sc.nextInt();',
    'Scanner sc = new Scanner(System.in);\nSystem.out.print("Precio");\ndouble precio = sc.nextDouble();'],
};

describe('c-18 lote 3: trampas rechazadas', () => {
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
