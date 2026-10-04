# Design — c-16-content-and-mapping

## Context

Ver proposal.md (Why). Estado actual verificado por inspección READ-ONLY
(sin ejecutar nada en propose):

- `content-pack/content-pack.json`: claves `version`/`generated`/`lessons`/
  `exercises`; 51 lecciones, 208 ejercicios, 67 con `starterCode` (verificado
  con `node -e`, no a mano).
- `tools/apply-content-pack.js` (99 líneas): único escritor. Reescribe `content`
  en `script.js` (template literals) y `lessonId`/consigna/starter-vacío en
  `data.js` (formato una-línea-por-ejercicio que sus regex asumen); verifica
  invariantes ANTES de escribir y aborta sin escribir ante violación; `--check`
  es dry-run que nunca escribe.
- `tools/content-quality.test.js` (58 líneas, 4 tests): guarda de aceptación
  (52/208 + lesson-existe; lección ≥500 + info-box + code-block + sin
  script/style/img/a; consigna ≥80 + frase esperada + sin HTML bloque;
  starter-comentario no valida).
- `docs/content-review-notes.md`: mapa nuevo lección→ejercicios + hallazgos §3
  fuera de alcance.
- Restricciones: AGENTS.md "Contenido intacto" (solo C-16 + revisión Belén);
  RN-CON-01/RN-CON-03 (52/208, ids estables); `data.js` una-línea-por-ejercicio
  (los regex del script dependen de ello — no reformatear).

## Goals / Non-Goals

**Goals:**

- Aplicar el pack con un solo comando auditable (`--check` primero, escritura
  después) y dejar la suite verde + matriz regenerada.
- Que cada edición manual fuera del script (test 1.3, tarjetas `index.html`)
  quede acotada a líneas exactas y verificada por tests.

**Non-Goals:**

- Cambiar reglas del validador (spec `validator-rules` intacta), backend,
  publish, rediseño, login, y corregir hallazgos de `content-review-notes.md`
  §3 (se reportan, no se tocan: p. ej. solución 205/181/129, starters que ya
  validan, validaciones laxas documentadas en C-01).

## Decisions

1. **El script es el único escritor de `script.js`/`data.js`** (alternativa:
   editar a mano — descartada: 259 campos, error humano seguro; el script ya
   trae invariantes + abort-on-violation verificados por inspección).
2. **`--check` antes de escribir, en la misma sesión de apply** (alternativa:
   escribir directo — descartada: el dry-run deja evidencia "Invariantes OK"
   antes de mutar archivos trackeados).
3. **Test 1.3 y tarjetas como ediciones manuales dentro del scope** (alternativa:
   dejarlas para otro change — descartada: quedarían en rojo/desactualizadas;
   son 2 líneas exactas: expectativa [22,25,40,42] y 62/58/48/40).
4. **Regenerar `docs/validator-audit.md` con `tools/audit-validator.js`**
   (alternativa: no regenerar — descartada: el `lessonId` cambia la matriz;
   precedente C-10 regeneró su matriz igual).
5. **Orden frente a C-07 activo**: el apply no depende de C-07 publicado
   (solo de C-10 archivado + pack verificado); el cierre espera revisión de
   Belén del diff y regulariza el orden al archivar (propuesta registrada en
   proposal.md, no decisión técnica).

## Risks / Trade-offs

- [Riesgo] C-07 ACTIVE pre-push: el apply de C-16 podría basarse en un árbol
  que C-07 aún mueve → Mitigación: apply toca archivos disjuntos de C-07
  (contenido/datos vs config de publish); ante conflicto, rebase y re-run
  `--check` + suite; el cierre espera a Belén de todos modos.
- [Riesgo] Regex frágiles si `data.js`/`script.js` se reformatean → Mitigación:
  no reformatear esos archivos en este change; el script falla ruidosamente
  (throw) si la estructura no coincide, nunca escribe parcial.
- [Riesgo] Lección 1 fuera del pack: queda con contenido viejo → Mitigación:
  intencional (ya estaba bien, ver review-notes §1); la guarda de calidad la
  cubre igual (≥500 + estructura).
- [Trade-off] Hallazgos §3 no se corrigen aquí: la suite puede seguir mostrando
  veredictos conocidos (p. ej. starters que ya validan) → aceptado: son
  problemas de reglas/ejecución (C-05/C-06) o de soluciones (change aparte),
  no de este contenido.

## Migration Plan

Apply (detalle en tasks.md): `--check` → escritura → test 1.3 → tarjetas →
suite completa → regenerar matriz → diff para Belén. Rollback: los 5 archivos
tocados están trackeados; `git checkout -- script.js data.js index.html
tools/audit-validator.test.js docs/validator-audit.md` revierte todo (el
script escribe ambos archivos juntos o ninguno tras invariantes OK). Sin
commit/push sin pedido explícito.

## Open Questions

Ninguna que cambie specs, enfoque o tasks. Capacidad faltante a notar:
sin skill de registry aplicable (gobernado por AGENTS.md; ver resumen).
