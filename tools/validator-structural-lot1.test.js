'use strict';
// C-18 validator-structural, lote 1 (ids 1-8): tests RED del validador
// estructural por tokens. Runner: node --test tools/*.test.js (cero deps,
// patrón vm de C-10). NO toca validator.js ni data.js.
//
// Reglas del lote 1 (diseño aprobado por Belén):
// - comentarios (// y /* */) se ignoran: la respuesta pegada en un
//   comentario NUNCA aprueba.
// - textos libres salvo API/consigna fija; números y operadores estrictos.
// - nombres fijos SOLO si la consigna los nombra (Ejemplo, main, edad, P,
//   a, b, Hola, e); el resto libre.
// - mensajes en español, conceptuales, sin la respuesta.

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

// Las 8 canónicas de data.js siempre tienen que validar.
describe('c-18 lote 1: canónicas de data.js aceptadas', () => {
  for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

// Variantes válidas: otra forma de hacer lo pedido (textos, espacios,
// nombres libres, código extra). Hoy FALLAN (reglas por presencia/texto).
const VALID = {
  1: [
    'public class Ejemplo {\n    public static void main(String... args) {\n        System.out.println("hola mama");\n        System.out.println("otra línea");\n    }\n}',
    'public class Ejemplo {\n    public static void main(String[] args) {\n        String saludo = "Hola";\n        System.out.println(saludo);\n    }\n}',
    'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println("Ho" + "la");\n    }\n}',
  ],
  2: [
    'if (edad >= 18) {\n    System.out.println("Grande");\n} else {\n    System.out.println("Chico");\n}',
    'if  (  edad  >=  18  )  {\n    System.out.println("Mayor");\n    System.out.println("detalle");\n} else {\n    System.out.println("Menor");\n}',
    'public class C {\n    public static void main(String[] args) {\n        int edad = 20;\n        if (edad >= 18) {\n            System.out.println("Mayor");\n        } else {\n            System.out.println("Menor");\n        }\n    }\n}',
    // C-18 ajuste 2: `18 <= edad` dice lo mismo que `edad >= 18`.
    'if (18 <= edad) {\n    System.out.println("Grande");\n} else {\n    System.out.println("Chico");\n}',
  ],
  3: [
    'class P {\n    void b() {\n        System.out.println("x");\n    }\n\n    void a() {\n        System.out.println("x");\n    }\n}',
    'class P {\n    void a() {\n        System.out.println("uno");\n        System.out.println("extra");\n    }\n\n    void b() {\n        System.out.println("dos");\n    }\n}',
    // C-18 ajuste 3: la línea vacía entre métodos es formato, no concepto.
    'class P {\n    void a() {\n        System.out.println("uno");\n    }\n    void b() {\n        System.out.println("dos");\n    }\n}',
    // C-18 nombre libre (decisión Belén 2026-10-04): P es la única clase y
    // nadie la reutiliza → vale cualquier nombre válido (métodos a/b fijos).
    'class Q {\n    void a() {\n        System.out.println("a");\n    }\n\n    void b() {\n        System.out.println("b");\n    }\n}',
    'public class Otra {\n    void a() {\n        System.out.println("uno");\n    }\n\n    void b() {\n        System.out.println("dos");\n    }\n}',
  ],
  4: [
    'for (int k = 0; k < 5; k++) {\n    if (k % 2 == 0) {\n        System.out.println(k);\n    }\n}',
    'for  (  int  i  =  0  ;  i  <  5  ;  i++  )  {\n    if  (  i  %  2  ==  0  )  {\n        System.out.println(i);\n    }\n}\nSystem.out.println("listo");',
    'for (int i = 0; i < 5; ++i) {\n    if (i % 2 == 0) {\n        System.out.println(i);\n    }\n}',
  ],
  5: [
    'public class Hola {\n    public static void main(String... args) {\n        System.out.println("hola mama");\n    }\n}',
    'public class Hola {\n    public static void main(String[] args) {\n        String s = "Hola";\n        System.out.println(s + "!");\n    }\n}',
    'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n        System.out.println("chau");\n    }\n}',
    // C-18 nombre libre (decisión Belén 2026-10-04): Hola es la única clase
    // y ninguna lección/ejercicio la reutiliza → vale cualquier nombre
    // válido en clase pública con main (la lección 2 enseña con Saludo).
    'public class HolaMundo {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n    }\n}',
    'public class Programa {\n    public static void main(String[] args) {\n        System.out.println("hola mama");\n    }\n}',
    'public class Saludo {\n    public static void main(String[] args) {\n        String s = "Hola";\n        System.out.println(s + "!");\n    }\n}',
  ],
  6: [
    'public class M {\n    public static void main(String[] args) {\n        System.out.println("Primera");\n        System.out.println("Segunda");\n    }\n}',
    'String a = "uno";\nSystem.out.println(a);\nSystem.out.println("dos");',
    'System.out.print("a\\n");\nSystem.out.print("b\\n");',
  ],
  7: [
    'System.out.print("Ey ");\nSystem.out.println("vos");',
    'System.out.print ( "Hola " ) ;\nSystem.out.println ( "Mundo" ) ;',
  ],
  8: [
    'int e = 25;\nSystem.out.printf("valor=%d!!", e);',
    'public class E {\n    public static void main(String[] args) {\n        int e = 25;\n        System.out.printf("Edad: %d%n", e);\n    }\n}',
  ],
};

describe('c-18 lote 1: variantes válidas aceptadas', () => {
  for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
    for (const [n, code] of VALID[id].entries()) {
      it(`id ${id}: variante válida ${n + 1}`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, true, `id ${id} var ${n + 1} rechazado: ${JSON.stringify(r.errors)}`);
      });
    }
  }
});

