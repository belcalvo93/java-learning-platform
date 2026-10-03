# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **java-learning-platform (JavaMaster)**.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**

> Contexto: plataforma existente (no greenfield). 52 lecciones / 208 ejercicios ya en `data.js`/`script.js`, validación por reglas en `validator.js`, backend Express **SUSPENDIDO** por inyección de comandos (`backend/server.js:56,78`), clave Gemini **revocada** pero aún en `config.js:6`, progreso solo en `localStorage`. Costo cero. Orden impuesto: auditoría → limpieza secretos → ejecución segura (evaluar alternativas, NO asumir Render) → publicar frontend sin backend → login/DB después. Ningún change reactiva Render sin tests de ejecución segura pasando (RN-SEG-02). No se reescribe historial git (PA-03 resuelta). No se toca contenido de lecciones/ejercicios salvo que la auditoría detecte errores.

---

## Cómo usar este documento

1. Identificar el change a implementar (verificar que sus dependencias están en `openspec/changes/archive/`).
2. Leer los docs de la knowledge-base indicados en "Leer antes".
3. Ejecutar `/opsx:propose <nombre-del-change>` (p. ej. `/opsx:propose C-01-validator-audit`).
4. Al terminar el change, archivarlo con `/opsx:archive <nombre-del-change>`.
5. Marcar el checkbox `[x]` en este archivo.

---

## Árbol de dependencias

```
C-01 validator-audit                       ← PRIMERA TAREA, desbloquea todo
  ├── C-02 secrets-cleanup                 ← revocar y remover del código actual, sin rewrite historial
  │     ├── C-03 readme-truth              ← README obligatorio: lo que la plataforma hace HOY
  │     └── C-04 frontend-no-backend       ← degrada a reglas, nunca expone Render caído
  │           └── C-10 validator-fix-rules     ← corrige reglas que rechazan la solución canónica (TDD)
  │                 └── C-07 publish-frontend  ← solo frontend estático, sin backend
  │                       ├── C-11 editor-ux                   ← polish editor post-publicación
  │                       ├── C-08 login-persisted-design      ← FUTURO, diseño solamente
  │                       └── C-09 admin-metrics-design        ← FUTURO, diseño solamente
  └── C-05 execution-alternatives
        └── C-06 secure-executor           ← tests pasando ANTES de cualquier reactivación (RN-SEG-02)
```

### Orden secuencial (una sola sesión — reemplaza cualquier paralelismo)

> Se trabaja con una sola sesión: sin agentes en paralelo, sin gates con ramas. Un change por vez, cada uno con su propio commit revertible.

```
C-01 validator-audit
  → C-02 secrets-cleanup
    → C-03 readme-truth
      → C-04 frontend-no-backend
        → C-10 validator-fix-rules       ← corrige reglas ids 3–8 y 168 (TDD)
          → C-07 publish-frontend        ← MVP PUBLICADO (sitio publicado)
            → C-11 editor-ux                 ← polish editor, sin librerías
              → C-05 execution-alternatives
                → C-06 secure-executor     ← ejecución segura, SIN desplegar
                  → C-08 login-persisted-design      ← FUTURO, diseño solamente
                  → C-09 admin-metrics-design        ← FUTURO, diseño solamente
```

Regla: no empezar un change hasta que el anterior esté archivado (`openspec/changes/archive/`).

### Camino crítico (6 changes — mínimo irreducible)

```
C-01 → C-02 → C-04 → C-10 → C-07 → C-08*
```

> `*` C-08 cierra el camino crítico como diseño del paso siguiente; el MVP lanzable termina en C-07. C-05/C-06 corren en rama paralela y C-06 NO bloquea la publicación (el MVP publica sin backend por DD-02). C-03 es obligatorio pero no bloquea C-04 (pueden ir en paralelo tras C-02; se lista fuera del crítico para no inflarlo).

### Orden de ejecución (una sola sesión)

