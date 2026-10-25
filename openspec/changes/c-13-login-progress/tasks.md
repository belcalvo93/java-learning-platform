# Tasks: C-13 Login y Progreso en Cuenta

## 1. Módulo de Progreso y Fusión Pura (T-13.1)

- [x] 1.1 Implementar `progress-sync.js` con las funciones puras `mergeProgress(local, remote)`, `serializeLocalStorage()` y `applyMergedToLocalStorage()`.
- [x] 1.2 Crear suite TDD `tools/progress-sync.test.js` verificando unión monótona de lecciones (1..52) y ejercicios (1..208), persistencia de aprobaciones, cálculo de `needsRemoteWrite` y filtrado de IDs espurios.

## 2. Reglas de Seguridad de Firestore (T-13.2)

- [x] 2.1 Crear `firestore.rules` con denegación por defecto, aislamiento estricto por `uid`, validación de campos y tamaños en `users/{uid}`, bloqueo de campos `role`/`isAdmin`, protección de `admins/{uid}` y lectura de `stats/{docId}`.
- [x] 2.2 Crear suite de pruebas estáticas de contrato `tools/firestore-rules.test.js` verificando la sintaxis de las reglas y la validación de payload `isValidUserPayload`.

## 3. Configuración y Carga Diferida (T-13.3)

- [x] 3.1 Actualizar `firebase-config.js` con valores vacíos (cero secretos), detección `isFirebaseConfigured()` y cargador asíncrono diferido de SDKs de Firebase (v9 compat).
- [x] 3.2 Crear suite TDD `tools/auth-degradation.test.js` verificando degradación limpia en ausencia de configuración o red sin errores de consola ni fugas de claves.

## 4. Servicio de Autenticación y Derechos del Usuario (T-13.4)

- [x] 4.1 Implementar en `auth.js` los métodos `signUp` (con check obligatorio 13+ años y datos mínimos), `signIn`, `signInWithGoogle` (sin Facebook), `resetPassword`, `signOut`, `exportUserData` ("Descargar mis datos" JSON) y `deleteAccount` ("Eliminar mi cuenta y mis datos" en Firestore y Auth).
- [x] 4.2 Crear suite de pruebas TDD `tools/auth-flow.test.js` con mocks del adaptador de Firebase para verificar flujos de registro, login, fusión, exportación y borrado.

## 5. UI de Cuenta, Privacidad y Documentación de Despliegue (T-13.5)

- [x] 5.1 Actualizar el modal de cuenta y el botón de acceso en `index.html` y `styles.css`: navegación por pestañas (login/registro/recuperación/perfil), campos mínimos, checkbox de 13+ años, aviso de privacidad (Ley 25.326) y botones de exportación/supresión.
- [x] 5.2 Conectar la sincronización de avance en `script.js` y `script-enhanced.js` mediante `progress-sync.js` asegurando que el modo local por defecto no sufra alteraciones.
- [x] 5.3 Redactar `docs/firebase-setup.md` con la guía paso a paso de aprovisionamiento en la consola de Firebase para la usuaria.
- [x] 5.4 Agregar casos de verificación visual y funcional en `tools/browser-check.js` (botón de cuenta accesible, aviso de modo local, degradación sin configuración y 0 errores JS en consola).
- [x] 5.5 Ejecutar suites de verificación completas (`node --test "tools/*.test.js"`, `browser-check.js`, `audit-validator.js`, `openspec validate --specs`).
