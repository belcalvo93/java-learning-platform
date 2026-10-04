'use strict';
// Aplica content-pack/description-fixes.json a data.js: solo cambia el campo
// description de los ejercicios listados. Uso: node tools/apply-description-fixes.js [--check]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const check = process.argv.includes('--check');
const fixes = JSON.parse(fs.readFileSync(path.join(root, 'content-pack', 'description-fixes.json'), 'utf8')).descriptions;
const sqEscape = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n');
const load = (src) => { const sb = {}; vm.createContext(sb); vm.runInContext(`${src}\nthis.__r = exercisesData;`, sb); return JSON.parse(JSON.stringify(sb.__r)); };

const before = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
let data = before;
for (const [id, desc] of Object.entries(fixes)) {
  const re = new RegExp(`^\\s*\\{ id: ${id}, lessonId: .*$`, 'm');
  const m = data.match(re);
  if (!m) throw new Error(`No encuentro el ejercicio ${id}`);
  const dRe = /description: '((?:[^'\\]|\\.)*)'/;
  if (!dRe.test(m[0])) throw new Error(`Ejercicio ${id}: sin description`);
  data = data.replace(m[0], () => m[0].replace(dRe, () => `description: '${sqEscape(desc)}'`));
}
const a = load(before), b = load(data);
if (a.length !== 208 || b.length !== 208) { console.error('INVARIANTE ROTO: cantidad'); process.exit(1); }
a.forEach((o, i) => {
  const n = b[i];
  for (const k of Object.keys(o)) {
    if (k === 'description' && fixes[o.id] !== undefined) { if (n.description !== fixes[o.id]) { console.error(`INVARIANTE ROTO: ${o.id} description`); process.exit(1); } continue; }
    if (JSON.stringify(o[k]) !== JSON.stringify(n[k])) { console.error(`INVARIANTE ROTO: ejercicio ${o.id} cambió ${k}`); process.exit(1); }
  }
});
console.log(`Invariantes OK. Consignas corregidas: ${Object.keys(fixes).length} (${check ? 'solo verificación' : 'escrito'})`);
if (!check) fs.writeFileSync(path.join(root, 'data.js'), data);