```
  1  │ C-01 validator-audit
  2  │ C-02 secrets-cleanup
  3  │ C-03 readme-truth
  4  │ C-04 frontend-no-backend
  5  │ C-10 validator-fix-rules           ← corrige reglas ids 3–8 y 168
  6  │ C-07 publish-frontend            ← sitio publicado
  7  │ C-11 editor-ux                   ← polish editor post-publicación
  8  │ C-05 execution-alternatives
  9  │ C-06 secure-executor             ← sin desplegar
  10 │ C-08 login-persisted-design      ← solo diseño
  11 │ C-09 admin-metrics-design        ← solo diseño
```

---

## FASE 0 — Auditoría y verdad técnica

> Un solo change. Debe completarse antes que todo lo demás (PA-01 bloquea DD-02 final).

### [C-01] `validator-audit`
- **Estado**: `[x]` completado y archivado (`openspec/changes/archive/2026-10-03-c-01-validator-audit/`)
- **Scope**: Auditoría de los 208 ejercicios: reglas vs compilación real vs engañabilidad (TDD — PRIMERA tarea del roadmap)
  - Script de auditoría `tools/audit-validator.js` (Node, sin dependencias nuevas): recorre `data.js` (208 registros) + reglas de `validator.js` y clasifica cada ejercicio en: `rules-only-ok` / `needs-real-execution` / `rules-cheatable`
  - Sonda de engaño: por cada regla, genera ≥2 variantes tramposas (p. ej. string literal con la respuesta esperada, código muerto que contiene el patrón) y registra si `validator.js` las acepta falsamente
  - Matriz `docs/validator-audit.md`: tabla por ejercicio (id, lección, categoría, veredicto) + resumen (conteos, % engañable, lista de ejercicios que exigen ejecución real)
  - Invariante verificado por el script: 52 lecciones (15/15/12/10) y 208 ejercicios presentes; falla si el conteo cambia
  - Prohíbe tocar contenido de lecciones/ejercicios en este change: solo lectura + informe (si detecta errores de contenido, los lista como hallazgos, no los corrige)
  - Tests (TDD, JSDOM o Node assert sin framework nuevo): clasificador con 2+ casos por categoría + al menos 3 sondas de engaño que deben fallar contra el validator actual + test del invariante 52/208
