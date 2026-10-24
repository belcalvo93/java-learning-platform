# Proposal — c-08-login-persisted-design (C-08 login-persisted-design)

> Nota de nombre: el roadmap la llama `C-08 login-persisted-design`; el CLI exige kebab-case en minúsculas, por eso el change vive como `c-08-login-persisted-design`.

## Why

La plataforma JavaMaster ya opera publicada en GitHub Pages (`C-07`) con validación estructural local (`C-18`), navegación por lección (`C-11b`), rediseño visual (`C-12`/`C-12b`) y executor endurecido en el repositorio (`C-05`/`C-06`). Actualmente todo el avance vive únicamente en `localStorage` (`RN-PRO-01`), por lo que el estudiante pierde su progreso si cambia de dispositivo o borra los datos del navegador, y el futuro bloqueo por nivel (`C-15`/`C-19`) carece de persistencia vinculada a una cuenta (`RN-PRO-03`). Antes de escribir código en `C-13` (`login-y-progreso-en-cuenta`, Governance ALTO), es necesario cerrar `PA-04` y diseñar la arquitectura completa de autenticación opcional, modelo de datos, reglas de seguridad, privacidad (Ley 25.326), migración/fusión desde `localStorage` y plan de tareas TDD, garantizando costo \$0 (`RN-COS-01`) y que la plataforma siga funcionando sin login por defecto.

## What Changes

- Crear el documento de diseño canónico `docs/auth-db-decision.md` con:
  1. **Comparativa de 3 proveedores free-tier** (Firebase Auth + Cloud Firestore Spark, Supabase Auth + PostgreSQL Free, Appwrite Cloud Free) y justificación de la recomendación (**Firebase Auth + Cloud Firestore**, registrada como `DD-05` "tomada por defecto, revertible").
  2. **Modelo de datos canónico**: `Usuario`, `Progreso` (`completedLessons` y `completedExercises`), `ResultadoEvaluacion` (`evaluationResults` por nivel), `Certificado` y `Rol` (`student` | `admin`), mapeado 1 a 1 con las claves actuales de `localStorage` (`javaMasterProgress`, `exercise_${id}_completed`, `evaluationResults`).
  3. **Flujos de usuario y algoritmo de fusión (`mergeProgress`)**: registro, login, verificación de email, recuperación de contraseña, cierre de sesión y migración/fusión determinística sin pérdida de avance cuando existen datos tanto en `localStorage` como en la cuenta remota.
  4. **Seguridad y privacidad**: minimización de datos (solo email y progreso; nunca contraseñas en claro ni código escrito por el usuario), reglas declarativas de Firestore (`firestore.rules` de referencia con denegación por defecto y prohibición de auto-otorgarse `admin`), restricción de dominios autorizados (`java.belencalvo.me`) y aviso de privacidad acorde a la Ley 25.326 (Argentina).
  5. **Integración con `C-09`/`C-14`, `C-15`, `C-19` y `LessonNav.isLevelAvailable(level)`**.
  6. **Plan de implementación de `C-13`** dividido en tasks chicas ordenadas por dependencia, con criterios de aceptación, tests TDD previstos, verificación manual y estimación de riesgo.
- Actualizar la Knowledge Base del proyecto:
  - `knowledge-base/09_decisiones_y_supuestos.md`: registrar `DD-05` ("tomada por defecto, revertible").
  - `knowledge-base/04_modelo_de_datos.md`: documentar esquemas de `Usuario`, `Progreso`, `ResultadoEvaluacion`, `Certificado` y regla de fusión `localStorage` ↔ nube.
  - `knowledge-base/03_actores_y_roles.md`: detallar RBAC (`visitante`, `student`, `admin` de solo lectura de métricas agregadas).
  - `knowledge-base/07_flujos_principales.md`: detallar el Flujo 4 (autenticación opcional y fusión de progreso).
  - `knowledge-base/10_preguntas_abiertas.md`: marcar `PA-04` y `PA-06` como resueltas en diseño y consolidar al final únicamente las decisiones de producto que corresponden a Belén con recomendación explícita.
- **Explícito NO-alcance**: cero cambios en código productivo (`config.js`, `auth.js`, `firebase-config.js`, `script.js`, `script-enhanced.js`, `lesson-nav.js`, `validator.js`, `data.js`, `backend/`), cero instalación de SDKs/librerías y cero creación de cuentas externas en este change.

## Capabilities

### New Capabilities

- `user-auth-progress`: Especificación de diseño para autenticación opcional de estudiantes, persistencia de progreso y evaluaciones por cuenta, algoritmo determinístico de fusión sin pérdida con `localStorage`, aislamiento de datos por usuario y conexión con la disponibilidad de niveles (`LessonNav.isLevelAvailable`).

### Modified Capabilities

<!-- Ninguna capacidad existente se modifica; el modo sin backend y sin login por defecto (frontend-no-backend) permanece intacto. -->

## Impact

- **Toca (solo documentación y specs)**: `docs/auth-db-decision.md` (nuevo), `knowledge-base/03_actores_y_roles.md`, `knowledge-base/04_modelo_de_datos.md`, `knowledge-base/07_flujos_principales.md`, `knowledge-base/09_decisiones_y_supuestos.md`, `knowledge-base/10_preguntas_abiertas.md`, `openspec/specs/user-auth-progress/spec.md` y `CHANGES.md`.
- **No toca**: ningún archivo de código fuente ni tests existentes (`52` lecciones / `208` ejercicios intactos).
- **Costo**: \$0 (`RN-COS-01`).
