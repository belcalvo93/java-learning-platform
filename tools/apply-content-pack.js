'use strict';
// Aplica content-pack/content-pack.json a script.js (contenido de lecciones)
// y data.js (lessonId, consigna y starter vacío de los ejercicios).
// Solo escribe esos campos: NO toca solution, hint, validation, title,
// difficulty ni ids. Uso: node tools/apply-content-pack.js [--check]
// Con --check no escribe nada: solo informa lo que cambiaría.

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const check = process.argv.includes('--check');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'content-pack', 'content-pack.json'), 'utf8'));

function tplEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}
function sqEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}

// ---- script.js: content de cada lección ----
let script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
let lessonsChanged = 0;
for (const [id, html] of Object.entries(pack.lessons)) {
  const start = script.indexOf(`id: ${id}, level:`);
  if (start < 0) throw new Error(`No encuentro la lección ${id} en script.js`);
  const c0 = script.indexOf('content: `', start);
  const c1 = script.indexOf('`', c0 + 10);
  // La lección siguiente no puede empezar antes del cierre: valida que no nos pasamos.
  const nextId = script.indexOf('id: ', start + 8);
  if (c0 < 0 || c1 < 0 || (nextId > 0 && c0 > nextId)) throw new Error(`Estructura inesperada en la lección ${id}`);
  script = script.slice(0, c0 + 10) + tplEscape(html) + script.slice(c1);
  lessonsChanged++;
}

// ---- data.js: ejercicios ----
let data = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
let exChanged = 0;
for (const [id, o] of Object.entries(pack.exercises)) {
  const re = new RegExp(`^(\\s*\\{ id: ${id}, lessonId: )\\d+(,.*)$`, 'm');
  const m = data.match(re);
  if (!m) throw new Error(`No encuentro el ejercicio ${id} en data.js`);
  let line = m[0];
  line = line.replace(new RegExp(`^(\\s*\\{ id: ${id}, lessonId: )\\d+`), `$1${o.lessonId}`);
  const dRe = /description: '((?:[^'\\]|\\.)*)'/;
  if (!dRe.test(line)) throw new Error(`Ejercicio ${id}: no encuentro description`);
  line = line.replace(dRe, () => `description: '${sqEscape(o.description)}'`);
  if (o.starterCode !== undefined) {
    const sRe = /starterCode: ''/;
    if (!sRe.test(line)) throw new Error(`Ejercicio ${id}: el starterCode no está vacío, no se toca`);
    line = line.replace(sRe, () => `starterCode: '${sqEscape(o.starterCode)}'`);
  }
  data = data.replace(m[0], () => line);
  exChanged++;
}

// ---- Verificación de invariantes antes de escribir ----
const vm = require('node:vm');
function loadExercises(src) {
  const sb = {}; vm.createContext(sb);
  vm.runInContext(`${src}\nthis.__r = exercisesData;`, sb);
  return JSON.parse(JSON.stringify(sb.__r));
}
function loadLessons(src) {
  const a = src.indexOf('const lessonsData = [');
  const b = src.indexOf('\n];', a) + 3;
  const sb = {}; vm.createContext(sb);
  vm.runInContext(`${src.slice(a, b)}\nthis.__r = lessonsData;`, sb);
  return JSON.parse(JSON.stringify(sb.__r));
}
const origEx = loadExercises(fs.readFileSync(path.join(root, 'data.js'), 'utf8'));
const newEx = loadExercises(data);
const origLe = loadLessons(fs.readFileSync(path.join(root, 'script.js'), 'utf8'));
const newLe = loadLessons(script);
const fail = (m) => { console.error('INVARIANTE ROTO: ' + m); process.exit(1); };
if (origEx.length !== newEx.length || newEx.length !== 208) fail('cantidad de ejercicios');
if (origLe.length !== newLe.length || newLe.length !== 52) fail('cantidad de lecciones');
origEx.forEach((o, i) => {
  const n = newEx[i];
  if (o.id !== n.id) fail(`orden/id del ejercicio ${o.id}`);
  for (const k of ['title', 'difficulty', 'solution', 'hint']) if (o[k] !== n[k]) fail(`ejercicio ${o.id}: cambió ${k}`);
  if (JSON.stringify(o.validation) !== JSON.stringify(n.validation)) fail(`ejercicio ${o.id}: cambió validation`);
  if (o.starterCode !== n.starterCode && o.starterCode !== '') fail(`ejercicio ${o.id}: cambió un starter no vacío`);
  if (Object.keys(o).sort().join() !== Object.keys(n).sort().join()) fail(`ejercicio ${o.id}: cambiaron los campos`);
});
origLe.forEach((o, i) => {
  const n = newLe[i];
  for (const k of ['id', 'level', 'module', 'title', 'description', 'duration']) if (o[k] !== n[k]) fail(`lección ${o.id}: cambió ${k}`);
  if (Object.keys(o).sort().join() !== Object.keys(n).sort().join()) fail(`lección ${o.id}: cambiaron los campos`);
  if (pack.lessons[o.id] !== undefined && n.content !== pack.lessons[o.id]) fail(`lección ${o.id}: el contenido no quedó idéntico al pack`);
});
console.log('Invariantes OK: ids, títulos, soluciones, pistas y validaciones intactos.');

console.log(`Lecciones: ${lessonsChanged}  Ejercicios: ${exChanged}  (${check ? 'solo verificación' : 'escrito'})`);
if (!check) {
  fs.writeFileSync(path.join(root, 'script.js'), script);
  fs.writeFileSync(path.join(root, 'data.js'), data);
}
