const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Módulo bajo prueba (se implementa en tools/audit-real-execution.js)
const {
  LEVEL_NAMES,
  loadLessonsData,
  detectJdk,
  wrapExerciseCode,
  parseExpectedOutput,
  classifyVerdict,
  runJavaExecution,
  generateAuditMarkdown,
} = require('./audit-real-execution.js');

describe('C-20: audit-real-execution (Lógica pura y wrappers)', () => {
  it('detectJdk reporta disponibilidad de javac y java sin lanzar excepciones', async () => {
    const jdk = await detectJdk();
    assert.equal(typeof jdk, 'object');
    assert.equal(typeof jdk.available, 'boolean');
    if (jdk.available) {
      assert.ok(jdk.javacVersion, 'Debe reportar versión de javac');
      assert.ok(jdk.javaVersion, 'Debe reportar versión de java');
    }
  });

  describe('wrapExerciseCode', () => {
    it('envuelve un fragmento simple dentro de Solution.main con importaciones', () => {
      const ex = {
        id: 1,
        title: 'Prueba simple',
        starterCode: '',
        solution: 'System.out.println("Hola");',
      };
      const code = wrapExerciseCode(ex);
      assert.ok(code.includes('public class Solution'), 'Debe definir clase Solution');
      assert.ok(code.includes('public static void main('), 'Debe tener método main');
      assert.ok(code.includes('System.out.println("Hola");'), 'Debe contener la solución');
      assert.ok(code.includes('import java.util.*;'), 'Debe incluir java.util.*');
    });

    it('respeta clases ya definidas en la solución o starter y asegura método main', () => {
      const ex = {
        id: 170,
        title: 'Runnable Interface',
        starterCode: '',
        solution: 'class MiTarea implements Runnable {\n    public void run() {\n        System.out.println("En hilo");\n    }\n}',
      };
      const code = wrapExerciseCode(ex);
      assert.ok(code.includes('class MiTarea implements Runnable'), 'Conserva la clase definida');
      assert.ok(code.includes('public static void main('), 'Agrega clase ejecutable con main');
      assert.ok(code.includes('MiTarea'), 'Instancia o ejecuta la clase definida en el main');
    });

    it('declara variables previas indicadas en el starter (p.ej. nums o edad)', () => {
      const ex = {
        id: 133,
        title: 'Aserciones con assert',
        starterCode: 'int edad = 15;\n// código',
        solution: 'assert edad >= 18 : "Menor de edad";',
      };
      const code = wrapExerciseCode(ex);
      assert.ok(code.includes('int edad = 15;') || code.includes('edad = 15;'), 'Debe declarar edad');
      assert.ok(code.includes('assert edad >= 18'), 'Debe contener la aserción');
    });
  });

  describe('parseExpectedOutput', () => {
    it('extrae el texto de <strong>Salida esperada:</strong>', () => {
      const desc = '<strong>Qué hacer:</strong> Suma 2+2.<br><strong>Salida esperada:</strong> <code>4</code>';
      const expected = parseExpectedOutput(desc);
      assert.equal(expected, '4');
    });

    it('extrae el texto de <strong>Resultado esperado:</strong>', () => {
      const desc = 'Haz algo.<br><strong>Resultado esperado:</strong> <code>true</code>. No imprime nada.';
      const expected = parseExpectedOutput(desc);
      assert.equal(expected, 'true');
    });

    it('retorna null cuando la consigna no especifica salida determinística', () => {
      const desc = 'Imprime números en orden concurrente según los hilos finalicen.';
      const expected = parseExpectedOutput(desc);
      assert.equal(expected, null);
    });
  });

  describe('classifyVerdict', () => {
    it('clasifica como NO COMPILA si javac falla', () => {
      const verdict = classifyVerdict({
        compileOk: false,
        compileError: 'error: cannot find symbol',
      });
      assert.equal(verdict.category, 'NO COMPILA');
    });

    it('clasifica como DEPENDE DEL ENTORNO si requiere flag (-ea) o archivo', () => {
      const verdict = classifyVerdict({
        compileOk: true,
        runOk: true,
        envDependent: true,
        envNote: 'Requiere flag -ea para activarse',
      });
      assert.equal(verdict.category, 'DEPENDE DEL ENTORNO (archivo, flag, tiempo)');
    });

    it('clasifica como NO DETERMINÍSTICO si las repeticiones difieren', () => {
      const verdict = classifyVerdict({
        compileOk: true,
        runOk: true,
        nonDeterministic: true,
        runs: ['Hilo-1\nHilo-2', 'Hilo-2\nHilo-1', 'Hilo-1\nHilo-2'],
      });
      assert.equal(verdict.category, 'NO DETERMINÍSTICO');
    });

    it('clasifica como SOLUCIÓN INCORRECTA si la ejecución lanza error o no coincide', () => {
      const verdict = classifyVerdict({
        compileOk: true,
        runOk: false,
        runError: 'Exception in thread "main" java.lang.NullPointerException',
      });
      assert.equal(verdict.category, 'SOLUCIÓN INCORRECTA');
    });

    it('clasifica como OK si compila y ejecuta limpiamente', () => {
      const verdict = classifyVerdict({
        compileOk: true,
        runOk: true,
        output: 'Hola Mundo\n',
        expectedOutput: 'Hola Mundo',
      });
      assert.equal(verdict.category, 'OK');
    });
  });

  describe('Carga de datos y generación de reporte', () => {
    it('loadLessonsData extrae exactamente 52 lecciones de script.js con niveles válidos', () => {
      const lessons = loadLessonsData();
      assert.equal(lessons.length, 52);
      assert.equal(typeof lessons[0].title, 'string');
      assert.ok(['beginner', 'intermediate', 'advanced', 'expert'].includes(lessons[0].level));
      assert.equal(LEVEL_NAMES.beginner, 'Principiante');
      assert.equal(LEVEL_NAMES.intermediate, 'Intermedio');
      assert.equal(LEVEL_NAMES.advanced, 'Avanzado');
      assert.equal(LEVEL_NAMES.expert, 'Experto');
    });

    it('generateAuditMarkdown incluye columnas Título, Nivel y Lección con ID y nombres reales', () => {
      const md = generateAuditMarkdown({
        jdkInfo: { javacVersion: 'javac 21', javaVersion: 'openjdk 21' },
        results: [
          {
            id: 33,
            title: 'Scanner Leer Int',
            level: 'Principiante',
            lessonId: 5,
            lesson: 'Entrada y Salida con Scanner',
            scopeSource: 'audit-validator',
            compileOk: true,
            runOk: true,
            verdict: 'OK',
            verdictDetail: 'Compila y ejecuta correctamente',
            recommendation: 'Comportamiento determinista y seguro.',
          },
        ],
      });
      assert.ok(md.includes('| ID | Título | Nivel | Lección | Origen Alcance | Compilación / Ejecución | Veredicto | Recomendación / Observación |'));
      assert.ok(md.includes('| 33 | Scanner Leer Int | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` |'));
    });
  });
});

