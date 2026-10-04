'use strict';
// Guarda de calidad del contenido (change C-16): lecciones con contenido real,
// consignas claras con salida esperada y ejercicios colgados de la lección correcta.
const test = require('node:test');
const assert = require('node:assert');
const audit = require('./audit-validator.js');
const path = require('node:path');

const root = path.join(__dirname, '..');
const exercises = audit.loadExercises(root);
const fs = require('node:fs');
const vm = require('node:vm');
function loadLessonList() {
  const src = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  const a = src.indexOf('const lessonsData = [');
  const b = src.indexOf('\n];', a) + 3;
  const sb = {}; vm.createContext(sb);
  vm.runInContext(`${src.slice(a, b)}\nthis.__r = lessonsData;`, sb);
  return Array.from(sb.__r, (l) => ({ ...l }));
}
const lessons = loadLessonList();
const byId = new Map(lessons.map((l) => [l.id, l]));

test('52 lecciones y 208 ejercicios, cada ejercicio con una lección que existe', () => {
  assert.strictEqual(lessons.length, 52);
  assert.strictEqual(exercises.length, 208);
  for (const e of exercises) assert.ok(byId.has(e.lessonId), `ejercicio ${e.id}: lessonId ${e.lessonId} no existe`);
});

test('toda lección tiene contenido real: título, ¿para qué sirve?, mundo real, código y reglas', () => {
  for (const l of lessons) {
    const c = l.content;
    assert.ok(c.startsWith(`<h2>${l.title}</h2>`), `lección ${l.id}: debe empezar con su título`);
    assert.ok(c.length >= 500, `lección ${l.id}: contenido demasiado corto (${c.length})`);
    assert.ok(c.includes('info-box'), `lección ${l.id}: falta el cuadro "En el mundo real"`);
    assert.ok(c.includes('code-block'), `lección ${l.id}: falta un ejemplo de código`);
    assert.ok(!/<script|<style|<img|<a /i.test(c), `lección ${l.id}: HTML no permitido`);
  }
});

test('toda consigna es clara: ≥ 80 caracteres y dice qué resultado se espera', () => {
  for (const e of exercises) {
    assert.ok(e.description.length >= 80, `ejercicio ${e.id}: consigna corta`);
    assert.ok(/(Salida esperada|Resultado esperado)/.test(e.description), `ejercicio ${e.id}: no dice la salida/resultado esperado`);
    assert.ok(!/<(p|ul|ol|li|pre|div|h\d)[ >]/i.test(e.description), `ejercicio ${e.id}: HTML de bloque en la consigna`);
  }
});

test('un starter que es solo un comentario nunca aprueba la validación', () => {
  const validator = audit.loadValidatorClass ? audit.loadValidatorClass(root, exercises) : null;
  assert.ok(validator, 'no se pudo cargar el validador');
  const v = new validator();
  for (const e of exercises) {
    if (/^\/\/[^\n]*(\n\/\/[^\n]*)?$/.test(e.starterCode)) {
      assert.strictEqual(v.validate(e.starterCode, e.id).isValid, false, `ejercicio ${e.id}: el starter vacío ya pasa`);
    }
  }
});

test('ninguna consigna contiene la solución completa del ejercicio', () => {
  const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const norm = (s) => s.replace(/\s+/g, '');
  for (const e of exercises) {
    const texto = norm(unescapeHtml(e.description).replace(/<[^>]+>/g, ''));
    const solucion = norm(e.solution);
    if (solucion.length >= 8) {
      assert.ok(!texto.includes(solucion), `ejercicio ${e.id}: la consigna regala la solución completa`);
    }
  }
});
