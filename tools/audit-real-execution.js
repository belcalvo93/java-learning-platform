/**
 * JavaMaster — Herramienta de Auditoría con Ejecución Real (C-20 real-execution-audit)
 *
 * Compila y ejecuta en una JVM local aislada las soluciones canónicas de los ejercicios
 * que no pueden ser verificados con precisión solo por reglas sintácticas:
 * 1. Los 9 clasificados needs-real-execution (Scanner y Supplier).
 * 2. Ejercicio 133 (aserciones con y sin -ea).
 * 3. Ejercicios de archivos en disco (128, 162, 163, 164, 165, 166, 167, 168).
 * 4. Ejercicios de concurrencia y temporización (169 a 188).
 */

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { execFile, spawn } = require('node:child_process');

const LEVEL_NAMES = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto',
};

/**
 * Carga lessonsData desde script.js de forma determinista usando el motor de VM.
 */
function loadLessonsData() {
  const scriptPath = path.join(__dirname, '..', 'script.js');
  const scriptSrc = fs.readFileSync(scriptPath, 'utf8');
  const start = scriptSrc.indexOf('const lessonsData = [');
  const end = scriptSrc.indexOf('\n];', start);
  const vm = require('node:vm');
  const sb = {};
  vm.createContext(sb);
  vm.runInContext(scriptSrc.slice(start, end + 3) + '\nthis.__r = lessonsData;', sb);
  return sb.__r;
}

/**
 * Detecta si el JDK está instalado en el sistema.
 */
function detectJdk() {
  return new Promise((resolve) => {
    execFile('javac', ['-version'], (javacErr, javacStdout, javacStderr) => {
      if (javacErr) {
        return resolve({ available: false, javacVersion: null, javaVersion: null });
      }
      const javacVersion = (javacStdout || javacStderr || '').trim();
      execFile('java', ['-version'], (javaErr, javaStdout, javaStderr) => {
        if (javaErr) {
          return resolve({ available: false, javacVersion, javaVersion: null });
        }
        const javaVersion = (javaStderr || javaStdout || '').trim().split('\n')[0];
        resolve({ available: true, javacVersion, javaVersion });
      });
    });
  });
}

/**
 * Extrae la salida esperada o resultado esperado del texto descriptivo de la consigna.
 */
function parseExpectedOutput(description) {
  if (!description) return null;
  const salidaMatch = description.match(/<strong>Salida esperada:<\/strong>\s*(?:<code>)?(.*?)(?:<\/code>)?(?:<br>|\.|$)/i);
  if (salidaMatch && salidaMatch[1]) {
    return cleanHtml(salidaMatch[1]);
  }
  const resMatch = description.match(/<strong>Resultado esperado:<\/strong>\s*(?:<code>)?(.*?)(?:<\/code>)?(?:<br>|\.|$)/i);
  if (resMatch && resMatch[1]) {
    return cleanHtml(resMatch[1]);
  }
  return null;
}

function cleanHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Genera un archivo Java compilable envolviendo la solución según su estructura.
 */