describe('C-20: Integración real con JDK (omite si no hay JDK)', () => {
  it('compila y ejecuta un programa Hola Mundo aislado', async (t) => {
    const jdk = await detectJdk();
    if (!jdk.available) {
      t.skip('JDK no disponible en el entorno');
      return;
    }

    const res = await runJavaExecution({
      code: 'public class Solution { public static void main(String[] args) { System.out.println("JavaMaster JDK OK"); } }',
      timeoutMs: 5000,
    });

    assert.equal(res.compileOk, true, `Compilación falló: ${res.compileError}`);
    assert.equal(res.runOk, true, `Ejecución falló: ${res.runError}`);
    assert.ok(res.output.includes('JavaMaster JDK OK'));
  });

  it('soporta inyección de stdin simulado', async (t) => {
    const jdk = await detectJdk();
    if (!jdk.available) {
      t.skip('JDK no disponible');
      return;
    }

    const code = `
import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("Leído: " + n);
    }
}
    `;

    const res = await runJavaExecution({
      code,
      stdin: '42\n',
      timeoutMs: 5000,
    });

    assert.equal(res.compileOk, true);
    assert.equal(res.runOk, true);
    assert.ok(res.output.includes('Leído: 42'));
  });

  it('soporta creación de archivos de muestra en el sandbox', async (t) => {
    const jdk = await detectJdk();
    if (!jdk.available) {
      t.skip('JDK no disponible');
      return;
    }

    const code = `
import java.io.*;
import java.nio.file.*;
public class Solution {
    public static void main(String[] args) throws Exception {
        String texto = Files.readString(Path.of("muestra.txt"));
        System.out.println("Contenido: " + texto.trim());
    }
}
    `;

    const res = await runJavaExecution({
      code,
      files: { 'muestra.txt': 'Hola archivo muestra' },
      timeoutMs: 5000,
    });

    assert.equal(res.compileOk, true);
    assert.equal(res.runOk, true);
    assert.ok(res.output.includes('Contenido: Hola archivo muestra'));
  });
});
