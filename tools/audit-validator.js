'use strict';
// Auditoría del validador offline (change c-01-validator-audit).
// SOLO LECTURA sobre data.js / validator.js / script.js: los carga con
// vm.runInNewContext + regex, sin modificar ningún archivo existente.
// Sin dependencias nuevas (solo módulos estándar de Node).

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const EXPECTED_EXERCISES = 208;
const EXPECTED_LESSONS = 52;
const EXPECTED_BY_LEVEL = { beginner: 15, intermediate: 15, advanced: 12, expert: 10 };

// El conteo de 52 lecciones viene de la lista de lecciones (script.js),
// NUNCA del campo lessonId de los ejercicios (ver checkInvariant).
const LESSON_IDS_TOTAL = 52;

// Un ejercicio exige ejecución real cuando su solución depende de
// semántica runtime (entrada interactiva, azar, args): ninguna regla
// estática de presencia de tokens puede decidirlo con fidelidad.
const NEEDS_EXECUTION_MARKERS = [
  'Scanner',
  'System.in',
  'nextInt(',
  'nextLine(',
  'nextDouble(',
  'hasNext',
  'Math.random',
  'new Random',
  'args[',
];

const CATEGORIES = ['rules-only-ok', 'needs-real-execution', 'rules-cheatable'];

function readRepoFile(repoRoot, name) {
  return fs.readFileSync(path.join(repoRoot, name), 'utf8');
}

function loadExercises(repoRoot) {
  const src = readRepoFile(repoRoot, 'data.js');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__exercises = exercisesData;`, sandbox, { filename: 'data.js' });
  // Array.from normaliza al realm host (los arrays creados dentro de vm
  // tienen otro prototipo y romperían deepStrictEqual en los tests).
  return Array.from(sandbox.__exercises, (e) => ({ ...e }));
}

function loadInnerValidator(repoRoot, exercises) {
  const src = readRepoFile(repoRoot, 'validator.js');
  const sandbox = { exercisesData: exercises, console };
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__JavaValidator = JavaValidator;`, sandbox, { filename: 'validator.js' });
  return sandbox.__JavaValidator;
}

// Adaptador: expone validate(code, exercise) aceptando objeto o id,
// porque JavaValidator.validate(code, exerciseId) necesita el exercisesData
// global para resolver el ejercicio.
function loadValidatorClass(repoRoot, exercises) {
  const Inner = loadInnerValidator(repoRoot, exercises);
  return class AuditValidator {
    constructor() {
      this.inner = new Inner();
    }
    validate(code, exerciseOrId) {
      const id = exerciseOrId && typeof exerciseOrId === 'object' ? exerciseOrId.id : exerciseOrId;
      return this.inner.validate(code, id);
    }
  };
}

function loadLessons(repoRoot) {
  const src = readRepoFile(repoRoot, 'script.js');
  const startMarker = 'const lessonsData = [';
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error('lessonsData no encontrado en script.js');
  const end = src.indexOf('\n];', start);
  if (end === -1) throw new Error('fin de lessonsData no encontrado en script.js');
  const block = src.slice(start, end);
  const byLevel = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
  for (const level of Object.keys(byLevel)) {
    byLevel[level] = (block.match(new RegExp(`level: '${level}'`, 'g')) || []).length;
  }
  const total = (block.match(/id: \d+, level:/g) || []).length;
  return { total, byLevel };
}

function checkInvariant(exercises, lessons) {
  const failures = [];
  const findings = [];
  if (exercises.length !== EXPECTED_EXERCISES) {
    failures.push(`ejercicios: esperados ${EXPECTED_EXERCISES}, encontrados ${exercises.length}`);
  }
  const ids = exercises.map((e) => e.id);
  const seen = new Set();
  const dupes = new Set();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  if (dupes.size > 0) failures.push(`ids duplicados: ${[...dupes].join(', ')}`);
  const missing = [];
  for (let i = 1; i <= EXPECTED_EXERCISES; i += 1) {
    if (!seen.has(i)) missing.push(i);
  }
  if (missing.length > 0) failures.push(`ids faltantes en 1-208: ${missing.join(', ')}`);
  if (lessons.total !== EXPECTED_LESSONS) {
    failures.push(`lecciones: esperadas ${EXPECTED_LESSONS}, encontradas ${lessons.total}`);
  }
  for (const [level, count] of Object.entries(EXPECTED_BY_LEVEL)) {
    if (lessons.byLevel[level] !== count) {
      failures.push(`nivel ${level}: esperado ${count}, encontrado ${lessons.byLevel[level]}`);
    }
  }
  // Las lecciones 51-52 existen en lessonsData pero no tienen ejercicios:
  // HALLAZGO reportado, no corrección (regla dura: contenido intacto).
  const lessonIdsWithExercises = new Set(exercises.map((e) => e.lessonId));
  const orphanLessonIds = [];
  for (let i = 1; i <= LESSON_IDS_TOTAL; i += 1) {
    if (!lessonIdsWithExercises.has(i)) orphanLessonIds.push(i);
  }
  if (orphanLessonIds.length > 0) {
    findings.push(
      `Lecciones sin ejercicios en data.js (lessonId ausentes): ${orphanLessonIds.join(', ')}. ` +
        'El conteo de 52 lecciones proviene de lessonsData en script.js, no del lessonId.',
    );
  }
  return { passed: failures.length === 0, failures, findings, orphanLessonIds };
}

