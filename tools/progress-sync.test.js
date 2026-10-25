/**
 * JavaMaster — Tests TDD para el módulo progress-sync.js (C-13)
 *
 * Verifica el algoritmo determinístico mergeProgress(local, remote),
 * la unión monótona de lecciones (1..52) y ejercicios (1..208),
 * la preservación irreversible de aprobaciones, y la serialización con localStorage.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ProgressSync = require('../progress-sync.js');
const { mergeProgress, serializeLocalStorage, applyMergedToLocalStorage } = ProgressSync;

describe('C-13 T-13.1: Algoritmo mergeProgress(local, remote)', () => {
  it('1. Fusión con remote vacío migra todo el avance local y marca needsRemoteWrite = true', () => {
    const local = {
      completedLessons: [1, 2, 5],
      completedExercises: [1, 2, 3, 4, 17, 18],
      evaluationResults: {
        beginner: { score: 85, passed: true, attempts: 1, updatedAt: '2026-10-24T10:00:00.000Z' }
      }
    };
    const remote = {
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {}
    };

    const { merged, needsRemoteWrite } = mergeProgress(local, remote);

    assert.equal(needsRemoteWrite, true, 'Debe indicar que requiere escritura remota');
    assert.deepEqual(merged.completedLessons, [1, 2, 5]);
    assert.deepEqual(merged.completedExercises, [1, 2, 3, 4, 17, 18]);
    assert.equal(merged.evaluationResults.beginner.passed, true);
    assert.equal(merged.evaluationResults.beginner.score, 85);
  });

  it('2. Fusión con local vacío descarga todo el avance remoto y marca needsRemoteWrite = false', () => {
    const local = {
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {}
    };
    const remote = {
      completedLessons: [1, 2, 3, 4],
      completedExercises: [1, 2, 3, 4, 5, 6, 7, 8],
      evaluationResults: {
        beginner: { score: 90, passed: true, attempts: 2, updatedAt: '2026-10-20T12:00:00.000Z' }
      }
    };

    const { merged, needsRemoteWrite } = mergeProgress(local, remote);

    assert.equal(needsRemoteWrite, false, 'No debe escribir en Firestore si remote ya tiene todo');
    assert.deepEqual(merged.completedLessons, [1, 2, 3, 4]);
    assert.deepEqual(merged.completedExercises, [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(merged.evaluationResults.beginner.score, 90);
  });

  it('3. Unión disjunta y con solapamiento sin duplicados y orden asc', () => {
    const local = {
      completedLessons: [1, 3, 5],
      completedExercises: [1, 2, 5, 9],
      evaluationResults: {}
    };
    const remote = {
      completedLessons: [2, 3, 6],
      completedExercises: [2, 5, 10, 11],
      evaluationResults: {}
    };

    const { merged, needsRemoteWrite } = mergeProgress(local, remote);

    assert.equal(needsRemoteWrite, true, 'Local aportó lecciones 1 y 5 no presentes en remote');
    assert.deepEqual(merged.completedLessons, [1, 2, 3, 5, 6]);
    assert.deepEqual(merged.completedExercises, [1, 2, 5, 9, 10, 11]);
  });

  it('4. Evaluación aprobada en un lado nunca es pisada por una desaprobada del otro', () => {
    const local = {
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {
        intermediate: { score: 60, passed: false, attempts: 3, updatedAt: '2026-10-24T18:00:00.000Z' }
      }
    };
    const remote = {
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {
        intermediate: { score: 80, passed: true, attempts: 2, updatedAt: '2026-10-22T12:00:00.000Z' }
      }
    };

    const { merged } = mergeProgress(local, remote);

    assert.equal(merged.evaluationResults.intermediate.passed, true, 'passed debe ser irreversiblemente true');
    assert.equal(merged.evaluationResults.intermediate.score, 80, 'score debe conservar el máximo');
    assert.equal(merged.evaluationResults.intermediate.attempts, 3, 'attempts debe conservar el máximo');
  });

  it('5. Filtra IDs espurios o fuera de rango (lecciones 1..52, ejercicios 1..208)', () => {
    const local = {
      completedLessons: [0, 1, 52, 53, 'foo', -1],
      completedExercises: [0, 1, 208, 209, 'bar', null],
      evaluationResults: {
        hacker_level: { score: 100, passed: true },
        beginner: { score: 70, passed: true }
      }
    };
    const remote = {
      completedLessons: [1, 999],
      completedExercises: [1, 1000],
      evaluationResults: {}
    };

    const { merged } = mergeProgress(local, remote);

    assert.deepEqual(merged.completedLessons, [1, 52]);
    assert.deepEqual(merged.completedExercises, [1, 208]);
    assert.equal(merged.evaluationResults.hacker_level, undefined, 'Nivel desconocido debe descartarse');
    assert.notEqual(merged.evaluationResults.beginner, undefined);
  });
});

describe('C-13 T-13.1: Serialización y aplicación en localStorage', () => {
  it('serializeLocalStorage extrae las tres estructuras del mock de storage', () => {
    const mockStorage = {
      javaMasterProgress: JSON.stringify({ 1: true, 2: true, 53: true, invalid: true }),
      exercise_1_completed: 'true',
      exercise_2_completed: 'true',
      exercise_999_completed: 'true',
      evaluationResults: JSON.stringify({
        beginner: { score: 80, passed: true }
      })
    };

    const serialized = serializeLocalStorage(mockStorage);

    assert.deepEqual(serialized.completedLessons, [1, 2]);
    assert.deepEqual(serialized.completedExercises, [1, 2]);
    assert.equal(serialized.evaluationResults.beginner.passed, true);
  });

  it('applyMergedToLocalStorage escribe las tres estructuras en el mock de storage', () => {
    const mockStorage = {};
    const merged = {
      completedLessons: [1, 4],
      completedExercises: [1, 2, 13],
      evaluationResults: {
        beginner: { score: 90, passed: true }
      }
    };

    applyMergedToLocalStorage(merged, mockStorage);

    const parsedProgress = JSON.parse(mockStorage.javaMasterProgress);
    assert.equal(parsedProgress['1'], true);
    assert.equal(parsedProgress['4'], true);
    assert.equal(mockStorage.exercise_1_completed, 'true');
    assert.equal(mockStorage.exercise_2_completed, 'true');
    assert.equal(mockStorage.exercise_13_completed, 'true');
    const parsedEval = JSON.parse(mockStorage.evaluationResults);
    assert.equal(parsedEval.beginner.score, 90);
  });
});
