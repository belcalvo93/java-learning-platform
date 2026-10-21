'use strict';
// C-18 validator-structural, lote 12 (ids 162-168: ficheros).
// Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Ficheros reales solo se comprueban ejecutando (C-05/C-06); acá se
// valida la estructura por tokens: recurso, llamadas y literales.
// Id 168 conserva su puerta de pipeline (fija el orden: líneas,
// filtro con contains, forEach), endurecida como el resto.

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

const IDS = [162, 163, 164, 165, 166, 167, 168];

describe('c-18 lote 12: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  162: ['String contenido="Hola Mundo";Files.writeString(Path.of("archivo.txt"),contenido);',
    'final String contenido = "Hola Mundo";\nFiles.writeString(Path.of("archivo.txt"), contenido);'],
  163: ['String contenido=Files.readString(Path.of("archivo.txt"));',
    'final String contenido = Files.readString(Path.of("archivo.txt"));'],
  164: ['boolean existe=Files.exists(Path.of("archivo.txt"));', 'final boolean existe = Files.exists(Path.of("archivo.txt"));'],
  165: ['Files.deleteIfExists(Path.of("archivo.txt"));', 'Files.deleteIfExists( Path.of( "archivo.txt" ) );'],
  166: ['try(BufferedReader br=new BufferedReader(new FileReader("file.txt"))){String linea;while((linea=br.readLine())!=null){System.out.println(linea);}}',
    'import java.io.*;\ntry (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {\n    String linea;\n    while ((linea = br.readLine()) != null) {\n        System.out.println(linea);\n    }\n}'],
  167: ['try(BufferedWriter bw=new BufferedWriter(new FileWriter("file.txt"))){bw.write("Línea 1");bw.newLine();bw.write("Línea 2");}',
    'import java.io.*;\ntry (BufferedWriter bw = new BufferedWriter(new FileWriter("file.txt"))) {\n    bw.write("Línea 1");\n    bw.newLine();\n    bw.write("Línea 2");\n}'],
  // 168: la puerta tolera formato con el pipeline presente.
  168: ['try (Stream<String> lineas = Files.lines(Path.of("file.txt"))) {\nlineas.filter(l -> l.contains("Java")).forEach(System.out::println);\n}',
    'try (Stream<String> lineas = Files.lines(Path.of("file.txt"))) {\n    lineas\n        .filter(l -> l.contains("Java"))\n        .forEach(System.out::println);\n}'],
};

describe('c-18 lote 12: variantes válidas aceptadas', () => {
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
  162: ['String contenido = "Hola Mundo";\nFiles.readString(Path.of("archivo.txt"));',
    'String contenido = "Hola Mundo";\nFiles.writeString(Path.of("otro.txt"), contenido);'],
  163: ['String contenido = Files.writeString(Path.of("archivo.txt"), contenido);',
    'String texto = Files.readString(Path.of("archivo.txt"));'],
  // notExists es otra llamada con otro sentido.
  164: ['boolean existe = Files.notExists(Path.of("archivo.txt"));',
    'boolean existe = Files.exists(Path.of("otro.txt"));'],
  // delete lanza si falta: deleteIfExists es el concepto.
  165: ['Files.delete(Path.of("archivo.txt"));', 'Files.deleteIfExists(Path.of("otro.txt"));'],
  166: ['try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {\n    String linea;\n    while ((linea = br.readLine()) == null) {\n        System.out.println(linea);\n    }\n}',
    'try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {\n    String linea;\n    while ((linea = br.read()) != null) {\n        System.out.println(linea);\n    }\n}'],
  167: ['try (BufferedWriter bw = new BufferedWriter(new FileWriter("file.txt"))) {\n    bw.write("Línea 1");\n    bw.write("Línea 2");\n}',
    'try (BufferedWriter bw = new BufferedWriter(new FileWriter("file.txt"))) {\n    bw.write("Línea 2");\n    bw.newLine();\n    bw.write("Línea 1");\n}'],
  // sin pipeline o con el pipeline en comentario: se rechaza.
  168: ['try (Stream<String> lineas = Files.lines(Path.of("file.txt"))) {\n    System.out.println(lineas.count());\n}',
    '/*\ntry (Stream<String> lineas = Files.lines(Path.of("file.txt"))) {\n    lineas.filter(l -> l.contains("Java"))\n        .forEach(System.out::println);\n}\n*/'],
};

describe('c-18 lote 12: trampas rechazadas', () => {
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
