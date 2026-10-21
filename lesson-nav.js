'use strict';
// C-11b lesson-exercise-nav: lógica pura de navegación por lección.
// Sin DOM ni almacenamiento: recibe los datos (ejercicios y lecciones) y
// devuelve resultados. Se usa en el navegador como `window.LessonNav` y en
// Node (tests) con `require('./lesson-nav.js')`.
(function (root) {
  const api = {};

  // Ejercicios de una lección, en el orden en que los trae `data.js`.
  api.getLessonExercises = function (exercises, lessonId) {
    return exercises.filter((e) => e.lessonId === lessonId);
  };

  // Única función de disponibilidad de lecciones y ejercicios. Hoy todo está
  // disponible; el bloqueo por nivel (C-19) se activa cambiando SOLO esta
  // función. La UI y `getLessonNav` la consultan siempre vía `api.isAvailable`.
  // kind: 'lesson' | 'exercise'.
  api.isAvailable = function (kind, id) { // eslint-disable-line no-unused-vars
    return true;
  };

  // Ids de las lecciones que no tienen ejercicios (lecciones de lectura).
  api.readingLessonIds = function (exercises, lessons) {
    const withExercises = new Set(exercises.map((e) => e.lessonId));
    return lessons.filter((l) => !withExercises.has(l.id)).map((l) => l.id);
  };

  // Ejercicios agrupados por lección, en el orden de las lecciones. Las
  // lecciones de lectura (sin ejercicios) no forman grupo.
  api.groupExercisesByLesson = function (exercises, lessons) {
    return lessons
      .map((lesson) => ({ lesson, exercises: api.getLessonExercises(exercises, lesson.id) }))
      .filter((g) => g.exercises.length > 0);
  };

  // Estado de navegación de un ejercicio dentro de su lección.
  api.getLessonNav = function (exercises, lessons, exerciseId) {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return null;
    const list = api.getLessonExercises(exercises, exercise.lessonId);
    const index = list.indexOf(exercise);
    const lessonIndex = lessons.findIndex((l) => l.id === exercise.lessonId);
    const lesson = lessonIndex >= 0 ? lessons[lessonIndex] : null;
    const nextLesson = lessonIndex >= 0 ? (lessons[lessonIndex + 1] || null) : null;
    const prev = list[index - 1] || null;
    const next = list[index + 1] || null;
    const isLastInLesson = next === null;
    let advance;
    if (next) advance = { type: 'exercise', target: next, available: api.isAvailable('exercise', next.id) === true };
    else if (nextLesson) advance = { type: 'lesson', target: nextLesson, available: api.isAvailable('lesson', nextLesson.id) === true };
    else advance = { type: 'none', target: null, available: false };
    return { exercise, lesson, exercises: list, index, total: list.length, prev, next, isLastInLesson, nextLesson, advance };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.LessonNav = api;
})(typeof window !== 'undefined' ? window : null);