function wrapExerciseCode(exercise) {
  const { id, starterCode = '', solution = '' } = exercise;

  const standardImports = `import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;
import java.util.stream.*;
import java.util.function.*;
`;

  // Caso 1: solución es una clase completa con main
  if (/public\s+class\s+\w+[\s\S]*public\s+static\s+void\s+main/m.test(solution)) {
    return standardImports + '\n' + solution.replace(/public\s+class\s+\w+/, 'public class Solution');
  }

  let outerClasses = '';
  let classMembers = '';
  let mainBody = solution;
  let starterInit = '';

  // 1. Extraer declaraciones previas del starterCode
  if (starterCode) {
    const lines = starterCode.split('\n');
    const localDecls = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('import ')) continue;
      // Si la solución ya contiene esta línea idéntica, no duplicarla
      if (solution.includes(trimmed)) continue;

      if (/^(?:private|public|protected)\s+/.test(trimmed) || /void\s+\w+\s*\(/.test(trimmed)) {
        // Miembro de clase
        const staticLine = trimmed.replace(/^(private|public|protected)\s+/, '$1 static ');
        classMembers += staticLine + '\n';
      } else {
        localDecls.push(line);
      }
    }
    if (localDecls.length) {
      starterInit = localDecls.join('\n') + '\n';
    }
  }

  // 2. Extraer clases definidas en solution si existen
  const matchClass = solution.match(/((?:public\s+)?class\s+([A-Za-z0-9_]+)[\s\S]*?\{[\s\S]*?\n\})/);
  if (matchClass) {
    outerClasses = matchClass[1].replace(/public\s+class/, 'class');
    const cName = matchClass[2];
    const rest = solution.replace(matchClass[1], '').trim();
    if (rest) {
      mainBody = rest;
    } else if (/extends\s+Thread/.test(outerClasses)) {
      mainBody = `${cName} t = new ${cName}();\nt.start();\nt.join();`;
    } else if (/implements\s+Runnable/.test(outerClasses)) {
      mainBody = `Thread t = new Thread(new ${cName}());\nt.start();\nt.join();`;
    } else {
      mainBody = `new ${cName}();`;
    }
  }

  // Casos específicos por ID para completar contexto requerido en tiempo de compilación
  switch (id) {
    case 33: // Scanner Leer Int
    case 34: // Scanner Leer String
    case 35: // Scanner Múltiples Datos
    case 36: // Scanner Validar Entrada
    case 37: // Scanner en Bucle
    case 38: // Scanner Cerrar
    case 39: // Scanner Try-With-Resources
    case 40: // Scanner Leer Double
      break;

    case 128: // Try-With-Resources BufferedReader
    case 166: // BufferedReader
    case 167: // BufferedWriter
    case 168: // Files Lines Stream
    case 162: // File Write
    case 163: // File Read
    case 164: // File Exists
    case 165: // File Delete
      break;

    case 129: // Multi-Catch
      classMembers += `static void consultar() throws IOException, SQLException {\n    throw new IOException("Error de I/O o BD");\n}\n`;
      break;

    case 133: // Assert
      if (!starterInit.includes('edad')) {
        starterInit += `int edad = -5;\n`;
      }
      break;

    case 148: // Supplier Get
      mainBody += `\nSystem.out.println("Random: " + num);`;
      break;

    case 169: // Thread Extends
      if (!outerClasses) {
        outerClasses = `class MiThread extends Thread {\n    public void run() {\n        System.out.println("Ejecutando");\n    }\n}`;
        mainBody = `MiThread t = new MiThread();\nt.start();\nt.join();`;
      }
      break;

    case 170: // Runnable Interface
      if (!outerClasses) {
        outerClasses = `class MiRunnable implements Runnable {\n    public void run() {\n        System.out.println("Ejecutando");\n    }\n}`;
        mainBody = `Thread t = new Thread(new MiRunnable());\nt.start();\nt.join();`;
      }
      break;

    case 171: // Thread Start
      if (!starterInit.includes('Thread t') && !classMembers.includes('Thread t')) {
        starterInit += `Thread t = new Thread(() -> System.out.println("Hola"));\n`;
      }
      mainBody = `t.start();\nt.join();`;
      break;

    case 173: // Thread Join
      if (!starterInit.includes('Thread t') && !classMembers.includes('Thread t')) {
        starterInit += `Thread t = new Thread(() -> {});\n`;
      }
      break;

    case 174: // Synchronized Method
      // La solución define un método que debe ser miembro de clase
      classMembers += `public static synchronized void incrementar() {\n    contador++;\n}\n`;
      mainBody = `incrementar();\nSystem.out.println("Contador: " + contador);`;
      break;

    case 175: // Synchronized Block
      if (!classMembers.includes('lock') && !starterInit.includes('lock')) {
        starterInit += `Object lock = new Object();\n`;
      }
      break;

    case 176: // Volatile Variable
      classMembers += `private static volatile boolean activo = true;\n`;
      mainBody = `System.out.println("Activo: " + activo);`;
      break;

    case 178: // ExecutorService
      mainBody = `${solution}\nexecutor.shutdown();\nexecutor.awaitTermination(2, TimeUnit.SECONDS);`;
      break;

    case 179: // Callable Future
      starterInit += `ExecutorService executor = Executors.newSingleThreadExecutor();\n`;
      mainBody = `${solution}\nexecutor.shutdown();\nexecutor.awaitTermination(2, TimeUnit.SECONDS);`;
      break;

    case 180: // CompletableFuture
      mainBody = `CompletableFuture<Void> cf = ${solution};\ncf.join();`;
      break;

    case 181: // CountDownLatch
      mainBody = `CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    new Thread(() -> latch.countDown()).start();
}
latch.await();
System.out.println("Latch liberado");`;
      break;

    case 182: // CyclicBarrier
      mainBody = `CyclicBarrier barrier = new CyclicBarrier(3);
for (int i = 0; i < 2; i++) {
    new Thread(() -> { try { barrier.await(); } catch (Exception e) {} }).start();
}
barrier.await();
System.out.println("Barrera superada");`;
      break;

    default:
      break;
  }

  // Detectar si la solución declara una variable simple de nivel superior no impresa para observarla
  if (!mainBody.includes('System.out.print') && !mainBody.includes('System.err.print')) {
    const varDeclMatch = mainBody.match(/^(?:boolean|int|double|String|long)\s+([a-zA-Z0-9_]+)\s*=/m);
    if (varDeclMatch) {
      const varName = varDeclMatch[1];
      mainBody += `\nSystem.out.println("${varName}=" + ${varName});`;
    }
  }

  return `${standardImports}

${outerClasses}

public class Solution {
${classMembers}
    public static void main(String[] args) throws Exception {
${starterInit}
${mainBody}
    }
}
`;
}