- **Dependencias**: ninguna
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/10_preguntas_abiertas.md` §PA-01 (qué debe responder la matriz)
  - `knowledge-base/09_decisiones_y_supuestos.md` §SU-01 (supuesto sin verificar que se valida aquí)
  - `knowledge-base/06_funcionalidades.md` §US-003, US-004 (criterios de validación por reglas vs ejecución)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CON-01, RN-CON-02 (invariante 52/208, offline-first)
  - `knowledge-base/02_descripcion_general.md` §Suposición SIN VERIFICAR (alcance de la duda)

---

## FASE 1 — Limpieza de secretos y desactivación insegura

> C-02 primero. C-03 y C-04 tras C-02; C-10 tras C-04. Sin rewrite de historial (PA-03).

### [C-02] `secrets-cleanup`
- **Estado**: `[x]` completado y archivado (`openspec/changes/archive/2026-10-03-c-02-secrets-cleanup/`) — paso manual Render Environment hecho por Belén: solo había PORT, sin secretos.
- **Scope**: Cero secretos en código actual + Gemini desactivado en navegador (verificación manual — config/texto, sin lógica nueva)
  - `config.js`: eliminar `GEMINI_API_KEY` hardcodeada (`config.js:6`); reemplazar por placeholder vacío + comentario "servidor-only, nunca en frontend"; eliminar `BACKEND_URL` apuntando a Render suspendido
  - `gemini-integration.js` + `ai-validator.js`: desactivar llamadas desde el navegador (feature-flag `AI_ENABLED=false` o early-return con mensaje "IA no disponible hasta diseño servidor-only"); ningún `fetch` a Gemini queda alcanzable desde UI
  - Verificación manual descrita en el change (sin tests de lógica): `git grep -in apikey` y `git grep -in gemini` no devuelven secretos reales; `node -e "require('./config.js')"` o apertura de `index.html` sin errores de consola por la desactivación; checklist de archivos tocados
  - Revisar las variables de entorno del servicio en Render (Environment) y rotar cualquier clave o token cargado ahí. No registrar sus valores en ningún archivo.
  - NO reescribir historial git (PA-03): solo código actual
- **Dependencias**: C-01
- **Governance**: CRITICO
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-SEG-03 (cero secretos, sin rewrite)
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-03 (alcance: remover + desactivar)
  - `knowledge-base/10_preguntas_abiertas.md` §IN-03, PA-03 (key revocada, resolución)
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad, §Variables de entorno (secrets fuera del repo)
  - `knowledge-base/02_descripcion_general.md` §Integraciones externas (estado real Gemini/Firebase/Render)

### [C-03] `readme-truth`
- **Estado**: `[ ]` pendiente
- **Scope**: README obligatorio — describir lo que la plataforma hace HOY (verificación manual — texto, sin lógica)
  - Reescribir secciones: quitar "Compilador Java en Tiempo Real en el navegador", "Sistema de Progreso con Firebase", "Certificado" como hechos; reemplazar por estado real: validación por reglas offline (`validator.js`), progreso solo en este navegador (`localStorage`), sin login ni base de datos, backend Render suspendido y no requerido, IA desactivada
  - Actualizar Demo/Despliegue: frontend GitHub Pages como único despliegue MVP; sección Render movida a "desactivado hasta ejecución segura (RN-SEG-02)" sin pasos de activación
  - Requisitos: Node/JDK solo para desarrollo del executor futuro, no para usar la plataforma
  - Verificación manual: checklist línea por línea README-vs-código (cada afirmación trazable a `validator.js`/`data.js`/KB); revisión de Belén; sin tests de lógica
- **Dependencias**: C-02
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/10_preguntas_abiertas.md` §IN-01, IN-02 (inconsistencias README-vs-código a corregir)
  - `knowledge-base/01_vision_y_objetivos.md` §Alcance v1.0, §Fuera de alcance (qué promete el MVP)
  - `knowledge-base/05_reglas_de_negocio.md` §Excepciones globales (manda el código, el README se corrige)
  - `knowledge-base/04_modelo_de_datos.md` §ProgresoLocal (local-only como limitación documentada)

### [C-04] `frontend-no-backend`
- **Estado**: `[ ]` pendiente
- **Scope**: Frontend funciona 100% sin backend con degradación explícita (TDD)
  - `java-executor.js` + `script.js`/`script-enhanced.js`: detección de backend no configurado → mensaje exacto "ejecución no disponible — validando por reglas" y fallback a `validator.js`; nunca reintento infinito, nunca expone URL interna en UI ante fallo
  - Eliminar default de `BACKEND_URL` a Render suspendido; si se configura una URL, timeout explícito + error legible con stage (`compilation`/`execution`) ante timeout/fallo de red
  - Aviso persistente de progreso: "se guarda en este navegador" (RN-PRO-01); `localStorage` lleno/bloqueado → aviso + la app sigue funcionando sin guardar (Flujo 1)
  - Firebase no-operativo (viene de C-02): banner "EJEMPLO NO OPERATIVO — sin login real en v1.0" en `firebase-config.js` y `auth.js` + keys de ejemplo → `REEMPLAZAR`; listar referencias vivas (`authManager`/`showAuthModal`/ids) y, si no hay uso vivo, retirar de `index.html` los scripts del SDK + ambos archivos (si hay uso vivo, dejar import con banner y reportar); archivos quedan en disco para el diseño C-08
  - UI honesta con IA apagada (verificación manual — visual): ocultar botones de login y cualquier mensaje visible de Firebase; sacar la etiqueta "Feedback de IA" y los porcentajes "Funcionalidad/Estilo" de la validación local mientras la IA esté apagada (dan falsa impresión de precisión); el aviso "se guarda en este navegador" queda visible; verificar abriendo ejercicios en móvil + desktop sin errores de consola
  - Tests (TDD): backend ausente → fallback a reglas; backend caído/timeout → mensaje + sin reintento; `localStorage` indisponible → aviso + app operativa; error de validación → mensaje en español sin stacktrace crudo
