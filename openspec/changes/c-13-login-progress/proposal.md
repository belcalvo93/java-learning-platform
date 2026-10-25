# Proposal: C-13 Login y Progreso en Cuenta

## Why

JavaMaster opera actualmente en modo 100% local (`localStorage`), lo que implica que el progreso de un estudiante se pierde si cambia de navegador o dispositivo, o si borra los datos de navegación.
En `C-08` se diseñó la solución técnica para ofrecer autenticación opcional con Firebase Auth y Cloud Firestore (Plan Spark, $0/mes) sin comprometer el modo local por defecto ni la privacidad de los estudiantes.
Este change implementa ese diseño (tareas T-13.1 a T-13.5 de `CHANGES.md`), permitiendo sincronizar el progreso entre dispositivos mediante una fusión determinista y sin pérdida (`mergeProgress`), con aislamiento estricto por usuario y minimización de datos conforme a la Ley 25.326 de Protección de Datos Personales (Argentina).

## What Changes

- **Módulo de Fusión y Sincronización (`progress-sync.js`)**:
  - Función pura `mergeProgress(localState, remoteState)` que calcula la unión monótona de lecciones (`1..52`) y ejercicios (`1..208`), mantiene el estado de evaluaciones (`passed = local || remote`, `Math.max(score, attempts)`), filtra IDs inválidos y determina si se requiere escritura remota (`needsRemoteWrite`).
  - Serialización y deserialización bidireccional entre las claves de `localStorage` (`javaMasterProgress`, `exercise_${id}_completed`, `evaluationResults`) y el esquema de documento de Firestore (`users/{uid}`).
- **Reglas de Seguridad de Firestore (`firestore.rules`)**:
  - Denegación por defecto (`match /{document=**} { allow read, write: if false; }`).
  - Reglas para `users/{userId}`: lectura, creación/actualización y borrado permitidos únicamente al dueño (`request.auth.uid == userId`).
  - Validación estricta de estructura y tamaño de datos (`isValidUserPayload`): prohíbe inyectar `role` o `isAdmin`, restringe listas a <= 52 lecciones y <= 208 ejercicios, y restringe evaluaciones a los 4 niveles canónicos.
  - Reglas para `admins/{userId}`: solo lectura para el dueño (`allow get: if isOwner`), escritura bloqueada desde el cliente (`allow write: if false`).
  - Reglas para `stats/{docId}`: solo lectura para administradores (`isAdmin()`), escritura bloqueada desde cliente.
- **Configuración y Carga Diferida (`firebase-config.js`)**:
  - Archivo con valores vacíos (cero secretos).
  - Función de detección de configuración activa (`isFirebaseConfigured()`); si no está configurado, la plataforma opera en modo local sin cargar SDKs ni emitir errores.
  - Carga diferida (*lazy loading*) del SDK de Firebase (versión fija compat 9.22.0) solo cuando hay configuración activa y el usuario abre el modal de cuenta.
- **Gestor de Autenticación (`auth.js`)**:
  - Implementación de `AuthManager`: `signUp`, `signIn`, `signInWithGoogle` (sin Facebook), `sendVerificationEmail`, `resetPassword`, `signOut`, `exportUserData` y `deleteAccount`.
  - Registro con datos mínimos: email, nombre opcional, país opcional y checkbox obligatorio "Tengo 13 años o más" (sin edad exacta ni región, Ley 25.326).
  - Exportación de datos: botón "Descargar mis datos" (descarga en archivo JSON el perfil y progreso completo del usuario).
  - Supresión de datos: botón "Eliminar mi cuenta y mis datos" (elimina documento en Firestore y cuenta de Firebase Auth tras confirmación explícita).
  - `signOut`: limpia claves locales de progreso de `localStorage` para proteger terminales compartidas, restaurando el aviso de progreso local.
  - Guardado con *debounce* de 1500 ms y omisión de escrituras redundantes para proteger la cuota gratuita de 20.000 escrituras/día.
- **Interfaz de Usuario y Aviso de Privacidad (`index.html`, `styles.css`)**:
  - Botón de cuenta en el header de navegación.
  - Modal accesible de cuenta con navegación entre pestañas: Iniciar sesión / Crear cuenta / Recuperar contraseña / Perfil y datos.
  - Aviso de Privacidad en español claro conforme a la Ley 25.326, marcado explícitamente como "borrador pendiente de revisión de la usuaria".
  - Indicador dinámico de estado en `#local-only-notice`: "Tu progreso se guarda solo en este navegador." vs. "Progreso sincronizado en tu cuenta (email)".
- **Guía de Configuración para la Usuaria (`docs/firebase-setup.md`)**:
  - Documento paso a paso detallando la creación del proyecto en consola de Firebase, habilitación de Auth (Email/Password + Google), creación de Firestore, despliegue de `firestore.rules`, configuración de dominios autorizados (`java.belencalvo.me`), restricción de API key y reemplazo de valores en `firebase-config.js`.

## Capabilities

### New Capabilities

<!-- Ninguna capacidad nueva fuera del dominio de user-auth-progress -->

### Modified Capabilities

- `user-auth-progress`: Se extienden los requisitos para incorporar:
  - Carga diferida del SDK de Firebase condicionada a `firebase-config.js` no vacío.
  - Registro con datos mínimos (check obligatorio de 13+ años, nombre y país opcionales, sin edad exacta ni región per Ley 25.326).
  - Derechos de acceso y supresión: "Descargar mis datos" (JSON) y "Eliminar mi cuenta y mis datos" (eliminación en Firestore y Auth).
  - Métodos de autenticación: Email/Contraseña y Google (excluyendo expresamente Facebook).
  - Despliegue de reglas declarativas `firestore.rules` con denegación por defecto y validación de esquema.

## Impact

- **Archivos creados o modificados**:
  - `progress-sync.js` (nuevo módulo de lógica pura de progreso y fusión).
  - `firestore.rules` (nuevo archivo de reglas de seguridad).
  - `firebase-config.js` (reestructurado con valores vacíos, exportable y detección de configuración).
  - `auth.js` (reescrito con adaptador moderno, derechos Ley 25.326 y debounce).
  - `index.html` (modal de cuenta actualizado, carga diferida de SDKs y aviso de privacidad).
  - `styles.css` (estilos del modal de cuenta, pestañas, avisos y botones de derechos).
  - `docs/firebase-setup.md` (nueva guía de aprovisionamiento en consola para la usuaria).
  - `tools/progress-sync.test.js`, `tools/firestore-rules.test.js`, `tools/auth-flow.test.js` (nuevas suites de tests TDD).
  - `tools/browser-check.js` (nuevos casos de prueba para degradación limpia sin configuración).
- **Invariantes protegidos**:
  - 52 lecciones y 208 ejercicios intactos.
  - Lecciones 22, 25, 40 y 42 en modo solo lectura.
  - `config.js` y `validator.js` intactos.
  - Cero secretos en el repositorio (solo identificadores públicos vacíos).
  - Modo sin cuenta funcionando 100% igual que hoy con `localStorage`.