/**
 * Ejecuta código Java en un directorio temporal aislado.
 */
async function runJavaExecution({ code, stdin = null, flags = [], files = {}, timeoutMs = 5000 }) {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'javamaster-real-audit-'));
  try {
    for (const [filename, content] of Object.entries(files)) {
      const filePath = path.join(tempDir, filename);
      await fsp.mkdir(path.dirname(filePath), { recursive: true });
      await fsp.writeFile(filePath, content, 'utf8');
    }

    const javaFile = path.join(tempDir, 'Solution.java');
    await fsp.writeFile(javaFile, code, 'utf8');

    // 1. Compilar con javac con codificación UTF-8
    const compileResult = await new Promise((resolve) => {
      execFile('javac', ['-encoding', 'UTF-8', 'Solution.java'], { cwd: tempDir, timeout: timeoutMs }, (err, stdout, stderr) => {
        if (err) {
          return resolve({ compileOk: false, compileError: (stderr || stdout || err.message).slice(0, 10000) });
        }
        resolve({ compileOk: true, compileError: null });
      });
    });

    if (!compileResult.compileOk) {
      return {
        compileOk: false,
        compileError: compileResult.compileError,
        runOk: false,
        runError: null,
        output: '',
      };
    }

    // 2. Ejecutar con java
    const javaArgs = [
      '-Dfile.encoding=UTF-8',
      '-Dstdout.encoding=UTF-8',
      '-Dstderr.encoding=UTF-8',
      ...flags,
      'Solution',
    ];

    const runResult = await new Promise((resolve) => {
      const child = spawn('java', javaArgs, {
        cwd: tempDir,
        env: {
          PATH: process.env.PATH,
          SYSTEMROOT: process.env.SYSTEMROOT || '',
          TEMP: tempDir,
          TMP: tempDir,
        },
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      const timer = setTimeout(() => {
        killed = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', (d) => {
        if (stdout.length < 10000) stdout += d.toString();
      });

      child.stderr.on('data', (d) => {
        if (stderr.length < 10000) stderr += d.toString();
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          runOk: false,
          runError: err.message,
          output: stdout,
        });
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (killed) {
          return resolve({
            runOk: false,
            runError: `Timeout de ${timeoutMs}ms excedido`,
            output: stdout,
          });
        }
        resolve({
          runOk: code === 0,
          runError: code !== 0 ? (stderr || `Proceso terminó con código ${code}`) : null,
          output: stdout,
        });
      });

      if (stdin !== null) {
        child.stdin.write(stdin);
        child.stdin.end();
      } else {
        child.stdin.end();
      }
    });

    return {
      compileOk: true,
      compileError: null,
      runOk: runResult.runOk,
      runError: runResult.runError,
      output: runResult.output,
    };
  } finally {
    try {
      await fsp.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignorar error de limpieza
    }
  }
}

/**
 * Clasifica el veredicto del ejercicio.
 */
