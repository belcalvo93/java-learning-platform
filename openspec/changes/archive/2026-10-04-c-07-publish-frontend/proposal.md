# Proposal — c-07-publish-frontend (C-07 publish-frontend)

> Nota de nombre: el roadmap la llama `C-07-publish-frontend`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-07-publish-frontend`. Son el mismo change (precedente: C-01..C-04, C-10).

## Why

El MVP ya está construido y verificado (C-03 README honesto, C-04 frontend
sin backend con degradación explícita, C-10 reglas corregidas) pero no está
publicado: el `README.md` dice "Demo en preparación" (`README.md:20`) y
conserva marcadores `TU-USUARIO` (`README.md:76,106,170`), y la usuaria
reportó que el sitio dejó de verse (Pages pudo quedar desapuntado). Sin este
change, la definición de "lanzable" de `01_vision_y_objetivos.md` §Alcance
v1.0 + §Métricas de éxito (sitio publicado, 52/52 + 208/208 validables sin
errores JS, sin secretos, costo $0) sigue sin cumplirse.

## What Changes

- Diagnóstico Pages en Settings > Pages (por qué dejó de verse el sitio) y
  configuración verificada: fuente rama `main`, carpeta `/ (root)`; rama
  `main` confirmada como activa (`git branch --show-current` → `main`,
  remoto `origin https://github.com/belcalvo93/java-learning-platform.git`).
- URL pública REAL decidida y rellenada EN ESTE change: reemplaza los
  marcadores `TU-USUARIO` (`README.md:70-76,104-107,170`) y la línea "Demo
  en preparación" (`README.md:20`) por la dirección efectiva de Pages.
  La propuesta NO inventa la URL: las tasks exigen que Belén confirme/pegue
  la URL real desde Settings > Pages (dueña del repo + settings es ella).
- Barrido pre-publicación (verificación manual, sin tests de lógica):
  52/52 lecciones y 208/208 ejercicios accesibles; cero errores JS en
  consola en `index.html` + 4 guías (móvil + desktop); `config.js` con
  `BACKEND_URL` ausente/vacío (verificado: `BACKEND_URL = ''`, post-C-02 ✓);
  `index.html` sin enlaces `TU-USUARIO` (verificado: grep solo da
  `README.md` ✓); `git grep -i apikey|secret|gemini` sin secretos reales;
  Firebase ejemplo ausente o marcado no-operativo (heredado de C-04).
- Copy visible verificado: "progreso solo en este navegador" (RN-PRO-01) y
  degradación "ejecución no disponible — validando por reglas" donde aplique
  (heredado de C-04, ya en código).
- Decisión PA-06 del certificado v1.0 en ESTE change (keep-or-hide): C-03 ya
  lo redactó como "Constancia local de finalización — no verificable, se
  pierde si cambiás de navegador o dispositivo" (`README.md:16`); al firmar
  la checklist de publicación Belén confirma MANTENER esa redacción o
  ESCONDERLO hasta login (C-08+). Sin validez externa en ningún caso
  (RN-PRO-02).
- **Alcance atómico**: solo configuración Pages (externa, en GitHub) +
  `README.md` (URL real) + checklist firmada. Sin código, sin commit/push
  (solo artefactos en working tree). Smoke script opcional permitido pero no
  exigido.
- **Explícito NO-alcance**: reactivar backend / trabajo de executor (C-05,
  C-06); cambios en `validator.js` (cerrado en C-10); rediseño (C-12);
  login/DB (C-08+); tocar contenido de lecciones/ejercicios (52/208
  intactos); reescribir historial git.

## Capabilities

### New Capabilities

<!-- Sin capacidades nuevas: no cambia comportamiento de producto
     observable como requisito, solo publica lo ya construido y fija la
     URL real. El comportamiento (degradación, copy, invariantes) ya está
     especificado en `frontend-no-backend` y `validator-rules`. -->

### Modified Capabilities

<!-- Sin capacidades modificadas: ningún requisito de runtime cambia.
     Las specs `frontend-no-backend` (6 reqs) y `validator-rules` (9 reqs)
     siguen vigentes sin deltas. -->

Este change no crea ni modifica specs de producto: es CONFIG/PUBLISH con
verificación manual (checklist de publicación firmada, sin tests de
lógica). Por eso `.openspec.yaml` lleva `skip_specs: true`
(`openspec validate` lo exige cuando hay cero deltas; precedente C-03).

## Impact

- Toca: Settings > Pages en GitHub (externo, lo hace Belén) + `README.md`
  (URL real: `README.md:20,76,106,170`).
- No toca: `data.js`/`script.js`/`validator.js`/`config.js`/`java-executor.js`
  (ya correctos post-C-04/C-10), backend (`backend/server.js` sigue
  suspendido), historial git, contenido 52/208.
- Sin costo nuevo ($0, Pages free-tier, RN-COS-01).
- **Governance BAJO**: cambio de configuración/publicación con verificación
  manual; el apply edita solo `README.md`, pide revisión y firma de Belén
  (incluye decisión PA-06 keep-or-hide) antes de cerrar, sin commit/push.
- Dependencias (todas archivadas ✓): C-03 (`2026-10-03-c-03-readme-truth`),
  C-04 (`2026-10-03-c-04-frontend-no-backend`), C-10
  (`2026-10-03-c-10-validator-fix-rules`). Verificado en
  `openspec/changes/archive/`.
