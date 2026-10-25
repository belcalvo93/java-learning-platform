# Tasks: c-22-content-fixes-from-audit

## 1. Fase 1: Elaboración y Validación de la Propuesta

- [x] 1.1 Analizar los 38 ejercicios auditados y clasificar aquellos con veredicto `CONSIGNA AMBIGUA` o `DEPENDE DEL ENTORNO`.
- [x] 1.2 Probar experimentalmente en el JDK local 21 las soluciones propuestas (Locale.US en id 40, Random(42) en id 148, shutdown en id 178/179, close en id 38).
- [x] 1.3 Redactar el documento formal de propuesta `docs/content-fixes-proposal.md` con metadatos exactos de `data.js` y `lessonsData`.
- [x] 1.4 Registrar la propuesta en `CHANGES.md` como pendiente de revisión.
- [x] 1.5 Obtener revisión y aprobación explícita de la usuaria sobre cada punto propuesto antes de modificar código de producción.

## 2. Fase 2: Implementación tras Aprobación

- [x] 2.1 Aplicar correcciones acordadas en `data.js` para los ejercicios aprobados (40, 38, 178, 179, 148, 133, 33-40 y 170/174/176/182/186).
- [x] 2.2 Ajustar reglas correspondientes en `validator.js` (`STRUCT_RULES` para id 38, `requiredKeywords` para id 178/179/148).
- [x] 2.3 Ejecutar suites completas de verificación (`tools/*.test.js`, `browser-check.js`, `audit-validator.js`, `audit-real-execution.js`).
- [x] 2.4 Archivar el change C-22 en OpenSpec.