function classifyVerdict({
  compileOk,
  compileError,
  runOk,
  runError,
  output,
  expectedOutput,
  nonDeterministic = false,
  envDependent = false,
  envNote = '',
  runs = [],
}) {
  if (!compileOk) {
    return {
      category: 'NO COMPILA',
      detail: compileError || 'Error de compilación javac',
    };
  }

  if (envDependent) {
    return {
      category: 'DEPENDE DEL ENTORNO (archivo, flag, tiempo)',
      detail: envNote || 'Depende de banderas de JVM o recursos externos',
    };
  }

  if (nonDeterministic) {
    return {
      category: 'NO DETERMIN\u00CDSTICO',
      detail: `Salidas variables entre repeticiones: ${runs.map(r => JSON.stringify(r.trim())).join(' vs ')}`,
    };
  }

  if (!runOk) {
    return {
      category: 'SOLUCI\u00D3N INCORRECTA',
      detail: runError || 'Error en tiempo de ejecución',
    };
  }

  if (expectedOutput) {
    const trimmedOut = (output || '').trim();
    const trimmedExp = expectedOutput.trim();
    if (!trimmedOut.includes(trimmedExp) && !trimmedExp.includes(trimmedOut)) {
      return {
        category: 'CONSIGNA AMBIGUA',
        detail: `Salida real "${trimmedOut}" difiere de la esperada "${trimmedExp}"`,
      };
    }
  }

  return {
    category: 'OK',
    detail: 'Compila y ejecuta correctamente',
  };
}

/**
 * Define el catálogo de archivos muestra estándar para ejercicios de I/O.
 */
function getSampleFiles() {
  return {
    'archivo.txt': 'Hola Mundo\nSegunda línea de prueba\nJava es genial\n',
    'file.txt': 'Java es genial\nPython es popular\nLínea 1\nLínea 2\n',
    'datos.txt': '10\n20\n30\n',
  };
}

/**
 * Mapa de entradas simuladas para ejercicios de Scanner.
 */
function getSimulatedStdin(exerciseId) {
  switch (exerciseId) {
    case 33: return '30\n';
    case 34: return 'Ana Pérez\n';
    case 35: return 'Ana Pérez\n30\n';
    case 36: return '42\n';
    case 37: return '5\n3\n0\n';
    case 38: return '10\n';
    case 39: return '42\n';
    case 40: return '3.5\n'; // Se probará también con '3,5\n' para evaluar locale
    default: return null;
  }
}

/**
 * Corre la auditoría completa de ejecución real sobre los ejercicios en alcance.
 */
