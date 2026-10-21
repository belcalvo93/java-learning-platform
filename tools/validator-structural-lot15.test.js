'use strict';
// C-18 validator-structural, lote 15 (ids 200-208: pruebas y mocks).
// Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Las pruebas solo "pasan" ejecutándose (C-05/C-06); acá se valida
// la estructura: anotaciones, aserciones, stubbing y verificación.
// Id 201: visibilidad de paquete (sin modificador) es concepto.
// Id 205: vale el nombre de la solución (testFalla), ver nota.
// Id 208: la solución SON comentarios ("solo comentarios" dice la
// consigna): se verifican 4 ideas (JaCoCo, 80 %, dimensiones,
// comando mvn) en vez del texto exacto; un pegado sin ideas se
// rechaza. Excepción documentada a "comentario nunca aprueba".

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
// Id 205 trae comentarios en la solución (se quitan para el espaciado);
// id 208 ES comentarios (no se tocan: las ideas viven ahí).
const oneLine = (s) => s.replace(/\s+/g, ' ').trim();
const oneLineNoComments = (s) => s.replace(/\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ').trim();

const IDS = [200, 201, 202, 203, 204, 205, 206, 207, 208];

describe('c-18 lote 15: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  200: ['@Test void testSuma(){int resultado=2+2;assertEquals(4,resultado);}',
    '@Test\nvoid testSuma( )\n{\n    int resultado = 2 + 2;\n    assertEquals( 4, resultado );\n}'],
  201: ['@BeforeEach void setUp(){}', '@BeforeEach\nvoid setUp() {\n    // preparo datos\n}'],
  202: ['@Test void testExcepcion(){assertThrows(IllegalArgumentException.class,()->{throw new IllegalArgumentException();});}',
    '@Test\nvoid testExcepcion() {\n    assertThrows(IllegalArgumentException.class, () -> {\n        throw new IllegalArgumentException();\n    });\n}'],
  203: ['Repositorio mockRepo=mock(Repositorio.class);when(mockRepo.obtener()).thenReturn("dato");',
    'final Repositorio mockRepo = mock(Repositorio.class);\nwhen(mockRepo.obtener()).thenReturn("dato");'],
  204: ['Repositorio mockRepo=mock(Repositorio.class);mockRepo.guardar();verify(mockRepo).guardar();',
    'final Repositorio mockRepo = mock(Repositorio.class);\nmockRepo.guardar();\nverify(mockRepo).guardar();'],
  // redacción propia de las fases: las ideas cuentan, no el texto.
  205: ['// fase roja\n@Test void testFalla() { assertEquals(5, suma(2,2)); }\n// fase verde\nint suma(int a, int b) { return a + b; }\n// fase refactor',
    '@Test void testFalla(){assertEquals(5,suma(2,2));}int suma(int a,int b){return a+b;}'],
  206: ['String texto="Hola";assertThat(texto).isNotNull().startsWith("H").hasSize(4);',
    'final String texto = "Hola";\nassertThat(texto).isNotNull().startsWith("H").hasSize(4);'],
  207: ['@ParameterizedTest @ValueSource(ints={1,2,3}) void testMultiple(int numero){assertTrue(numero>0);}',
    '@ParameterizedTest\n@ValueSource(ints = {1, 2, 3})\nvoid testMultiple(int numero) {\n    assertTrue(numero > 0);\n}'],
  // 208: mismas ideas con otra redacción y en una línea.
  208: ['// cobertura con jacoco, objetivo 80 por ciento en lineas, ramas y metodos: mvn test jacoco:report',
    '// Usa herramientas como JaCoCo // Objetivo: >80% de cobertura // Cubre: líneas, ramas, métodos // mvn test jacoco:report'],
};