function needsRealExecution(exercise) {
  const text = `${exercise.solution || ''}\n${exercise.starterCode || ''}`;
  return NEEDS_EXECUTION_MARKERS.some((m) => text.includes(m));
}

// Sonda (a): la solución esperada aparece solo como comentario,
// sin lógica real ejecutable.
function commentProbe(exercise) {
  const code = [
    '/* referencia archivada, sin logica ejecutable:',
    String(exercise.solution),
    '*/',
    'public class Vacia {',
    '}',
  ].join('\n');
  return { name: 'comentario-con-respuesta', code };
}

// Sonda (b): el patrón buscado existe pero dentro de código muerto
// (bloque if (false) jamás ejecutado) con semántica rota.
function deadCodeProbe(exercise) {
  const code = [
    'public class Truco {',
    '    static void truco() {',
    '        if (false) {',
    String(exercise.solution),
    '        }',
    '    }',
    '}',
  ].join('\n');
  return { name: 'codigo-muerto-con-patron', code };
}

// Sonda (c, solo reglas específicas ids 1-8): el patrón vive dentro de
// un literal de texto, semánticamente inerte.
function stringLiteralProbe(exercise) {
  const flat = String(exercise.solution).replace(/"/g, "'").replace(/\s+/g, ' ').trim();
  const code = [
    'public class Truco {',
    `    String archivo = "${flat}";`,
    '}',
  ].join('\n');
  return { name: 'literal-con-patron', code };
}

function buildProbes(exercise) {
  const probes = [commentProbe(exercise), deadCodeProbe(exercise)];
  if (exercise.id >= 1 && exercise.id <= 8) probes.push(stringLiteralProbe(exercise));
  return probes;
}

function probeFamilyCoverage() {
  return {
    'specific-1-8': ['comentario-con-respuesta', 'codigo-muerto-con-patron', 'literal-con-patron'],
    'default-9-208': ['comentario-con-respuesta', 'codigo-muerto-con-patron'],
  };
}

// Precedencia documentada:
// 1) marcadores runtime → needs-real-execution.
// 2) alguna sonda aceptada → rules-cheatable.
// 3) canónica aceptada y sondas rechazadas → rules-only-ok.
// 4) canónica rechazada y sondas rechazadas → needs-real-execution con nota
//    (la regla no acepta ni la solución real: sin ejecución no hay veredicto fiable).
function classifyExercise(exercise, validator) {
  if (needsRealExecution(exercise)) {
    return {
      category: 'needs-real-execution',
      canonicalAccepted: safeValidate(validator, exercise.solution, exercise),
      falseAccepts: [],
      note: 'requiere entrada/ejecución runtime (Scanner/azar/args)',
    };
  }
  const canonicalAccepted = safeValidate(validator, exercise.solution, exercise);
  const falseAccepts = [];
  for (const probe of buildProbes(exercise)) {
    if (safeValidate(validator, probe.code, exercise)) falseAccepts.push(probe.name);
  }
  if (falseAccepts.length > 0) {
    return {
      category: 'rules-cheatable',
      canonicalAccepted,
      falseAccepts,
      note: `sondas aceptadas falsamente: ${falseAccepts.join(', ')}`,
    };
  }
  if (canonicalAccepted) {
    return { category: 'rules-only-ok', canonicalAccepted, falseAccepts, note: 'regla rechaza sondas y acepta la canónica' };
  }
  return {
    category: 'needs-real-execution',
    canonicalAccepted,
    falseAccepts,
    note: 'la regla específica rechaza la solución canónica: sin ejecución real no hay veredicto fiable',
  };
}

function safeValidate(validator, code, exercise) {
  try {
    return validator.validate(code, exercise).isValid === true;
  } catch (e) {
    return false;
  }
}

function runAudit(repoRoot) {
  const exercises = loadExercises(repoRoot);
  const lessons = loadLessons(repoRoot);
  const invariant = checkInvariant(exercises, lessons);
  const ValidatorClass = loadValidatorClass(repoRoot, exercises);
  const results = exercises
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((ex) => {
      const verdict = classifyExercise(ex, new ValidatorClass());
      return {
        id: ex.id,
        lessonId: ex.lessonId,
        title: ex.title,
        category: verdict.category,
        canonicalAccepted: verdict.canonicalAccepted,
        falseAccepts: verdict.falseAccepts,
        note: verdict.note,
      };
    });
  const counts = { 'rules-only-ok': 0, 'needs-real-execution': 0, 'rules-cheatable': 0 };
  for (const r of results) counts[r.category] += 1;
  const findings = [...invariant.findings];
  for (const r of results.filter((r) => !r.canonicalAccepted)) {
    findings.push(`Id ${r.id} («${r.title}»): la regla actual rechaza la solución canónica.`);
  }
  const summary = {
    total: results.length,
    counts,
    cheatPercent: (counts['rules-cheatable'] / results.length) * 100,
    needsRealExecutionIds: results.filter((r) => r.category === 'needs-real-execution').map((r) => r.id),
  };
  return { invariant, lessons, results, summary, findings };
}

function sanitizeCell(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/').replace(/\n/g, ' ');
}

function renderMarkdown(auditResult) {
  const { results, summary, findings, invariant, lessons } = auditResult;
  const lines = [];
  lines.push('# Auditoría del validador offline (C-01)');
  lines.push('');
  lines.push('Matriz generada por `tools/audit-validator.js` (solo lectura sobre `data.js`,');
  lines.push('`validator.js` y `script.js`). No modifica contenido de lecciones/ejercicios.');
  lines.push('');
  lines.push('## Resumen');
  lines.push('');
  lines.push(`- Ejercicios auditados: ${summary.total}`);
  lines.push(`- rules-only-ok: ${summary.counts['rules-only-ok']}`);
  lines.push(`- needs-real-execution: ${summary.counts['needs-real-execution']}`);
  lines.push(`- rules-cheatable: ${summary.counts['rules-cheatable']}`);
  lines.push(`- % engañable (rules-cheatable / 208): ${summary.cheatPercent.toFixed(1)} %`);
  lines.push(`- Invariante 52/208: ${invariant.passed ? 'PASA' : 'FALLA'}`);
  lines.push(
    `- Lecciones: ${lessons.total} ` +
      `(beginner ${lessons.byLevel.beginner}, intermediate ${lessons.byLevel.intermediate}, ` +
      `advanced ${lessons.byLevel.advanced}, expert ${lessons.byLevel.expert})`,
  );
  lines.push(`- Lecciones sin ejercicios: ${invariant.orphanLessonIds.join(', ') || 'ninguna'}`);
  lines.push('');
  lines.push('## Ejercicios que exigen ejecución real (needs-real-execution)');
  lines.push('');
  lines.push(summary.needsRealExecutionIds.join(', '));
  lines.push('');
  lines.push('## Hallazgos de contenido (sin correcciones)');
  lines.push('');
  if (findings.length === 0) lines.push('- Ninguno.');
  for (const f of findings) lines.push(`- ${sanitizeCell(f)}`);
  lines.push('');
  lines.push('## Matriz por ejercicio');
  lines.push('');
  lines.push('| id | lessonId | título | categoría | canónica | nota |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const r of results) {
    lines.push(
      `| ${r.id} | ${r.lessonId} | ${sanitizeCell(r.title)} | ${r.category} | ` +
        `${r.canonicalAccepted ? 'sí' : 'no'} | ${sanitizeCell(r.note)} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const auditResult = runAudit(repoRoot);
  const outDir = path.join(repoRoot, 'docs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'validator-audit.md'), renderMarkdown(auditResult));
  const s = auditResult.summary;
  console.log(
    `Auditoría: total=${s.total} ok=${s.counts['rules-only-ok']} ` +
      `real=${s.counts['needs-real-execution']} cheat=${s.counts['rules-cheatable']} ` +
      `enganable=${s.cheatPercent.toFixed(1)}% invariante=${auditResult.invariant.passed ? 'PASA' : 'FALLA'}`,
  );
  if (!auditResult.invariant.passed) {
    console.error(`FALLA invariante: ${auditResult.invariant.failures.join(' | ')}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  EXPECTED_EXERCISES,
  EXPECTED_LESSONS,
  NEEDS_EXECUTION_MARKERS,
  CATEGORIES,
  loadExercises,
  loadValidatorClass,
  loadLessons,
  checkInvariant,
  needsRealExecution,
  buildProbes,
  probeFamilyCoverage,
  classifyExercise,
  runAudit,
  renderMarkdown,
};