// Trampas: tienen que ser rechazadas. Varias ya lo son (siguen en verde);
// las que abusan de comentarios o de la rigidez vieja fallan en RED.
const TRAPS = {
  // [nombre, código]
  1: [
    ['respuesta en comentario', '// public class Ejemplo {\n// public static void main(String[] args) {\n// System.out.println("Hola");\n// }\n// }'],
    ['vacío', ''],
    ['otra clase', 'public class OtroNombre {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}'],
    ['clase vacía', 'public class Ejemplo {\n}'],
    ['sin main', 'public class Ejemplo {\n    System.out.println("Hola");\n}'],
    ['sin comillas', 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println(Hola);\n    }\n}'],
    ['comilla sin cerrar', 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println("Hola);\n    }\n}'],
    ['variable no declarada', 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println(saludo);\n    }\n}'],
    ['println vacío', 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println();\n    }\n}'],
    ['sin punto y coma', 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println("Hola")\n    }\n}'],
    ['todo en una línea', 'public class Ejemplo { public static void main(String[] args) { System.out.println("Hola"); } }'],
  ],
  2: [
    ['respuesta en comentario', '// if (edad >= 18) {\n// System.out.println("Mayor");\n// } else {\n// System.out.println("Menor");\n// }'],
    ['vacío', ''],
    ['operador > en vez de >=', 'if (edad > 18) {\n    System.out.println("Mayor");\n} else {\n    System.out.println("Menor");\n}'],
    // C-18 ajuste 2 (triangulación): `18 < edad` NO es lo mismo que
    // `edad >= 18` (concepto distinto: menor estricto invertido).
    ['18 < edad (menor estricto invertido)', 'if (18 < edad) {\n    System.out.println("Mayor");\n} else {\n    System.out.println("Menor");\n}'],
    ['sin else', 'if (edad >= 18) {\n    System.out.println("Mayor");\n}'],
    ['un solo println', 'if (edad >= 18) {\n    System.out.println("Mayor");\n} else {\n}'],
    ['sin comillas', 'if (edad >= 18) {\n    System.out.println(Mayor);\n} else {\n    System.out.println(Menor);\n}'],
    ['llave en otra línea', 'if (edad >= 18)\n{\n    System.out.println("Mayor");\n} else {\n    System.out.println("Menor");\n}'],
    ['todo en una línea', 'if (edad >= 18) { System.out.println("Mayor"); } else { System.out.println("Menor"); }'],
  ],
  3: [
    ['respuesta en comentario', '// class P {\n// void a() {\n// System.out.println("a");\n// }\n// void b() {\n// System.out.println("b");\n// }\n// }'],
    ['vacío', ''],
    // C-18 nombre libre: 'otra clase' (Q) ahora es válida → vive en VALID[3].
    ['falta b', 'class P {\n    void a() {\n        System.out.println("a");\n    }\n}'],
    // C-18 ajuste 3: la línea vacía entre métodos es formato (ya no se
    // rechaza); el caso vive ahora en variantes válidas.
    ['todo en una línea', 'class P { void a() { System.out.println("a"); } void b() { System.out.println("b"); } }'],
    ['mal indentado', 'class P {\n    void a() {\n   System.out.println("a");\n    }\n\n    void b() {\n        System.out.println("b");\n    }\n}'],
    ['sin punto y coma', 'class P {\n    void a() {\n        System.out.println("a")\n    }\n\n    void b() {\n        System.out.println("b");\n    }\n}'],
    ['variable no declarada', 'class P {\n    void a() {\n        System.out.println(texto);\n    }\n\n    void b() {\n        System.out.println("b");\n    }\n}'],
  ],
  4: [
    ['respuesta en comentario', '// for (int i = 0; i < 5; i++) {\n// if (i % 2 == 0) {\n// System.out.println(i);\n// }\n// }'],
    ['vacío', ''],
    ['print en vez de println', 'for (int i = 0; i < 5; i++) {\n    if (i % 2 == 0) {\n        System.out.print(i);\n    }\n}'],
    ['límite 10 en vez de 5', 'for (int i = 0; i < 10; i++) {\n    if (i % 2 == 0) {\n        System.out.println(i);\n    }\n}'],
    ['condición par distinta', 'for (int i = 0; i < 5; i++) {\n    if (i % 2 == 1) {\n        System.out.println(i);\n    }\n}'],
    ['otra variable no declarada', 'for (int i = 0; i < 5; i++) {\n    if (j % 2 == 0) {\n        System.out.println(j);\n    }\n}'],
    ['imprime texto en vez del contador', 'for (int i = 0; i < 5; i++) {\n    if (i % 2 == 0) {\n        System.out.println("i");\n    }\n}'],
    ['sin punto y coma', 'for (int i = 0; i < 5; i++) {\n    if (i % 2 == 0) {\n        System.out.println(i)\n    }\n}'],
  ],
  5: [
    ['respuesta en comentario', '// public class Hola {\n// public static void main(String[] args) {\n// System.out.println("Hola, Java!");\n// }\n// }'],
    ['vacío', ''],
    // C-18 nombre libre: 'otra clase' (Adios) ahora es válida → vive en
    // VALID[5] (HolaMundo/Programa/Saludo).
    ['sin main', 'System.out.println("Hola, Java!");'],
    // ANTES (lote 1): 'print en vez de println' y 'printf en vez de
    // println' eran trampas rechazadas. DESPUÉS (ajuste id5-print,
    // decisión Belén 2026-10-04): print/printf con texto libre son
    // VÁLIDOS en id 5 → salen de TRAPS y viven como aceptaciones en el
    // describe 'c-18 ajuste id5'. Se reemplazan por trampas que sí violan
    // la regla nueva (sin impresión / impresión vacía).
    ['sin impresión (main vacío)', 'public class Hola {\n    public static void main(String[] args) {\n    }\n}'],
    ['print vacío', 'public class Hola {\n    public static void main(String[] args) {\n        System.out.print();\n    }\n}'],
    ['sin comillas', 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println(Hola);\n    }\n}'],
    ['comilla sin cerrar', 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola);\n    }\n}'],
    ['sin punto y coma', 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola")\n    }\n}'],
    ['println vacío', 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println();\n    }\n}'],
  ],
  6: [
    ['respuesta en comentario', '// System.out.println("Línea 1");\n// System.out.println("Línea 2");'],
    ['vacío', ''],
    ['un solo println', 'System.out.println("Línea 1");'],
    ['dos print sin salto', 'System.out.print("a");\nSystem.out.print("b");'],
    ['println vacío', 'System.out.println();\nSystem.out.println();'],
    ['sin comillas', 'System.out.println(texto);\nSystem.out.println("b");'],
    ['sin punto y coma', 'System.out.println("a")\nSystem.out.println("b");'],
  ],
  7: [
    ['respuesta en comentario', '// System.out.print("Hola ");\n// System.out.println("Mundo");'],
    ['vacío', ''],
    ['dos println sin print', 'System.out.println("Hola ");\nSystem.out.println("Mundo");'],
    ['dos print sin println', 'System.out.print("Hola ");\nSystem.out.print("Mundo");'],
    ['orden invertido', 'System.out.println("Mundo");\nSystem.out.print("Hola ");'],
    ['sin punto y coma', 'System.out.print("Hola ")\nSystem.out.println("Mundo");'],
  ],
  8: [
    ['respuesta en comentario', '// System.out.printf("Edad: %d", e);'],
    ['vacío', ''],
    ['println en vez de printf', 'System.out.println("Edad: " + e);'],
    ['%s en vez de %d', 'System.out.printf("Edad: %s", e);'],
    ['sin variable', 'System.out.printf("Edad: %d");'],
    ['número en vez de la variable', 'System.out.printf("Edad: %d", 25);'],
    ['otra variable no declarada', 'System.out.printf("Edad: %d", x);'],
    ['comilla sin cerrar', 'System.out.printf("Edad: %d, e);'],
    ['sin punto y coma', 'System.out.printf("Edad: %d", e)'],
  ],
};

