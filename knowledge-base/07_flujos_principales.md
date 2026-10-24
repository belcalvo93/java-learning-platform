# Flujos Principales

## Flujo 1: Estudiar y practicar sin backend ni login (happy path por defecto)
**Disparador**: estudiante abre el sitio publicado (`https://java.belencalvo.me`). **Actor**: visitante / estudiante sin cuenta.
**Pasos**:
1. [Navegador] carga `index.html` + `data.js` + `script.js` + `validator.js` + `lesson-nav.js` desde GitHub Pages.
2. [Navegador] muestra el aviso `"Tu progreso se guarda solo en este navegador"` (`RN-PRO-01`) y lista los 4 niveles y 52 lecciones.
3. [Estudiante] abre una lección, lee la teoría y abre sus ejercicios.
4. [Estudiante] escribe su solución en el editor y pulsa `"Ejecutar y Validar"`.
5. [`validator.js`] evalúa estructuralmente por tokens localmente → devuelve feedback inmediato en español.
6. [Navegador] guarda el avance en `localStorage` (`javaMasterProgress`, `exercise_${id}_completed`, `evaluationResults`).
**Casos de error**:
- Solución incompleta → mensaje pedagógico en español + pista (sin mostrar la respuesta literal ni stacktrace crudo).
- `localStorage` lleno o bloqueado → aviso no bloqueante y la plataforma sigue funcionando en memoria durante la sesión.

---

## Flujo 2: Ejecución Java remota (DESHABILITADO en producción — DD-02)
**Disparador**: intento de ejecución cuando `BACKEND_URL` está vacío (estado permanente en GitHub Pages per `DD-02`).
**Pasos**:
1. [`java-executor.js`] detecta `BACKEND_URL === ''` sin realizar llamadas de red.
2. [Frontend] degrada transparentemente a `validator.js` (`95,2 % rules-only-ok` tras `C-18`).
3. [Entorno local de desarrollo con `backend/server.js` de `C-06`] Si un desarrollador levanta localmente el executor endurecido, valida `className` con allowlist, ejecuta `javac`/`java` vía `execFile` sin shell, con `env: {}`, `-Xmx64m`, timeout 5 s (`SIGKILL`), salida truncada a 10 KB y limpieza inmediata en `finally`.

---

## Flujo 3: Publicar contenido (administradora, vía Git)
**Disparador**: Belén actualiza una lección o ejercicio. **Actor**: administradora.
**Pasos**:
1. [Admin] edita archivos en rama local.
2. [Admin] ejecuta `node --test "tools/*.test.js"`, `node tools/audit-validator.js` (invariante 52/208) y `node tools/browser-check.js`.
3. [Admin] hace merge a `main` y GitHub Pages publica el sitio estático.

---

## Flujo 4: Autenticación opcional y sincronización de progreso en cuenta (diseño C-08 → implementa C-13)
**Disparador**: estudiante decide pulsar `"Guardar mi progreso / Iniciar sesión"` en el encabezado. **Actor**: estudiante con cuenta (`student`).  
**Documento de diseño**: [`docs/auth-db-decision.md`](../docs/auth-db-decision.md).

### 4.1 Registro de cuenta nueva y migración inicial desde `localStorage`
1. [Estudiante] abre el modal de cuenta, selecciona `"Crear cuenta"`, acepta el **Aviso de Privacidad (Ley 25.326)** e ingresa email + contraseña (`>= 8` caracteres) o pulsa `"Continuar con Google"`.
2. [Firebase Auth] crea el usuario (`uid`) y, si es email/contraseña, dispara `sendEmailVerification()`.
3. [`progress-sync.js`] lee el avance existente en `localStorage` (`javaMasterProgress`, `exercise_${id}_completed`, `evaluationResults`), construye el payload inicial con `mergeProgress(localState, emptyRemoteState)` y lo guarda en Firestore (`users/{uid}`).
4. [UI] actualiza el indicador a `"Progreso sincronizado en tu cuenta"` y muestra el aviso no bloqueante de verificación de correo si corresponde.

### 4.2 Inicio de sesión y fusión determinística sin pérdida (`mergeProgress`)
1. [Estudiante] inicia sesión con email/contraseña o Google en un dispositivo que puede tener (o no) progreso previo en `localStorage`.
2. [`auth.js`] obtiene el documento remoto `users/{uid}` desde Firestore.
3. [`progress-sync.js`] ejecuta `mergeProgress(localState, remoteState)`:
   - **Lecciones completadas (`1..52`)**: unión de conjuntos `local ∪ remote`.
   - **Ejercicios resueltos (`1..208`)**: unión de conjuntos `local ∪ remote`.
   - **Evaluaciones por nivel**: `passed = local.passed || remote.passed` y `score = Math.max(local.score, remote.score)`.
4. [Navegador] actualiza `localStorage` con el resultado fusionado y refresca las tarjetas de lección, barras de progreso y `LessonNav.isLevelAvailable(level)`.
5. [Firestore] **solo si la fusión incorporó datos locales que no estaban en la nube (`needsRemoteWrite === true`)**, escribe el documento fusionado en `users/{uid}` (ahorrando escrituras de la cuota gratuita).

### 4.3 Recuperación de contraseña
1. [Estudiante] pulsa `"¿Olvidaste tu contraseña?"` en el modal e ingresa su email.
2. [Firebase Auth] ejecuta `sendPasswordResetEmail(auth, email)`.
3. [UI] muestra siempre el mensaje neutro `"Si el correo está registrado, recibirás un enlace para restablecer tu contraseña"` (evitando enumeración de usuarios).

### 4.4 Cierre de sesión (`SignOut`) y supresión de cuenta (Ley 25.326)
- **Cerrar sesión**: confirma sincronización pendiente, cierra sesión en Firebase Auth, limpia las claves de progreso en `localStorage` (para no dejar expuestos los datos del alumno en una PC compartida) y restaura el aviso `"Tu progreso se guarda solo en este navegador"`.
- **Eliminar mi cuenta y mis datos (Derecho de supresión — Ley 25.326)**: tras confirmación explícita del usuario, elimina el documento `users/{uid}` en Firestore, elimina la cuenta en Firebase Auth (`user.delete()`) y limpia `localStorage`.
- **Fallo de red o cuota diaria agotada**: la plataforma nunca se bloquea; guarda el avance inmediatamente en `localStorage` y muestra un aviso suave indicando que se sincronizará cuando vuelva la conexión.