- **Dependencias**: C-02
- **Governance**: ALTO
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 1, §Flujo 2 (happy path sin backend + degradación)
  - `knowledge-base/06_funcionalidades.md` §US-004, US-005 (degradación explícita, progreso local)
  - `knowledge-base/08_arquitectura_propuesta.md` §Graceful degradation, §Static-first (patrones)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-SEG-02, RN-PRO-01 (prohibido reactivar sin tests, aviso local-only)

### [C-10] `validator-fix-rules`
- **Estado**: `[ ]` pendiente
- **Scope**: Corregir las reglas de `validator.js` que hoy rechazan la solución canónica de `data.js` (TDD)
  - Ids alcanzados: 3, 4, 5, 6, 7, 8 y 168 (hallazgo de C-01, ver `docs/validator-audit.md`); no tocar reglas de ningún otro id
  - Por cada id: 1 test que PASA con la solución correcta de `data.js` + 1 test que FALLA con una solución incorrecta (TDD, sin framework nuevo, `node --test`)
  - Si el error está en `data.js` y no en la regla → NO tocarlo: reportarlo como hallazgo y consultar a Belén antes de seguir
  - No tocar contenido de lecciones/ejercicios fuera de estas reglas; no cambiar IDs ni conteos (RN-CON-01, RN-CON-03)
  - Al cerrar: re-correr `tools/audit-validator.js` y actualizar `docs/validator-audit.md` con la matriz nueva
- **Dependencias**: C-01
- **Governance**: MEDIO
- **Leer antes**:
  - `docs/validator-audit.md` §hallazgos ids 3–8, 168 (qué rechaza cada regla hoy)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CON-01, RN-CON-02, RN-CON-03 (invariante 52/208, offline-first, IDs estables)
  - `knowledge-base/09_decisiones_y_supuestos.md` §SU-01 (supuesto que este change ayuda a cerrar)
  - `knowledge-base/06_funcionalidades.md` §US-003 (validación por reglas offline)

---

## FASE 2 — Ejecución segura (evaluar antes de construir)

> C-05 decide; C-06 construye solo lo decidido. Ninguno reactiva Render. C-06 es el gate RN-SEG-02.

### [C-05] `execution-alternatives`
- **Estado**: `[ ]` pendiente
- **Scope**: Evaluación documentada de alternativas de ejecución Java + decisión DD-02 final (verificación manual — análisis, sin código productivo)
  - Matriz `docs/execution-options.md`: parche sandbox propio (allowlist + `execFile` + timeout + output cap + cleanup) vs Piston/Judge0 vs WASM vs solo-reglas; columnas: costo mensual free-tier, mantenimiento, fidelidad compilación JDK21, superficie de ataque, latencia, qué subset de C-01 cubre
  - Usa la matriz C-01 como entrada: cuántos ejercicios exigen ejecución real determina si basta con solo-reglas o hace falta sandbox
  - Entrada de C-01 (hallazgo archivado): 92,3 % de ejercicios engañables (192/208 `rules-cheatable`, 16 `needs-real-execution`, 0 `rules-only-ok`) — ver `docs/validator-audit.md`. Dimensiona cuánto cubre "solo reglas" en la matriz.
  - Decisión explícita firmada por Belén (costo/mantenimiento primero per RN-COS-02): una opción ganadora + criterio de reversión; si gana "solo reglas", C-06 se reduce a endurecer validación por reglas
  - Verificación manual: tabla completa + supuestos de costo con fuentes (precios free-tier enlazados); revisión de Belén; sin tests de lógica