describe('c-18 lote 1: trampas rechazadas', () => {
  for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
    for (const [name, code] of TRAPS[id]) {
      it(`id ${id}: trampa rechazada (${name})`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, false, `id ${id} trampa aceptada (${name})`);
      });
    }
  }
});

// Los mensajes no muestran la respuesta: ningún error contiene literales
// de las soluciones de data.js.
describe('c-18 lote 1: mensajes conceptuales sin respuesta', () => {
  it('ningún mensaje filtra literales de data.js (ids 1-8)', () => {
    const leaks = ['Hola, Java!', 'Línea 1', 'Línea 2', 'Mayor', 'Menor', '"Hola "', 'Mundo', 'Edad: '];
    for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
      for (const [, code] of TRAPS[id]) {
        const r = check(id, code);
        for (const m of r.errors) {
          for (const leak of leaks) {
            assert.ok(!m.includes(leak), `id ${id}: el mensaje filtra la respuesta (${leak}): ${m}`);
          }
        }
      }
    }
  });

  it('id 5: el mensaje no trae el código exacto', () => {
    const r = check(5, '');
    assert.ok(r.errors.length > 0);
    for (const m of r.errors) {
      assert.ok(!m.includes('System.out.println("Hola'), `filtra código: ${m}`);
    }
  });
});

