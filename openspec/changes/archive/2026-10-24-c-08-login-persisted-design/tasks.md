# Tasks — c-08-login-persisted-design

> Verificación MANUAL + suite existente en verde (change 100 % de diseño: documentos, KB y specs; cero cambios en código de producción).

## 1. Documento de arquitectura y decisión `docs/auth-db-decision.md`

- [x] 1.1 Redactar `docs/auth-db-decision.md` con: (1) comparativa de los 3 proveedores free-tier (Firebase Auth + Firestore Spark, Supabase Free, Appwrite Cloud Free) y justificación de `DD-05`, (2) modelo de datos (`Usuario`, `Progreso`, `ResultadoEvaluacion`, `Certificado`, `Rol`), (3) flujos de autenticación y algoritmo determinístico de migración/fusión `mergeProgress`, (4) seguridad (`firestore.rules`), protección de claves públicas por dominio (`java.belencalvo.me`), qué NO se guarda y aviso de privacidad acorde a la Ley 25.326, (5) integración con `C-09`/`C-14`, `C-15`, `C-19` y `LessonNav.isLevelAvailable`, y (6) plan detallado de tasks para `C-13` con criterios de aceptación, tests TDD, verificación manual y riesgo.

## 2. Actualización sincronizada de la Knowledge Base

- [x] 2.1 Actualizar `knowledge-base/09_decisiones_y_supuestos.md` agregando la decisión `DD-05` (proveedor Firebase Auth + Firestore en plan Spark, marcada como `"tomada por defecto, revertible"`).
- [x] 2.2 Actualizar `knowledge-base/04_modelo_de_datos.md` y `knowledge-base/03_actores_y_roles.md` con las entidades `Usuario`, `ProgresoPersistido`, `ResultadoEvaluacion`, `Certificado`, rol `student`/`admin` y la regla de fusión con `localStorage`.
- [x] 2.3 Actualizar `knowledge-base/07_flujos_principales.md` (Flujo 4 completo: registro, login, verificación de email, recuperación de contraseña, logout y migración/fusión desde `localStorage`) y `knowledge-base/10_preguntas_abiertas.md` (marcar resueltas `PA-04` y `PA-06`, y listar al final únicamente las decisiones que le corresponden a Belén con recomendación para cada una).

## 3. Verificación de invariantes y cierre

- [x] 3.1 Ejecutar `node --test "tools/*.test.js"`, `node tools/browser-check.js`, `node tools/audit-validator.js` y `npx openspec validate --changes`, y verificar con `git status` que únicamente cambiaron documentos, specs y `CHANGES.md` (cero cambios en código productivo).

## Workflow follow-up

- Archivar `c-08-login-persisted-design` con `openspec archive`, sincronizando `openspec/specs/user-auth-progress/spec.md`.
- Marcar `[C-08] login-persisted-design` como `[x]` en `CHANGES.md` y validar con `npx openspec validate --specs`.
