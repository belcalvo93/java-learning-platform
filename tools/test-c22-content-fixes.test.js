'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const audit = require('./audit-validator.js');
const { exercisesData } = require(path.join(rootDir, 'data.js'));

const VClass = audit.loadValidatorClass(rootDir, exercisesData);
const validator = new VClass();

describe('C-22 TDD Content Fixes from Real Execution Audit Suite', () => {

  test('Invariante estricto: 208 ejercicios y 52 lecciones', () => {
    assert.equal(exercisesData.length, 208);
  });

  describe('Ejercicio 40: Locale.US en Scanner Leer Double', () => {
    const ex40 = exercisesData.find((e) => e.id === 40);

    test('starterCode contiene import de Locale y Scanner y línea // Escribe tu código aquí', () => {
      assert.ok(ex40.starterCode.includes('import java.util.Locale;'), 'Starter debe importar Locale');
      assert.ok(ex40.starterCode.includes('import java.util.Scanner;'), 'Starter debe importar Scanner');
      assert.ok(ex40.starterCode.includes('// Escribe tu código aquí'), 'Starter debe tener comentario // Escribe tu código aquí');
    });

    test('solución canónica usa .useLocale(Locale.US)', () => {
      assert.ok(ex40.solution.includes('useLocale(Locale.US)'), 'Solución debe configurar useLocale(Locale.US)');
      assert.ok(ex40.solution.includes('nextDouble()'), 'Solución debe invocar nextDouble()');
    });

    test('consigna describe Salida esperada (pantalla) y configuración Locale.US', () => {
      assert.ok(ex40.description.includes('Salida esperada (pantalla):'), 'Debe usar Salida esperada (pantalla)');
      assert.ok(ex40.description.includes('Locale.US'), 'Debe mencionar Locale.US en la consigna');
    });

    test('validador acepta la solución canónica con useLocale', () => {
      const res = validator.validate(ex40.solution, ex40);
      assert.equal(res.isValid, true, 'La solución con useLocale debe ser válida');
    });
  });

  describe('Ejercicios 33 a 40: Estandarización de "Salida esperada (pantalla):"', () => {
    const scannerIds = [33, 34, 35, 36, 37, 38, 39, 40];

    test('todos los ejercicios 33-40 tienen etiqueta de pantalla en description', () => {
      for (const id of scannerIds) {
        const ex = exercisesData.find((e) => e.id === id);
        assert.ok(
          ex.description.includes('Salida esperada (pantalla):'),
          `Ejercicio ${id} debe tener Salida esperada (pantalla):`
        );
      }
    });

    test('ejercicio 39: consigna preserva nota sobre cierre automático del Scanner al salir del try', () => {
      const ex39 = exercisesData.find((e) => e.id === 39);
      assert.ok(ex39.description.includes('se cierra solo'), 'Consigna 39 debe explicar que el Scanner se cierra solo');
    });

    test('las soluciones canónicas de 33 a 40 siguen siendo válidas', () => {
      for (const id of scannerIds) {
        const ex = exercisesData.find((e) => e.id === id);
        const res = validator.validate(ex.solution, ex);
        assert.equal(res.isValid, true, `Ejercicio ${id} debe validar solución canónica`);
      }
    });
  });

  describe('Ejercicio 38: Scanner Cerrar e import + validador tolerante', () => {
    const ex38 = exercisesData.find((e) => e.id === 38);

    test('starterCode contiene import java.util.Scanner; y línea // Escribe tu código aquí', () => {
      assert.ok(ex38.starterCode.includes('import java.util.Scanner;'), 'Starter debe incluir import');
      assert.ok(ex38.starterCode.includes('// Escribe tu código aquí'), 'Starter debe tener comentario // Escribe tu código aquí');
    });

    test('solución contiene import java.util.Scanner; y sc.close();', () => {
      assert.ok(ex38.solution.includes('import java.util.Scanner;'), 'Solución debe incluir import');
      assert.ok(ex38.solution.includes('sc.close();'), 'Solución debe cerrar el lector');
    });

    test('validador acepta el bloque completo canónico', () => {
      const res = validator.validate(ex38.solution, ex38);
      assert.equal(res.isValid, true, 'Bloque completo debe ser válido');
    });

    test('validador acepta la instrucción sc.close(); sola (tolerante)', () => {
      const res = validator.validate('sc.close();', ex38);
      assert.equal(res.isValid, true, 'sc.close(); solo debe ser aceptado');
    });

    test('validador RECHAZA código incorrecto, vacío o trampas para id 38', () => {
      // 1. Vacío
      assert.equal(validator.validate('', ex38).isValid, false, 'Vacío no debe pasar');
      // 2. Solo comentarios
      assert.equal(validator.validate('// sc.close();', ex38).isValid, false, 'Comentario no debe pasar');
      // 3. Método incorrecto
      assert.equal(validator.validate('sc.flush();', ex38).isValid, false, 'Método erróneo no debe pasar');
      // 4. Variable equivocada
      assert.equal(validator.validate('otro.close();', ex38).isValid, false, 'Variable no declarada no debe pasar');
      // 5. Sin punto y coma
      assert.equal(validator.validate('sc.close()', ex38).isValid, false, 'Sin punto y coma no debe pasar');
    });
  });

  describe('Ejercicios 178 y 179: ExecutorService y cierre con shutdown()', () => {
    const ex178 = exercisesData.find((e) => e.id === 178);
    const ex179 = exercisesData.find((e) => e.id === 179);

    test('ejercicio 178: solución tiene executor.shutdown() y validation exige shutdown', () => {
      assert.ok(ex178.solution.includes('executor.shutdown();'), 'Solución 178 debe tener shutdown()');
      assert.ok(ex178.validation.requiredKeywords.includes('shutdown'), 'Validador 178 debe exigir shutdown');
    });

    test('ejercicio 178: validador rechaza código sin shutdown()', () => {
      const withoutShutdown = 'ExecutorService executor = Executors.newFixedThreadPool(5);\nexecutor.submit(() -> System.out.println("Tarea"));';
      const res = validator.validate(withoutShutdown, ex178);
      assert.equal(res.isValid, false, '178 sin shutdown debe ser rechazado');
    });

    test('ejercicio 179: solución y consigna tienen executor.shutdown() y validation exige shutdown', () => {
      assert.ok(ex179.solution.includes('executor.shutdown();'), 'Solución 179 debe tener shutdown()');
      assert.ok(ex179.description.includes('executor.shutdown()'), 'Consigna 179 debe mencionar shutdown()');
      assert.ok(ex179.validation.requiredKeywords.includes('shutdown'), 'Validador 179 debe exigir shutdown');
    });

    test('ejercicio 179: validador rechaza código sin shutdown()', () => {
      const withoutShutdown = 'Callable<Integer> tarea = () -> 42;\nFuture<Integer> futuro = executor.submit(tarea);\nint resultado = futuro.get();';
      const res = validator.validate(withoutShutdown, ex179);
      assert.equal(res.isValid, false, '179 sin shutdown debe ser rechazado');
    });

    test('ejercicio 179: consigna preserva aclaración sobre excepciones comprobadas y throws Exception', () => {
      assert.ok(ex179.description.includes('excepciones comprobadas'), 'Consigna 179 debe mencionar excepciones comprobadas');
      assert.ok(ex179.description.includes('throws Exception'), 'Consigna 179 debe mencionar throws Exception');
    });

    test('ejercicio 179: validador acepta la solución canónica completa', () => {
      const res = validator.validate(ex179.solution, ex179);
      assert.equal(res.isValid, true, 'Solución canónica 179 debe ser válida');
    });
  });

  describe('Ejercicio 148: Supplier con Random(42) determinista (retorna 30)', () => {
    const ex148 = exercisesData.find((e) => e.id === 148);

    test('starter importa Random y Supplier y tiene // Escribe tu código aquí', () => {
      assert.ok(ex148.starterCode.includes('import java.util.Random;'), 'Starter debe importar Random');
      assert.ok(ex148.starterCode.includes('import java.util.function.Supplier;'), 'Starter debe importar Supplier');
      assert.ok(ex148.starterCode.includes('// Escribe tu código aquí'), 'Starter debe incluir // Escribe tu código aquí');
    });

    test('solución usa Random(42) y Supplier<Integer> retornando num entero', () => {
      assert.ok(ex148.solution.includes('Random r = new Random(42);'), 'Debe crear Random(42)');
      assert.ok(ex148.solution.includes('Supplier<Integer>'), 'Debe ser Supplier<Integer>');
      assert.ok(ex148.solution.includes('r.nextInt(100)'), 'Debe llamar a r.nextInt(100)');
      assert.ok(ex148.solution.includes('int num = random.get();'), 'Debe leer num con get()');
    });

    test('consigna menciona valor determinista 30 y Comportamiento:', () => {
      assert.ok(ex148.description.includes('Comportamiento:'), 'Debe usar Comportamiento:');
      assert.ok(ex148.description.includes('30'), 'Debe indicar que num almacena 30');
    });

    test('validador exige Random, Supplier y get, y aprueba solución canónica', () => {
      assert.ok(ex148.validation.requiredKeywords.includes('Random'), 'Debe exigir keyword Random');
      assert.ok(ex148.validation.requiredKeywords.includes('Supplier'), 'Debe exigir keyword Supplier');
      assert.ok(ex148.validation.requiredKeywords.includes('get'), 'Debe exigir keyword get');
      const res = validator.validate(ex148.solution, ex148);
      assert.equal(res.isValid, true, 'Solución canónica 148 debe ser válida');
    });
  });

  describe('Ejercicio 133: Nota explícita sobre flag -ea', () => {
    const ex133 = exercisesData.find((e) => e.id === 133);

    test('consigna contiene nota explicativa sobre el flag -ea de la JVM', () => {
      assert.ok(ex133.description.includes('-ea'), 'Consigna debe mencionar -ea');
      assert.ok(ex133.description.includes('enableassertions'), 'Consigna debe explicar enableassertions');
    });

    test('solución canónica se mantiene intacta y aprueba validación', () => {
      assert.equal(ex133.solution, 'assert edad >= 0 : "Edad no puede ser negativa";');
      const res = validator.validate(ex133.solution, ex133);
      assert.equal(res.isValid, true);
    });
  });

  describe('Etiqueta uniforme Comportamiento: en ejercicios 170, 174, 176, 182, 186', () => {
    const behaviorIds = [170, 174, 176, 182, 186];

    test('todos los ejercicios seleccionados tienen etiqueta Comportamiento:', () => {
      for (const id of behaviorIds) {
        const ex = exercisesData.find((e) => e.id === id);
        assert.ok(
          ex.description.includes('<strong>Comportamiento:</strong>'),
          `Ejercicio ${id} debe tener <strong>Comportamiento:</strong>`
        );
      }
    });

    test('ninguno de los 5 ejercicios conserva Resultado esperado:', () => {
      for (const id of behaviorIds) {
        const ex = exercisesData.find((e) => e.id === id);
        assert.ok(
          !ex.description.includes('Resultado esperado:'),
          `Ejercicio ${id} no debe tener Resultado esperado:`
        );
      }
    });
  });
});
