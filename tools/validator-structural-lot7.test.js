'use strict';
// C-18 validator-structural, lote 7 (ids 85-100: clases internas,
// enums, equals/hashCode/compareTo, genéricos, record, sealed, pattern
// matching, text blocks, yield). Patrón vm de C-10. NO toca
// validator.js ni data.js.
//
// Todo fijo por consigna (incluida `s` de 98, que la consigna escribe).
// Sin nombres libres. Id 99: el bloque de texto compara por contenido
// (indentación interna libre, líneas y contenido fijos: la consigna
// pide tres líneas).

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

const IDS = [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
// Id 99: las 3 líneas internas son concepto (la consigna las fija);
// colapsarlas a una línea debe SEGUIR rechazado (trampa, abajo).
const IDS_ONELINE = IDS.filter((id) => id !== 99);

describe('c-18 lote 7: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  85: ['class Interna{void metodo(){}}', 'public class Interna {\n    public void metodo() { }\n}'],
  86: ['Runnable r = new Runnable() {\n    @Override\n    public void run() {\n        System.out.println("Hola");\n    }\n};',
    'new Runnable(){@Override public void run(){System.out.println("Hola");}};'],
  87: ['public enum Dia{LUNES,MARTES,MIERCOLES}', 'public enum Dia {\n    LUNES, MARTES, MIERCOLES\n}'],
  88: ['public enum Talla{S(1),M(2),L(3);private int numero;Talla(int numero){this.numero=numero;}}',
    'public enum Talla {\n    S(1), M(2), L(3);\n    private int numero;\n    Talla(int numero) {\n        this.numero = numero;\n    }\n}'],
  // llaves del if de una línea: opcionales.
  89: ['@Override public boolean equals(Object obj){if(obj instanceof Persona)return nombre.equals(((Persona)obj).nombre);return false;}',
    '@Override\npublic boolean equals( Object obj )\n{\n    if ( obj instanceof Persona )\n    {\n        return nombre.equals( ((Persona) obj).nombre );\n    }\n    return false;\n}'],
  90: ['@Override public int hashCode(){return nombre.hashCode();}', '@Override\npublic int hashCode() {\n    return (nombre.hashCode());\n}'],
  91: ['@Override public int compareTo(Persona otra){return Integer.compare(this.edad,otra.edad);}',
    '@Override\npublic int compareTo( Persona otra )\n{\n    return Integer.compare( this.edad, otra.edad );\n}'],
  92: ['public class Caja<T>{private T contenido;public void guardar(T item){contenido=item;}}',
    'public class Caja<T> {\n    private T contenido;\n    public void guardar(T item) {\n        this.contenido = item;\n    }\n}'],
  93: ['public static <T>void imprimir(T elemento){System.out.println(elemento);}',
    'public static <T> void imprimir(T elemento)\n{\n    System.out.println(elemento);\n}'],
  94: ['public class Comparador<T extends Comparable<T>>{public T mayor(T a,T b){return a.compareTo(b)>0?a:b;}}',
    'public class Comparador<T extends Comparable<T>> {\n    public T mayor(T a, T b) {\n        return a.compareTo(b) > 0 ? a : b;\n    }\n}'],
  95: ['public void imprimir(List<?> lista){for(Object obj:lista){System.out.println(obj);}}',
    'public void imprimir(List<?> lista) {\n    for (final Object obj : lista) {\n        System.out.println(obj);\n    }\n}'],
  96: ['public record Punto(int x,int y){}', 'public record Punto( int x, int y ) { }'],
  97: ['public sealed class Forma permits Circulo,Cuadrado{}', 'public sealed class Forma permits Circulo, Cuadrado {\n}'],
  98: ['if(obj instanceof String s){System.out.println(s.toUpperCase());}',
    'if (obj instanceof String s) System.out.println(s.toUpperCase());'],
  // indentación interna del bloque libre; contenido y líneas fijos.
  99: ['String json = """\n{ \n"nombre": "Ana"\n}\n""";',
    'String json = """\n            { \n                "nombre": "Ana" \n            } \n            """;'],
  100: ['String tipo = switch (dia) { case 1,7 -> "Fin de semana"; case 2,3,4,5,6 -> { System.out.println("Día laboral"); yield "Laboral"; } default -> "Desconocido"; };',
    'String tipo=switch(dia){case 1,7->"Fin de semana";case 2,3,4,5,6->{System.out.println("Día laboral");yield "Laboral";}default->"Desconocido";};'],
};

describe('c-18 lote 7: variantes válidas aceptadas', () => {
  for (const id of IDS) {
    for (const [n, code] of VALID[id].entries()) {
      it(`id ${id}: variante válida ${n + 1}`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, true, `id ${id} var ${n + 1} rechazado: ${JSON.stringify(r.errors)}`);
      });
    }
    if (IDS_ONELINE.includes(id)) {
      it(`id ${id}: en una línea (espacios libres)`, () => {
        const r = check(id, oneLine(solutionOf(id)));
        assert.strictEqual(r.isValid, true, `id ${id} una-línea rechazado: ${JSON.stringify(r.errors)}`);
      });
    }
    it(`id ${id}: con código extra válido`, () => {
      const r = check(id, `${solutionOf(id)}\nint aparte${id} = ${id};`);
      assert.strictEqual(r.isValid, true, `id ${id} extra-código rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const INVALID = {
  85: ['class Interna {\n    void metodo();\n}', 'class Otra {\n    void metodo() { }\n}'],
  // lambda en vez de clase anónima: otra construcción, se rechaza.
  86: ['Runnable r = () -> System.out.println("Hola");',
    'new Runnable() {\n    public void run() {\n        System.out.println("Hola");\n    }\n};'],
  // el orden de las constantes es concepto (la consigna lo fija).
  87: ['public enum Dia {\n    MARTES, LUNES, MIERCOLES\n}', 'public enum Dia {\n    LUNES, MARTES\n}'],
  88: ['public enum Talla {\n    S(2), M(2), L(3);\n    private int numero;\n    Talla(int numero) {\n        this.numero = numero;\n    }\n}',
    'public enum Talla {\n    S(1), M(2), L(3);\n    private int numero;\n    Talla(int numero) {\n        numero = numero;\n    }\n}'],
  89: ['@Override\npublic boolean equals(Object obj) {\n    if (obj instanceof Persona) {\n        return nombre == ((Persona) obj).nombre;\n    }\n    return false;\n}',
    '@Override\npublic boolean equals(Object obj) {\n    if (obj instanceof Persona) {\n        return nombre.equals(((Persona) obj).nombre);\n    }\n}'],
  90: ['@Override\npublic int hashCode() {\n    return super.hashCode();\n}',
    '@Override\npublic int hashCode() {\n    return nombre.hashCode;\n}'],
  91: ['@Override\npublic int compareTo(Persona otra) {\n    return Integer.compare(otra.edad, this.edad);\n}',
    '@Override\npublic int compareTo(Persona otra) {\n    return otra.edad - this.edad;\n}'],
  92: ['public class Caja<E> {\n    private E contenido;\n    public void guardar(E item) {\n        contenido = item;\n    }\n}',
    'public class Caja<T> {\n    private T contenido;\n    public void guardar(T item) {\n    }\n}'],
  93: ['public static void imprimir(T elemento) {\n    System.out.println(elemento);\n}',
    'public static <T> void imprimir(T elemento) {\n    System.out.println("elemento");\n}'],
  94: ['public class Comparador<T extends Comparable<T>> {\n    public T mayor(T a, T b) {\n        return a.compareTo(b) >= 0 ? a : b;\n    }\n}',
    'public class Comparador<T extends Comparable<T>> {\n    public T mayor(T a, T b) {\n        return b.compareTo(a) > 0 ? b : a;\n    }\n}'],
  95: ['public void imprimir(List<Object> lista) {\n    for (Object obj : lista) {\n        System.out.println(obj);\n    }\n}',
    'public void imprimir(List<?> lista) {\n    for (String obj : lista) {\n        System.out.println(obj);\n    }\n}'],
  96: ['public record Punto(int y, int x) { }', 'public class Punto(int x, int y) { }'],
  97: ['public sealed class Forma permits Cuadrado, Circulo { }', 'public final class Forma permits Circulo, Cuadrado { }'],
  // cast clásico en vez de pattern matching: otra construcción.
  98: ['if (obj instanceof String) {\n    System.out.println(((String) obj).toUpperCase());\n}',
    'if (obj instanceof String s) {\n    System.out.println(s.toLowerCase());\n}'],
  // el bloque pide tres líneas: en una sola no vale.
  99: ['String json = """{ "nombre": "Ana" }""";', 'String json = "{ \\"nombre\\": \\"Ana\\" }";'],
  100: ['String tipo = switch (dia) {\n    case 1, 7 -> "Fin de semana";\n    case 2, 3, 4, 5, 6 -> {\n        System.out.println("Día laboral");\n        return "Laboral";\n    }\n    default -> "Desconocido";\n};',
    'String tipo = switch (dia) {\n    case 1, 7 -> "Fin de semana";\n    case 2, 3, 4, 5, 6 -> "Laboral";\n    default -> "Desconocido";\n};'],
};

describe('c-18 lote 7: trampas rechazadas', () => {
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
