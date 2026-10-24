# Diseño de Login Opcional, Progreso Persistido en Cuenta y Privacidad (C-08)

> **Change**: `c-08-login-persisted-design`  
> **Cierra**: `PA-04` y diseño técnico de `PA-06` (`knowledge-base/10_preguntas_abiertas.md`)  
> **Registra**: Decisión `DD-05` en [`knowledge-base/09_decisiones_y_supuestos.md`](../knowledge-base/09_decisiones_y_supuestos.md) (*"tomada por defecto, revertible"*)  
> **Reglas rectoras**: `RN-PRO-01`, `RN-PRO-02`, `RN-PRO-03`, `RN-SEG-03`, `RN-COS-01`, `RN-CON-01`, `RN-CON-03`  
> **Alcance de C-08**: **SOLO DISEÑO**. La implementación en código corresponde a `C-13` (`login-y-progreso-en-cuenta`).

---

## 1. Comparación de proveedores Auth + Base de Datos en Free-Tier (`RN-COS-01`)

Se evalúan 3 proveedores serverless compatibles con un frontend 100 % estático alojado en **GitHub Pages (`https://java.belencalvo.me`)**, sin requerir un servidor intermedio propio (`RN-SEG-02`):

| Criterio | 1. Firebase Auth + Cloud Firestore (Plan Spark) — **RECOMENDADO** | 2. Supabase (Auth + PostgreSQL Free Plan) | 3. Appwrite Cloud (Plan Free) |
| --- | --- | --- | --- |
| **Costo mensual free-tier** | **\$0 / mes** fijo. **No exige tarjeta de crédito**; si se alcanza un tope diario, bloquea hasta medianoche UTC sin generar cargos ([Firebase Pricing](https://firebase.google.com/pricing)). | **\$0 / mes** sin tarjeta (máx. 2 proyectos activos por organización — [Supabase Pricing](https://supabase.com/pricing)). | **\$0 / mes** sin tarjeta (hasta 2 proyectos en Appwrite Cloud Free — [Appwrite Pricing](https://appwrite.io/pricing)). |
| **Límites del plan gratuito** | **Auth**: **50.000 MAU** (Email/Password + Google OAuth).<br>**Firestore**: **1 GiB** de datos, **50.000 lecturas/día**, **20.000 escrituras/día**, **20.000 borrados/día**, **10 GiB/mes** de salida de red. | **Auth**: **50.000 MAU**.<br>**Postgres**: **500 MB** de base de datos, **5 GB** de salida de red.<br>⚠️ **Pausa por inactividad**: **se pausa automáticamente tras 7 días sin consultas a la base de datos**. | **Auth**: **75.000 MAU**.<br>**Base de datos**: 1 DB, **2 GB** storage, **5 GB** ancho de banda.<br>⚠️ Proyectos gratuitos sujetos a límites de concurrencia e hibernación en inactividad prolongada. |
| **Disponibilidad continua sin mantenimiento** | **Alta (sin pausa por inactividad)**. Un proyecto Spark sigue activo aunque pasen semanas entre cursadas sin tráfico. | **Baja en períodos sin cursada**. Si durante 7 días nadie hace login/escritura en Postgres, el proyecto se apaga y el login da error hasta reactivarlo manualmente en el dashboard (o mantener un cron externo). | **Media**. Menor madurez de ecosistema en comparación con Firebase y Supabase. |
| **Cómo se protege cada dato (Reglas / RLS)** | **Firestore Security Rules** declarativas: `request.auth != null && request.auth.uid == userId`, con validación de campos, tipos y tamaño por documento. | **Row Level Security (RLS)** en PostgreSQL (`auth.uid() = user_id`) mediante políticas SQL por tabla. | **Permisos por documento/colección** (`Role.user(userId)`) configurables en consola. |
| **Dependencia de backend propio** | **Ninguna**. El SDK web se comunica directo con Firebase Auth y Firestore desde GitHub Pages. | **Ninguna** (PostgREST + GoTrue directo desde el navegador). | **Ninguna** (API REST / Web SDK directo desde el navegador). |
| **Facilidad con GitHub Pages y repo actual** | **Muy alta**. El repositorio ya contiene el diseño preliminar en [`firebase-config.js`](../firebase-config.js) y [`auth.js`](../auth.js); permite carga modular por ESM desde CDN oficial de Google sin bundler. | **Alta**, pero requiere reescribir toda la capa prevista en `auth.js` a SQL/PostgREST y configurar un *heartbeat* externo para evitar la pausa de 7 días. | **Media**. Requiere SDK específico y configuración CORS de plataforma en panel. |
| **Riesgo de lock-in y mitigación** | **Medio** (NoSQL documental y reglas propias). **Mitigación**: en `C-13` se encapsula detrás de una interfaz `ProgressSyncAdapter` de 4 métodos; todo el estado de un usuario es un único JSON de `< 2 KB` exportable. | **Bajo** (PostgreSQL estándar). | **Medio** (API propia de documentos). |

### 1.1 Recomendación y justificación (`DD-05` — tomada por defecto, revertible)
Se recomienda **Firebase Auth + Cloud Firestore (Plan Spark, \$0/mes)**:
1. **Cero pausas tras 7 días de inactividad**: a diferencia de Supabase Free (que apaga la base de datos tras 7 días sin consultas SQL), Firebase Spark permanece siempre en línea sin requerir *cron jobs* artificiales ni intervención manual de Belén.
2. **Costo \$0 garantizado sin tarjeta de crédito (`RN-COS-01`)**: el plan Spark no permite cargos sorpresa y ofrece 50.000 MAU, 50.000 lecturas/día y 20.000 escrituras/día.
3. **Consumo mínimo por estructura de documento único**: al guardar todo el progreso de cada estudiante en un único documento `users/{uid}`, iniciar sesión consume **1 lectura** y completar una lección/ejercicio/evaluación consume **1 escritura** (soportando hasta 20.000 avances diarios gratis).
4. **Sin backend propio (`RN-SEG-02`)**: funciona directo desde GitHub Pages (`https://java.belencalvo.me`) protegiendo cada documento con Firestore Security Rules y restricción de dominios autorizados.
5. **Reversibilidad**: la decisión queda registrada como `DD-05` (*"tomada por defecto, revertible"*). Como toda la lógica de negocio y fusión (`mergeProgress`) es JavaScript puro independiente del proveedor, cambiar a Supabase en el futuro solo implicaría reemplazar el adaptador de persistencia remota.

---

## 2. Modelo de Datos (`Usuario`, `Progreso`, `ResultadoEvaluacion`, `Certificado`, `Rol`)

### 2.1 Principio de funcionamiento dual (`localStorage` por defecto + cuenta opcional)
- **Sin sesión (modo por defecto, `RN-PRO-01`)**: la plataforma funciona igual que hoy usando únicamente `localStorage` y mostrando el aviso `"Tu progreso se guarda solo en este navegador"`.
- **Con sesión iniciada (`RN-PRO-03`)**: el documento `users/{uid}` en Firestore es la fuente de verdad persistida y `localStorage` actúa como caché local inmediata (para que la UI y `LessonNav.isLevelAvailable` respondan en `< 1 ms` sin esperar red).

### 2.2 Esquema de documentos en Firestore

#### A. Colección `users/{uid}` (1 documento por estudiante)
La clave del documento es exactamente el `uid` de Firebase Auth.

```json
{
  "email": "estudiante@ejemplo.com",
  "displayName": "Ana Pérez",
  "completedLessons": [1, 2, 3, 4],
  "completedExercises": [1, 2, 3, 4, 5, 9, 13],
  "evaluationResults": {
    "beginner": {
      "score": 85,
      "passed": true,
      "attempts": 2,
      "updatedAt": "2026-10-24T15:30:00.000Z"
    }
  },
  "certificate": {
    "issued": false,
    "issuedAt": null,
    "recipientName": null
  },
  "privacyAcceptedAt": "2026-10-24T14:00:00.000Z",
  "createdAt": "2026-10-24T14:00:00.000Z",
  "updatedAt": "2026-10-24T15:30:00.000Z"
}
```

#### Reglas de integridad del documento `users/{uid}`:
- **`completedLessons`**: arreglo ordenado sin duplicados de enteros en el rango `1..52` (máximo 52 elementos). Mapea 1 a 1 con las claves verdaderas de `javaMasterProgress` en `localStorage`.
- **`completedExercises`**: arreglo ordenado sin duplicados de enteros en el rango `1..208` (máximo 208 elementos). Mapea 1 a 1 con las claves `exercise_${id}_completed === 'true'` en `localStorage`.
- **`evaluationResults`**: objeto cuyas claves permitidas son únicamente `'beginner' | 'intermediate' | 'advanced' | 'expert'`. Cada entrada contiene:
  - `score`: entero `0..100` (el mayor puntaje obtenido por el estudiante en ese nivel).
  - `passed`: booleano (`true` una vez que superó el umbral de aprobación del nivel; nunca vuelve a `false`).
  - `attempts`: entero `>= 1` (cantidad acumulada de intentos rendidos).
  - `updatedAt`: timestamp ISO 8601.
- **`certificate`**: metadatos de finalización cuando los 4 niveles tienen `passed === true`.

#### B. Colección `admins/{uid}` (Asignación de rol `admin` — solo consola/servidor)
- **Por seguridad, el rol `admin` NUNCA es un campo escribible dentro de `users/{uid}`**.
- Un usuario tiene rol **`student`** por defecto.
- Un usuario tiene rol **`admin`** sí y solo si existe el documento `admins/{uid}` (creado manualmente por Belén en la consola de Firebase) o posee el custom claim `request.auth.token.admin == true`. `admins/{uid}` tiene `allow write: if false;` para todo cliente web.

#### C. Documento `stats/global` (Métricas agregadas para `C-09`/`C-14`, sin PII)
- Contiene únicamente contadores agregados (cantidad de completados por lección/nivel y evaluaciones aprobadas), sin emails ni identificadores personales, legible por el rol `admin`.

---

## 3. Flujos de Autenticación y Regla de Migración / Fusión (`mergeProgress`)

### 3.1 Flujos de cuenta (todos opcionales desde el botón de sesión en `.header`)
1. **Registro con Email y Contraseña (o Google OAuth)**:
   - El estudiante abre el modal opcional `"Guardar mi progreso en mi cuenta"`, marca la casilla de aceptación del aviso de privacidad (Ley 25.326) e ingresa email y contraseña (`>= 8` caracteres) o elige `"Continuar con Google"`.
   - Si se registra con email/contraseña, Firebase Auth crea la cuenta y envía automáticamente el correo de verificación (`sendEmailVerification()`).
   - Inmediatamente se ejecuta el **Flujo de Migración/Fusión (§3.2)** para subir cualquier progreso que el estudiante ya tuviera en `localStorage`.
2. **Inicio de sesión (`SignIn`)**:
   - El estudiante ingresa con su email/contraseña o Google.
   - Se lee `users/{uid}` desde Firestore, se fusiona con el estado local actual mediante `mergeProgress(localState, remoteState)` (§3.2), se actualiza `localStorage` y si la fusión agregó datos nuevos locales a la cuenta, se persiste el documento fusionado en `users/{uid}`.
   - El aviso de estado pasa de `"Tu progreso se guarda solo en este navegador"` a `"Progreso sincronizado en tu cuenta (email)"`.
3. **Verificación de email**:
   - Tras registrarse con email/contraseña, se muestra un banner no bloqueante: `"Te enviamos un enlace de verificación a tu correo"` con botón `"Reenviar correo"`.
   - Mientras el email no esté verificado, el estudiante puede seguir practicando normalmente; verificar el email consolida la cuenta para recuperación y emisión de certificado.
4. **Recuperación de contraseña**:
   - En el formulario de login, el enlace `"¿Olvidaste tu contraseña?"` solicita el email e invoca `sendPasswordResetEmail(auth, email)` mostrando siempre un mensaje neutro en español (`"Si el correo está registrado, recibirás un enlace para restablecer tu contraseña"` para no facilitar enumeración de cuentas).
5. **Cierre de sesión (`SignOut`)**:
   - Asegura que cualquier cambio pendiente se haya guardado en `users/{uid}`.
   - Limpia las claves de progreso de `localStorage` (`javaMasterProgress`, `exercise_*_completed`, `evaluationResults`) para proteger la privacidad del estudiante si estaba usando una computadora compartida (laboratorio, biblioteca).
   - Restaura el aviso `"Tu progreso se guarda solo en este navegador"`.

### 3.2 Algoritmo determinístico de fusión sin pérdida (`mergeProgress`)
**Problema que resuelve**: un estudiante puede haber resuelto las lecciones 1 a 5 sin cuenta en su celular (`localStorage`) y tener además una cuenta donde en su PC había resuelto las lecciones 3 a 8. Al iniciar sesión en el celular, **ninguno de los dos avances debe perderse**.

La función pura `mergeProgress(localState, remoteState)` aplica **unión monótona creciente**:

```js
/**
 * Regla de fusión sin pérdida (función pura para testear con TDD en C-13):
 * 1. Lecciones completadas: unión de conjuntos (1..52).
 * 2. Ejercicios completados: unión de conjuntos (1..208).
 * 3. Evaluaciones por nivel:
 *    - passed = Boolean(local.passed || remote.passed)  (aprobar es irreversible)
 *    - score  = Math.max(local.score || 0, remote.score || 0)
 *    - attempts = Math.max(local.attempts || 0, remote.attempts || 0)
 *    - updatedAt = fecha ISO más reciente entre local y remoto
 */
```

| Caso al iniciar sesión | Estado en `localStorage` | Estado en `users/{uid}` (Nube) | Resultado tras `mergeProgress` | ¿Escribe en Firestore? |
| --- | --- | --- | --- | --- |
| **1. Cuenta recién creada desde navegador con avance previo** | Lecciones `[1, 2]`, Ejercicios `[1..8]` | Documento no existe (`empty`) | Lecciones `[1, 2]`, Ejercicios `[1..8]` en ambos lados | **Sí** (migración inicial del avance local a la cuenta) |
| **2. Login en dispositivo nuevo (sin avance local)** | Vacío (`[]`) | Lecciones `[1..10]`, Ejercicios `[1..40]` | Lecciones `[1..10]`, Ejercicios `[1..40]` descargados a `localStorage` | **No** (ahorra escrituras: `remote` ya contiene todo) |
| **3. Avance distinto en navegador y en cuenta** | Lecciones `[1, 2]`, Eval `beginner: 70% (no aprobada)` | Lecciones `[2, 3]`, Eval `beginner: 85% (aprobada)` | Lecciones `[1, 2, 3]`, Eval `beginner: 85% (aprobada)` en ambos lados | **Sí** (solo porque la lección `1` local no estaba aún en la nube) |
| **4. Fallo de red / Firestore caído o cuota agotada** | Lecciones `[1..5]` | Inaccesible temporalmente | Conserva `localStorage` intacto, muestra aviso suave `"Sin conexión con la nube: tu avance se guardó en este navegador y se sincronizará luego"` | Reintenta en el próximo avance con sesión activa |

---

## 4. Seguridad, Reglas de Acceso y Privacidad (Ley 25.326 Argentina)

### 4.1 Minimización de datos: qué se guarda y qué NO se guarda
- **Qué SÍ se guarda en `users/{uid}`**:
  - `email` y `displayName` opcional (alias para el certificado).
  - IDs numéricos de lecciones completadas (`1..52`), IDs numéricos de ejercicios resueltos (`1..208`) y puntajes de evaluaciones por nivel (`score`, `passed`, `attempts`, `updatedAt`).
  - Timestamps de creación, actualización y aceptación del aviso de privacidad (`privacyAcceptedAt`).
- **Qué NO se guarda NUNCA**:
  1. **Contraseñas en claro ni hashes propios**: las contraseñas las gestiona exclusivamente Firebase Authentication (scrypt/bcrypt aislado de Firestore).
  2. **Código Java escrito por el usuario**: las soluciones escritas en el editor **no se envían ni se guardan en Firestore** (solo se guarda el número de ejercicio completado `1..208`). Esto evita almacenar texto libre arbitrario en la base de datos, mantiene cada documento en `< 2 KB` y elimina riesgos de inyección/XSS almacenado.
  3. **Datos sensibles, DNI, teléfono, dirección o geolocalización**: no se piden ni se almacenan.

### 4.2 Reglas de seguridad de Firestore (`firestore.rules` de referencia para `C-13`)
Denegación por defecto en toda la base de datos; cada usuario solo puede leer y escribir su propio documento `users/{uid}` con validación de esquema:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function isValidUserPayload(data) {
      return data.keys().hasOnly([
          'email', 'displayName', 'completedLessons', 'completedExercises',
          'evaluationResults', 'certificate', 'privacyAcceptedAt',
          'createdAt', 'updatedAt'
        ])
        && (!('role' in data))
        && (!('isAdmin' in data))
        && data.completedLessons is list
        && data.completedLessons.size() <= 52
        && data.completedExercises is list
        && data.completedExercises.size() <= 208
        && data.evaluationResults is map
        && data.evaluationResults.keys().hasOnly(['beginner', 'intermediate', 'advanced', 'expert']);
    }

    // Cada estudiante solo lee y escribe su propio documento validado.
    // Ni siquiera el admin lee documentos individuales de usuarios desde el cliente (privacidad).
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create, update: if isOwner(userId) && isValidUserPayload(request.resource.data);
      allow delete: if isOwner(userId); // Derecho de supresión (Ley 25.326)
    }

    // Colección de administradores: solo lectura para verificar el propio rol;
    // creación/edición exclusivamente desde la consola de Firebase (nunca desde cliente).
    match /admins/{userId} {
      allow get: if isOwner(userId);
      allow list, create, update, delete: if false;
    }

    // Métricas agregadas sin datos personales (para C-09 / C-14):
    match /stats/{docId} {
      allow read: if isAdmin();
      allow write: if false; // Solo actualizable por proceso autorizado / consola
    }

    // Denegación por defecto para cualquier otra ruta
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 4.3 Claves públicas en el frontend y protección contra abuso (`RN-SEG-03`)
- En Firebase, el objeto `firebaseConfig` (`apiKey`, `authDomain`, `projectId`, `appId`) contiene **identificadores públicos de ruteo** diseñados para ir en aplicaciones cliente web (no son secretos de servidor como era `GEMINI_API_KEY`).
- Para que esos identificadores públicos sean seguros en `https://java.belencalvo.me`:
  1. **Restricción de Dominios Autorizados en Firebase Auth**: habilitar únicamente `java.belencalvo.me` y `localhost` / `127.0.0.1` (cualquier otro dominio no puede iniciar flujos OAuth ni de autenticación).
  2. **Restricción de HTTP Referrer en Google Cloud Console (`Browser key`)**: limitar la `apiKey` pública de Firebase a los referrers `https://java.belencalvo.me/*` y `http://localhost:*/*`, y restringir las APIs habilitadas únicamente a *Identity Toolkit API*, *Token Service API* y *Cloud Firestore API*.
  3. **Debounce de escritura en cliente**: agrupar escrituras con un *debounce* de `1500 ms` y omitir `saveUserProgress` cuando el estado fusionado no cambió respecto de la última lectura, protegiendo la cuota gratuita de 20.000 escrituras/día.
  4. **Protección anti-enumeración en Firebase Auth**: activar la opción *Email enumeration protection* en la consola de Firebase Auth (por defecto activa en proyectos nuevos).

### 4.4 Aviso de Privacidad básico conforme a la Ley 25.326 (Argentina)
En el modal de registro/login se mostrará un aviso claro y conciso antes de crear la cuenta, junto con un botón `"Eliminar mi cuenta y mis datos"` dentro del perfil del usuario autenticado:

> **Aviso de Privacidad (Ley 25.326 — Protección de los Datos Personales)**:  
> Crear una cuenta es opcional; podés usar JavaMaster sin registrarte guardando tu avance en este navegador. Si creás una cuenta, únicamente almacenamos tu dirección de correo electrónico, tu nombre o alias opcional y la lista de lecciones, ejercicios y evaluaciones que completás, con la única finalidad de sincronizar tu progreso entre dispositivos. No guardamos el código que escribís en el editor ni compartimos tus datos con terceros. Como titular de los datos personales tenés la facultad de ejercer el derecho de acceso, rectificación y supresión de tus datos en forma gratuita en cualquier momento (incluyendo el botón *"Eliminar mi cuenta y mis datos"* disponible en tu perfil), conforme a la Ley N° 25.326. La Agencia de Acceso a la Información Pública (AAIP), en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.

---

## 5. Impacto e Integración con Otros Changes (`C-09`/`C-14`, `C-15`, `C-19` y `LessonNav`)

### 5.1 Conexión con `LessonNav.isLevelAvailable(level)` (`lesson-nav.js:16`)
En `C-11b` se centralizó toda la consulta de disponibilidad en [`LessonNav.isLevelAvailable(level)`](file:///c:/Users/beluu/Documents/java-learning-platform/lesson-nav.js#L16-L18) (invocada por [`LessonNav.isAvailable(kind, id, context)`](file:///c:/Users/beluu/Documents/java-learning-platform/lesson-nav.js#L45-L48)).
- **En `C-13` (login y progreso en cuenta)**: al iniciar sesión o al fusionar progreso (`mergeProgress`), el estado sincronizado actualiza inmediatamente las claves de caché en `localStorage` (`javaMasterProgress`, `exercise_${id}_completed`, `evaluationResults`) y expone un getter `progressStore.getEvaluationResults()`.
- **En `C-15` y `C-19` (gating por examen y nivel)**: para activar el bloqueo de niveles bastará con cambiar **únicamente el cuerpo de `LessonNav.isLevelAvailable(level)`** para que verifique:
  - `'beginner'`: siempre `true`.
  - `'intermediate'`: `evaluationResults.beginner?.passed === true` (o rol `admin`).
  - `'advanced'`: `evaluationResults.intermediate?.passed === true` (o rol `admin`).
  - `'expert'`: `evaluationResults.advanced?.passed === true` (o rol `admin`).
  Como `C-13` mantiene sincronizados `evaluationResults` entre la cuenta de Firestore y la caché local (y nunca permite que un examen aprobado vuelva a `false`), `LessonNav.isLevelAvailable(level)` funcionará sin cambios de interfaz tanto para usuarios logueados como para el modo local.

### 5.2 Conexión con `C-09` (`admin-metrics-design`) y `C-14` (`panel-admin`)
- El rol `admin` (definido en `admins/{uid}`) tendrá permiso en `firestore.rules` para leer `/stats/global` y para que `LessonNav.isLevelAvailable(level)` devuelva siempre `true` cuando la administradora esté autenticada (permitiéndole inspeccionar cualquier lección o ejercicio sin tener que rendir los exámenes previos).
- El diseño respeta la privacidad: el rol `admin` no lista ni lee documentos privados `/users/{userId}` de estudiantes individuales desde el navegador, sino únicamente métricas agregadas sin PII.

---

## 6. Plan de Implementación para `C-13` (`login-y-progreso-en-cuenta`)

> **Governance de `C-13`**: **ALTO** (requiere confirmación de Belén antes de escribir código productivo y despliegue manual de `firestore.rules` en su consola de Firebase).  
> **Orden recomendado**: de lógica pura sin red (Riesgo BAJO) → reglas de seguridad (Riesgo ALTO) → adaptador Auth/Firestore (Riesgo MEDIO) → UI y flujo de borrado de cuenta (Riesgo MEDIO).

| Task | Descripción | Criterio de aceptación | Tests TDD previstos (`node --test`) | Verificación manual | Riesgo y orden |
| --- | --- | --- | --- | --- | --- |
| **T-13.1** | **Módulo puro `progress-sync.js`: serialización de `localStorage` y algoritmo `mergeProgress(local, remote)`** | Lee/escribe las 3 estructuras actuales (`javaMasterProgress`, `exercise_${id}_completed`, `evaluationResults`), filtra IDs fuera de rango (`1..52` y `1..208`), calcula la unión monótona de lecciones/ejercicios, conserva `passed = local.passed \|\| remote.passed` y `Math.max(score)`, e indica con un flag `needsRemoteWrite` si la fusión agregó datos nuevos respecto de `remote`. | `tools/progress-sync.test.js`: 1) fusión con `remote` vacío migra todo lo local; 2) fusión con `local` vacío descarga todo sin marcar `needsRemoteWrite`; 3) unión disjunta y con solapamiento de lecciones y ejercicios; 4) evaluación aprobada en un lado nunca es pisada por una desaprobada del otro; 5) IDs inválidos (`0`, `999`, `"abc"`) son descartados. | Ninguna (100 % lógica pura determinista en Node). | **Orden 1 — Riesgo BAJO** |
| **T-13.2** | **Archivo `firestore.rules` y tests de contrato del esquema de seguridad** | `firestore.rules` en el repo implementa denegación por defecto, lectura/escritura solo para `request.auth.uid == userId`, prohibición de campos `role`/`isAdmin` en `users/{uid}`, tope de 52 lecciones y 208 ejercicios, `allow delete: if isOwner(userId)` (Ley 25.326), `/admins/{uid}` con `allow write: if false` y `/stats/{docId}` de solo lectura para `isAdmin()`. | `tools/firestore-rules.test.js`: valida la estructura de `firestore.rules` y testea en JS el validador de payload (`isValidUserPayload`) contra intentos de inyectar `role: "admin"`, listas > 208 ítems o claves desconocidas. | Pegar y publicar `firestore.rules` en la consola de Firebase y probar en el Rules Playground que `uid_A` no puede leer `users/uid_B` ni escribir `role: "admin"`. | **Orden 2 — Riesgo ALTO** |
| **T-13.3** | **Configuración pública en `firebase-config.js` y cliente modular con degradación limpia** | `firebase-config.js` expone la configuración pública del proyecto Firebase (documentada como pública y restringida por dominio `java.belencalvo.me`), con feature-flag automático: si la configuración no está cargada o la red falla, el sitio sigue 100 % operativo en modo local sin errores de consola. | `tools/auth-degradation.test.js`: verifica que sin red o sin SDK disponible, `authManager` opera en modo `local-only` sin lanzar excepciones no capturadas y sin contener claves privadas (`GEMINI_API_KEY`, `service_account`, `private_key`). | Abrir el sitio con DevTools en modo *Offline* y confirmar 0 errores de consola y funcionamiento normal de lecciones y ejercicios. | **Orden 3 — Riesgo MEDIO** |
| **T-13.4** | **Servicio `auth.js`: Registro, Login (Email + Google), Verificación de email, Reset de contraseña, Logout y Borrado de cuenta** | Implementa `signUp`, `signIn`, `signInWithGoogle`, `sendVerificationEmail`, `resetPassword`, `signOut` (limpiando caché local al salir para proteger equipos compartidos) y `deleteAccount` (borra `users/{uid}` y el usuario en Firebase Auth per Ley 25.326), disparando `mergeProgress` en cada inicio de sesión y *debounce* de 1,5 s al guardar avances. | `tools/auth-flow.test.js` (con mock del adaptador Firebase): prueba que `onAuthStateChanged` ejecuta `mergeProgress`, sube el resultado solo si `needsRemoteWrite === true`, actualiza `localStorage`, que `signOut` limpia las claves locales y que `deleteAccount` elimina documento y sesión. | Probar en navegador: 1) resolver 2 ejercicios sin sesión; 2) registrarse y verificar que los 2 ejercicios aparecen en Firestore; 3) cerrar sesión y comprobar que se limpia el navegador; 4) volver a iniciar sesión y comprobar que se recuperan los 2 ejercicios. | **Orden 4 — Riesgo ALTO** |
| **T-13.5** | **UI del modal de cuenta, banner de estado de sincronización y aviso de privacidad (Ley 25.326)** | Habilita el botón `"Guardar mi progreso / Iniciar sesión"` en `.header`, modal accesible (modo claro/oscuro, `>= 44 px` en móvil) con pestañas Iniciar sesión / Crear cuenta / Recuperar contraseña, casilla obligatoria del Aviso de Privacidad (Ley 25.326), indicador `"Progreso sincronizado en tu cuenta"` vs `"Tu progreso se guarda solo en este navegador"` y botón `"Eliminar mi cuenta y mis datos"`. | Extensión en `tools/browser-check.js`: verifica que sin sesión sigue visible `"Tu progreso se guarda solo en este navegador"`, que el modal de cuenta abre/cierra sin romper el layout a `360 px` y `1280 px`, que incluye el aviso de la Ley 25.326 y que hay 0 errores de consola. | Revisión visual en móvil (`360/390 px`) y escritorio (`1280 px`) en tema claro y oscuro. | **Orden 5 — Riesgo BAJO** |