// C-18 ajuste 3: el formato no es concepto. Solo la lección 1 conserva
// indentación estructural (+4 por bloque); en los ids 5-8 (lección 2) el
// espaciado no limita el veredicto.
describe('c-18 ajuste 3: el formato no es concepto', () => {
  it('ids 5-8: indentación distinta (2 espacios) se acepta', () => {
    const cases = {
      5: 'public class Hola {\n  public static void main(String[] args) {\n    System.out.println("Hola");\n  }\n}',
      6: '  System.out.println("a");\n  System.out.println("b");',
      7: '  System.out.print("Hola ");\n  System.out.println("Mundo");',
      8: '  int e = 25;\n  System.out.printf("Edad: %d", e);',
    };
    for (const [id, code] of Object.entries(cases)) {
      const r = check(Number(id), code);
      assert.strictEqual(r.isValid, true, `id ${id} rechazado por formato: ${JSON.stringify(r.errors)}`);
    }
  });

  it('id 1: indentación de 2 espacios se sigue rechazando (lección 1: +4 por bloque)', () => {
    const r = check(1, 'public class Ejemplo {\n  public static void main(String[] args) {\n    System.out.println("Hola");\n  }\n}');
    assert.strictEqual(r.isValid, false, 'la lección 1 exige +4 por bloque');
    assert.ok(r.errors.some((m) => /indentación/.test(m)), `sin mensaje de indentación: ${JSON.stringify(r.errors)}`);
  });

  it('id 4: código pegado al margen se rechaza (lección 1: +4 por bloque)', () => {
    const r = check(4, 'for(int i=0;i<5;i++){\nif(i%2==0){\nSystem.out.println(i);\n}\n}');
    assert.strictEqual(r.isValid, false, 'la lección 1 exige +4 por bloque');
    assert.ok(r.errors.some((m) => /indentación/.test(m)), `sin mensaje de indentación: ${JSON.stringify(r.errors)}`);
  });
});

