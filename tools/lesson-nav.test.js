'use strict';
// C-11b lesson-exercise-nav: lógica pura de navegación por lección (TDD).
// Sin DOM: se carga `lesson-nav.js` en Node con los datos reales de
// `data.js` (ejercicios) y `script.js` (lecciones, solo el arreglo).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

function loadExercises() {
  const src = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const sb = {};
  vm.createContext(sb);
  vm.runInContext(`${src}\nthis.__r = exercisesData;`, sb, { filename: 'data.js' });
  return Array.from(sb.__r, (e) => ({ ...e }));
}

function loadLessons() {
  const src = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  const a = src.indexOf('const lessonsData = [');
  const b = src.indexOf('\n];', a) + 3;
  const sb = {};
  vm.createContext(sb);
  vm.runInContext(`${src.slice(a, b)}\nthis.__r = lessonsData;`, sb);
  return Array.from(sb.__r, (l) => ({ id: l.id, title: l.title, level: l.level }));
}

const exercises = loadExercises();
const lessons = loadLessons();
const LessonNav = require('../lesson-nav.js');

const idsOf = (lessonId) => exercises.filter((e) => e.lessonId === lessonId).map((e) => e.id);

describe('C-11b orden de ejercicios dentro de la lección', () => {
  it('getLessonExercises devuelve solo los ejercicios de la lección, en orden', () => {
    const list = LessonNav.getLessonExercises(exercises, 3);
    assert.deepStrictEqual(list.map((e) => e.id), idsOf(3));
    assert.ok(list.length >= 3, 'la lección 3 tiene varios ejercicios');
    assert.ok(list.every((e) => e.lessonId === 3));
  });

  it('una lección sin ejercicios devuelve lista vacía', () => {
    assert.deepStrictEqual(LessonNav.getLessonExercises(exercises, 22), []);
  });

  it('Siguiente en el primer ejercicio de la lección va al segundo de la MISMA lección', () => {
    const [first, second] = idsOf(3);
    const nav = LessonNav.getLessonNav(exercises, lessons, first);
    assert.strictEqual(nav.next.id, second);
    assert.strictEqual(nav.next.lessonId, 3);
    assert.strictEqual(nav.prev, null);
    assert.strictEqual(nav.index, 0);
    assert.strictEqual(nav.total, idsOf(3).length);
  });

  it('Anterior y Siguiente en un ejercicio del medio quedan dentro de la lección', () => {
    const ids = idsOf(3);
    const nav = LessonNav.getLessonNav(exercises, lessons, ids[1]);
    assert.strictEqual(nav.prev.id, ids[0]);
    assert.strictEqual(nav.next.id, ids[2]);
    assert.strictEqual(nav.isLastInLesson, false);
  });

  it('el siguiente es siempre de la misma lección, aunque el id global siguiente sea de otra', () => {
    let differsFromGlobal = 0;
    exercises.forEach((e, i) => {
      const nav = LessonNav.getLessonNav(exercises, lessons, e.id);
      const sameLesson = idsOf(e.lessonId);
      const pos = sameLesson.indexOf(e.id);
      const expected = pos + 1 < sameLesson.length ? sameLesson[pos + 1] : null;
      assert.strictEqual(nav.next ? nav.next.id : null, expected, `ejercicio ${e.id}`);
      if (nav.next) assert.strictEqual(nav.next.lessonId, e.lessonId);
      const globalNext = exercises[i + 1];
      if (globalNext && globalNext.lessonId !== e.lessonId) differsFromGlobal++;
    });
    assert.ok(differsFromGlobal > 0, 'los datos tienen cortes de lección en el orden global');
  });

  it('un ejercicio cuyo id global anterior es de otra lección no tiene Anterior', () => {
    const ids = idsOf(10);
    const nav = LessonNav.getLessonNav(exercises, lessons, ids[0]);
    assert.strictEqual(nav.prev, null);
  });
});

describe('C-11b fin de lección', () => {
  it('en el último ejercicio de la lección se ofrece la lección siguiente', () => {
    const ids = idsOf(3);
    const nav = LessonNav.getLessonNav(exercises, lessons, ids[ids.length - 1]);
    assert.strictEqual(nav.isLastInLesson, true);
    assert.strictEqual(nav.next, null);
    assert.strictEqual(nav.nextLesson.id, 4);
    assert.strictEqual(nav.advance.type, 'lesson');
    assert.strictEqual(nav.advance.target.id, 4);
  });

  it('en un ejercicio que no es el último, el avance es un ejercicio', () => {
    const ids = idsOf(3);
    const nav = LessonNav.getLessonNav(exercises, lessons, ids[0]);
    assert.strictEqual(nav.advance.type, 'exercise');
    assert.strictEqual(nav.advance.target.id, ids[1]);
  });

  it('antes de una lección de lectura, la lección siguiente es la de lectura (no se saltea)', () => {
    const ids = idsOf(21);
    const nav = LessonNav.getLessonNav(exercises, lessons, ids[ids.length - 1]);
    assert.strictEqual(nav.nextLesson.id, 22);
    assert.strictEqual(nav.advance.type, 'lesson');
    assert.strictEqual(nav.advance.target.id, 22);
  });

  it('en el último ejercicio de la última lección no hay avance', () => {
    const lastLesson = lessons[lessons.length - 1].id;
    const ids = idsOf(lastLesson);
    assert.ok(ids.length > 0, 'la última lección tiene ejercicios');
    const nav = LessonNav.getLessonNav(exercises, lessons, ids[ids.length - 1]);
    assert.strictEqual(nav.nextLesson, null);
    assert.strictEqual(nav.advance.type, 'none');
    assert.strictEqual(nav.advance.target, null);
  });

  it('un id de ejercicio inexistente devuelve null', () => {
    assert.strictEqual(LessonNav.getLessonNav(exercises, lessons, 99999), null);
  });
});

