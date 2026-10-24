# Modelo de Datos

## Dominios
- **Contenido educativo**: lecciones (52) y ejercicios (208) versionados en código (`data.js`, `script.js`).
- **Progreso local (v1.0 y modo sin cuenta por defecto)**: estado en `localStorage` del navegador (`RN-PRO-01`), que pasa a funcionar como caché inmediata cuando el estudiante inicia sesión (`RN-PRO-03`).
- **Progreso persistido en cuenta (diseño C-08 para implementar en C-13)**: documentos en Cloud Firestore (`users/{uid}`, `admins/{uid}`, `stats/global`) protegidos por reglas de seguridad declarativas (`firestore.rules`). Ver detalle completo en [`docs/auth-db-decision.md`](../docs/auth-db-decision.md).
- **Guías**: 4 HTML descargables (`guia-principiante.html`, `guia-intermedio.html`, `guia-avanzado.html`, `guia-experto.html`).

## ERD (Modo Dual: `localStorage` por defecto + Cuenta opcional en Firestore)

```
[Navegador: localStorage (por defecto / caché inmediata)]
  ├── javaMasterProgress: { "1": true, ... }          (lecciones 1..52)
  ├── exercise_<id>_completed: "true"                 (ejercicios 1..208)
  └── evaluationResults: { [level]: { score, passed, date } }
           │
           │  mergeProgress(local, remote) — unión monótona sin pérdida
           ▼
[Cloud Firestore (opcional con sesión iniciada — DD-05)]
  ├── users/{uid}        ← 1 documento por estudiante (dueño lee/escribe/borra solo el suyo)
  ├── admins/{uid}       ← rol admin (solo lectura cliente; escritura solo en consola Firebase)
  └── stats/global       ← métricas agregadas sin PII (solo lectura para rol admin en C-14)
```

## Entidades

### 1. Leccion (en código, no en DB)
- **Atributos**: `id` (`1..52`), `level` (`beginner` | `intermediate` | `advanced` | `expert`), `title`, `content` (HTML), `order`
- **Relaciones**: 1 lección → N ejercicios (salvo lecciones de lectura `[22, 25, 40, 42]`); 1 nivel → N lecciones (`15 / 15 / 12 / 10`)
- **Constraints**: IDs estables (`RN-CON-03`) para no romper progreso local ni en cuenta
- **Origen**: `script.js`

### 2. Ejercicio (en código, no en DB)
- **Atributos**: `id` (`1..208`), `lessonId` (`1..52`), `title`, `difficulty`, `description`, `starter`, `solution`, `hint`, `validation`
- **Relaciones**: N ejercicios → 1 lección
- **Constraints**: validación determinista y offline en `validator.js` (`RN-CON-02`)
- **Origen**: `data.js` (208 registros)

### 3. ProgresoLocal (`localStorage` — modo por defecto sin login y caché con login)
- **Claves reales en el navegador**:
  - `javaMasterProgress`: JSON `{ [lessonId: string]: true }`
  - `exercise_${exerciseId}_completed`: `'true'`
  - `evaluationResults`: JSON `{ [level]: { score: number, passed: boolean, date: string } }`
- **Constraints**: funciona 100 % offline; cuando no hay sesión activa muestra `"Tu progreso se guarda solo en este navegador"` (`RN-PRO-01`).

### 4. Usuario y ProgresoPersistido (`users/{uid}` en Cloud Firestore — diseño C-08 / implementa C-13)
- **Clave del documento**: `uid` de Firebase Authentication.
- **Atributos**:
  - `email` (`string`): correo de la cuenta.
  - `displayName` (`string | null`): nombre o alias opcional elegido por el estudiante (usado para el certificado).
  - `completedLessons` (`number[]`): arreglo ordenado sin duplicados de IDs de lecciones completadas (`1..52`, máx. 52 elementos).
  - `completedExercises` (`number[]`): arreglo ordenado sin duplicados de IDs de ejercicios resueltos (`1..208`, máx. 208 elementos).
  - `evaluationResults` (`Record<'beginner'|'intermediate'|'advanced'|'expert', ResultadoEvaluacion>`): resultados de examen por nivel.
  - `certificate` (`{ issued: boolean, issuedAt: string | null, recipientName: string | null }`): metadatos del certificado al aprobar los 4 niveles.
  - `privacyAcceptedAt`, `createdAt`, `updatedAt` (`string` ISO 8601 / timestamp).
- **Qué NO almacena nunca**: contraseñas (gestionadas por Firebase Auth) ni el código Java escrito por el estudiante en los ejercicios.

### 5. ResultadoEvaluacion (subestructura en `evaluationResults[level]`)
- **Atributos**:
  - `score` (`number`, `0..100`): máximo puntaje alcanzado en la evaluación del nivel.
  - `passed` (`boolean`): `true` si alcanzó o superó el puntaje mínimo de aprobación (`passingScore`); una vez `true`, nunca retrocede a `false`.
  - `attempts` (`number`, `>= 1`): cantidad de intentos realizados.
  - `updatedAt` (`string` ISO 8601).
- **Uso en bloqueo de niveles (`C-15` / `C-19`)**: es la fuente que consulta `LessonNav.isLevelAvailable(level)` para habilitar el nivel siguiente o permitir saltear un nivel rindiendo su examen.

### 6. Rol (`student` vs `admin`)
- **`student` (implícito por defecto)**: todo usuario autenticado en Firebase Auth cuyo documento vive en `users/{uid}`. Prohibido incluir un campo `role` o `isAdmin` dentro de `users/{uid}`.
- **`admin` (`admins/{uid}`)**: documento en la colección `/admins/{uid}` creado exclusivamente desde la consola de Firebase por Belén (`allow write: if false` en reglas). Otorga permiso de lectura sobre `/stats/global` y desbloqueo completo en `LessonNav.isLevelAvailable`.

## Regla de fusión sin pérdida (`mergeProgress(local, remote)`)
Al registrarse o iniciar sesión en un navegador que ya tiene datos en `localStorage`, se aplica unión monótona antes de actualizar `localStorage` y Firestore:
1. `completedLessons = union(local.completedLessons, remote.completedLessons)` (filtrado a enteros `1..52`).
2. `completedExercises = union(local.completedExercises, remote.completedExercises)` (filtrado a enteros `1..208`).
3. Por cada nivel en `evaluationResults`:
   - `passed = Boolean(local.passed || remote.passed)`
   - `score = Math.max(local.score || 0, remote.score || 0)`
   - `attempts = Math.max(local.attempts || 0, remote.attempts || 0)`
   - `updatedAt = maxISO(local.updatedAt, remote.updatedAt)`

## Seed data inicial
- Las 52 lecciones y 208 ejercicios son el seed estático en código (`data.js` / `script.js`).
- En Firestore no se requiere seed de usuarios; el documento `/admins/{uid}` de la administradora se carga una única vez desde la consola de Firebase en `C-13`/`C-14`.
