---
name: revisar-validacion-ejercicio
description: Usar cuando haya que revisar, debuggear, arreglar o actualizar un ejercicio de JavaMaster (validator.js, STRUCT_RULES, data.js), por ejemplo si un ejercicio rechaza una respuesta correcta, acepta una incorrecta, un alumno dice "lo hice bien y me lo marca mal", o cuando pidan "arreglá el ejercicio X", "actualizá el ejercicio X", "este ejercicio está mal" o "revisá este ejercicio nuevo" antes de sumarlo.
---

# Revisar, debuggear, arreglar o actualizar un ejercicio — JavaMaster (v2)

Objetivo: diagnosticar con criterio fijo dónde está el problema de un ejercicio (consigna, `starterCode`, `solution`, pista o regla de validación), decidir qué respuestas tiene que aceptar y cuáles tiene que rechazar, comprobarlo contra el validador real sin adivinar (cada caso se ejecuta) y aplicar el camino de corrección que corresponda según las reglas duras del repositorio.

## Paso 1 — Leer el ejercicio y diagnosticar las 5 partes
Buscá el ejercicio por `id` en `data.js` (`description`, `starterCode`, `solution`, `hint`, `lessonId`) y su regla en `STRUCT_RULES` de `validator.js` (o su validador propio si es de los ids 1–8).

Antes de armar casos, hacé el **chequeo de coherencia entre las 5 partes** para diagnosticar dónde está el problema:
1. **Consigna (`description`)**: ¿Explica con claridad qué hacer y qué resultado se espera (≥ 80 caracteres, incluye `"Salida esperada"` o `"Resultado esperado"`, sin etiquetas HTML de bloque como `<p>`, `<ul>`, `<ol>`, `<li>`, `<pre>`, `<div>`, `<h1>`–`<h6>`)?
2. **Código inicial (`starterCode`)**: ¿Es coherente con lo que dice la consigna? Si es de solo-comentario (`// ...`), nunca debe aprobar por sí solo (`isValid: false`). Si trae código pre-escrito, ¿fija algo que la consigna no menciona o contradice? *(Ejemplo real: en el ejercicio 24 el `starterCode` trae `for (int i = 1; i <= 10; i++)`, pero la consigna solo dice "`i` va de 1 a 10", lo que genera duda de si `i < 11` debe aceptarse).*
3. **Solución canónica (`solution`)**: ¿Compila/cumple exactamente lo que pide la consigna y respeta el `starterCode`?
4. **Pista (`hint`)**: ¿Orienta hacia la solución sin contradecir la consigna ni pedir otra estructura distinta?
5. **Regla de validación (`STRUCT_RULES[id]` / `validator.js`)**: ¿Está alineada con las 4 partes anteriores (`ctx`, `free`, `strings`, `alts`, `strictIncr`, `forInitTypeOptional`, `diamond`, `bare`, `missing`)?

Clasificá el diagnóstico:
- **Problema de validación**: la consigna, `starterCode`, `solution` y `hint` están bien, pero `validator.js` rechaza una variante válida o acepta una trampa.
- **Problema de contenido** (o mixto): hay una incoherencia o error en `description`, `starterCode`, `solution` o `hint` en `data.js` (o en la lección de `script.js`).

## Paso 2 — Separar qué fija la consigna
Anotá en una lista qué está **fijado** (se exige tal cual) y qué está **libre**:
- **Fijado**: lo que la consigna nombra o cita textualmente. Por ejemplo, el nombre de una variable ("Declara `int suma`"), la estructura ("con un bucle `while`", "escribe un if-else"), una forma ("con `i++`" → `strictIncr`), un texto de salida citado ("imprime `Par`") o variables que el editor ya trae ("Considera que `n` ya está declarado" → `ctx`).
- **Libre**: todo lo demás.

## Paso 3 — Armar la matriz de casos
Escribí entre 6 y 10 respuestas de prueba en Java, de cuatro tipos:

**A. Deben ACEPTARSE (equivalencias de Java, si no chocan con algo fijado):**
- Otro formato: espacios, saltos de línea, llaves en otra línea, comentarios agregados.
- Renombrar de forma consistente una variable que la consigna no nombra (`i` → `j`).
- Incremento equivalente: `i++`, `i += 1`, `i = i + 1` (salvo `strictIncr`).
- Límites equivalentes: `i <= 10` ↔ `i < 11`; `i >= 1` ↔ `i > 0`.
- Condición invertida con las ramas invertidas (`n % 2 != 0` imprime "Impar", si no "Par").
- Otro bucle (`for` ↔ `while`) **solo si la consigna no nombra el bucle** y la salida es idéntica. Ojo: `do-while` siempre ejecuta al menos una vez.
- Textos de salida distintos **solo si la consigna no cita el texto** (`strings: 'free'`).

