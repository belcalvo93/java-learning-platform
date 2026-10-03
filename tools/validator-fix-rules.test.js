'use strict';
// Phase A (RED) del change c-10-validator-fix-rules: por cada id in-scope
// (3-8, 168) un test exige que la canónica de data.js sea válida (hoy FALLA)
// y un test exige que una solución incorrecta sea rechazada.
// Carga idéntica a tools/audit-validator.js (vm, sin dependencias).
// NUNCA toca validator.js ni data.js.

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

// Soluciones incorrectas: cada una de ids 3-8 SATISFACE la vieja regla del id
// (pensada para otro ejercicio) pero VIOLA la regla nueva del design
// §Decisions-1, así que hoy son aceptadas (test en RED) y tras el fix serán
// rechazadas. La del 168 no usa el pipeline y ya es rechazada (rama default).
const WRONG = {
  3: 'class P {\n    int edad = 25;\n    void a() {\n        System.out.println(edad);\n    }\n}',
  4: 'class C {\n    String nombre = "Ana";\n    void m() {\n        System.out.println(nombre);\n    }\n}',
  5: 'public class Suma {\n    public static void main(String[] args) {\n        int a = 10;\n        int b = 5;\n        int resultado = a + b;\n        System.out.println(resultado);\n    }\n}',
  6: 'public class C {\n    public static void main(String[] args) {\n        int edad = 20;\n        if (edad >= 18) {\n            System.out.println("Mayor");\n        } else {\n            System.out.println("Menor");\n        }\n    }\n}',
  7: 'public class C {\n    public static void main(String[] args) {\n        int num1 = 15;\n        int num2 = 20;\n        if (num1 < num2) {\n            System.out.println(num2);\n        }\n    }\n}',
  8: 'public class C {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            System.out.println(i);\n        }\n    }\n}',
  168: 'import java.nio.file.*;\npublic class Lector {\n    public static void main(String[] args) {\n        System.out.println("hola");\n    }\n}',
};

// Fase B: contenido correcto con indentación realmente rota (3 espacios en
// una línea de cuerpo → no múltiplo de 4). Ver nota en el describe de abajo.
const BROKEN_INDENT = {
  3: 'class P {\n    void a() {\n   System.out.println("a");\n    }\n    void b() {\n        System.out.println("b");\n    }\n}',
  4: 'for (int i = 0; i < 5; i++) {\n   if (i % 2 == 0) {\n        System.out.println(i);\n    }\n}',
};

// Fase B, triangulación: violan la regla NUEVA (deleitan el caso feliz sin
// repetir el WRONG original).
const WRONG2 = {
  3: 'class P {\n    void a() {\n        return;\n    }\n    void b() {\n        return;\n    }\n}',
  4: 'for (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}',
  5: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola Mundo");\n    }\n}',
  6: 'System.out.println("Línea 1");',
  7: 'System.out.println("Hola ");\nSystem.out.println("Mundo");',
  8: 'public class E {\n    public static void main(String[] args) {\n        int e = 25;\n        System.out.println("Edad: " + e);\n    }\n}',
  168: 'try (Stream<String> lineas = Files.lines(Path.of("file.txt"))) {\n    System.out.println(lineas.count());\n}',
};