describe('C-11b lecciones de lectura y agrupado por lección', () => {
  it('readingLessonIds = lecciones sin ejercicios = [22, 25, 40, 42]', () => {
    assert.deepStrictEqual(LessonNav.readingLessonIds(exercises, lessons), [22, 25, 40, 42]);
  });

  it('readingLessonIds se deriva de los datos (no está fijo)', () => {
    const fakeLessons = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const fakeEx = [{ id: 10, lessonId: 1 }, { id: 11, lessonId: 3 }];
    assert.deepStrictEqual(LessonNav.readingLessonIds(fakeEx, fakeLessons), [2]);
  });

  it('groupExercisesByLesson cubre los 208 ejercicios sin omitir ni duplicar', () => {
    const groups = LessonNav.groupExercisesByLesson(exercises, lessons);
    const all = groups.flatMap((g) => g.exercises.map((e) => e.id));
    assert.strictEqual(all.length, 208);
    assert.strictEqual(new Set(all).size, 208);
    assert.deepStrictEqual([...all].sort((a, b) => a - b), exercises.map((e) => e.id).sort((a, b) => a - b));
  });

  it('los grupos siguen el orden de las lecciones y omiten las de lectura', () => {
    const groups = LessonNav.groupExercisesByLesson(exercises, lessons);
    const ids = groups.map((g) => g.lesson.id);
    assert.deepStrictEqual(ids, [...ids].sort((a, b) => a - b));
    assert.strictEqual(groups.length, 48);
    for (const r of [22, 25, 40, 42]) assert.ok(!ids.includes(r));
    for (const g of groups) assert.ok(g.exercises.every((e) => e.lessonId === g.lesson.id));
  });

  it('cada grupo conserva el orden de ejercicios de su lección', () => {
    const groups = LessonNav.groupExercisesByLesson(exercises, lessons);
    const g3 = groups.find((g) => g.lesson.id === 3);
    assert.deepStrictEqual(g3.exercises.map((e) => e.id), idsOf(3));
  });
});

describe('C-11b función única de disponibilidad', () => {
  it('hoy todo está disponible: toda lección y todo ejercicio', () => {
    for (const l of lessons) assert.strictEqual(LessonNav.isAvailable('lesson', l.id), true);
    for (const e of exercises) assert.strictEqual(LessonNav.isAvailable('exercise', e.id), true);
  });

  it('con el avance disponible, advance.available es true', () => {
    const ids = idsOf(3);
    assert.strictEqual(LessonNav.getLessonNav(exercises, lessons, ids[0]).advance.available, true);
    assert.strictEqual(LessonNav.getLessonNav(exercises, lessons, ids[ids.length - 1]).advance.available, true);
  });

  it('getLessonNav consulta isAvailable: si el siguiente ejercicio no está disponible, el avance no lo está', () => {
    const original = LessonNav.isAvailable;
    const ids = idsOf(3);
    try {
      LessonNav.isAvailable = (kind, id) => !(kind === 'exercise' && id === ids[1]);
      const nav = LessonNav.getLessonNav(exercises, lessons, ids[0]);
      assert.strictEqual(nav.advance.type, 'exercise');
      assert.strictEqual(nav.advance.available, false);
      // el resto no se ve afectado
      assert.strictEqual(LessonNav.getLessonNav(exercises, lessons, ids[1]).advance.available, true);
    } finally {
      LessonNav.isAvailable = original;
    }
  });

  it('getLessonNav consulta isAvailable para la lección siguiente en fin de lección', () => {
    const original = LessonNav.isAvailable;
    const ids = idsOf(3);
    try {
      LessonNav.isAvailable = (kind, id) => !(kind === 'lesson' && id === 4);
      const nav = LessonNav.getLessonNav(exercises, lessons, ids[ids.length - 1]);
      assert.strictEqual(nav.advance.type, 'lesson');
      assert.strictEqual(nav.advance.available, false);
    } finally {
      LessonNav.isAvailable = original;
    }
  });

  it('sin avance posible, available es false', () => {
    const ids = idsOf(lessons[lessons.length - 1].id);
    assert.strictEqual(LessonNav.getLessonNav(exercises, lessons, ids[ids.length - 1]).advance.available, false);
  });

  it('C-12 isLevelAvailable devuelve true hoy para los 4 niveles', () => {
    assert.strictEqual(typeof LessonNav.isLevelAvailable, 'function');
    for (const lvl of ['beginner', 'intermediate', 'advanced', 'expert']) {
      assert.strictEqual(LessonNav.isLevelAvailable(lvl), true);
    }
  });

  it('C-12 isAvailable y getLessonNav consultan isLevelAvailable cuando se bloquea un nivel (preparado para C-19)', () => {
    const origLevel = LessonNav.isLevelAvailable;
    try {
      LessonNav.isLevelAvailable = (lvl) => lvl !== 'intermediate';
      assert.strictEqual(LessonNav.isAvailable('lesson', 15, { lessons, exercises }), true);
      assert.strictEqual(LessonNav.isAvailable('lesson', 16, { lessons, exercises }), false);
      const ids15 = idsOf(15);
      const navEndBeginner = LessonNav.getLessonNav(exercises, lessons, ids15[ids15.length - 1]);
      assert.strictEqual(navEndBeginner.advance.type, 'lesson');
      assert.strictEqual(navEndBeginner.advance.target.id, 16);
      assert.strictEqual(navEndBeginner.advance.available, false);
    } finally {
      LessonNav.isLevelAvailable = origLevel;
    }
  });
});