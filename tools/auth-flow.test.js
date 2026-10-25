'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Mock localStorage para Node.js
function createMockLocalStorage(initial = {}) {
  let store = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get _store() {
      return store;
    }
  };
}

// Mock Firebase SDK v9 compat
function createMockFirebase(options = {}) {
  const usersDb = new Map();
  const docInstances = new Map();
  let authStateCallback = null;
  let currentUser = null;
  let deleteMustFailWithRecentLogin = Boolean(options.failDeleteWithRecentLogin);
  let deleteMustFailPermanently = Boolean(options.failDeletePermanently);

  const emailAuthProvider = {
    credential(email, password) {
      return { providerId: 'password', email, password };
    }
  };

  const googleAuthProvider = class GoogleAuthProvider {};

  return {
    usersDb,
    apps: [{}],
    auth: Object.assign(() => ({
      get currentUser() { return currentUser; },
      onAuthStateChanged(cb) {
        authStateCallback = cb;
        if (currentUser) cb(currentUser);
      },
      async createUserWithEmailAndPassword(email, password) {
        if (!email.includes('@')) throw { code: 'auth/invalid-email' };
        if (password.length < 6) throw { code: 'auth/weak-password' };
        currentUser = {
          uid: 'uid-' + Math.random().toString(36).substring(2, 9),
          email,
          displayName: '',
          providerData: [{ providerId: 'password' }],
          async updateProfile(profile) {
            if (profile.displayName) this.displayName = profile.displayName;
          },
          async delete() {
            if (deleteMustFailWithRecentLogin) {
              deleteMustFailWithRecentLogin = false; // Solo falla la 1ra vez
              throw { code: 'auth/requires-recent-login' };
            }
            if (deleteMustFailPermanently) {
              throw { code: 'auth/network-request-failed', message: 'Fallo de red al eliminar usuario' };
            }
            currentUser = null;
            if (authStateCallback) authStateCallback(null);
          },
          async reauthenticateWithCredential(cred) {
            return { user: currentUser };
          },
          async reauthenticateWithPopup(provider) {
            return { user: currentUser };
          }
        };
        if (authStateCallback) authStateCallback(currentUser);
        return { user: currentUser };
      },
      async signInWithEmailAndPassword(email, password) {
        currentUser = {
          uid: 'uid-mock-123',
          email,
          displayName: 'Test User',
          providerData: [{ providerId: 'password' }],
          async delete() {
            if (deleteMustFailWithRecentLogin) {
              deleteMustFailWithRecentLogin = false;
              throw { code: 'auth/requires-recent-login' };
            }
            if (deleteMustFailPermanently) {
              throw { code: 'auth/network-request-failed', message: 'Fallo de red al eliminar usuario' };
            }
            currentUser = null;
            if (authStateCallback) authStateCallback(null);
          },
          async reauthenticateWithCredential(cred) {
            return { user: currentUser };
          },
          async reauthenticateWithPopup(provider) {
            return { user: currentUser };
          }
        };
        if (authStateCallback) authStateCallback(currentUser);
        return { user: currentUser };
      },
      async signInWithPopup(provider) {
        currentUser = {
          uid: 'uid-google-999',
          email: 'googleuser@gmail.com',
          displayName: 'Google User',
          providerData: [{ providerId: 'google.com' }],
          async delete() {
            if (deleteMustFailWithRecentLogin) {
              deleteMustFailWithRecentLogin = false;
              throw { code: 'auth/requires-recent-login' };
            }
            if (deleteMustFailPermanently) {
              throw { code: 'auth/network-request-failed', message: 'Fallo de red al eliminar usuario' };
            }
            currentUser = null;
            if (authStateCallback) authStateCallback(null);
          },
          async reauthenticateWithCredential(cred) {
            return { user: currentUser };
          },
          async reauthenticateWithPopup(prov) {
            return { user: currentUser };
          }
        };
        if (authStateCallback) authStateCallback(currentUser);
        return { user: currentUser };
      },
      async signOut() {
        currentUser = null;
        if (authStateCallback) authStateCallback(null);
      }
    }), {
      EmailAuthProvider: emailAuthProvider,
      GoogleAuthProvider: googleAuthProvider
    }),
    firestore: () => ({
      collection(colName) {
        return {
          doc(docId) {
            const key = `${colName}/${docId}`;
            if (docInstances.has(key)) {
              return docInstances.get(key);
            }
            const instance = {
              async get() {
                const exists = usersDb.has(key);
                return {
                  exists,
                  data: () => exists ? usersDb.get(key) : undefined
                };
              },
              async set(data, options = {}) {
                if (options.merge && usersDb.has(key)) {
                  usersDb.set(key, { ...usersDb.get(key), ...data });
                } else {
                  usersDb.set(key, { ...data });
                }
              },
              async delete() {
                usersDb.delete(key);
              }
            };
            docInstances.set(key, instance);
            return instance;
          }
        };
      }
    })
  };
}

