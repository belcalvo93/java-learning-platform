'use strict';
// C-18 validator-structural, lote 5 (ids 59-70: métodos, clases,
// encapsulamiento). Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Todo fijo por consigna (clases, métodos, atributos, this): no hay
// nombres libres en este lote. El orden de atributos y de asignaciones
// independientes no es concepto y se acepta en cualquier orden.

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

const IDS = [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];

describe('c-18 lote 5: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  59: ['public static void saludar(){System.out.println("Hola");}',
    'public static void saludar() {\n    System.out.println("Hola");\n    System.out.println("chau");\n}'],
  60: ['public static int sumar(int a,int b){return a+b;}',
    'public static int sumar(int a, int b) {\n    return (a + b);\n}'],
  // el orden de los atributos no es concepto.
  61: ['public class Persona{String nombre;int edad;}', 'public class Persona {\n    int edad;\n    String nombre;\n}'],
  // el orden de las asignaciones no es concepto.
  62: ['public Persona(String nombre,int edad){this.nombre=nombre;this.edad=edad;}',
    'public Persona(String nombre, int edad) {\n    this.edad = edad;\n    this.nombre = nombre;\n}'],
  63: ['Persona p=new Persona("Ana",25);', 'final Persona p = new Persona("Ana", 25);'],
  64: ['System.out.println(p.nombre );', 'System.out.println((p.nombre));'],
  65: ['public void saludar(){System.out.println("Hola, soy "+nombre);}',
    'public void saludar() {\n    System.out.println("Hola, soy " + this.nombre);\n}'],
  66: ['p . saludar ( ) ;', 'p.saludar();\np.saludar();'],
  67: ['private double saldo;', 'private   double   saldo   ;'],
  // `this.saldo` dice lo mismo que `saldo` acá.
  68: ['public double getSaldo(){return saldo;}', 'public double getSaldo() {\n    return this.saldo;\n}'],
  69: ['public void setSaldo(double saldo){this.saldo=saldo;}', 'public void setSaldo(double saldo)\n{\nthis.saldo = saldo;\n}'],
  // llaves del if de una línea: opcionales.
  70: ['public void setEdad(int edad){if(edad>=0)this.edad=edad;}', 'public void setEdad(int edad) {\n    if (edad >= 0)\n    {\n        this.edad = edad;\n    }\n}'],
};

describe('c-18 lote 5: variantes válidas aceptadas', () => {
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
  59: ['public static void saludar() {\n}', 'public static void saludar() {\n    System.out.println("Adiós");\n}'],
  60: ['public static int sumar(int a, int b) {\n    return a - b;\n}',
    'public static int sumar(int a, int b) {\n    int r = a + b;\n}'],
  61: ['public class Persona {\n    String nombre;\n    String edad;\n}', 'public class Persona {\n    String nombre;\n}'],
  62: ['public Persona(String nombre, int edad) {\n    nombre = nombre;\n    edad = edad;\n}',
    'public Persona(String nombre, int edad) {\n    this.nombre = edad;\n    this.edad = nombre;\n}'],
  63: ['Persona p = new Persona("Ana");', 'Persona p = new Persona("Juan", 25);'],
  64: ['System.out.println(p.edad);', 'System.out.println(nombre);'],
  65: ['public void saludar() {\n    System.out.println("Hola " + nombre);\n}',
    'public void saludar() {\n    return "Hola, soy " + nombre;\n}'],
  66: ['saludar();', 'p.saludar;'],
  67: ['double saldo;', 'private int saldo;'],
  // Java distingue mayúsculas: getsaldo no es getSaldo.
  68: ['public double getSaldo() {\n    return 0;\n}', 'public double getsaldo() {\n    return saldo;\n}'],
  69: ['public void setSaldo(double saldo) {\n    saldo = saldo;\n}', 'public void setSaldo(double s) {\n    this.saldo = s;\n}'],
  70: ['public void setEdad(int edad) {\n    if (edad > 0) {\n        this.edad = edad;\n    }\n}',
    'public void setEdad(int edad) {\n    this.edad = edad;\n}'],
};

describe('c-18 lote 5: trampas rechazadas', () => {
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
