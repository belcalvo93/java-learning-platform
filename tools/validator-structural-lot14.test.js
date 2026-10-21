'use strict';
// C-18 validator-structural, lote 14 (ids 189-199: patrones y SOLID).
// Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Nombres libres (la consigna no los nombra): `o` en 192, `c` en
// 194. El resto fijo por consigna. Los comentarios (`// Mal`, `// Bien`)
// son libres: nunca cuentan (se quitan antes de comparar).

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
// Los comentarios no son código: la variante de espaciado los quita
// primero (los id 195-199 los traen en la solución).
const oneLine = (s) => s.replace(/\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ').trim();

const IDS = [189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199];

describe('c-18 lote 14: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  189: ['public class Singleton{private static Singleton instancia;private Singleton(){}public static Singleton getInstancia(){if(instancia==null){instancia=new Singleton();}return instancia;}}',
    'public class Singleton\n{\n    private static Singleton instancia;\n    private Singleton() { }\n    public static Singleton getInstancia()\n    {\n        if (instancia == null)\n        {\n            instancia = new Singleton();\n        }\n        return instancia;\n    }\n}'],
  // llaves del if de una línea: opcionales.
  190: ['public class AnimalFactory{public static Animal crear(String tipo){if(tipo.equals("perro")){return new Perro();}if(tipo.equals("gato")){return new Gato();}return null;}}',
    'public class AnimalFactory {\n    public static Animal crear(String tipo) {\n        if (tipo.equals("perro")) return new Perro();\n        if (tipo.equals("gato")) return new Gato();\n        return null;\n    }\n}'],
  191: ['public class Persona{private String nombre;private int edad;public static class Builder{private Persona p=new Persona();public Builder nombre(String n){p.nombre=n;return this;}public Persona build(){return p;}}}',
    'public class Persona {\n    private String nombre;\n    private int edad;\n    public static class Builder {\n        private Persona p = new Persona();\n        public Builder nombre(String n) {\n            p.nombre = n;\n            return this;\n        }\n        public Persona build() {\n            return p;\n        }\n    }\n}'],
  // `o` libre: vale renombrada si se usa siempre igual en todo el código.
  192: ['import java.util.*;\ninterface Observer {\n    void actualizar(String evento);\n}\nclass Sujeto {\n    private List<Observer> observadores = new ArrayList<>();\n    public void agregar(Observer obs) {\n        observadores.add(obs);\n    }\n    public void notificar(String evento) {\n        observadores.forEach(obs -> obs.actualizar(evento));\n    }\n}',
    'import java.util.*;\ninterface Observer{void actualizar(String evento);}class Sujeto{private List<Observer> observadores=new ArrayList<>();public void agregar(Observer o){observadores.add(o);}public void notificar(String evento){observadores.forEach(o->o.actualizar(evento));}}'],
  193: ['interface Estrategia{int calcular(int a,int b);}class Suma implements Estrategia{public int calcular(int a,int b){return a+b;}}class Contexto{private Estrategia estrategia;public void setEstrategia(Estrategia e){estrategia=e;}}',
    'interface Estrategia {\n    int calcular(int a, int b);\n}\nclass Suma implements Estrategia {\n    public int calcular(int a, int b) {\n        return a + b;\n    }\n}\nclass Contexto {\n    private Estrategia estrategia;\n    public void setEstrategia(Estrategia e) {\n        this.estrategia = e;\n    }\n}'],
  // `c` libre: vale renombrado si se usa siempre igual.
  194: ['interface Componente{String operar();}class Decorador implements Componente{private Componente componente;public Decorador(Componente k){componente=k;}public String operar(){return "Decorado: "+componente.operar();}}',
    'interface Componente {\n    String operar();\n}\nclass Decorador implements Componente {\n    private Componente componente;\n    public Decorador(Componente c) {\n        componente = c;\n    }\n    public String operar() {\n        return "Decorado: " + componente.operar();\n    }\n}'],
  // los comentarios son libres: otra redacción vale igual.
  195: ['// diseño: una clase por responsabilidad\nclass Usuario { }\nclass UsuarioRepositorio { }\nclass UsuarioValidator { }',
    'class Usuario{}\nclass UsuarioRepositorio{}\nclass UsuarioValidator{}'],
  196: ['// jerarquía abierta a extensión\nabstract class Forma {\n    abstract double area();\n}\nclass Circulo extends Forma {\n    double radio;\n    public double area() {\n        return Math.PI * radio * radio;\n    }\n}',
    'abstract class Forma{abstract double area();}class Circulo extends Forma{double radio;double area(){return Math.PI*radio*radio;}}'],
  197: ['// subtipos sustituibles\nclass Ave {\n    void volar() { }\n}\n// pinguino y arreglo aparte',
    'class Ave{void volar(){}}'],
  // el orden de las dos interfaces no es concepto.
  198: ['// interfaces chicas\ninterface Escaneable {\n    void escanear();\n}\ninterface Imprimible {\n    void imprimir();\n}',
    'interface Imprimible{void imprimir();}interface Escaneable{void escanear();}'],
  199: ['// abstracciones, no concreciones\ninterface Repositorio {\n    void guardar();\n}\nclass Servicio {\n    private Repositorio repo;\n    public Servicio(Repositorio r) {\n        repo = r;\n    }\n}',
    'interface Repositorio{void guardar();}class Servicio{private Repositorio repo;public Servicio(Repositorio r){repo=r;}}'],
};

