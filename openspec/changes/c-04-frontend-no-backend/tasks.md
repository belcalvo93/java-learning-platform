# Tasks — c-04-frontend-no-backend

> TDD tests-first para la LOGICA de degradación (grupos 1–2, `node --test`
> sin framework nuevo, patrón C-01 `tools/*.test.js`); verificación MANUAL
> visual para lo UI (grupos 3–4, checklist móvil + desktop, cero errores de
> consola). Governance ALTO: proponer y pausar para revisión de Belén ANTES
> de editar `auth.js`/`firebase-config.js`/`config.js`/`index.html`. Sin
> commit/push (solo artefactos + working tree). No tocar `data.js` (52/208),
> reglas de `validator.js` (C-10), ni `backend/` (suspendido).

## 1. Degradación backend — fallback a reglas (TDD)

- [x] 1.1 RED: escribir `tools/frontend-no-backend.test.js` con casos
  backend ausente (`BACKEND_URL=''` + endpoint `''` → `isBackendConfigured()`
  false y mensaje exacto "ejecución no disponible — validando por reglas" +
  veredicto de `validator.js` sin `fetch`); verificar que falla (lógica aún
  no existe). → RED 0/17 verificado, luego GREEN.
- [x] 1.2 GREEN: implementar `isBackendConfigured()` + rama ausente en
  `java-executor.js`/`script-enhanced.js` (cero `fetch` cuando ausente,
  mensaje exacto + fallback a `validator.js`); verificar que el test 1.1 pasa.
- [x] 1.3 TRIANGULAR: agregar casos backend caído/timeout (fetch rechaza o
  aborta a `CONFIG.executionTimeout` 5000 ms → intento ÚNICO, mensaje exacto
  + error legible con stage `compilation`/`execution`, sin URL interna en UI,
  sin reintento) y error de validación en español sin stacktrace crudo (fuera
  `cd backend && npm start` y rutas internas); verificar suite verde con
  `node --test tools/frontend-no-backend.test.js`. → 17/17 + suite total 35/35.
- [x] 1.4 REFACTOR: extraer `formatStageError(stage, causa)` puro (sin DOM)
  y constructor de `JavaExecutor` que rechaza endpoint vacío sin red;
  verificar suite sigue verde y `git grep -in "onrender" -- java-executor.js
  script-enhanced.js config.js` sin URLs reales. → sin matches verificado.
  Nota: el constructor no lanza; `execute()`/`checkHealth()` cortocircuitan
  sin `fetch` con endpoint vacío (degradación sin red).

## 2. Progreso local — aviso + storage degradado (TDD)

- [x] 2.1 RED: casos `safeStorage` (`localStorage` lleno/bloqueado → aviso +
  app operativa en memoria, sin lanzar); verificar que fallan. → RED verificado.
- [x] 2.2 GREEN: envolver `ProgressManager` (`script.js:7,16,33`) y guardados
  de `script-enhanced.js:241,284,499,501,555` en `try/catch` con aviso visible
  y fallback en memoria; verificar tests 2.1 en verde. → verde; aviso
  persistente inyectado por `ensureLocalOnlyNotice()` en `script.js`.
- [ ] 2.3 Aviso persistente "se guarda en este navegador" (y mantener
  "tu progreso se guarda solo en este navegador" como estado temporal) junto
  al progreso, visible tras reload; verificar a mano en navegador (desktop +
  móvil) que el aviso persiste y que con storage bloqueado la validación y
  navegación siguen operativas.

## 3. Firebase no-operativo — banner + desimport condicional (manual)

- [x] 3.1 Listar referencias vivas (`git grep -n "authManager\|showAuthModal\|
  auth-button\|auth-modal\|signin-form\|signup-form" -- index.html script*.js
  auth.js firebase-config.js`) y decidir rama: A (cero uso vivo → retirar
  `index.html:346-349` SDK ×3 + `:360-361`) o B (uso vivo → mantener imports
  con banner); verificar checklist con la salida del grep pegada en el
  resumen. Camino esperado: B (hero `:44,47`, modal `:304`, `auth.js:146`).
- [x] 3.2 Banner "EJEMPLO NO OPERATIVO — sin login real en v1.0" en
  cabecera de `firebase-config.js` y `auth.js` + keys `DEMO…` → `REEMPLAZAR`
  y eliminar `console.log` de "Firebase inicializado correctamente"
  (`firebase-config.js:19`); verificar por inspección y apertura de
  `index.html` sin ese mensaje en consola ni UI. Archivos quedan en disco
  para C-08. Governance ALTO: pausar para revisión de Belén antes de editar.

## 4. UI honesta con IA apagada (manual — visual)

- [x] 4.1 Botones de sesión deshabilitados con la etiqueta exacta
"Próximamente: guardá tu progreso en tu cuenta" (hero `index.html:43-51`,
sin `onclick` a modal; modal `#auth-modal` `:304-344` no operativo);
verificar a mano: botones visibles, deshabilitados, no abren auth.
[Ajuste de Belén aplicado: hero = ancla activa "Empezar a aprender" → #niveles + UN solo botón deshabilitado; resto del diff tal cual]
- [ ] 4.2 Quitar "Feedback de IA" (`script-enhanced.js:182`) y porcentajes
  "Funcionalidad/Estilo" (`:222-226`); loading `:94` → "Validando por
  reglas…"; verificar abriendo 2 ejercicios (uno correcto, uno con error) en
  móvil + desktop: sin etiqueta de IA, sin porcentajes, cero errores de
  consola.
- [ ] 4.3 Barrido final visual: `git grep -in "Feedback de IA\|Funcionalidad.*Estilo\|
  Firebase inicializado correctamente\|cd backend" -- index.html
  script-enhanced.js` sin resultados; verificar checklist móvil + desktop
  firmada (ejercicios abren, validan por reglas, progreso muestra aviso
  local-only).

## 5. Cierre — invariantes y estado

- [ ] 5.1 Verificar invariantes: conteo 52 lecciones (15/15/12/10) y 208
  ejercicios intactos, ningún id tocado (`node -e` o apertura de lecciones
  muestra 52/208); `git status` muestra solo archivos del scope + artefactos
  del change; sin commit/push.