test('AuthManager: signUp asume ageConfirmed: true por defecto con la línea legal y guarda perfil', async () => {
  const { AuthManager } = require('../auth.js');
  const mockStorage = createMockLocalStorage();
  const mockFirebase = createMockFirebase();

  const authMgr = new AuthManager({
    storage: mockStorage,
    firebase: mockFirebase,
    isConfigured: () => true
  });

  const res = await authMgr.signUp({
    email: 'estudiante@ejemplo.com',
    password: 'password123',
    displayName: 'Ana Gómez',
    country: 'Argentina'
    // Sin check explícito: por defecto es true per ítem 3
  });

  assert.equal(res.success, true, 'El registro debe ser exitoso');
  assert.ok(authMgr.currentUser, 'currentUser debe estar definido');
  assert.equal(authMgr.currentUser.email, 'estudiante@ejemplo.com');

  // Verificar perfil guardado en Firestore
  const savedDoc = mockFirebase.usersDb.get(`users/${authMgr.currentUser.uid}`);
  assert.ok(savedDoc, 'Debe existir el documento en Firestore');
  assert.equal(savedDoc.email, 'estudiante@ejemplo.com');
  assert.equal(savedDoc.displayName, 'Ana Gómez');
  assert.equal(savedDoc.country, 'Argentina');
  assert.equal(savedDoc.ageConfirmed, true);
  // Verificar que NO guarde fecha de nacimiento ni provincia/región (minimización)
  assert.equal(savedDoc.birthDate, undefined);
  assert.equal(savedDoc.region, undefined);
});

test('AuthManager: signIn y Google signIn disparan merge de progreso entre local y remoto', async () => {
  const { AuthManager } = require('../auth.js');
  const mockStorage = createMockLocalStorage({
    javaMasterProgress: JSON.stringify({ 1: true, 2: true }),
    exercise_1_completed: 'true'
  });
  const mockFirebase = createMockFirebase();

  // Simular progreso remoto previo en Firestore
  mockFirebase.usersDb.set('users/uid-mock-123', {
    email: 'user@test.com',
    progress: {
      completedLessons: [2, 3],
      completedExercises: [2]
    }
  });

  const authMgr = new AuthManager({
    storage: mockStorage,
    firebase: mockFirebase,
    isConfigured: () => true
  });

  const res = await authMgr.signIn('user@test.com', 'password123');
  assert.equal(res.success, true);

  // Comprobar que en localStorage local ahora están las lecciones {1: true, 2: true, 3: true}
  const mergedLessonsObj = JSON.parse(mockStorage.getItem('javaMasterProgress'));
  assert.equal(mergedLessonsObj['1'], true);
  assert.equal(mergedLessonsObj['2'], true);
  assert.equal(mergedLessonsObj['3'], true);

  // Comprobar que en Firestore también quedó la unión
  const updatedDoc = mockFirebase.usersDb.get('users/uid-mock-123');
  assert.deepEqual(updatedDoc.progress.completedLessons.sort(), [1, 2, 3]);
  assert.deepEqual(updatedDoc.progress.completedExercises.sort(), [1, 2]);
});

test('AuthManager: exportUserData genera JSON completo con progreso y metadatos', async () => {
  const { AuthManager } = require('../auth.js');
  const mockStorage = createMockLocalStorage({
    javamaster_completed_lessons: JSON.stringify([1]),
    exercise_passed_1: 'true'
  });
  const mockFirebase = createMockFirebase();

  const authMgr = new AuthManager({
    storage: mockStorage,
    firebase: mockFirebase,
    isConfigured: () => true
  });

  await authMgr.signIn('user@test.com', 'password123');
  const exported = await authMgr.exportUserData();

  assert.ok(exported, 'Debe retornar datos');
  assert.equal(exported.email, 'user@test.com');
  assert.ok(exported.exportedAt, 'Debe incluir timestamp de exportación');
  assert.ok(exported.progress, 'Debe incluir progreso');
});

