# JavaMaster — Instrucciones para Agentes

> Este archivo (y su copia `CLAUDE.md`) es lo PRIMERO que todo agente lee al entrar al repo.
> Generado a partir de `knowledge-base/` y `CHANGES.md`. No editar a mano sin re-sincronizar ambos archivos.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | HTML5, CSS3, JavaScript Vanilla (sin framework) | Navegador moderno ES2020 |
| Lógica curso | script.js, script-enhanced.js, data.js (208 ejercicios), validator.js, java-executor.js | — |
| Auth/DB declarada | firebase-config.js, auth.js (código ejemplo, NO operativo) | No aplica en v1.0 |
| Backend executor | Node.js + Express + cors + dotenv (SUSPENDIDO por seguridad) | Node 16+ |
| Compilación Java | JDK en host del backend (futuro, tras rediseño seguro) | JDK 21+ |
| IA opcional | gemini-integration.js + ai-validator.js (DESACTIVADO, key revocada) | — |
| Hosting MVP | GitHub Pages (frontend estático, costo $0) | — |

Detalle completo: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md)

---

## Base de Conocimiento

La fuente de verdad del dominio vive en `knowledge-base/`. **Leé el archivo relevante ANTES de implementar.**

| Archivo | Cuándo leerlo |
|---------|---------------|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Entender propósito y alcance |
| [02_descripcion_general.md](knowledge-base/02_descripcion_general.md) | Stack real y estado de integraciones |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Actores (sin login en v1.0), RBAC futuro |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Lección/Ejercicio en código, progreso local |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | Reglas codificadas (RN-SEG/CON/PRO/COS) |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | Historias US-001..008 por épica |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Flujos E2E (sin backend, degradación) |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Patrones, estructura, seguridad, env vars |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | DD-01..04 + SU-01..03 (SU-01 sin verificar) |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | ⚠️ Inconsistencias a resolver ANTES de codear |

> ⚠️ Resolver las preguntas de prioridad **Alta** de `10_preguntas_abiertas.md` antes de arrancar el primer change (PA-01 la resuelve C-01).

---

## Skills Disponibles

Fuente de verdad: `.atl/skill-registry.md` (generado por `skill-registry`).

| Agente | Rol | Skills que carga |
|--------|-----|------------------|
| **Frontend** | Vanilla JS/CSS, UX de aprendizaje | `frontend-design` |
| **Backend/Executor** | Node/Express seguro (post-MVP) | *(ninguna instalada — rige RN-SEG + TDD global)* |
| **Descubrimiento** | Buscar capacidades nuevas | `find-skills` |
| **Orquestación** | SDD / OPSX / docs / roadmap | `active-orchestrator`, `kb-creator`, `roadmap-generator`, `agents-md-generator`, `skill-creator` |

Cargá la skill correspondiente al contexto ANTES de escribir código.

> Los compact rules de cada skill los resuelve el orquestador desde `.atl/skill-registry.md` (generado por `skill-registry`; no versionado — no está en el repo). Esta tabla solo mapea skill→rol.

---

## Roadmap de Changes

El plan de implementación completo está en [CHANGES.md](CHANGES.md). Resumen:

- **Total**: 10 changes, orden secuencial (una sola sesión, un change por vez con su propio commit).
- **Orden**: `C-01 → C-02 → C-03 → C-04 → C-07` (sitio publicado) → `C-05 → C-06` (ejecución segura, sin desplegar) → `C-08, C-09` (solo diseño futuro).
- **Camino crítico**: `C-01 → C-02 → C-04 → C-07` (MVP lanzable en C-07; C-03 obligatorio en paralelo lógico, C-08 cierra como diseño siguiente).
- **Primer change**: `C-01` (validator-audit — matriz 208 ejercicios, TDD).

**Antes de cualquier `/opsx:propose`**: leé [CHANGES.md](CHANGES.md), identificá las dependencias del change y los archivos de "Leer antes".

---

## Reglas Duras

> Reglas globales ya definidas en `~/.claude/CLAUDE.md` (orquestador, governance, TDD, engram): el proyecto las hereda. Acá viven solo las reglas **específicas de este proyecto** + las universales que el global no cubre.

Confirmadas por Belén (contrato; romperlas es un defecto):

- **Seguridad executor**: NUNCA reactivar Render ni ejecutar código de usuario sin allowlist (`^[A-Z][A-Za-z0-9_]{0,31}$`) + `execFile` sin shell + tests pasando → gate RN-SEG-02.
- **Cero secretos**: NUNCA commitear API keys en código trackeado → remover del código actual, desactivar llamadas IA desde el navegador, sin reescribir historial git (PA-03).
- **Contenido intacto**: NUNCA tocar lecciones/ejercicios salvo hallazgo de la auditoría C-01.
- **TDD o verificación**: NUNCA lógica sin tests primero → TDD; config/textos con verificación manual descrita en el change.
- **Un change un commit**: NUNCA mezclar objetivos → cambios chicos, commit propio revertible; NUNCA commit/push sin pedido explícito.
- **Invariantes 52/208**: NUNCA cambiar IDs ni conteos → 52 lecciones (15/15/12/10), 208 ejercicios.
- **Degradar sin exponer**: NUNCA exponer URL de backend en UI ni reintentar infinito → mensaje exacto "ejecución no disponible — validando por reglas" y fallback a `validator.js`.
- **Sin login real**: NUNCA asumir Firebase/login/DB operativos → progreso local con aviso visible "se guarda solo en este navegador".

---

## Flujo de Trabajo

```
1. Leer la KB relevante (knowledge-base/)        → entender el dominio
2. Identificar el change en CHANGES.md           → respetar dependencias y orden secuencial
3. /opsx:propose C-NN-nombre                     → proposal + design + specs + tasks
4. Implementar las tasks (cargando skills)       → respetando las reglas duras
5. /opsx:archive C-NN-nombre + marcar [x]        → cerrar el change
```

Aplicar TODAS las reglas duras en cada paso. Ante conflicto entre la KB y este archivo, las reglas duras prevalecen.
