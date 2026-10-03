# Proposal — c-04-frontend-no-backend (C-04 frontend-no-backend)

> Nota de nombre: el roadmap la llama `C-04-frontend-no-backend`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-04-frontend-no-backend`. Son el mismo change (precedente C-01..C-03).

## Why

El frontend todavía promete ejecución remota y sesiones con cuenta que no
existen en v1.0: `script-enhanced.js:118` construye `JavaExecutor` con
endpoint vacío, el `catch` de `checkExercise` pide `cd backend && npm start`
(`script-enhanced.js:131-141`), los botones hero llaman a `showAuthModal()`
(`index.html:44,47`), `firebase-config.js:19` afirma "Firebase inicializado
correctamente" y el resultado muestra "🤖 Feedback de IA" +
"Funcionalidad/Estilo %" (`script-enhanced.js:182,224`) con la IA apagada
(C-02). Sin este change la plataforma cuelga o miente ante backend ausente
(Flujo 2, US-004) y ante progreso local (Flujo 1, US-005, RN-PRO-01).

## What Changes

- `java-executor.js` + `script.js`/`script-enhanced.js`: detección de backend
  no configurado → mensaje exacto "ejecución no disponible — validando por reglas"
  y fallback a `validator.js`; nunca reintento infinito, nunca expone URL
  interna en UI ante fallo.
- Eliminar default de `BACKEND_URL` a Render suspendido (ya vacío tras C-02,
  se fija por contrato); si se configura una URL, timeout explícito + error
  legible con stage (`compilation`/`execution`) ante timeout/fallo de red.
- Aviso persistente de progreso: "se guarda en este navegador" (RN-PRO-01);
  `localStorage` lleno/bloqueado → aviso + la app sigue funcionando sin
  guardar (Flujo 1).
- Firebase no-operativo: banner "EJEMPLO NO OPERATIVO — sin login real en v1.0"
  en `firebase-config.js` y `auth.js` + keys de ejemplo → `REEMPLAZAR`;
  listar referencias vivas (`authManager`/`showAuthModal`/ids) y, si no hay uso
  vivo, retirar de `index.html` los scripts del SDK + ambos archivos (si hay
  uso vivo, dejar import con banner y reportar); archivos quedan en disco para
  el diseño C-08.
- UI honesta con IA apagada (verificación manual — visual): mostrar los
  botones de sesión deshabilitados con la etiqueta "Próximamente: guardá tu progreso en tu cuenta"
  (el login con base de datos es un objetivo del proyecto); sacar el mensaje
  "Firebase inicializado correctamente"; mantener el aviso "tu progreso se guarda solo en este navegador"
  como estado temporal; sacar la etiqueta "Feedback de IA" y los porcentajes
  "Funcionalidad/Estilo" de la validación local mientras la IA esté apagada
  (dan falsa impresión de precisión); verificar abriendo ejercicios en móvil +
  desktop sin errores de consola.
- Tests (TDD): backend ausente → fallback a reglas; backend caído/timeout →
  mensaje + sin reintento; `localStorage` indisponible → aviso + app
  operativa; error de validación → mensaje en español sin stacktrace crudo.

## Capabilities

### New Capabilities

- `frontend-no-backend`: frontend funciona 100% sin backend con degradación
  explícita (detección backend ausente/caído/timeout + fallback a reglas,
  timeout y stages legibles, aviso local-only + `localStorage` degradado,
  Firebase marcado no-operativo con desimport condicional, UI honesta con IA
  apagada). Crea `specs/frontend-no-backend/spec.md`.

### Modified Capabilities

<!-- Sin capacidades previas: openspec/specs/ solo tiene .gitkeep (C-01..C-03
     usaron skip_specs). Nada que modificar. -->

## Impact

- Toca: `java-executor.js`, `script-enhanced.js` (flujo `checkExercise` +
  `displayValidationResult`), `script.js` (`ProgressManager` +
  `localStorage`), `config.js` (contrato `BACKEND_URL` vacío + timeout),
  `index.html` (imports ~L346-362, botones sesión, modal auth, aviso
  progreso), `firebase-config.js`, `auth.js` (banner + `REEMPLAZAR`).
- No toca: contenido lecciones/ejercicios (`data.js`, 52/208 intactos), reglas
  de `validator.js` (las corrige C-10), backend (`server.js` suspendido),
  despliegue (C-07), rediseño visual (C-12).
- Dependencia: C-02 archivado ✓
  (`openspec/changes/archive/2026-10-03-c-02-secrets-cleanup/`).
- **Governance ALTO**: el apply propone y pausa para revisión de Belén ANTES
  de editar archivos de auth/config acá alcanzados. Sin commit/push (solo
  artefactos).
- Non-goals: cambios de backend (suspendido), publish en Pages (C-07),
  corrección de reglas del validator (C-10), rediseño visual (C-12).