describe('c-18 lote 14: variantes válidas aceptadas', () => {
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
  // constructor público rompe el patrón (cualquiera crea instancias).
  189: ['public class Singleton {\n    private static Singleton instancia;\n    public Singleton() {}\n    public static Singleton getInstancia() {\n        if (instancia == null) {\n            instancia = new Singleton();\n        }\n        return instancia;\n    }\n}',
    'public class Singleton {\n    private static Singleton instancia;\n    private Singleton() {}\n    public static Singleton getInstancia() {\n        return new Singleton();\n    }\n}'],
  // == compara referencias: con textos se usa equals.
  190: ['public class AnimalFactory {\n    public static Animal crear(String tipo) {\n        if (tipo == "perro") return new Perro();\n        if (tipo == "gato") return new Gato();\n        return null;\n    }\n}',
    'public class AnimalFactory {\n    public static Animal crear(String tipo) {\n        if (tipo.equals("perro")) return new Perro();\n        if (tipo.equals("gato")) return new Gato();\n    }\n}'],
  191: ['public class Persona {\n    private String nombre;\n    private int edad;\n    public static class Builder {\n        private Persona p = new Persona();\n        public Builder nombre(String n) {\n            p.nombre = n;\n            return p;\n        }\n        public Persona build() {\n            return p;\n        }\n    }\n}',
    'public class Persona {\n    private String nombre;\n    private int edad;\n    public static class Builder {\n        private Persona p = new Persona();\n        public Builder nombre(String n) {\n            p.nombre = n;\n            return this;\n        }\n        public Persona build() {\n            return new Persona();\n        }\n    }\n}'],
  // bucle clásico en vez de forEach: otra construcción.
  192: ['import java.util.*;\ninterface Observer {\n    void actualizar(String evento);\n}\nclass Sujeto {\n    private List<Observer> observadores = new ArrayList<>();\n    public void agregar(Observer o) {\n        observadores.add(o);\n    }\n    public void notificar(String evento) {\n        for (Observer o : observadores) {\n            o.actualizar(evento);\n        }\n    }\n}',
    'import java.util.*;\ninterface Observer {\n    void actualizar(String evento);\n}\nclass Sujeto {\n    public void agregar(Observer o) {\n        observadores.add(o);\n    }\n    public void notificar(String evento) {\n        observadores.forEach(o -> o.actualizar(evento));\n    }\n}'],
  193: ['interface Estrategia {\n    int calcular(int a, int b);\n}\nclass Suma implements Estrategia {\n    public int calcular(int a, int b) {\n        return a - b;\n    }\n}\nclass Contexto {\n    private Estrategia estrategia;\n    public void setEstrategia(Estrategia e) {\n        estrategia = e;\n    }\n}',
    'interface Estrategia {\n    int calcular(int a, int b);\n}\nclass Suma implements Estrategia {\n    public int calcular(int a, int b) {\n        return a + b;\n    }\n}\nclass Contexto {\n    private Estrategia estrategia;\n    public void setEstrategia(Estrategia e) {\n        e = estrategia;\n    }\n}'],
  // sin el espacio, el texto es otro.
  194: ['interface Componente {\n    String operar();\n}\nclass Decorador implements Componente {\n    private Componente componente;\n    public Decorador(Componente c) {\n        componente = c;\n    }\n    public String operar() {\n        return "Decorado:" + componente.operar();\n    }\n}',
    'interface Componente {\n    String operar();\n}\nclass Decorador implements Componente {\n    private Componente componente;\n    public Decorador(Componente x) {\n        componente = c;\n    }\n    public String operar() {\n        return "Decorado: " + componente.operar();\n    }\n}'],
  195: ['class Usuario { }\nclass UsuarioRepositorio { }', 'interface Usuario { }\nclass UsuarioRepositorio { }\nclass UsuarioValidator { }'],
  196: ['abstract class Forma {\n    abstract double area();\n}\nclass Circulo extends Forma {\n    double radio;\n    double area() {\n        return Math.PI * radio;\n    }\n}',
    'abstract class Forma {\n    abstract double area();\n}\nclass Cuadrado extends Forma {\n    double lado;\n    double area() {\n        return lado * lado;\n    }\n}'],
  197: ['class Pato {\n    void volar() { }\n}', 'class Ave {\n    void volar();\n}'],
  198: ['interface Todo {\n    void imprimir();\n    void escanear();\n}', 'interface Imprimible {\n    void imprimir();\n}'],
  199: ['interface Repositorio {\n    void guardar();\n}\nclass Servicio {\n    private Repositorio repo;\n    public Servicio(Repositorio r) {\n        r = repo;\n    }\n}',
    'class Servicio {\n    private Repositorio repo;\n    public Servicio(Repositorio r) {\n        repo = r;\n    }\n}'],
};

describe('c-18 lote 14: trampas rechazadas', () => {
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
