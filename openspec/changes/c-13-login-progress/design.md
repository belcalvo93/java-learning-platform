# Design: C-13 Login y Progreso en Cuenta

## Context

Ver `proposal.md` y `docs/auth-db-decision.md` (diseño arquitectónico de C-08).
La plataforma actualmente almacena el progreso exclusivamente en `localStorage` del navegador. Para habilitar sincronización multidispositivo sin comprometer el modo local ni la gratuidad del proyecto ($0/mes fijo en Firebase Spark), se requiere un módulo desacoplado de sincronización, reglas estrictas de Firestore y una capa de autenticación con degradación limpia.

## Goals / Non-Goals

**Goals:**
- Implementar `progress-sync.js` como módulo puro y determinista con el algoritmo `mergeProgress(local, remote)` y serializadores de `localStorage`.
- Crear `firestore.rules` con denegación por defecto, aislamiento estricto por `uid`, tope de tamaños y restricción de escalado de privilegios.
- Configurar `firebase-config.js` con valores vacíos (cero secretos) y detección de inicialización.
- Implementar carga diferida (*lazy loading*) de los scripts del SDK de Firebase (versión fija compat 9.22.0) solo si existe configuración y se abre el modal.
- Proveer en `auth.js` los métodos de registro, login (Email + Google), reset de contraseña, logout, exportación JSON y eliminación de cuenta/datos per Ley 25.326.
- Desarrollar la UI del modal de cuenta accesible (modo claro y oscuro) con aviso de privacidad y banner de sincronización.
- Documentar en `docs/firebase-setup.md` el instructivo paso a paso para la usuaria.

**Non-Goals:**
- Gating de niveles por examen (`C-15` / `C-19`).
- Panel de administración y agregados de métricas (`C-14`).
- Integración de IA o despliegue del ejecutor backend (`C-06`).
- Métodos de autenticación con Facebook u otros proveedores comerciales.

## Decisions

### 1. Módulo `progress-sync.js` desacoplado y 100% puro
- **Decisión:** Toda la lógica de serialización de `localStorage` y el algoritmo `mergeProgress(local, remote)` reside en `progress-sync.js`, compatible tanto con Node.js (`module.exports` para tests) como con el navegador (`window.ProgressSync`).
- **Alternativa descartada:** Mezclar la lógica de fusión dentro de `auth.js` o `script.js`. Se descartó para permitir pruebas unitarias exhaustivas con `node --test` sin emular DOM completo.

### 2. Algoritmo `mergeProgress(local, remote)` con unión monótona
- **Decisión:**
  - `completedLessons`: unión matemática de conjuntos, acotada al rango de enteros `1..52`.
  - `completedExercises`: unión matemática de conjuntos, acotada al rango de enteros `1..208`.
  - `evaluationResults`: para cada nivel (`beginner`, `intermediate`, `advanced`, `expert`):
    - `passed = Boolean(local.passed || remote.passed)` (aprobar un examen es irreversible).
    - `score = Math.max(local.score || 0, remote.score || 0)`.
    - `attempts = Math.max(local.attempts || 0, remote.attempts || 0)`.
    - `updatedAt = maxISO(local.updatedAt, remote.updatedAt)`.
  - Devuelve `{ merged, needsRemoteWrite }` donde `needsRemoteWrite` es `true` únicamente si el estado fusionado contiene elementos o puntajes que no estaban presentes en `remote`.
- **Alternativa descartada:** "Última escritura gana" (LWW). Se descartó porque causaría pérdida de ejercicios resueltos en otro dispositivo cuando los timestamps divergen.

### 3. Reglas de Firestore (`firestore.rules`)
- **Decisión:**
  - `users/{userId}`: `allow read, write, delete: if request.auth != null && request.auth.uid == userId`.
  - `isValidUserPayload`: valida campos permitidos, deniega expresamente `role` o `isAdmin`, exige que las listas no superen 52 y 208 elementos respectivamente.
  - `admins/{userId}`: `allow get: if isOwner(userId); allow write: if false;`.
  - `stats/{docId}`: `allow read: if isAdmin(); allow write: if false;`.
  - Resto denegado por defecto (`allow read, write: if false;`).

### 4. Carga diferida de Firebase y degradación elegante
- **Decisión:** `index.html` ya no incluye etiquetas fijas `<script src="https://www.gstatic.com/firebasejs/...">`. `firebase-config.js` se entrega con cadenas vacías. Si `isFirebaseConfigured()` es falso o no hay red, la plataforma opera puramente en local, y al hacer clic en el botón de cuenta se muestra un mensaje informativo que explica que la sincronización en la nube no está configurada aún en este despliegue.

### 5. Privacidad y Derechos de Acceso/Supresión (Ley 25.326)
- **Decisión:**
  - En registro se exige únicamente email, contraseña, nombre opcional, país opcional y checkbox obligatorio "Tengo 13 años o más". No se solicitan datos innecesarios (edad exacta, DNI, teléfono, provincia).
  - Botón "Descargar mis datos": descarga inmediata de un archivo `javamaster-datos-[uid].json` con los datos del usuario.
  - Botón "Eliminar mi cuenta y mis datos": borra el documento de Firestore y la cuenta de Firebase Auth tras cuadro de diálogo de confirmación.

## Risks / Trade-offs

- **[Agotamiento de cuota de escrituras Spark (20.000/día)]** → Mitigado mediante *debounce* de 1500 ms al registrar avances sucesivos, y suprimiendo escrituras si `needsRemoteWrite === false`.
- **[Usuario sin internet o Firebase caído]** → Mitigado manteniendo `localStorage` como caché local inmediata; el avance se guarda localmente y el sistema reintenta sincronizar al restablecerse la conexión.
- **[Escalamiento de privilegios a admin]** → Mitigado porque el rol `admin` no es un campo del documento `users/{uid}`, sino que reside en una colección separada `/admins/{uid}` inmutable desde clientes web.