test('AuthManager: deleteAccount elimina documento en Firestore y cuenta Auth con confirmación', async () => {
  const { AuthManager } = require('../auth.js');
  const mockStorage = createMockLocalStorage({
    javamaster_completed_lessons: JSON.stringify([1])
  });
  const mockFirebase = createMockFirebase();

  const authMgr = new AuthManager({
    storage: mockStorage,
    firebase: mockFirebase,
    isConfigured: () => true
  });

  await authMgr.signIn('delete-me@test.com', 'password123');
  const uid = authMgr.currentUser.uid;
  mockFirebase.usersDb.set(`users/${uid}`, { email: 'delete-me@test.com' });

  const res = await authMgr.deleteAccount();
  assert.equal(res.success, true);
  assert.equal(authMgr.currentUser, null, 'currentUser debe ser null tras borrar');
  assert.equal(mockFirebase.usersDb.has(`users/${uid}`), false, 'Documento en Firestore debe estar borrado');
});

test('AuthManager: deleteAccount ante auth/requires-recent-login solicita reautenticación y reintenta borrado limpio', async () => {
  const { AuthManager } = require('../auth.js');
  const mockStorage = createMockLocalStorage();
  const mockFirebase = createMockFirebase({ failDeleteWithRecentLogin: true });

  let promptCalled = false;
  const authMgr = new AuthManager({
    storage: mockStorage,
    firebase: mockFirebase,
    isConfigured: () => true,
    reauthPrompt: async (providerId) => {
      promptCalled = true;
      assert.equal(providerId, 'password');
      return { password: 'password123' };
    }
  });

  await authMgr.signIn('user@test.com', 'password123');
  const uid = authMgr.currentUser.uid;
  mockFirebase.usersDb.set(`users/${uid}`, { email: 'user@test.com', progress: {} });

  const res = await authMgr.deleteAccount();
  assert.equal(res.success, true, 'El borrado debe completar con éxito tras reautenticarse');
  assert.equal(promptCalled, true, 'Debe haber solicitado reautenticación');
  assert.equal(authMgr.currentUser, null, 'currentUser debe ser null');
  assert.equal(mockFirebase.usersDb.has(`users/${uid}`), false, 'Documento en Firestore debe estar borrado');
});

test('AuthManager: deleteAccount no deja estado a medias si falla el borrado en Auth', async () => {
  const { AuthManager } = require('../auth.js');
  const mockStorage = createMockLocalStorage();
  const mockFirebase = createMockFirebase({ failDeletePermanently: true });

  const authMgr = new AuthManager({
    storage: mockStorage,
    firebase: mockFirebase,
    isConfigured: () => true
  });

  await authMgr.signIn('user@test.com', 'password123');
  const uid = authMgr.currentUser.uid;
  const initialData = { email: 'user@test.com', progress: { completedLessons: [1] } };
  mockFirebase.usersDb.set(`users/${uid}`, initialData);

  const res = await authMgr.deleteAccount();
  assert.equal(res.success, false, 'Debe fallar reportando el error');
  assert.ok(authMgr.currentUser, 'currentUser no debe darse por eliminado si Auth falló');
  // Nunca estado a medias: si Auth no pudo borrar al usuario, no dar la cuenta por eliminada
  assert.match(res.error, /Fallo de red al eliminar usuario|Error al eliminar/);
});

test('AuthManager: debounce de guardado de progreso acumula llamadas rápidas', async () => {
  const { AuthManager } = require('../auth.js');
  const mockStorage = createMockLocalStorage();
  const mockFirebase = createMockFirebase();

  let saveCount = 0;
  const authMgr = new AuthManager({
    storage: mockStorage,
    firebase: mockFirebase,
    isConfigured: () => true,
    debounceMs: 50 // corto para el test
  });

  await authMgr.signIn('test@test.com', 'password123');

  // Sobrescribir para contar sets
  const docRef = mockFirebase.firestore().collection('users').doc(authMgr.currentUser.uid);
  const oldSet = docRef.set;
  docRef.set = async function(...args) {
    saveCount++;
    return oldSet.apply(this, args);
  };

  // Disparar 5 guardados seguidos
  authMgr.saveProgressDebounced();
  authMgr.saveProgressDebounced();
  authMgr.saveProgressDebounced();
  authMgr.saveProgressDebounced();
  authMgr.saveProgressDebounced();

  // Esperar a que pase el debounce
  await new Promise(r => setTimeout(r, 100));

  assert.equal(saveCount, 1, 'Debe haber ejecutado solo 1 guardado en Firestore');
});