// C-18 ajuste 5: cada nombre fijo del lote tiene su cita de consigna (ver
// informe en la respuesta). Estos tests fijan que otro nombre —aunque esté
// declarado— se rechaza donde la consigna nombra uno.
describe('c-18 ajuste 5: nombres fijos por consigna', () => {
  it('id 1: main con otro nombre se rechaza', () => {
    const r = check(1, 'public class Ejemplo {\n    public static void principal(String[] args) {\n        System.out.println("Hola");\n    }\n}');
    assert.strictEqual(r.isValid, false);
  });

  it('id 2: otra variable en vez de edad se rechaza', () => {
    const r = check(2, 'if (age >= 18) {\n    System.out.println("Mayor");\n} else {\n    System.out.println("Menor");\n}');
    assert.strictEqual(r.isValid, false);
  });

  it('id 3: métodos con otros nombres se rechazan', () => {
    const r = check(3, 'class P {\n    void m1() {\n        System.out.println("a");\n    }\n\n    void m2() {\n        System.out.println("b");\n    }\n}');
    assert.strictEqual(r.isValid, false);
  });

  it('id 8: otra variable declarada en vez de e se rechaza', () => {
    const r = check(8, 'int f = 25;\nSystem.out.printf("Edad: %d", f);');
    assert.strictEqual(r.isValid, false);
  });
});

// C-18 nombre libre de clase (decisión Belén 2026-10-04, contrato): el
// nombre es libre cuando es la única clase y nadie la reutiliza. Id 5:
// Hola → libre (la lección 2 enseña con Saludo/Formatos, no con Hola),
// pero la clase tiene que ser pública (la consigna dice "pública") y con
// main. Id 3: P → libre (sin public en la consigna ni en la canónica).
// Id 1: Ejemplo → FIJO (la lección 1 enseña con Ejemplo). Los mensajes
// nunca nombran la clase correcta.
describe('c-18 nombre libre de clase (ids 3 y 5; id 1 fijo)', () => {
  it('id 5: acepta HolaMundo, Programa y Saludo con println y main', () => {
    for (const name of ['HolaMundo', 'Programa', 'Saludo']) {
      const code = `public class ${name} {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n    }\n}`;
      const r = check(5, code);
      assert.strictEqual(r.isValid, true, `${name} rechazado: ${JSON.stringify(r.errors)}`);
    }
  });

  it('id 5: rechaza clase no pública aunque tenga main y println', () => {
    const r = check(5, 'class HolaMundo {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n    }\n}');
    assert.strictEqual(r.isValid, false, 'clase no pública aceptada');
  });

  it('id 5: rechaza nombre inválido como 1Hola', () => {
    for (const bad of [
      'public class 1Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n    }\n}',
      'public class Mi-Clase {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n    }\n}',
    ]) {
      const r = check(5, bad);
      assert.strictEqual(r.isValid, false, `nombre inválido aceptado: ${bad.split('\n')[0]}`);
    }
  });

  it('id 5: rechaza clase pública sin main', () => {
    const r = check(5, 'public class Programa {\n    void arranque() {\n        System.out.println("Hola");\n    }\n}');
    assert.strictEqual(r.isValid, false, 'clase sin main aceptada');
  });

  it('id 3: acepta otro nombre de clase (Q) con métodos a/b', () => {
    const r = check(3, 'class Q {\n    void a() {\n        System.out.println("a");\n    }\n\n    void b() {\n        System.out.println("b");\n    }\n}');
    assert.strictEqual(r.isValid, true, `Q rechazado: ${JSON.stringify(r.errors)}`);
  });

  it('id 3: rechaza nombre de clase inválido como 1Q', () => {
    const r = check(3, 'class 1Q {\n    void a() {\n        System.out.println("a");\n    }\n\n    void b() {\n        System.out.println("b");\n    }\n}');
    assert.strictEqual(r.isValid, false, 'nombre inválido aceptado');
  });

  it('id 1: otro nombre se sigue rechazando (la lección 1 enseña con Ejemplo)', () => {
    const r = check(1, 'public class OtroNombre {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}');
    assert.strictEqual(r.isValid, false, 'otro nombre aceptado en id 1 (Ejemplo es fijo)');
  });

  it('ids 1, 3 y 5: ningún mensaje nombra la clase correcta', () => {
    const cases = [
      [1, ''],
      [3, ''],
      [5, ''],
      [1, 'public class OtroNombre {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}'],
      [3, 'class Q {\n    void a() {\n        return;\n    }\n\n    void b() {\n        System.out.println("b");\n    }\n}'],
      [5, 'class HolaMundo {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}'],
      [5, 'public class 1Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}'],
    ];
    for (const [id, code] of cases) {
      const r = check(Number(id), code);
      for (const m of r.errors) {
        assert.ok(!m.includes('Ejemplo'), `id ${id}: filtra Ejemplo: ${m}`);
        assert.ok(!m.includes('clase Hola'), `id ${id}: filtra la clase: ${m}`);
        assert.ok(!m.includes('clase P'), `id ${id}: filtra la clase: ${m}`);
      }
    }
  });
});

