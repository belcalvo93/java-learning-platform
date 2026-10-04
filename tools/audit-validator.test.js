'use strict';
// Tests TDD para la auditoría del validador (change c-01-validator-audit).
// Runner: node --test tools/*.test.js (sin dependencias nuevas).
// Estos tests se escribieron ANTES que tools/audit-validator.js (RED primero).

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const audit = require('./audit-validator.js');

// --- Helpers de sondas reales (verifican comportamiento, no tipos) ---

function realHarness() {
  const exercises = audit.loadExercises(REPO_ROOT);
  const ValidatorClass = audit.loadValidatorClass(REPO_ROOT, exercises);
  return { exercises, ValidatorClass };
}

describe('1. Invariante 52/208 (carga solo-lectura)', () => {
  test('1.1 carga 208 ejercicios con ids 1-208 únicos y contiguos', () => {
    const exercises = audit.loadExercises(REPO_ROOT);
    assert.equal(exercises.length, 208);
    const ids = exercises.map((e) => e.id).sort((a, b) => a - b);
    assert.deepStrictEqual(ids, Array.from({ length: 208 }, (_, i) => i + 1));
  });

  test('1.1 carga 52 lecciones con distribución 15/15/12/10 desde script.js', () => {
    const lessons = audit.loadLessons(REPO_ROOT);
    assert.equal(lessons.total, 52);
    assert.deepStrictEqual(lessons.byLevel, {
      beginner: 15,
      intermediate: 15,
      advanced: 12,
      expert: 10,
    });
  });

  test('1.3 triangula: detecta ids duplicados como fallo', () => {
    const exercises = audit.loadExercises(REPO_ROOT);
    const lessons = audit.loadLessons(REPO_ROOT);
    const dup = [...exercises, { ...exercises[0] }];
    const result = audit.checkInvariant(dup, lessons);
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes('duplicado')));
  });

  test('1.3 triangula: detecta hueco de ids como fallo', () => {
    const exercises = audit.loadExercises(REPO_ROOT);
    const lessons = audit.loadLessons(REPO_ROOT);
    const gap = exercises.filter((e) => e.id !== 100);
    const result = audit.checkInvariant(gap, lessons);
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes('100')));
  });

  test('1.3 triangula: lecciones 22, 25, 40 y 42 sin ejercicios se reportan como hallazgo (no fallo)', () => {
    const exercises = audit.loadExercises(REPO_ROOT);
    const lessons = audit.loadLessons(REPO_ROOT);
    const result = audit.checkInvariant(exercises, lessons);
    assert.equal(result.passed, true);
    assert.deepStrictEqual([...result.orphanLessonIds].sort((a, b) => a - b), [22, 25, 40, 42]);
    assert.ok(result.findings.some((f) => f.includes('22') && f.includes('42')));
  });
});

describe('2. Clasificador rules-only-ok / needs-real-execution / rules-cheatable', () => {
  // Fakes que aíslan la LÓGICA de decisión (no el dato real).
  function strictValidator() {
    return {
      validate: (code, exercise) =>
        code === exercise.solution
          ? { isValid: true, errors: [], warnings: [] }
          : { isValid: false, errors: ['rechazado'], warnings: [] },
    };
  }
  function laxValidator() {
    return { validate: () => ({ isValid: true, errors: [], warnings: [] }) };
  }
  const plain = (id) => ({
    id,
    lessonId: 1,
    title: `sintético ${id}`,
    solution: 'int edad = 25;',
  });

  test('2.1 rules-only-ok: canónica aceptada + sondas rechazadas (2 casos: regla específica y rama default)', () => {
    assert.equal(audit.classifyExercise(plain(3), strictValidator()).category, 'rules-only-ok');
    assert.equal(audit.classifyExercise(plain(150), strictValidator()).category, 'rules-only-ok');
  });

  test('2.1 rules-cheatable: al menos una sonda aceptada (2 casos: id 1-8 y rama default)', () => {
    assert.equal(audit.classifyExercise(plain(5), laxValidator()).category, 'rules-cheatable');
    assert.equal(audit.classifyExercise(plain(200), laxValidator()).category, 'rules-cheatable');
  });

  test('2.1 needs-real-execution: soluciones con entrada runtime (2 casos: nextInt y nextLine)', () => {
    const withInt = { ...plain(33), solution: 'Scanner sc = new Scanner(System.in);\nint edad = sc.nextInt();' };
    const withLine = { ...plain(34), solution: 'Scanner sc = new Scanner(System.in);\nString n = sc.nextLine();' };
    assert.equal(audit.classifyExercise(withInt, strictValidator()).category, 'needs-real-execution');
    assert.equal(audit.classifyExercise(withLine, strictValidator()).category, 'needs-real-execution');
  });

  test('2.1 needs-real-execution no se dispara sin marcadores runtime', () => {
    assert.equal(audit.needsRealExecution(plain(13)), false);
    assert.equal(audit.needsRealExecution({ ...plain(13), solution: 'int s = a + b;' }), false);
  });

  test('2.3 triangula con el validator real: canónica del 9 aceptada, sonda-comentario del 9 aceptada (cheatable)', () => {
    const { exercises, ValidatorClass } = realHarness();
    const ex9 = exercises.find((e) => e.id === 9);
    const v = new ValidatorClass();
    assert.equal(v.validate(ex9.solution, ex9).isValid, true);
    const probes = audit.buildProbes(ex9);
    assert.ok(probes.length >= 2);
    const accepted = probes.filter((p) => v.validate(p.code, ex9).isValid);
    assert.ok(accepted.length >= 1, 'la rama default por includes() debe aceptar al menos una sonda');
    assert.equal(audit.classifyExercise(ex9, new ValidatorClass()).category, 'rules-cheatable');
  });

  test('2.3 triangula con el validator real: canónica del 1 aceptada y ejercicio Scanner 33 exige ejecución real', () => {
    const { exercises, ValidatorClass } = realHarness();
    const ex1 = exercises.find((e) => e.id === 1);
    const ex33 = exercises.find((e) => e.id === 33);
    assert.equal(new ValidatorClass().validate(ex1.solution, ex1).isValid, true);
    assert.equal(audit.classifyExercise(ex33, new ValidatorClass()).category, 'needs-real-execution');
  });

  test('2.3 triangula: variante semánticamente rota es rechazada por el validator real (id 3)', () => {
    const { exercises, ValidatorClass } = realHarness();
    const ex3 = exercises.find((e) => e.id === 3);
    const broken = 'int edad = 99;\nSystem.out.println(edad);';
    assert.equal(new ValidatorClass().validate(broken, ex3).isValid, false);
  });
});