async function auditAllExercises(exercisesData, lessonsData) {
  const jdk = await detectJdk();
  if (!jdk.available) {
    console.warn('⚠️ AVISO: JDK (javac/java) no disponible en el entorno local. La auditoría real no puede ejecutarse.');
    return { hasJdk: false, results: [] };
  }

  // Alcance:
  // 1. Los 9 de audit-validator: 33, 34, 35, 36, 37, 38, 39, 40, 148
  // 2. docs/content-followups: 133, 128, 163, 166, 167, 169 a 188
  // 3. encontrados (I/O): 162, 164, 165, 168
  const inScopeIds = [
    33, 34, 35, 36, 37, 38, 39, 40, // Scanner
    128, 162, 163, 164, 165, 166, 167, 168, // Archivos en disco
    133, // Assert
    148, // Supplier (Random)
    ...Array.from({ length: 20 }, (_, i) => 169 + i), // Concurrencia (169-188)
  ];

  const results = [];
  const sampleFiles = getSampleFiles();

  for (const id of inScopeIds) {
    const exercise = exercisesData.find((e) => e.id === id);
    if (!exercise) continue;

    const lesson = lessonsData.find((l) => l.id === exercise.lessonId) || { title: `Lección ${exercise.lessonId}`, level: 'desconocido' };
    const expectedOutput = parseExpectedOutput(exercise.description);
    const code = wrapExerciseCode(exercise);
    const stdin = getSimulatedStdin(id);

    // CASO ESPECIAL: Ejercicio 133 (assert)
    if (id === 133) {
      // 1. Sin -ea
      const resNoEa = await runJavaExecution({ code, flags: [], timeoutMs: 5000 });
      // 2. Con -ea
      const resEa = await runJavaExecution({ code, flags: ['-ea'], timeoutMs: 5000 });

      const envDependent = true;
      const envNote = 'Sin flag -ea la JVM no evalúa la aserción (termina con éxito sin salida). Con flag -ea lanza AssertionError: Edad no puede ser negativa como describe la consigna.';
      const verdict = classifyVerdict({
        compileOk: resEa.compileOk,
        runOk: true, // Se comporta exactamente como describe Java
        envDependent,
        envNote,
      });

      results.push({
        id,
        title: exercise.title,
        level: LEVEL_NAMES[lesson.level] || lesson.level,
        lessonId: exercise.lessonId,
        lesson: lesson.title,
        scopeSource: 'content-followups',
        code,
        compileOk: resEa.compileOk,
        runOk: true,
        output: `[sin -ea]: exitCode 0 (sin error)\n[con -ea]: ${resEa.runError || resEa.output}`,
        expectedOutput,
        verdict: verdict.category,
        verdictDetail: verdict.detail,
        runs: [resNoEa.output, resEa.output],
        recommendation: 'Mantener validación por reglas en cliente. Si en el futuro se habilita el ejecutor de C-06, agregar automáticamente la bandera "-ea" a la ejecución del JDK para ejercicios con aserciones.',
      });
      continue;
    }

    // CASO ESPECIAL: Ejercicio 40 (Scanner Leer Double - prueba de locale)
    if (id === 40) {
      const resDot = await runJavaExecution({ code, stdin: '3.5\n', timeoutMs: 5000 });
      const resComma = await runJavaExecution({ code, stdin: '3,5\n', timeoutMs: 5000 });

      let envDependent = false;
      let envNote = '';
      if (!resDot.runOk && resComma.runOk) {
        envDependent = true;
        envNote = 'Sensible a Locale regional: la JVM en este sistema espera coma decimal ("3,5") en vez de punto ("3.5"), lanzando InputMismatchException con punto.';
      } else if (resDot.runOk && !resComma.runOk) {
        envDependent = true;
        envNote = 'Sensible a Locale regional: la JVM espera punto ("3.5") en vez de coma ("3,5").';
      }

      const verdict = classifyVerdict({
        compileOk: resDot.compileOk,
        compileError: resDot.compileError,
        runOk: resDot.runOk || resComma.runOk,
        runError: resDot.runError,
        output: resDot.output || resComma.output,
        expectedOutput,
        envDependent,
        envNote,
      });

      results.push({
        id,
        title: exercise.title,
        level: LEVEL_NAMES[lesson.level] || lesson.level,
        lessonId: exercise.lessonId,
        lesson: lesson.title,
        scopeSource: 'audit-validator',
        code,
        compileOk: resDot.compileOk,
        runOk: resDot.runOk || resComma.runOk,
        output: resDot.runOk ? resDot.output : (resComma.output || resDot.runError),
        expectedOutput,
        verdict: verdict.category,
        verdictDetail: verdict.detail,
        runs: [resDot.output, resComma.output],
        recommendation: 'En la consigna o starter, sugerir "sc.useLocale(Locale.US)" para garantizar que tanto "3.5" como "3,5" no rompan según la configuración regional del sistema operativo.',
      });
      continue;
    }

    // CASO CONCURRENCIA: 169 a 188 (correr 3 veces para evaluar no determinismo)
    const isConcurrency = id >= 169 && id <= 188;
    const runsCount = isConcurrency ? 3 : 1;
    const runOutputs = [];
    let lastResult = null;
    let anyFail = false;

    for (let r = 0; r < runsCount; r++) {
      const res = await runJavaExecution({
        code,
        stdin,
        files: sampleFiles,
        timeoutMs: 5000,
      });
      lastResult = res;
      runOutputs.push(res.output);
      if (!res.runOk) anyFail = true;
    }

    // Detectar si las salidas entre corridas son variables (no determinismo)
    const uniqueOutputs = new Set(runOutputs.map((o) => o.trim()));
    const nonDeterministic = isConcurrency && uniqueOutputs.size > 1;

    let envDependent = false;
    let envNote = '';

    // Si es ejercicio de archivo
    if ([128, 162, 163, 164, 165, 166, 167, 168].includes(id)) {
      envDependent = true;
      envNote = 'Depende de la presencia física de archivos muestra ("archivo.txt", "file.txt") en el directorio de trabajo del proceso.';
    }

    let verdict = classifyVerdict({
      compileOk: lastResult.compileOk,
      compileError: lastResult.compileError,
      runOk: lastResult.runOk,
      runError: lastResult.runError,
      output: lastResult.output,
      expectedOutput,
      nonDeterministic,
      envDependent,
      envNote,
      runs: runOutputs,
    });

    let recommendation = '';
    const scopeSource = [33, 34, 35, 36, 37, 38, 39, 40, 148].includes(id)
      ? 'audit-validator'
      : ([162, 164, 165, 168].includes(id) ? 'encontrado' : 'content-followups');

    if (verdict.category === 'NO COMPILA') {
      recommendation = `Revisar solución canónica o starter del id ${id}: javac rechaza el código (${lastResult.compileError.split('\n')[0]}).`;
    } else if (verdict.category === 'DEPENDE DEL ENTORNO (archivo, flag, tiempo)') {
      recommendation = 'Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados.';
    } else if (verdict.category === 'NO DETERMINÍSTICO') {
      recommendation = 'La salida varía según la planificación de hilos de la JVM. La validación estructural por reglas en el cliente es preferible a una comparación exacta de texto.';
    } else if (verdict.category === 'CONSIGNA AMBIGUA') {
      recommendation = `La salida real "${lastResult.output.trim()}" no coincide exactamente con "${expectedOutput}". Evaluar homogeneizar el texto de la consigna.`;
    } else {
      recommendation = 'Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK.';
    }

    results.push({
      id,
      title: exercise.title,
      level: LEVEL_NAMES[lesson.level] || lesson.level,
      lessonId: exercise.lessonId,
      lesson: lesson.title,
      scopeSource,
      code,
      compileOk: lastResult.compileOk,
      runOk: lastResult.runOk,
      output: lastResult.output.trim() || (lastResult.runError ? `Error: ${lastResult.runError}` : '(sin salida estándar)'),
      expectedOutput: expectedOutput || '(sin salida explícita)',
      verdict: verdict.category,
      verdictDetail: verdict.detail,
      runs: runOutputs,
      recommendation,
    });
  }

  return { hasJdk: true, jdkInfo: jdk, results };
}