// C-18 ajuste id5-print (decisión Belén 2026-10-04): el concepto del id 5 es
// mostrar texto; valen print, println y printf con texto libre (el resultado
// visible es el mismo). La distinción print/println de los ids 6-7 NO cambia.
describe('c-18 ajuste id5: print/println/printf aceptados', () => {
  it('id 5: acepta System.out.print con texto libre', () => {
    const r = check(5, 'public class Hola {\n    public static void main(String[] args) {\n        System.out.print("Hola, Java!");\n    }\n}');
    assert.strictEqual(r.isValid, true, `print rechazado: ${JSON.stringify(r.errors)}`);
  });

  it('id 5: acepta System.out.printf con texto libre', () => {
    const r = check(5, 'public class Hola {\n    public static void main(String[] args) {\n        System.out.printf("Hola, Java!");\n    }\n}');
    assert.strictEqual(r.isValid, true, `printf rechazado: ${JSON.stringify(r.errors)}`);
  });

  it('id 5: acepta System.out.println con texto libre (sigue valiendo)', () => {
    const r = check(5, 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("hola mama");\n    }\n}');
    assert.strictEqual(r.isValid, true, `println rechazado: ${JSON.stringify(r.errors)}`);
  });

  it('id 6: dos print sin salto se siguen rechazando', () => {
    const r = check(6, 'System.out.print("a");\nSystem.out.print("b");');
    assert.strictEqual(r.isValid, false, 'id 6 aceptó dos print en una línea');
  });

  it('id 7: dos println se siguen rechazando', () => {
    const r = check(7, 'System.out.println("Hola ");\nSystem.out.println("Mundo");');
    assert.strictEqual(r.isValid, false, 'id 7 aceptó dos println');
  });

  it('id 7: dos print se siguen rechazando', () => {
    const r = check(7, 'System.out.print("Hola ");\nSystem.out.print("Mundo");');
    assert.strictEqual(r.isValid, false, 'id 7 aceptó dos print');
  });

  it('id 7: orden invertido se sigue rechazando', () => {
    const r = check(7, 'System.out.println("Mundo");\nSystem.out.print("Hola ");');
    assert.strictEqual(r.isValid, false, 'id 7 aceptó orden invertido');
  });
});

// C-18 ajuste mensaje-comillas (decisión Belén 2026-10-04): un nombre sin
// declarar ni entrecomillar en un println/print sugiere —solo como pista,
// sin dar la respuesta— que el texto va entre comillas dobles.
describe('c-18 ajuste mensaje: pista de comillas ante nombre no declarado', () => {
  it('id 5: println(Hola) pide comillas dobles sin dar la respuesta', () => {
    const r = check(5, 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println(Hola);\n    }\n}');
    assert.strictEqual(r.isValid, false, 'nombre sin declarar aceptado en id 5');
    assert.ok(r.errors.some((m) => /comillas dobles/.test(m)), `sin pista de comillas: ${JSON.stringify(r.errors)}`);
    for (const m of r.errors) {
      assert.ok(!m.includes('Hola, Java!'), `filtra la respuesta: ${m}`);
    }
  });

  it('id 6: println(texto) pide comillas dobles sin dar la respuesta', () => {
    const r = check(6, 'System.out.println(texto);\nSystem.out.println("b");');
    assert.strictEqual(r.isValid, false, 'nombre sin declarar aceptado en id 6');
    assert.ok(r.errors.some((m) => /comillas dobles/.test(m)), `sin pista de comillas: ${JSON.stringify(r.errors)}`);
    for (const m of r.errors) {
      assert.ok(!m.includes('Línea 1') && !m.includes('Línea 2'), `filtra la respuesta: ${m}`);
    }
  });
});