describe('3. Sondas de engaño (≥2 por familia, ≥3 fallan hoy)', () => {
  test('3.1 cada ejercicio 1-208 tiene ≥2 sondas y cada familia de reglas está cubierta', () => {
    const exercises = audit.loadExercises(REPO_ROOT);
    for (const ex of exercises) {
      const probes = audit.buildProbes(ex);
      assert.ok(probes.length >= 2, `id ${ex.id} sin ≥2 sondas`);
      assert.ok(probes.every((p) => typeof p.code === 'string' && p.code.length > 0));
      assert.ok(new Set(probes.map((p) => p.name)).size >= 2, `id ${ex.id} sin 2 nombres distintos`);
    }
    const coverage = audit.probeFamilyCoverage();
    const families = ['specific-1-8', 'default-9-208'];
    for (const f of families) {
      assert.ok((coverage[f] || []).length >= 2, `familia ${f} sin ≥2 plantillas`);
    }
  });

  test('3.2 al menos 3 sondas son aceptadas falsamente por el validator actual', () => {
    const { exercises, ValidatorClass } = realHarness();
    let falseAccepts = 0;
    for (const ex of exercises) {
      const v = new ValidatorClass();
      for (const probe of audit.buildProbes(ex)) {
        if (v.validate(probe.code, ex).isValid) falseAccepts += 1;
      }
    }
    assert.ok(falseAccepts >= 3, `solo ${falseAccepts} aceptaciones falsas`);
  });

  test('3.3 todo id 1-208 recibe veredicto (ningún ejercicio sin categoría)', () => {
    const { exercises, ValidatorClass } = realHarness();
    const maker = () => new ValidatorClass();
    const seen = new Set();
    for (const ex of exercises) {
      const verdict = audit.classifyExercise(ex, maker());
      assert.ok(['rules-only-ok', 'needs-real-execution', 'rules-cheatable'].includes(verdict.category));
      seen.add(ex.id);
    }
    assert.equal(seen.size, 208);
  });
});

describe('4. Auditoría completa + matriz docs/validator-audit.md', () => {
  test('4.2 consistencia matriz-vs-clasificador: 208 filas, resumen cuadra, hallazgos listados', () => {
    const auditResult = audit.runAudit(REPO_ROOT);
    assert.equal(auditResult.results.length, 208);
    const counts = { 'rules-only-ok': 0, 'needs-real-execution': 0, 'rules-cheatable': 0 };
    for (const r of auditResult.results) counts[r.category] += 1;
    assert.deepStrictEqual(counts, auditResult.summary.counts);
    assert.equal(
      counts['rules-only-ok'] + counts['needs-real-execution'] + counts['rules-cheatable'],
      208,
    );
    const md = audit.renderMarkdown(auditResult);
    const tableRows = md.split('\n').filter((l) => /^\| \d+ \|/.test(l));
    assert.equal(tableRows.length, 208);
    assert.ok(md.includes('51') && md.includes('52'), 'la matriz debe listar el hallazgo 51-52');
    assert.ok(md.includes('%'), 'el resumen debe incluir el % engañable');
  });

  test('4.1 el markdown incluye lista needs-real-execution y veredicto por ejercicio', () => {
    const auditResult = audit.runAudit(REPO_ROOT);
    const md = audit.renderMarkdown(auditResult);
    assert.ok(md.includes('needs-real-execution'));
    const needy = auditResult.results.filter((r) => r.category === 'needs-real-execution');
    assert.ok(needy.length >= 1, 'se espera al menos un ejercicio que exija ejecución real');
    for (const r of needy.slice(0, 3)) {
      assert.ok(md.includes(`| ${r.id} |`), `falta la fila del id ${r.id}`);
    }
  });
});

describe('5. Cierre e integración', () => {
  test('5.1 audit generado en disco: docs/validator-audit.md existe con 208 filas', () => {
    const mdPath = path.join(REPO_ROOT, 'docs', 'validator-audit.md');
    assert.ok(fs.existsSync(mdPath), 'docs/validator-audit.md no generado (correr node tools/audit-validator.js)');
    const md = fs.readFileSync(mdPath, 'utf8');
    assert.equal(md.split('\n').filter((l) => /^\| \d+ \|/.test(l)).length, 208);
  });
});
