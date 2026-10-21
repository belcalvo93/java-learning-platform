'use strict';
// C-18 validator-structural, lote 6 (ids 71-84: herencia, abstract,
// interfaces, static). Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Todo fijo por consigna: no hay nombres libres. El orden de
// modificadores (public static final) y de métodos/atributos
// independientes no es concepto. `super(...)` primera línea sí es
// concepto y orden (Java lo exige).

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

const IDS = [71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84];

describe('c-18 lote 6: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  71: ['public class Estudiante extends Persona{String carrera;}', 'public class Estudiante extends Persona {\n    String carrera;\n    String otra = "x";\n}'],
  72: ['public Estudiante(String nombre,String carrera){super(nombre);this.carrera=carrera;}',
    'public Estudiante( String nombre, String carrera )\n{\n    super( nombre );\n    this.carrera = carrera;\n}'],
  73: ['@Override public String toString(){return "Persona: "+nombre;}', '@Override\npublic String toString() {\n    return ("Persona: " + nombre);\n}'],
  74: ['Persona p=new Estudiante("Ana","Ingeniería");', 'final Persona p = new Estudiante("Ana", "Ingeniería");'],
  75: ['public abstract class Animal{public abstract void hacerSonido();}',
    'public abstract class Animal {\n    public abstract void hacerSonido( );\n}'],
  76: ['public class Perro extends Animal{@Override public void hacerSonido(){System.out.println("Guau");}}',
    'public class Perro extends Animal {\n    @Override\n    public void hacerSonido() {\n        System.out.println("Guau");\n    }\n}'],
  77: ['public interface Volador{void volar();}', 'public interface Volador {\n    void volar( );\n}'],
  78: ['public class Ave implements Volador{@Override public void volar(){System.out.println("Volando");}}',
    'public class Ave implements Volador\n{\n    @Override\n    public void volar( )\n    {\n        System.out.println( "Volando" );\n    }\n}'],
  // el orden de los métodos no es concepto.
  79: ['public class Pato implements Volador,Nadador{public void volar(){}public void nadar(){}}',
    'public class Pato implements Volador, Nadador {\n    public void nadar() { }\n    public void volar() { }\n}'],
  80: ['default void despedir(){System.out.println("Adiós");}',
    'default void despedir( )\n{\n    System.out.println( "Adiós" );\n}'],
  81: ['static int total=0;', 'public static int total = 0;'],
  82: ['public static int sumar(int a,int b){return a+b;}', 'static public int sumar(int a, int b) {\n    return a + b;\n}'],
  // el orden de los modificadores no es concepto.
  83: ['public static final double PI=3.14159;', 'static public final double PI = 3.14159;'],
  84: ['static{url="http://localhost";}', 'static {\n    url = "http://localhost";\n}'],
};

describe('c-18 lote 6: variantes válidas aceptadas', () => {
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
  71: ['public class Estudiante implements Persona {\n    String carrera;\n}', 'public class Estudiante extends Persona {\n}'],
  // super tiene que ir primera: Java lo exige y la consigna lo pide.
  72: ['public Estudiante(String nombre, String carrera) {\n    this.carrera = carrera;\n    super(nombre);\n}',
    'public Estudiante(String nombre, String carrera) {\n    super(carrera);\n    this.carrera = carrera;\n}'],
  73: ['public String toString() {\n    return "Persona: " + nombre;\n}',
    'public String toString() {\n    System.out.println("Persona: " + nombre);\n}'],
  // el tipo declarado padre es el concepto (polimorfismo).
  74: ['Estudiante p = new Estudiante("Ana", "Ingeniería");', 'Persona p = new Persona("Ana", 25);'],
  75: ['public abstract class Animal {\n    public void hacerSonido();\n}',
    'public abstract class Animal {\n    public abstract void hacerSonido() {}\n}'],
  76: ['public class Perro extends Animal {\n    public void hacerSonido() {\n        System.out.println("Guau");\n    }\n}',
    'public class Perro implements Animal {\n    @Override\n    public void hacerSonido() {\n        System.out.println("Guau");\n    }\n}'],
  77: ['public class Volador {\n    void volar();\n}', 'public interface Volador {\n    void volar() {}\n}'],
  78: ['public class Ave extends Volador {\n    @Override\n    public void volar() {\n        System.out.println("Volando");\n    }\n}',
    'public class Ave implements Volador {\n    public void volar() {\n        System.out.println("Volando");\n    }\n}'],
  79: ['public class Pato implements Volador {\n    public void volar() { }\n    public void nadar() { }\n}',
    'public class Pato extends Volador, Nadador {\n    public void volar() { }\n    public void nadar() { }\n}'],
  80: ['void despedir() {\n    System.out.println("Adiós");\n}',
    'default void despedir() {\n    System.out.println("Chau");\n}'],
  81: ['int total = 0;', 'static int total = 1;'],
  82: ['public int sumar(int a, int b) {\n    return a + b;\n}', 'public static int sumar(int a, int b) {\n    return a * b;\n}'],
  83: ['public static double PI = 3.14159;', 'public static final double PI = 3.14;'],
  84: ['{\n    url = "http://localhost";\n}', 'static {\n    url = "http://otro";\n}'],
};

describe('c-18 lote 6: trampas rechazadas', () => {
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