describe('c-18 lote 15: variantes válidas aceptadas', () => {
  for (const id of IDS) {
    for (const [n, code] of VALID[id].entries()) {
      it(`id ${id}: variante válida ${n + 1}`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, true, `id ${id} var ${n + 1} rechazado: ${JSON.stringify(r.errors)}`);
      });
    }
    it(`id ${id}: en una línea (espacios libres)`, () => {
      const r = check(id, id === 208 ? oneLine(solutionOf(id)) : oneLineNoComments(solutionOf(id)));
      assert.strictEqual(r.isValid, true, `id ${id} una-línea rechazado: ${JSON.stringify(r.errors)}`);
    });
    it(`id ${id}: con código extra válido`, () => {
      const r = check(id, `${solutionOf(id)}\nint aparte${id} = ${id};`);
      assert.strictEqual(r.isValid, true, `id ${id} extra-código rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const INVALID = {
  // el esperado va primero en assertEquals (convención JUnit).
  200: ['@Test\nvoid testSuma() {\n    int resultado = 2 + 2;\n    assertEquals(resultado, 4);\n}',
    '@Test\nvoid testSuma() {\n    int resultado = 2 + 3;\n    assertEquals(4, resultado);\n}'],
  // con modificador ya no es visibilidad de paquete.
  201: ['@BeforeEach\npublic void setUp() {\n}', '@Test\nvoid setUp() {\n}'],
  202: ['@Test\nvoid testExcepcion() {\n    assertEquals(1, 1);\n}',
    '@Test\nvoid testExcepcion() {\n    assertThrows(IllegalArgumentException.class, () -> throw new IllegalArgumentException());\n}'],
  203: ['Repositorio mockRepo = mock(Repositorio.class);\nwhen(mockRepo.obtener()).thenReturn("otro");',
    'Repositorio mockRepo = mock(Repositorio.class);\nwhen(mockRepo.guardar()).thenReturn("dato");'],
  // verificar antes de llamar no verifica nada.
  204: ['Repositorio mockRepo = mock(Repositorio.class);\nverify(mockRepo).guardar();\nmockRepo.guardar();',
    'Repositorio mockRepo = mock(Repositorio.class);\nverify(mockRepo).guardar();'],
  // en Red el test debe fallar: con 4 pasaría de entrada.
  205: ['@Test void testFalla() { assertEquals(4, suma(2,2)); }\nint suma(int a, int b) { return a + b; }',
    '@Test void testFalla() { assertEquals(5, suma(2,2)); }\nint suma(int a, int b) { return a - b; }'],
  206: ['String texto = "Hola";\nassertThat(texto).isNotNull().startsWith("H").hasSize(5);',
    'String texto = "Hola";\nassertThat(texto).startsWith("H").hasSize(4);'],
  207: ['@ParameterizedTest\n@ValueSource(ints = {1, 2, 4})\nvoid testMultiple(int numero) {\n    assertTrue(numero > 0);\n}',
    '@ParameterizedTest\n@ValueSource(ints = {1, 2, 3})\nvoid testMultiple(int numero) {\n    assertFalse(numero > 0);\n}'],
  // pegado de comentarios sin las ideas: se rechaza.
  208: ['// un comentario cualquiera\n// otro comentario', '// JaCoCo mide cobertura\n// pero sin objetivo ni comando'],
};

describe('c-18 lote 15: trampas rechazadas', () => {
  for (const id of IDS) {
    for (const [n, code] of INVALID[id].entries()) {
      it(`id ${id}: trampa ${n + 1} rechazada`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, false, `id ${id} trampa ${n + 1} aceptada como válida`);
      });
    }
    // Id 208 ES comentarios (así lo pide su consigna): la trampa de
    // comentario no aplica; la cubren las trampas de ideas de arriba.
    if (id !== 208) {
      it(`id ${id}: respuesta en comentario nunca aprueba`, () => {
        const r = check(id, `// ${solutionOf(id).replace(/\n/g, '\n// ')}`);
        assert.strictEqual(r.isValid, false, `id ${id}: comentario-con-respuesta aceptado`);
      });
    }
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
