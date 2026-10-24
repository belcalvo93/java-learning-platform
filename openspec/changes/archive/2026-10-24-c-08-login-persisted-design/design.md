# Design — c-08-login-persisted-design

## Context

Ver `proposal.md` — Why. El relevamiento del código actual muestra:
- En `script.js` y `script-enhanced.js`, el progreso local usa tres estructuras en `localStorage`:
  1. `javaMasterProgress`: objeto JSON `{ "1": true, "2": true, ... }` para lecciones completadas (`1..52`).
  2. `exercise_${id}_completed`: string `'true'` por cada ejercicio resuelto (`1..208`).
  3. `evaluationResults`: objeto JSON `{ beginner: { score, passed, date }, intermediate: ..., advanced: ..., expert: ... }`.
- En `lesson-nav.js:16-18`, `LessonNav.isLevelAvailable(level)` ya es el punto único que consultan `LessonNav.isAvailable(kind, id)` y toda la navegación de tarjetas/botones.
- En `auth.js` y `firebase-config.js` existe un esqueleto no operativo pensado originalmente para Firebase, pero que tenía defectos de diseño importantes que `C-08` corrige antes de `C-13`:
  - En `auth.js:88`, al iniciar sesión sobrescribía `progressManager.progress = data.progress || {}` **pisando el avance previo de `localStorage`** si el usuario había practicado antes de loguearse.
  - En `auth.js:74`, al cerrar sesión vaciaba `progressManager.progress = {}` sin distinguir caché local ni sincronizar ejercicios (`exercise_${id}_completed`) ni evaluaciones (`evaluationResults`).
  - No contemplaba verificación de email, recuperación de contraseña, aviso de privacidad (Ley 25.326) ni reglas de seguridad de Firestore.

## Goals / Non-Goals

**Goals:**

- Evaluar con datos verificables 3 alternativas de proveedor Auth+DB con free-tier y registrar la decisión `DD-05` ("tomada por defecto, revertible").
- Especificar el esquema de datos exacto en Firestore (`users/{uid}` y `stats/global`) y su correspondencia directa con las 3 estructuras de `localStorage`.
- Definir el algoritmo puro y determinístico `mergeProgress(localState, remoteState)` para que la migración y sincronización jamás pierdan avance.
- Redactar las reglas de seguridad de referencia (`firestore.rules`), el aviso de privacidad conforme a la Ley 25.326 y las medidas anti-abuso y de protección de claves públicas.
- Desglosar `C-13` en tasks atómicas con TDD estricto y estimación de riesgo.

**Non-Goals:**

- Escribir o modificar código JS/HTML/CSS productivo o instalar SDKs (todo el código se implementa en `C-13`).
- Crear proyectos reales en consolas cloud externas durante este change.

## Decisions

1. **Elección de proveedor (`DD-05`, tomada por defecto, revertible): Firebase Auth + Cloud Firestore (Plan Spark)**:
   - **Por qué gana frente a Supabase Free y Appwrite Cloud Free**:
     - **Sin pausa por inactividad**: Supabase Free pausa automáticamente la base de datos tras **7 días sin consultas SQL**, dejando roto el login y el guardado hasta reactivación manual en el panel. Firebase Spark **no se pausa por inactividad**, algo decisivo para un sitio educativo estático en GitHub Pages (`RN-COS-01`).
     - **Sin tarjeta de crédito ni riesgo de facturación**: el plan Spark es 100 % gratuito sin tarjeta; incluye 50.000 MAUs, 1 GiB de almacenamiento, 50.000 lecturas/día y 20.000 escrituras/día. Guardando todo el estado del alumno en un único documento `users/{uid}`, cada sesión consume ~1 lectura al entrar y 1 escritura por avance completado.
     - **Cero backend propio**: funciona directo desde GitHub Pages mediante reglas declarativas (`firestore.rules`) y restricción de dominios autorizados (`java.belencalvo.me`).
   - **Mitigación de lock-in (reversibilidad)**: toda la interacción en `C-13` se encapsulará detrás de un adaptador `ProgressSyncAdapter` (`loadRemote()`, `saveRemote()`, `onAuthChange()`), de modo que el algoritmo `mergeProgress` y la UI no dependan directamente del SDK de Firebase.

2. **Documento único `users/{uid}` y prohibición de almacenar código del usuario**:
   - Cada usuario autenticado tiene un único documento `users/{uid}` con `completedLessons` (array de enteros `1..52`), `completedExercises` (array de enteros `1..208`), `evaluationResults` (mapa por nivel con `{ score, passed, attempts, updatedAt }`), `certificate` (metadatos de emisión cuando aprueba los 4 niveles) y `updatedAt`.
   - **No se almacena el código Java escrito por el estudiante**: reduce tamaño del documento a `< 2 KB`, elimina superficie de almacenamiento de texto libre y protege la privacidad.

3. **Fusión monótona sin pérdida (`mergeProgress`)**:
   - `completedLessons`: unión ordenada de conjuntos `Array.from(new Set([...local.completedLessons, ...remote.completedLessons]))` filtrada a enteros válidos `1..52`.
   - `completedExercises`: unión ordenada de conjuntos `Array.from(new Set([...local.completedExercises, ...remote.completedExercises]))` filtrada a enteros válidos `1..208`.
   - `evaluationResults[level]`: `passed = Boolean(local.passed || remote.passed)`, `score = Math.max(local.score || 0, remote.score || 0)`, `attempts = Math.max(local.attempts || 0, remote.attempts || 0)`, `date = fecha más reciente`.

4. **Rol `admin` fuera del alcance de escritura del cliente y métricas sin PII**:
   - Las reglas de Firestore prohíben que el usuario escriba un campo `role` en `users/{uid}`. El carácter de administradora se verifica mediante un documento de solo lectura en `admins/{uid}` (creado únicamente desde la consola de Firebase por Belén) o Custom Claim, y el panel futuro (`C-09`/`C-14`) solo lee el documento agregado `stats/global` (conteos por lección/nivel, sin emails ni listado de usuarios).

## Risks / Trade-offs

- **[Riesgo] Cuota diaria de escrituras de Firestore (20.000/día en Spark) si un script malicioso intenta escribir en bucle** → Mitigación: validación estricta en `firestore.rules` (tamaño y tipos de campos), exigencia de `request.auth.token.email_verified == true` para escrituras persistentes (o límite de tasa en cliente con *debounce* de 2 s) y Firebase App Check opcional.
- **[Trade-off] Al cerrar sesión en un dispositivo compartido, ¿qué pasa con `localStorage`?** → Mitigación: al hacer `signOut()`, se limpia la caché local del navegador (`javaMasterProgress`, `exercise_*_completed`, `evaluationResults`) tras confirmar que el estado ya está sincronizado en la nube, para no exponer el progreso de la cuenta al siguiente usuario de esa computadora pública; si un visitante vuelve a practicar sin sesión, empieza limpio en `localStorage`.

## Migration Plan

Este change solo agrega y actualiza documentación técnica y specs. El plan de implementación en código queda detallado en `docs/auth-db-decision.md` §6 para ejecutarse en `C-13`.