**B. Deben RECHAZARSE (trampas o errores reales):**
- La solución pegada dentro de un comentario (`//` o `/* */`).
- La solución más código extra que no hace lo pedido (`int trampa = 0;`) o variables sin declarar.
- Otro número u operador que cambia el resultado (`i < 10` cuando la salida pide hasta 10).
- Un bucle infinito (falta el incremento).
- Cambiar algo fijado en el Paso 2 (otro nombre exigido, `for` cuando pide `while`, ternario cuando pide if-else).
- El propio `starterCode` si es solo comentario.

**C. A DECIDIR POR BELÉN (no lo decidas vos):**
- Variantes de texto cuando la consigna cita la salida: mayúsculas/minúsculas, tildes, espacios finales, signos de puntuación.
- Desajustes entre `starterCode` y consigna (ej. el `starterCode` fija un operador que la consigna dejó abierto).
- Cualquier caso donde la consigna sea ambigua sobre si algo está fijado.

**D. REQUIERE EJECUCIÓN (no se puede validar solo por reglas):**
- Ejercicios con `Scanner`/`System.in`, `Math.random()` sin semilla fija, archivos en disco o hilos/concurrencia. Marcalo así y no fuerces una regla engañosa (ver matrices de `docs/validator-audit.md` y `docs/real-execution-audit.md`).

## Paso 4 — Ejecutar cada caso contra el validador real
Desde la raíz del repo, con este arnés (no crea archivos):

```bash
node -e "
const fs=require('fs');
eval(fs.readFileSync('validator.js','utf8')+';globalThis.JavaValidator=JavaValidator;');
eval(fs.readFileSync('data.js','utf8').replace('const exercisesData','globalThis.exercisesData'));
const T=(id,code,caso)=>{const r=new globalThis.JavaValidator().validate(code,id);console.log(caso,'| valid='+r.isValid,'|',JSON.stringify(r.errors));};
T(ID,'CÓDIGO','nombre del caso');
"
```

## Paso 5 — Entregar el informe
Presentá primero el diagnóstico de las 5 partes y después la tabla con una fila por caso:

| Caso | Tipo (A/B/C/D) | Esperado | Obtenido (`valid=`) | ¿Coincide? |
|---|---|---|---|---|

Después de la tabla:
- **Diagnóstico de las 5 partes**: estado de coherencia entre consigna, `starterCode`, `solution`, `hint` y regla.
- **Discrepancias**: para cada fila que no coincide, decí qué parte de la regla o del contenido la causa (clave de `STRUCT_RULES`, rama de `validator.js` o texto de `data.js`).
- **Propuesta mínima**: el cambio más chico que lo arregla, indicando cuál de los dos caminos del Paso 6 aplica.
- **Preguntas para Belén**: los casos tipo C o cualquier cambio de contenido.

## Paso 6 — Dos caminos de corrección (solo tras aprobación de Belén)
Por defecto, entregá **solo el informe y la propuesta**. No edites ningún archivo hasta que Belén apruebe. Una vez aprobado, seguí el camino que corresponda:

### Camino 1 — Corrección de validación (`validator.js` / `STRUCT_RULES`)
1. **TDD obligatorio**: primero escribí un test que falle (RED) en `tools/validator-*.test.js` con el caso que hoy falla (y casos de no-regresión).
2. Aplicá el ajuste mínimo en `validator.js` (`alts`, `strings: 'free'`, `ctx`, `free`, etc.) hasta que pase (GREEN).
3. Verificá que el mensaje de error (`missing` o específico) sea conceptual en español y **nunca muestre la respuesta ni la línea de código exacta**.
4. Corré la suite completa: `node --test tools/*.test.js` (tené en cuenta las 2 fallas preexistentes conocidas en `secure-executor.test.js` por el tiempo de `javac` en Windows) y, si corresponde al cierre, `node tools/audit-validator.js`.

