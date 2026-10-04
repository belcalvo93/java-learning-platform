# Proposal — C-18 validator-structural

> Nota de nombre: el task pide el change `C-18-validator-structural`, pero el
> CLI `openspec` fuerza minúsculas (kebab-case) y creó el change vivo como
> `c-18-validator-structural` en
> `openspec/changes/c-18-validator-structural/`. Este documento usa `C-18`
> por legibilidad del roadmap; el nombre efectivo es el minúsculo.

## Why

El validador offline (`validator.js`) compara por texto exacto o por
`includes()` (rama `default`), exige nombres/textos/espacios que la consigna
no fija y acepta trampas (respuesta pegada en un comentario o en código
muerto — hallazgo C-01/C-16 en `docs/validator-audit.md`: 199/208
`rules-cheatable`). Además filtra respuestas válidas (ej. id 5 rechaza
cualquier texto distinto de `"Hola, Java!"`) y expone la respuesta en el
mensaje de error. Hay que pasar a validación estructural por tokens sin
romper las 208 soluciones canónicas.

## What Changes

- **Fase 1 — auditoría solamente (sin código):** nuevo documento
  `docs/validator-strictness.md` con veredicto por ejercicio (de los 208):
  qué exige de más (nombres, textos, espacios) y qué está bien, más una
  propuesta de regla por ejercicio. NO se implementa nada hasta que Belén
  revise la auditoría (gate explícito).
- **Fase 2 — implementación por TDD (tras el OK de Belén):** comparador por
  tokens en vez de texto exacto en `validator.js`:
  - Ignorar comentarios y formato (espacios, saltos, indentación cruda).
  - Nombres de variable libres con equivalencia por renombrado consistente;
    fijos solo los nombres que fija la consigna (clases, métodos, API del JDK).
  - Textos entre comillas libres salvo que el ejercicio los exija; números y
    operadores estrictos (son la lógica).
  - Rechazar la respuesta pegada dentro de un comentario (y patrones
    `codigo-muerto-con-patron` / `literal-con-patron` de
    `tools/audit-validator.js` reutilizados como sondas).
  - Aceptar las 208 soluciones canónicas de `data.js` + variantes válidas.
  - Ids 1–8 incluidos: id 5 (Hola Mundo) acepta cualquier texto entre
    comillas dentro de `System.out.println(...)` (cualquier mayúscula,
    con/sin exclamaciones); mismo criterio para ejercicios que piden
    "imprimir un mensaje" sin fijar texto.
  - Mensajes de error conceptuales, NUNCA con la respuesta ni la línea exacta
    (ej. "falta imprimir algo con System.out.println" en vez de
    `Debes imprimir "Hola, Java!" con System.out.println("Hola, Java!");`).
  - Indentación de lección 1 (ids 1–4) mide estructura (+4 por bloque), no
    igualdad con la solución.
- **Verificación:** tests TDD (`node --test`, sin framework nuevo) + matriz
  `docs/validator-audit.md` regenerada; conteos 52/208 intactos.
- **Non-goals:** ejecución real (C-05/C-06, largo plazo), publicar, rediseño,
  login. NUNCA tocar `data.js` ni contenido de lecciones; ids/conteos 52/208
  inmutables. Sin commit/push (solo artefactos).

## Capabilities

### New Capabilities

- `validator-structural`: validación estructural offline por tokens —
  normalización (quitar comentarios/formato), equivalencia por renombrado
  consistente, política de mensajes conceptuales sin respuesta, indentación
  estructural (+4 por bloque) y rechazo de respuesta-en-comentario; con
  auditoría previa `docs/validator-strictness.md` como gate.

### Modified Capabilities

- `validator-rules`: los requisitos actuales (aceptar canónica / rechazar
  incorrecta por id, mensajes en español) cambian de "coincidencia por texto
  o presencia" a "equivalencia estructural por tokens" para los 208
  ejercicios (incluidos ids 1–8 y 168), con mensajes que ya no muestran la
  respuesta exacta.

## Impact

- Código afectado: `validator.js` (comparador + 8 validadores propios +
  `checkIndentation` + rama `default`), `tools/audit-validator.js`
  (reutilizar patrones de sondas; regenerar matriz), docs
  (`docs/validator-strictness.md` nuevo, `docs/validator-audit.md`
  regenerada). `data.js`/`script.js`/contenido: solo lectura, prohibido
  modificar (AGENTS.md — Contenido intacto).
- Riesgo MEDIO (governance del roadmap): cambiar el comparador puede romper
  veredictos actuales; lo mitigan el gate de auditoría + TDD + invariante
  52/208 verificado por script.
- Tensión conocida a resolver en Fase 1: la consigna real del id 5 SÍ fija
  el texto (`Hola, Java!`, "Respeta la coma y el signo de exclamación") y
  los ids 6/7/8 también fijan textos; la regla "texto libre" del roadmap
  choca con eso. La auditoría lo lista por ejercicio y Belén decide qué
  textos quedan fijos y cuáles libres antes de implementar.
