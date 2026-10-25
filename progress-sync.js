/**
 * JavaMaster — Módulo de Sincronización y Fusión de Progreso (C-13)
 *
 * Provee funciones puras para:
 * 1. mergeProgress(local, remote): unión monótona creciente de lecciones y ejercicios,
 *    y conservación irreversible de resultados de evaluación.
 * 2. serializeLocalStorage(storage): lectura y normalización de claves del navegador.
 * 3. applyMergedToLocalStorage(merged, storage): escritura atómica de caché local.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ProgressSync = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VALID_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
  const MAX_LESSONS = 52;
  const MAX_EXERCISES = 208;

  /**
   * Filtra y normaliza un arreglo de enteros dentro del rango inclusivo [min, max].
   * Elimina duplicados y ordena ascendentemente.
   */
  function sanitizeIdList(list, min, max) {
    if (!Array.isArray(list)) return [];
    const set = new Set();
    for (const item of list) {
      const num = Number(item);
      if (Number.isInteger(num) && num >= min && num <= max) {
        set.add(num);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }

  /**
   * Compara dos fechas ISO y devuelve la más reciente o una fecha actual si alguna es inválida.
   */
  function maxIsoDate(dateA, dateB) {
    const timeA = dateA ? Date.parse(dateA) : 0;
    const timeB = dateB ? Date.parse(dateB) : 0;
    if (isNaN(timeA) && isNaN(timeB)) return new Date().toISOString();
    if (isNaN(timeA)) return dateB;
    if (isNaN(timeB)) return dateA;
    return timeA >= timeB ? dateA : dateB;
  }

  /**
   * Algoritmo de fusión monótona sin pérdida.
   *
   * @param {Object} localState
   * @param {Object} remoteState
   * @returns {{ merged: Object, needsRemoteWrite: boolean }}
   */
  function mergeProgress(localState, remoteState) {
    const local = localState || {};
    const remote = remoteState || {};

    const localLessons = sanitizeIdList(local.completedLessons, 1, MAX_LESSONS);
    const remoteLessons = sanitizeIdList(remote.completedLessons, 1, MAX_LESSONS);

    const localExercises = sanitizeIdList(local.completedExercises, 1, MAX_EXERCISES);
    const remoteExercises = sanitizeIdList(remote.completedExercises, 1, MAX_EXERCISES);

    // 1. Unión de lecciones
    const mergedLessonsSet = new Set([...localLessons, ...remoteLessons]);
    const mergedLessons = Array.from(mergedLessonsSet).sort((a, b) => a - b);

    // 2. Unión de ejercicios
    const mergedExercisesSet = new Set([...localExercises, ...remoteExercises]);
    const mergedExercises = Array.from(mergedExercisesSet).sort((a, b) => a - b);

    // 3. Fusión de evaluaciones
    const mergedEval = {};
    let evalNeedsRemoteWrite = false;

    const localEval = local.evaluationResults && typeof local.evaluationResults === 'object' ? local.evaluationResults : {};
    const remoteEval = remote.evaluationResults && typeof remote.evaluationResults === 'object' ? remote.evaluationResults : {};

    for (const level of VALID_LEVELS) {
      const l = localEval[level];
      const r = remoteEval[level];

      if (!l && !r) continue;

      const passed = Boolean((l && l.passed) || (r && r.passed));
      const score = Math.max(Number(l && l.score) || 0, Number(r && r.score) || 0);
      const attempts = Math.max(Number(l && l.attempts) || 0, Number(r && r.attempts) || 0);
      const updatedAt = maxIsoDate(l && (l.updatedAt || l.date), r && (r.updatedAt || r.date));

      mergedEval[level] = {
        passed,
        score,
        attempts,
        updatedAt
      };

      // Verificar si local aportó una mejora al registro remoto
      if (!r) {
        if (passed || score > 0 || attempts > 0) {
          evalNeedsRemoteWrite = true;
        }
      } else {
        if (passed && !r.passed) evalNeedsRemoteWrite = true;
        if (score > (Number(r.score) || 0)) evalNeedsRemoteWrite = true;
        if (attempts > (Number(r.attempts) || 0)) evalNeedsRemoteWrite = true;
      }
    }

    // Calcular si hay lecciones o ejercicios locales que no estaban en remote
    const remoteLessonSet = new Set(remoteLessons);
    const hasNewLessons = mergedLessons.some((id) => !remoteLessonSet.has(id));

    const remoteExerciseSet = new Set(remoteExercises);
    const hasNewExercises = mergedExercises.some((id) => !remoteExerciseSet.has(id));

    const needsRemoteWrite = hasNewLessons || hasNewExercises || evalNeedsRemoteWrite;

    return {
      merged: {
        completedLessons: mergedLessons,
        completedExercises: mergedExercises,
        evaluationResults: mergedEval
      },
      needsRemoteWrite
    };
  }

  /**
   * Extrae el progreso almacenado en localStorage.
   */
  function serializeLocalStorage(storage) {
    const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!s) {
      return { completedLessons: [], completedExercises: [], evaluationResults: {} };
    }

    // Lecciones
    const lessons = [];
    try {
      const rawLessons = s.getItem ? s.getItem('javaMasterProgress') : s.javaMasterProgress;
      if (rawLessons) {
        const parsed = typeof rawLessons === 'string' ? JSON.parse(rawLessons) : rawLessons;
        for (const [k, v] of Object.entries(parsed)) {
          if (v === true) {
            const num = Number(k);
            if (Number.isInteger(num)) lessons.push(num);
          }
        }
      }
    } catch (_) {}

    // Ejercicios
    const exercises = [];
    for (let id = 1; id <= MAX_EXERCISES; id++) {
      try {
        const key = `exercise_${id}_completed`;
        const val = s.getItem ? s.getItem(key) : s[key];
        if (val === 'true' || val === true) {
          exercises.push(id);
        }
      } catch (_) {}
    }

    // Evaluaciones
    let evalResults = {};
    try {
      const rawEval = s.getItem ? s.getItem('evaluationResults') : s.evaluationResults;
      if (rawEval) {
        evalResults = typeof rawEval === 'string' ? JSON.parse(rawEval) : rawEval;
      }
    } catch (_) {}

    return {
      completedLessons: sanitizeIdList(lessons, 1, MAX_LESSONS),
      completedExercises: sanitizeIdList(exercises, 1, MAX_EXERCISES),
      evaluationResults: evalResults
    };
  }

  /**
   * Guarda el progreso fusionado en localStorage.
   */
  function applyMergedToLocalStorage(mergedState, storage) {
    const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!s || !mergedState) return;

    // 1. Lecciones
    const progressMap = {};
    for (const id of mergedState.completedLessons || []) {
      progressMap[id] = true;
    }
    const progressJson = JSON.stringify(progressMap);
    if (s.setItem) {
      s.setItem('javaMasterProgress', progressJson);
    } else {
      s.javaMasterProgress = progressJson;
    }

    // 2. Ejercicios
    const exerciseSet = new Set(mergedState.completedExercises || []);
    for (let id = 1; id <= MAX_EXERCISES; id++) {
      const key = `exercise_${id}_completed`;
      if (exerciseSet.has(id)) {
        if (s.setItem) s.setItem(key, 'true');
        else s[key] = 'true';
      }
    }

    // 3. Evaluaciones
    const evalJson = JSON.stringify(mergedState.evaluationResults || {});
    if (s.setItem) {
      s.setItem('evaluationResults', evalJson);
    } else {
      s.evaluationResults = evalJson;
    }
  }

  return {
    VALID_LEVELS,
    MAX_LESSONS,
    MAX_EXERCISES,
    sanitizeIdList,
    mergeProgress,
    serializeLocalStorage,
    applyMergedToLocalStorage
  };
});