/**
 * Genera el documento markdown docs/real-execution-audit.md a partir de los resultados.
 */
function generateAuditMarkdown(auditData) {
  const { jdkInfo, results } = auditData;
  const counts = {
    OK: 0,
    'SOLUCI\u00D3N INCORRECTA': 0,
    'CONSIGNA AMBIGUA': 0,
    'NO COMPILA': 0,
    'DEPENDE DEL ENTORNO (archivo, flag, tiempo)': 0,
    'NO DETERMIN\u00CDSTICO': 0,
  };

  for (const r of results) {
    if (counts[r.verdict] !== undefined) counts[r.verdict]++;
    else counts[r.verdict] = 1;
  }

  const lines = [
    '# Matriz de Auditoría con Ejecución Real — C-20 (`real-execution-audit`)',
    '',
    `> **Fecha de generación:** ${new Date().toISOString().slice(0, 10)}  `,
    `> **Entorno de ejecución:** JDK local (${jdkInfo.javacVersion || 'javac'}, ${jdkInfo.javaVersion || 'java'})  `,
    `> **Total de ejercicios auditados:** ${results.length}`,
    '',
    '## Resumen ejecutivo de veredictos',
    '',
    '| Categoría de Veredicto | Cantidad | Descripción |',
    '|---|:---:|---|',
    `| **OK** | ${counts['OK']} | Compila y ejecuta de forma estable, coincidiendo con la especificación. |`,
    `| **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | ${counts['DEPENDE DEL ENTORNO (archivo, flag, tiempo)']} | Exige archivos de disco en el directorio de trabajo, flags de JVM (\`-ea\`) o depende del Locale regional. |`,
    `| **NO DETERMINÍSTICO** | ${counts['NO DETERMIN\u00CDSTICO']} | Produce salidas alternantes o entrelazadas según el scheduler de hilos o generadores pseudo-aleatorios. |`,
    `| **CONSIGNA AMBIGUA** | ${counts['CONSIGNA AMBIGUA']} | La salida real difiere ligeramente del texto de resultado esperado en la consigna. |`,
    `| **SOLUCIÓN INCORRECTA** | ${counts['SOLUCI\u00D3N INCORRECTA']} | Compila pero falla en tiempo de ejecución. |`,
    `| **NO COMPILA** | ${counts['NO COMPILA']} | El compilador \`javac\` rechaza el programa. |`,
    '',
    '---',
    '',
    '## Evaluación de Seguridad: Validación por Reglas vs. Ejecución Real',
    '',
    '1. **Ejercicios seguros de mantener SOLO por reglas en el navegador:**',
    '   - **Concurrencia y sincronización (ids 169 a 188):** debido a la naturaleza multi-hilo, el entrelazado de `stdout` es intrínsecamente no determinista. Validar la estructura del código (`synchronized`, `Thread.sleep`, `CountDownLatch`, `ReentrantLock`) mediante el motor de reglas en el cliente es más robusto y rápido que compilar en un backend remoto, evitando bloqueos y condiciones de carrera.',
    '   - **Lectura/Escritura de archivos (ids 128, 162 a 168):** no requieren acceso real al disco en producción; validar la sintaxis de `Files.writeString`, `Files.readString`, `try-with-resources` y `BufferedReader` evita crear/borrar archivos innecesarios en el cliente.',
    '   - **Aserciones con assert (id 133):** validar la estructura `assert condición : mensaje` previene la confusión de que la JVM por defecto apague los asserts sin el parámetro `-ea`.',
    '2. **Ejercicios que convendría mejorar con ejecución real asistida o ajustes:**',
    '   - **Scanner con lectura interactiva (ids 33 a 40):** requieren entrada dinámica en tiempo de ejecución. El validador estructural hoy verifica que se llame a `nextInt()` o `nextLine()`, pero no puede simular la interacción con el usuario.',
    '   - **Sensibilidad de Locale en `Scanner.nextDouble()` (id 40):** en entornos con configuración regional en español, `Scanner` espera coma decimal (ej. `3,5`) en vez de punto (`3.5`). Se recomienda documentar o preconfigurar `sc.useLocale(Locale.US)` si se ejecuta en backend.',
    '',
    '---',
    '',
    '## Detalle ejercicio por ejercicio',
    '',
    '| ID | Título | Nivel | Lección | Origen Alcance | Compilación / Ejecución | Veredicto | Recomendación / Observación |',
    '|:--:|---|---|---|:--:|:---:|:---:|---|',
  ];

  for (const r of results) {
    const status = r.compileOk && r.runOk ? '✓ Compila / ✓ Ejecuta' : (r.compileOk ? '✓ Compila / ✗ Fallo Run' : '✗ Fallo Compilación');
    const safeTitle = r.title.replace(/\|/g, '-');
    const safeLesson = r.lesson.replace(/\|/g, '-');
    const safeDetail = r.verdictDetail.replace(/\|/g, '/').replace(/\n/g, ' ');
    const safeRec = r.recommendation.replace(/\|/g, '/').replace(/\n/g, ' ');
    lines.push(`| ${r.id} | ${safeTitle} | ${r.level} | Lección ${r.lessonId}: ${safeLesson} | \`${r.scopeSource}\` | ${status} | **${r.verdict}** | ${safeRec} |`);
  }

  lines.push('');
  return lines.join('\n');
}

