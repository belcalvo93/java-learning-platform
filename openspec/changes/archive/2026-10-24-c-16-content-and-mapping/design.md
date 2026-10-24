# Design

## Context

En C-16 Fase 1 se identificaron 14 ítems en `data.js` que requerían revisión de contenido y starter/solución, documentados exhaustivamente en `docs/content-changes-proposal.md`.
Ver `proposal.md` para motivación y desglose de capabilities.

## Goals / Non-Goals

**Goals:**
- Corregir de forma quirúrgica los ejercicios con errores conceptuales en sus soluciones canónicas (205, 181, 129).
- Agregar imports y llaves faltantes en los starters de ejercicios 124, 168, 192, 207.
- Proporcionar comentarios claros de guía en starters de colecciones y clases (84, 85, 107, 110, 115, 117).
- Mantener compatibilidad total con el validador estructural (`validator.js`), sincronizando la regla de 205.
- Verificar el 100% de invariantes: 52 lecciones (15/15/12/10), 208 ejercicios, lecciones de lectura [22, 25, 40, 42].

**Non-Goals:**
- NO alterar la numeración de ejercicios ni lecciones.
- NO reescribir la teoría general ni reestructurar el diseño de la plataforma.
- NO añadir dependencias externas ni modificar `backend/` o `config.js`.

## Decisions

### Decisión 1: Sincronización de regla 205 en validator.js
- **Alternativa A:** Cambiar la solución en `data.js` sin tocar `validator.js`. (Rechazada: haría fallar la auditoría estructural de 205).
- **Alternativa B (Elegida):** Actualizar la solución canónica a `assertEquals(4, suma(2, 2))` y configurar la regla estructural 205 para que acepte tanto `testSuma` como `testFalla`.

### Decisión 2: Enfoque de scaffolding en starters
- **Alternativa A:** Dejar los starters vacíos. (Rechazada: genera dudas sobre imports o contexto de clases).
- **Alternativa B (Elegida):** Proveer imports mínimos y comentarios de scaffolding (`// Tu código acá`) para orientar al alumno sin regalar la solución.

## Risks / Trade-offs

- [Riesgo de romper la validación de soluciones alternativas de estudiantes] → Se mitiga corriendo la suite de tests de `tools/` y `audit-validator.js` antes de cerrar la Fase 2.
- [Riesgo de modificar inadvertidamente un ID o campo protegido] → Se implementa un script de verificación / test TDD que compara los 208 IDs y sus atributos inmutables.