- **Dependencias**: C-01
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-01, §DD-02, §SU-03 (opciones y trade-offs ya considerados)
  - `knowledge-base/10_preguntas_abiertas.md` §PA-02 (pregunta a cerrar aquí)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-SEG-01, RN-SEG-02, RN-COS-02 (restricciones de seguridad y costo)
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad (allowlist, sandbox, execFile prohibido exec)
  - `knowledge-base/02_descripcion_general.md` §API REST (superficie vulnerable de referencia)

### [C-06] `secure-executor`
- **Estado**: `[ ]` pendiente
- **Scope**: Executor Java seguro con tests pasando — SIN desplegar ni reactivar Render (TDD, gate RN-SEG-02)
  - `backend/server.js`: `className` contra allowlist `^[A-Z][A-Za-z0-9_]{0,31}$` (rechazo por defecto); `execFile` sin shell (prohibido `exec` con interpolación); sandbox: directorio temporal aislado, `javac`/`java` con timeout 5s, output capado 10KB, limpieza garantizada en `finally`; rate-limit básico; CORS con origen explícito (no `*` permanente); límite de body restrictivo (techo actual `1mb`)
  - Contrato `POST /api/execute {code, className}` → `{stage, stdout, stderr}` con stages `compilation`/`execution`; errores legibles sin filtrar paths internos
  - Tests (TDD, obligatorios antes de cualquier reactivación): inyección (`className="A; rm -rf /"`, path traversal `../`, backticks, `$()`) rechazada; timeout mata proceso; output gigante truncado a 10KB; temp limpiado tras éxito y fallo; CORS rechaza origen no listado; suite verde documentada en el change como evidencia del gate
  - Explícito NO-alcance: ningún paso de deploy, ninguna URL pública, ningún cambio en frontend para apuntar al executor
- **Dependencias**: C-05
- **Governance**: CRITICO
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-SEG-01, RN-SEG-02, RN-SEG-04 (allowlist, gate de tests, CORS/body)
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad (execFile, sandbox, secrets)
  - `knowledge-base/07_flujos_principales.md` §Flujo 2 (contrato futuro validado+sandbox)
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-01 (por qué el parche mínimo no alcanza)
  - `knowledge-base/02_descripcion_general.md` §API REST, §Backend executor (líneas vulnerables de referencia)

---

## FASE 3 — Publicación del MVP (frontend sin backend)

> Solo tras C-03 + C-04 + C-10. Publica Pages. No toca backend.

### [C-07] `publish-frontend`
- **Estado**: `[ ]` pendiente
- **Scope**: Sitio estático publicado en GitHub Pages sin secretos ni backend (verificación manual — configuración/publicación)
  - Configuración Pages (rama `main`, raíz), URLs placeholder reemplazadas por la real, `BACKEND_URL` sin valor o ausente
  - Antes de publicar, confirmar el estado de GitHub Pages en Settings > Pages (por qué dejó de verse el sitio) y verificar que quede apuntando a la rama main, carpeta raíz.
  - Barrido: 52/52 lecciones y 208/208 ejercicios accesibles; cero errores JS en consola en `index.html` + 4 guías (móvil + desktop); `git grep -i apikey|secret|gemini` sin secretos reales; Firebase ejemplo ausente o marcado no-operativo
  - Copy visible: "progreso solo en este navegador" y degradación "ejecución no disponible — validando por reglas" donde aplique; certificado v1.0 (si visible) rotulado local/no-verificable o escondido per PA-06
  - Verificación manual descrita en el change: checklist de publicación firmada (URLs, conteos, consolas, grep, dispositivos); sin tests de lógica; smoke script opcional permitido pero no exigido