### Camino 2 — Corrección o actualización de contenido (`data.js` / `script.js`)
1. **Regla dura de contenido intacto**: NUNCA tocar lecciones ni ejercicios en `data.js` o `script.js` por fuera de un **change de OpenSpec de contenido** (como `C-16` o `C-22`) y siempre con revisión explícita de Belén.
2. **Invariantes 52/208 inamovibles**: NUNCA cambiar IDs, orden ni cantidades totales: **52 lecciones** (15/15/12/10 por nivel; lecciones `[22, 25, 40, 42]` de solo lectura sin ejercicios) y **208 ejercicios** (62/58/48/40 por nivel).
3. Si en una revisión de validación detectás que el error está en `data.js` y no hay un change de contenido abierto, **no edites `data.js`**: reportalo como hallazgo en el informe y consultá a Belén si quiere abrir/usar un change de contenido o resolverlo como tolerancia en `STRUCT_RULES` (p. ej. mediante `alts`).
4. Cuando sí se edite dentro de un change de contenido aprobado: correr `node --test tools/content-quality.test.js`, `node --test tools/*.test.js` y regenerar la auditoría si aplica.

## Paso 7 — Checklist para ejercicio nuevo o modificado
Antes de dar por bueno un ejercicio nuevo o actualizado, verificá todos los puntos:
- [ ] **Coherencia de las 5 partes**: consigna (`description`), `starterCode`, `solution`, pista (`hint`) y regla en `STRUCT_RULES` dicen lo mismo y no se contradicen.
- [ ] **Guarda de consigna (`course-content`)**: `description` mide ≥ 80 caracteres, incluye `"Salida esperada"` o `"Resultado esperado"`, y no usa HTML de bloque (`<p>`, `<ul>`, `<ol>`, `<li>`, `<pre>`, `<div>`, `<h1>`–`<h6>`).
- [ ] **Mapeo e invariantes (`course-content`)**: `lessonId` apunta a una lección válida (1–52, evitando las de solo lectura `[22, 25, 40, 42]`) y se respetan los invariantes 52/208 si es modificación.
- [ ] **Solución pasa**: `validator.validate(exercise.solution, id)` devuelve `isValid: true` y `errors: []`.
- [ ] **Starter no aprueba solo**: si `starterCode` es comentario o código incompleto, `validator.validate(exercise.starterCode, id)` devuelve `isValid: false`.
- [ ] **Variantes válidas pasan**: al menos 3 casos tipo A (formato, equivalencias, renombrado libre si aplica) dan `isValid: true`.
- [ ] **Trampas típicas se rechazan**: al menos 3 casos tipo B (solución comentada con `//` o `/* */`, operador/número distinto, variable no declarada, falta de estructura) dan `isValid: false`.
- [ ] **Mensaje conceptual sin spoiler (`validator-structural`)**: los errores están en español, explican qué concepto falta y **nunca filtran la solución canónica ni el código exacto**.

## Reglas
- Por defecto, solo informe: no modifiques archivos hasta que Belén apruebe la propuesta.
- Todo cambio de lógica en `validator.js` va con TDD (`tools/validator-*.test.js` primero en RED, luego GREEN).
- NUNCA tocar el texto de lecciones ni ejercicios en `data.js`/`script.js` fuera de un change de contenido aprobado por Belén, ni cambiar ids o cantidades (52 lecciones / 208 ejercicios).
- Los mensajes de error nunca muestran la respuesta.
- No hacer commit ni push sin pedido explícito.

## Criterio de éxito
- Se diagnosticaron las 5 partes del ejercicio (consigna, `starterCode`, `solution`, `hint`, regla) antes de proponer cambios.
- La matriz tiene al menos 3 casos tipo A y 3 tipo B, y cada uno se ejecutó de verdad (con su `valid=` real, no supuesto).
- Toda discrepancia tiene su causa ubicada en el código y una propuesta mínima que respeta los dos caminos (TDD para validación; change de OpenSpec + invariantes 52/208 para contenido).
- Ningún caso dudoso ni cambio de contenido se aplicó sin preguntarle a Belén.

## Historial de versiones
- **v1**: Procedimiento para revisar la validación de un ejercicio en `validator.js` (`STRUCT_RULES`): lectura del ejercicio, separación de lo fijado vs. libre, matriz de casos A/B/C/D, arnés de ejecución en Node y tabla de informe.
- **v2**: Ampliada a procedimiento estándar para debuggear, arreglar o actualizar ejercicios (y revisar nuevos). Suma: (1) diagnóstico inicial y chequeo de coherencia entre las 5 partes (consigna, `starterCode`, `solution`, `hint`, regla) con el caso real del ej. 24; (2) dos caminos explícitos de corrección alineados con `AGENTS.md`, `CHANGES.md` (`C-10`, `C-16`, `C-18`, `C-22`) y las specs `course-content` y `validator-structural` (Camino 1: TDD en `validator.js`; Camino 2: change de OpenSpec de contenido respetando invariantes 52/208); (3) checklist de 8 puntos para ejercicio nuevo o modificado; (4) triggers ampliados en `description`; y (5) esta sección de historial.
