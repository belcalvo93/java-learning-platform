# Tasks — c-05-execution-alternatives

> Verificación MANUAL (documento de análisis y decisión técnica `docs/execution-options.md`, sin código productivo ni tests de lógica). Governance MEDIO: requiere revisión y firma explícita de Belén sobre la decisión `DD-02` final antes de archivar.

## 1. Línea base y matriz de alternativas en `docs/execution-options.md`

- [x] 1.1 Documentar en `docs/execution-options.md` la entrada cuantitativa de la auditoría (`docs/validator-audit.md`), comparando el hallazgo inicial de `C-01` (`192/208 rules-cheatable` = 92,3 %, `16 needs-real-execution`, `0 rules-only-ok`) con el estado actual post-`C-18` (`198/208 rules-only-ok` = 95,2 %, `9 needs-real-execution` = 4,3 % en ids 33–40 y 148, `1 rules-cheatable` = 0,5 % en id 208), y verificar que los números coinciden con `node tools/audit-validator.js`.
- [x] 1.2 Construir en `docs/execution-options.md` la matriz comparativa completa de las 5 alternativas (Solo reglas post-`C-18`, Parche sandbox propio en `backend/server.js`, Piston público/self-hosted, Judge0 Cloud/self-hosted y WASM/CheerpJ) con las 6 columnas exigidas (costo mensual free-tier, mantenimiento, fidelidad JDK 21, superficie de ataque, latencia y subset de ejercicios cubierto) más enlaces a fuentes oficiales de precios y límites free-tier.

## 2. Decisión `DD-02` final, criterio de reversión y revisión de Belén

- [x] 2.1 Redactar en `docs/execution-options.md` la sección de decisión `DD-02` final (priorizando seguridad, costo y mantenimiento según `RN-COS-02` y `RN-SEG-01`/`RN-SEG-02`), definiendo la opción ganadora en producción, el alcance de `C-06` (`secure-executor` sin desplegar) y el criterio explícito de reversión.
- [x] 2.2 Presentar `docs/execution-options.md` a Belén y registrar su firma/confirmación sobre la decisión `DD-02` final; verificar con `git status` que no se modificó ningún archivo de código productivo.

## Workflow follow-up

- Archivar `c-05-execution-alternatives` con `openspec archive` una vez firmada la decisión `DD-02` por Belén.
- Marcar `[C-05] execution-alternatives` como `[x]` en `CHANGES.md`.