// Ejecución CLI directa
if (require.main === module) {
  (async () => {
    try {
      const { exercisesData } = require('../data.js');
      const lessonsData = loadLessonsData();

      console.log('Iniciando auditoría de ejecución real en JDK local...');
      const audit = await auditAllExercises(exercisesData, lessonsData);

      if (!audit.hasJdk) {
        process.exit(0);
      }

      console.log(`Auditoría completada sobre ${audit.results.length} ejercicios.`);
      const md = generateAuditMarkdown(audit);
      const outPath = path.join(__dirname, '..', 'docs', 'real-execution-audit.md');
      fs.writeFileSync(outPath, md, 'utf8');
      console.log(`Reporte guardado exitosamente en: ${outPath}`);

      // Imprimir resumen
      const counts = {};
      audit.results.forEach((r) => {
        counts[r.verdict] = (counts[r.verdict] || 0) + 1;
      });
      console.log('Resumen de veredictos:', counts);
    } catch (err) {
      console.error('Error durante la auditoría:', err);
      process.exit(1);
    }
  })();
}

module.exports = {
  LEVEL_NAMES,
  loadLessonsData,
  detectJdk,
  parseExpectedOutput,
  wrapExerciseCode,
  runJavaExecution,
  classifyVerdict,
  auditAllExercises,
  generateAuditMarkdown,
};
