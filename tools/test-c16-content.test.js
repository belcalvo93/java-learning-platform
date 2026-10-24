const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const validatorCode = fs.readFileSync(path.join(rootDir, 'validator.js'), 'utf8');
const { exercisesData } = require(path.join(rootDir, 'data.js'));

const fn = new Function('window', 'exercisesData', validatorCode + '; return { JavaValidator: window.JavaValidator || JavaValidator, STRUCT_RULES };');
const { JavaValidator, STRUCT_RULES } = fn({}, exercisesData);

describe('C-16 TDD Content and Validation Suite', () => {

    test('Invariante 52 lecciones y 208 ejercicios con ids 1 a 208', () => {
        assert.equal(exercisesData.length, 208, 'Debe haber exactamente 208 ejercicios');
        for (let i = 1; i <= 208; i++) {
            assert.equal(exercisesData[i - 1].id, i, `El ejercicio en índice ${i - 1} debe tener id ${i}`);
        }
    });

    test('Ejercicio 205: solución canónica usa testSuma y assertEquals(4, suma(2, 2)), y validator acepta testSuma y testFalla', () => {
        const ex205 = exercisesData.find(e => e.id === 205);
        assert.match(ex205.solution, /testSuma/, 'Solución de 205 debe tener testSuma');
        assert.match(ex205.solution, /assertEquals\s*\(\s*4\s*,\s*suma\s*\(\s*2\s*,\s*2\s*\)\s*\)/, 'Solución de 205 debe esperar 4');

        const v = new JavaValidator();
        const resCanonica = v.validateExercise(ex205.solution, 205);
        assert.equal(resCanonica.isValid, true, 'Solución canónica de 205 debe validar');

        const altFalla = '// 1. Red: escribe test que falla\n@Test void testFalla() { assertEquals(5, suma(2, 2)); }\n// 2. Green: implementa mínimo para pasar\nint suma(int a, int b) { return a + b; }\n// 3. Refactor: mejora el código';
        const resFalla = v.validateExercise(altFalla, 205);
        assert.equal(resFalla.isValid, true, 'Variante testFalla de 205 debe seguir validando');
    });

    test('Ejercicio 124: starter tiene método cerrado con comentario y solución canónica es método completo; validator acepta método completo y cuerpo suelto', () => {
        const ex124 = exercisesData.find(e => e.id === 124);
        assert.match(ex124.starterCode, /public\s+void\s+validar\s*\(\s*int\s+edad\s*\)\s*\{[\s\S]*\}/, 'Starter 124 debe cerrar el método');
        assert.match(ex124.starterCode, /\/\/\s*Escribe tu código aquí/, 'Starter 124 debe tener placeholder estándar');
        assert.match(ex124.solution, /public\s+void\s+validar/, 'Solución 124 debe ser método completo');

        const v = new JavaValidator();
        const resFull = v.validateExercise(ex124.solution, 124);
        assert.equal(resFull.isValid, true, 'Solución método completo debe validar');

        const looseBody = 'if (edad < 0) {\n    throw new IllegalArgumentException("Edad negativa");\n}';
        const resLoose = v.validateExercise(looseBody, 124);
        assert.equal(resLoose.isValid, true, 'Cuerpo suelto sin firma debe validar');
    });

    test('Ejercicio 129: starter define método auxiliar y solución llama a consultar(), compilando en Java real', () => {
        const ex129 = exercisesData.find(e => e.id === 129);
        assert.match(ex129.starterCode, /void\s+consultar\s*\(\s*\)\s*throws\s+IOException\s*,\s*SQLException/, 'Starter 129 debe declarar consultar()');
        assert.match(ex129.solution, /consultar\s*\(\s*\)/, 'Solución 129 debe llamar a consultar()');

        const v = new JavaValidator();
        const res129 = v.validateExercise(ex129.solution, 129);
        assert.equal(res129.isValid, true, 'Solución 129 debe validar');

        // Verificación con javac
        const testFile = path.join(rootDir, 'Test129Compilation.java');
        const javaSource = `import java.io.IOException;
import java.sql.SQLException;
public class Test129Compilation {
    void consultar() throws IOException, SQLException { }
    void test() {
        ${ex129.solution}
    }
}`;
        fs.writeFileSync(testFile, javaSource);
        try {
            const proc = spawnSync('javac', [testFile], { encoding: 'utf8' });
            assert.equal(proc.status, 0, `javac falló: ${proc.stderr}`);
        } finally {
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
            const classFile = path.join(rootDir, 'Test129Compilation.class');
            if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
        }
    });

    test('Ejercicio 181: CountDownLatch contiene comentario de countDown en los hilos', () => {
        const ex181 = exercisesData.find(e => e.id === 181);
        assert.match(ex181.solution, /countDown/, 'Solución 181 debe mencionar countDown en comentario');

        const v = new JavaValidator();
        assert.equal(v.validateExercise(ex181.solution, 181).isValid, true);
    });

    test('Ejercicio 19: solución con llaves en if/else if/else y un enunciado por línea', () => {
        const ex19 = exercisesData.find(e => e.id === 19);
        assert.match(ex19.solution, /if\s*\(n\s*>=\s*90\)\s*\{/, 'Debe tener llave en if');
        assert.match(ex19.solution, /else\s+if\s*\(n\s*>=\s*70\)\s*\{/, 'Debe tener llave en else if');
        assert.match(ex19.solution, /else\s*\{/, 'Debe tener llave en else');

        const v = new JavaValidator();
        assert.equal(v.validateExercise(ex19.solution, 19).isValid, true);
    });

    test('Starters 168, 192, 207 incluyen sus imports', () => {
        const ex168 = exercisesData.find(e => e.id === 168);
        assert.match(ex168.starterCode, /import\s+java\.util\.stream\.Stream;/, 'Starter 168 debe importar Stream');

        const ex192 = exercisesData.find(e => e.id === 192);
        assert.match(ex192.starterCode, /import\s+java\.util\.\*;/, 'Starter 192 debe importar java.util.*');

        const ex207 = exercisesData.find(e => e.id === 207);
        assert.match(ex207.starterCode, /import\s+static\s+org\.junit\.jupiter\.api\.Assertions\.\*;/, 'Starter 207 debe importar Assertions');
    });

    test('Starters 84, 85, 107, 110, 115, 117 usan placeholder estándar', () => {
        [84, 85, 107, 110, 115, 117].forEach(id => {
            const ex = exercisesData.find(e => e.id === id);
            assert.match(ex.starterCode, /\/\/\s*Escribe tu código aquí/, `Starter ${id} debe tener placeholder estándar`);
        });
    });

    test('Todos los 208 starters tal cual NO aprueban la validación', () => {
        const v = new JavaValidator();
        for (const ex of exercisesData) {
            const res = v.validateExercise(ex.starterCode, ex.id);
            assert.equal(res.isValid, false, `Starter del ejercicio ${ex.id} (${ex.title}) no debe aprobar la validación sin código del alumno`);
        }
    });

    test('Las 208 soluciones canónicas aprueban la validación', () => {
        const v = new JavaValidator();
        for (const ex of exercisesData) {
            const res = v.validateExercise(ex.solution, ex.id);
            assert.equal(res.isValid, true, `Solución canónica del ejercicio ${ex.id} (${ex.title}) debe ser válida`);
        }
    });

});