- **Dependencias**: C-03, C-04, C-10
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/01_vision_y_objetivos.md` §Alcance v1.0, §Métricas de éxito (definición de lanzable)
  - `knowledge-base/06_funcionalidades.md` §US-001, US-002, US-008 (navegación, guías, sitio sin secretos)
  - `knowledge-base/07_flujos_principales.md` §Flujo 3 (publicar vía git + invariante 52/208)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CON-01, RN-CON-03, RN-PRO-01, RN-PRO-02 (invariantes y copy obligatorio)

### [C-11] `editor-ux`
- **Estado**: `[ ]` pendiente
- **Scope**: Mejoras de UX del editor de código (verificación manual — visual, sin lógica de negocio nueva)
  - Numeración de líneas + guías sutiles de indentación en el editor, SIN librerías de terceros: textarea con columna de números y capa de guías sincronizadas (scroll y tamaño); si no alcanza sin librería, evaluar UNA librería y consultar a Belén antes de agregarla
  - Ocultar la pista cuando el ejercicio sale correcto (la pista solo se muestra ante fallo o a pedido)
  - Mover el `@import` de `styles.css:101` al principio del archivo (los `@import` deben ir primeros para aplicarse)
  - Verificación manual: abrir ejercicios en móvil + desktop; chequear sincronía números/scroll, guías alineadas, pista oculta en correcto y visible en fallo, cero errores de consola; sin tests de lógica
- **Dependencias**: C-07
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-003 (resolver ejercicios con validación inmediata)
  - `knowledge-base/02_descripcion_general.md` §Stack tecnológico (Vanilla sin framework)

---

## FASE 4 — Post-MVP: login y administración (diseño solamente)

> Ningún change de esta fase implementa código. Requieren MVP publicado (C-07). Proveedor y modelo pendientes (PA-04/PA-05).

### [C-08] `login-persisted-design`
- **Estado**: `[ ]` pendiente
- **Scope**: Diseño de login + progreso persistido + certificado verificable — DOCUMENTO, sin implementar (verificación manual)
  - `docs/auth-db-decision.md`: Firebase real vs Supabase vs otro (costo free-tier, mantenimiento, auth social, RLS/ reglas); recomendación + migración desde `localStorage` (import de avance local, `localStorage` pasa a caché per RN-PRO-03)
  - Modelo `Usuario / Avance / Certificado`: campos, fuente de verdad servidor, certificado verificable (id firmada o URL pública); lecciones siguen públicas (sin barrera)
  - Verificación manual: revisión de Belén del documento; criterios de aceptación US-006 mapeados a diseño; explícito "no crear cuentas ni tablas en este change"
- **Dependencias**: C-07
- **Governance**: ALTO
- **Leer antes**:
  - `knowledge-base/03_actores_y_roles.md` §RBAC futuro (qué cambia con sesión)
  - `knowledge-base/04_modelo_de_datos.md` §Usuario/Avance/Certificado FUTURO (reservado post-MVP)
  - `knowledge-base/06_funcionalidades.md` §US-006 (criterios de auth real)
  - `knowledge-base/10_preguntas_abiertas.md` §PA-04, PA-06 (proveedor, certificado v1.0)
  - `knowledge-base/07_flujos_principales.md` §Flujo 4 futuro (alcance reservado)

### [C-09] `admin-metrics-design`
- **Estado**: `[ ]` pendiente
- **Scope**: Diseño de administración de contenido + métricas agregadas — DOCUMENTO, sin implementar (verificación manual)
  - `docs/admin-metrics-decision.md`: confirma si git-directo alcanza hasta post-MVP (PA-05) o se necesita editor; define agregados (completions, drop-off por lección) sin PII; permisos de administradora vía repo hoy, panel solo con auth real
  - Verificación manual: revisión de Belén; US-007 mapeada a diseño; explícito "sin panel en este change"
- **Dependencias**: C-07, C-08
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/03_actores_y_roles.md` §Administradora (gestión vía git confirmada)
  - `knowledge-base/06_funcionalidades.md` §US-007 (CRUD contenido + agregados)
  - `knowledge-base/09_decisiones_y_supuestos.md` §SU-02 (git-directo confirmado)
  - `knowledge-base/04_modelo_de_datos.md` §Guías, §Seed data inicial (contenido como seed)
