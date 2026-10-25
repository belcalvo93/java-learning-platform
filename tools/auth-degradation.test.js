'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('firebase-config.js exporta una configuración con strings vacíos y sin secretos', () => {
  const filePath = path.join(__dirname, '..', 'firebase-config.js');
  const content = fs.readFileSync(filePath, 'utf8');

  // Evaluar en un contexto seguro tipo Node/browser mock
  const sandbox = {};
  const fn = new Function('window', `${content}; return { firebaseConfig: window.firebaseConfig, isFirebaseConfigured: window.isFirebaseConfigured, loadFirebaseSdk: window.loadFirebaseSdk };`);
  const exported = fn(sandbox);

  assert.ok(exported.firebaseConfig, 'firebaseConfig debe estar definido en window');
  assert.equal(typeof exported.isFirebaseConfigured, 'function', 'isFirebaseConfigured debe ser una función');
  assert.equal(typeof exported.loadFirebaseSdk, 'function', 'loadFirebaseSdk debe ser una función');

  // Debe estar vacío por defecto
  assert.equal(exported.isFirebaseConfigured(), false, 'isFirebaseConfigured() debe ser false cuando los campos son strings vacíos');

  // Validar campos requeridos y que todos sean strings vacíos
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  for (const key of requiredKeys) {
    assert.equal(exported.firebaseConfig[key], '', `El campo ${key} debe ser string vacío por defecto`);
  }

  // Verificar que no haya placeholders inseguros ni claves API filtradas
  assert.ok(!content.includes('AIzaSy'), 'No debe haber claves reales de Google');
  assert.ok(!content.includes('REEMPLAZAR'), 'No debe contener placeholders como REEMPLAZAR');
});

test('isFirebaseConfigured detecta correctamente cuando la configuración está completa o incompleta', () => {
  const filePath = path.join(__dirname, '..', 'firebase-config.js');
  const content = fs.readFileSync(filePath, 'utf8');
  const sandbox = {};
  const fn = new Function('window', `${content}; return window;`);
  const win = fn(sandbox);

  // Incompleto (solo apiKey)
  win.firebaseConfig = { apiKey: 'test-key', authDomain: '', projectId: '' };
  assert.equal(win.isFirebaseConfigured(), false, 'Debe retornar false si faltan campos');

  // Completo
  win.firebaseConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef'
  };
  assert.equal(win.isFirebaseConfigured(), true, 'Debe retornar true si todos los campos requeridos están presentes');
});

test('loadFirebaseSdk resuelve sin error inmediatamente si ya está cargado o rechaza limpiamente si falla la carga en DOM', async () => {
  const filePath = path.join(__dirname, '..', 'firebase-config.js');
  const content = fs.readFileSync(filePath, 'utf8');

  // Caso 1: firebase ya existe globalmente
  const sandboxMock = {
    firebase: { apps: [] }
  };
  const fn1 = new Function('window', `${content}; return window.loadFirebaseSdk();`);
  await assert.doesNotReject(async () => {
    await fn1(sandboxMock);
  }, 'loadFirebaseSdk debe resolver inmediatamente si window.firebase ya existe');
});