// Fase B, variaciones razonables: deben pasar con las reglas nuevas.
const VARIATIONS = {
  3: [
    'class P { void a() { System.out.println("a"); } void b() { System.out.println("b"); } }',
    'class Q {\n    void a() {\n        System.out.println("a");\n    }\n    void b() {\n        System.out.println("b");\n    }\n}',
  ],
  4: [
    'for (int i = 0; i < 5; i++) { if (i % 2 == 0) {\nSystem.out.println(i); } }',
    'for ( int i = 0 ; i < 5 ; i++ ) {\n    if ( i % 2 == 0 ) {\n        System.out.println( i ) ;\n    }\n}',
  ],
  5: [
    'System.out.println("Hola, Java!");',
    'public class Hola {\n    public static void main(String[] args) {\n        System.out.println ( "Hola, Java!" ) ;\n    }\n}',
  ],
  6: [
    'public class M {\n    public static void main(String[] args) {\n        System.out.println("Línea 1");\n        System.out.println("Línea 2");\n    }\n}',
    'System.out.println ( "Línea 1" ) ;\nSystem.out.println ( "Línea 2" ) ;',
  ],
  7: [
    'public class S {\n    public static void main(String[] args) {\n        System.out.print("Hola ");\n        System.out.println("Mundo");\n    }\n}',
    'System.out.print ( "Hola " ) ;\nSystem.out.println ( "Mundo" ) ;',
  ],
  8: [
    'public class E {\n    public static void main(String[] args) {\n        int e = 25;\n        System.out.printf("Edad: %d%n", e);\n    }\n}',
    'System.out.printf ( "Edad: %d" , e ) ;',
  ],
  168: [
    'try (Stream<String> lineas = Files.lines(Path.of("file.txt"))) {\n    lineas.filter(l -> l.contains("Java"))\n        .forEach(System.out::println);\n}',
    'try (Stream<String> lineas = Files.lines(Path.of("file.txt"))) {\n    lineas\n        .filter(l -> l.contains("Java"))\n        .forEach(System.out::println);\n}',
  ],
};

describe('c-10 validator-fix-rules (fase A: RED)', () => {
  for (const id of [3, 4, 5, 6, 7, 8, 168]) {
    it(`id ${id}: la solución canónica de data.js es válida`, () => {
      const result = new JavaValidator().validate(solutionOf(id), id);
      assert.strictEqual(result.isValid, true, `id ${id} rechazado: ${JSON.stringify(result.errors)}`);
      assert.strictEqual(result.errors.length, 0);
    });

    it(`id ${id}: una solución incorrecta es rechazada`, () => {
      const result = new JavaValidator().validate(WRONG[id], id);
      assert.strictEqual(result.isValid, false, `id ${id}: solución incorrecta aceptada como válida`);
    });

    // Fase B, triangulación: segunda solución incorrecta por id (viola la
    // regla NUEVA del design §Decisions-1/2); debe seguir rechazada.
    it(`id ${id}: segunda solución incorrecta (triangulación) es rechazada`, () => {
      const result = new JavaValidator().validate(WRONG2[id], id);
      assert.strictEqual(result.isValid, false, `id ${id}: triangulación aceptada como válida`);
    });

    // Fase B, variaciones: formas razonables equivalentes deben pasar.
    for (const [n, code] of VARIATIONS[id].entries()) {
      it(`id ${id}: variación razonable ${n + 1} es válida`, () => {
        const result = new JavaValidator().validate(code, id);
        assert.strictEqual(result.isValid, true, `id ${id} var ${n + 1} rechazado: ${JSON.stringify(result.errors)}`);
      });
    }
  }
});

// Fase B, indentación (ids 3-4). Nota data.js (solo-lectura): las canónicas
// de 3-4 YA están bien indentadas (0/4/8); los starterCode están a 0 espacios
// (múltiplo de 4: pasan la puerta general preexistente — limitación conocida,
// fuera de alcance). El negativo usa contenido correcto con indentación
// realmente rota (3 espacios: no múltiplo de 4 → rechazado en español).
describe('c-10 indentación ids 3-4 (fase B)', () => {
  for (const id of [3, 4]) {
    it(`id ${id}: contenido correcto con indentación rota es rechazado`, () => {
      const result = new JavaValidator().validate(BROKEN_INDENT[id], id);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((m) => /indentación/.test(m)), `sin mensaje de indentación: ${JSON.stringify(result.errors)}`);
    });

    it(`id ${id}: la forma bien indentada (canónica) pasa sin error de indentación`, () => {
      const result = new JavaValidator().validate(solutionOf(id), id);
      assert.strictEqual(result.isValid, true, `id ${id} rechazado: ${JSON.stringify(result.errors)}`);
      assert.ok(!result.errors.some((m) => /indentación/.test(m)));
    });
  }
});

describe('c-10 invariante 52/208 post-fix (fase B)', () => {
  it('data.js intacto: 208 ejercicios con ids 1-208', () => {
    assert.strictEqual(exercises.length, 208);
    const ids = exercises.map((e) => e.id).sort((a, b) => a - b);
    assert.deepStrictEqual(ids, Array.from({ length: 208 }, (_, i) => i + 1));
  });
});
