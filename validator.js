// ============================================
// VALIDADOR DE CÓDIGO JAVA - NIVEL UNIVERSITARIO
// ============================================

class JavaValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    validate(code, exerciseId) {
        this.errors = [];
        this.warnings = [];

        // Validaciones generales de sintaxis
        // C-18 lote 1 + ajustes: los ids 1-8 no usan la puerta cruda de
        // múltiplos de 4. Los ids 1-4 miden la indentación por estructura
        // (+4 por bloque) en su propio validador; en los ids 5-8 (lección 2)
        // el formato no es concepto y no limita el veredicto.
        // C-18 lotes 2+: los ids migrados a validación estructural tampoco
        // usan la puerta cruda (el formato no es concepto; solo la
        // indentación +4/bloque de la lección 1, ya cubierta en ids 1-4).
        const skipRawIndentationIds = [1, 2, 3, 4, 5, 6, 7, 8];
        const structurallyMigrated = Object.prototype.hasOwnProperty.call(STRUCT_RULES, exerciseId);
        this.checkBasicSyntax(code, skipRawIndentationIds.includes(exerciseId) || structurallyMigrated);
        this.checkBraces(code);
        this.checkSemicolons(code);
        this.checkOperators(code);

        // Validación específica por ejercicio
        return this.validateExercise(code, exerciseId);
    }

    checkBasicSyntax(code, skipIndentation) {
        // Check for common syntax errors
        if (code.includes('=<')) {
            this.errors.push('Error de sintaxis: El operador correcto es <= (no =<)');
        }
        if (code.includes('=>') && !code.includes('->')) {
            this.errors.push('Error de sintaxis: El operador correcto es >= (no =>)');
        }
        if (code.match(/if\s+[a-zA-Z]/)) {
            this.errors.push('Error de sintaxis: if requiere paréntesis -> if (condicion)');
        }
        if (code.match(/for\s+[a-zA-Z]/)) {
            this.errors.push('Error de sintaxis: for requiere paréntesis -> for (init; cond; inc)');
        }
        if (code.match(/while\s+[a-zA-Z]/)) {
            this.errors.push('Error de sintaxis: while requiere paréntesis -> while (condicion)');
        }

        // Check indentation
        if (!skipIndentation) {
            this.checkIndentation(code);
        }
    }

    checkIndentation(code) {
        const lines = code.split('\n');
        let expectedIndent = 0;
        const indentSize = 4;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('//')) continue;

            // Count leading spaces
            const leadingSpaces = line.search(/\S/);
            if (leadingSpaces === -1) continue;

            // Continuation lines keep their own alignment: if the previous
            // significant line does not close the statement (';', '{', '}')
            // this line continues it (e.g. chained '.forEach(...)'). Only
            // block lines must be a multiple of 4.
            let prev = null;
            for (let j = i - 1; j >= 0; j--) {
                const t = lines[j].trim();
                if (t && !t.startsWith('//')) { prev = t; break; }
            }
            const isContinuation = prev !== null && !/[;{}]$/.test(prev);
            // Check if indentation is correct (must be multiple of 4)
            if (!isContinuation && leadingSpaces % indentSize !== 0) {
                this.errors.push(`Error de indentación en línea ${i + 1}: Usa 4 espacios por nivel (encontrados: ${leadingSpaces})`);
                return; // Stop after first error
            }

            // Adjust expected indent based on braces
            if (trimmed.includes('{')) {
                expectedIndent += indentSize;
            }
            if (trimmed.startsWith('}')) {
                expectedIndent -= indentSize;
            }
        }
    }

    // c-11-editor-ux 6.2: la DECISIÓN no cambia (error si y solo si los
    // conteos crudos difieren, igual que antes); solo el TEXTO usa
    // `braceNotice` para decir de más/de menos en español simple. Si
    // `braceNotice` no ve dirección (p. ej. llaves solo dentro de strings),
    // se conserva el mensaje genérico anterior.
    checkBraces(code) {
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;

        if (openBraces !== closeBraces) {
            const notice = (typeof braceNotice === 'function') ? braceNotice(code) : null;
            this.errors.push(`Error: ${notice || `Llaves desbalanceadas (${openBraces} aperturas, ${closeBraces} cierres)`}`);
        }
    }

    checkSemicolons(code) {
        // Check if println statements have semicolons
        const printlnLines = code.match(/System\.out\.println[^;]*$/gm);
        if (printlnLines && printlnLines.length > 0) {
            this.errors.push('Error: Falta punto y coma (;) después de System.out.println()');
        }
    }

    checkOperators(code) {
        // C-18 fix aviso de asignación: avisar SOLO ante una asignación
        // (= solo) dentro de la CONDICIÓN de un if/while, donde se esperaba
        // comparar (p. ej. `if (x = 5)`). Nunca ante `==`, `<=`, `>=`, `!=`
        // (el segundo `=` de `==` disparaba el falso aviso), ni ante el `=`
        // del init de un `for`, ni ante `=` dentro de textos o comentarios
        // (se buscan las condiciones sobre código sin comentarios y con
        // textos enmascarados, con paréntesis gemelos).
        const stripped = maskJavaStrings(stripJavaComments(code));
        const re = /\b(?:if|while)\s*\(/g;
        let m;
        while ((m = re.exec(stripped)) !== null) {
            const cond = extractParens(stripped, m.index + m[0].length - 1);
            if (cond === null) continue;
            if (/(?<![=!<>])=(?![=>])/.test(cond)) {
                this.warnings.push('Advertencia: Posible asignación (=) en lugar de comparación (==)');
                return;
            }
        }
    }

    validateExercise(code, exerciseId) {
        const exercise = exercisesData.find(e => e.id === exerciseId);
        if (!exercise) return { isValid: false, output: '', errors: ['Ejercicio no encontrado'] };

        let isValid = false;
        let output = '';

        // c-11-editor-ux 6.3: sin salidas simuladas. Ningún ejercicio
        // devuelve texto de salida inventado; el bloque "Salida del programa"
        // solo aparece con ejecución real (C-06). `output` queda siempre ''.
        // Solo cambia el texto de salida: ningún veredicto válido/inválido.
        switch (exerciseId) {
            case 1: // Hola Java
                isValid = this.validateHelloWorld(code);
                break;

            case 2: // Múltiples líneas
                isValid = this.validateMultipleLines(code);
                break;

            case 3: // Múltiples Métodos (dos métodos a/b con println)
                isValid = this.validateTwoMethods(code);
                break;

            case 4: // Bucle Anidado (for + condición par + println)
                isValid = this.validateNestedLoop(code);
                break;

            case 5: // Hola Mundo
                isValid = this.validateHolaMundo(code);
                break;

            case 6: // Múltiples Líneas (dos println)
                isValid = this.validateTwoLines(code);
                break;

            case 7: // Print vs Println
                isValid = this.validatePrintVsPrintln(code);
                break;

            case 8: // Printf con %d
                isValid = this.validatePrintf(code);
                break;

            default:
                // C-18 lotes 2+: ids migrados a validación estructural por
                // tokens (STRUCT_RULES); el resto sigue con igualdad exacta.
                if (Object.prototype.hasOwnProperty.call(STRUCT_RULES, exerciseId)) {
                    isValid = this.validateStructural(code, exerciseId);
                    break;
                }
                // Normalizar código y solución para comparación
                const normalizeCode = (str) => str
                    .replace(/\r\n/g, '\n')  // Windows line endings
                    .replace(/\r/g, '\n')    // Old Mac line endings
                    .trim();

                const userCode = normalizeCode(code);
                const expectedCode = normalizeCode(exercise.solution);

                isValid = userCode === expectedCode || userCode.includes(expectedCode);
                if (exerciseId === 168) {
                    // C-18: el pipeline se busca SIN comentarios (la respuesta
                    // pegada en un comentario nunca aprueba).
                    const noComments = stripJavaComments(code);
                    const hasPipeline = noComments.includes('Files.lines') && noComments.includes('.filter(') && noComments.includes('.forEach(');
                    if (!hasPipeline) {
                        this.errors.push('Error: Debes usar el pipeline Files.lines(...).filter(...).forEach(...);');
                        isValid = false;
                    } else if (this.errors.length === 0) {
                        // Tolerar variaciones de formato con el pipeline
                        // presente y chequeos generales limpios + las
                        // vigilancias estructurales (texto sin cerrar,
                        // paréntesis, nombres no declarados).
                        const toks168 = normalizeStructToks(tokenizeJava(noComments));
                        const solIds168 = new Set(tokenizeJava(stripJavaComments(exercise.solution)).filter((t) => t.k === 'id').map((t) => t.v));
                        const bad168 = toks168.some((t) => t.k === 'bad') ? 'Hay un texto sin cerrar con comillas.'
                            : !parensBalanced(toks168) ? 'Falta cerrar un paréntesis.'
                            : checkNoUndeclared(toks168, solIds168, collectStudentEntities(noComments), new Set());
                        if (bad168) {
                            this.errors.push(bad168);
                            isValid = false;
                        } else {
                            isValid = true;
                        }
                    }
                }
        }

        return {
            isValid: isValid && this.errors.length === 0,
            output: output,
            errors: this.errors,
            warnings: this.warnings
        };
    }

    // C-18 lote 1, id 1: clase Ejemplo + main + println con cualquier texto.
    // FIJA por decisión Belén 2026-10-04: la lección 1 enseña con
    // `public class Ejemplo` (script.js) y la consigna dice "sin cambiar las
    // palabras public class Ejemplo ni public static void main". Libre:
    // nombre de args (incluye String... args), texto del println, código
    // extra válido. El mensaje NO nombra la clase (conceptual).
    validateHelloWorld(code) {
        const s = stripJavaComments(code);
        const masked = maskJavaStrings(s);
        const declared = collectDeclaredVars(s);
        const mClass = /\bclass\s+Ejemplo\b/.exec(masked);
        if (!mClass) {
            this.errors.push('Falta la clase con el método main adentro.');
            return false;
        }
        const cls = extractBlock(s, mClass.index);
        if (!cls) {
            this.errors.push('Falta cerrar alguna llave de la clase o del método.');
            return false;
        }
        const mMain = /\bpublic\s+static\s+void\s+main\s*\(\s*String\s*(?:\[\]\s*[A-Za-z_$][\w$]*|\.\.\.\s*[A-Za-z_$][\w$]*|[A-Za-z_$][\w$]*\s*\[\])\s*\)/.exec(maskJavaStrings(cls.body));
        if (!mMain) {
            this.errors.push('Falta el método main dentro de la clase.');
            return false;
        }
        const main = extractBlock(cls.body, mMain.index + mMain[0].length);
        if (!main) {
            this.errors.push('Falta cerrar alguna llave de la clase o del método.');
            return false;
        }
        let ok = this._requirePrintableIn(
            findPrintCalls(main.body).filter((c) => c.method === 'println'),
            declared,
            'Falta imprimir algo con System.out.println dentro del main.'
        );
        const indentMsg = structuralIndentMessage(s);
        if (indentMsg) {
            this.errors.push(indentMsg);
            ok = false;
        }
        return ok;
    }

    // C-18 lote 1, id 2 (+ ajuste 2: `18 <= edad` vale igual que
    // `edad >= 18`, mismo concepto): if-else indentado con condición
    // edad >= 18 y un println por rama. Fijo por consigna ("Mantén la
    // condición edad >= 18", "{ queda en la misma línea que if y else"):
    // edad, >=, 18, if, else, orden, llaves en la misma línea. Textos
    // libres (decisión 8).
    validateMultipleLines(code) {
        const s = stripJavaComments(code);
        const masked = maskJavaStrings(s);
        const declared = collectDeclaredVars(s);
        declared.add('edad');
        const mIf = /\bif\s*\(/.exec(masked);
        if (!mIf) {
            this.errors.push('Falta el if con la condición que compara edad con 18 usando >=.');
            return false;
        }
        const cond = extractParens(s, mIf.index + mIf[0].length - 1);
        // Ajuste 2: `edad >= 18` y `18 <= edad` dicen lo mismo (mismo
        // concepto); otros operadores y números siguen estrictos.
        const condMasked = cond === null ? '' : maskJavaStrings(cond);
        const condOk = /edad\s*>=\s*18/.test(condMasked) || /18\s*<=\s*edad/.test(condMasked);
        if (cond === null || !condOk) {            this.errors.push('Falta el if con la condición que compara edad con 18 usando >=.');
            return false;
        }
        const ifBrace = nextOpenBrace(s, mIf.index + mIf[0].length - 1 + cond.length + 2);
        if (ifBrace === -1 || lineOf(s, mIf.index) !== lineOf(s, ifBrace)) {
            this.errors.push('La llave de apertura { va en la misma línea que if y else.');
            return false;
        }
        const ifBlock = extractBlock(s, ifBrace);
        if (!ifBlock) {
            this.errors.push('Falta cerrar alguna llave del if o del else.');
            return false;
        }
        const mElse = /\belse\b(?!\s*if\b)/.exec(maskJavaStrings(s.slice(ifBlock.end)));
        if (!mElse) {
            this.errors.push('Falta la parte del else.');
            return false;
        }
        const elseIndex = ifBlock.end + mElse.index;
        const elseBrace = nextOpenBrace(s, elseIndex + mElse[0].length);
        if (elseBrace === -1 || lineOf(s, elseIndex) !== lineOf(s, elseBrace)) {
            this.errors.push('La llave de apertura { va en la misma línea que if y else.');
            return false;
        }
        const elseBlock = extractBlock(s, elseBrace);
        if (!elseBlock) {
            this.errors.push('Falta cerrar alguna llave del if o del else.');
            return false;
        }
        const branchMsg = 'Cada parte (if y else) tiene que imprimir algo con System.out.println.';
        let ok = this._requirePrintableIn(
            findPrintCalls(ifBlock.body).filter((c) => c.method === 'println'),
            declared,
            branchMsg
        );
        if (!this._requirePrintableIn(
            findPrintCalls(elseBlock.body).filter((c) => c.method === 'println'),
            declared,
            branchMsg
        )) {
            ok = false;
        }
        const indentMsg = structuralIndentMessage(s);
        if (indentMsg) {
            this.errors.push(indentMsg);
            ok = false;
        }
        return ok;
    }

    validateIntVariable(code, varName, expectedValue) {
        const regex = new RegExp(`int\\s+${varName}\\s*=\\s*${expectedValue}\\s*;`);
        if (!regex.test(code)) {
            this.errors.push(`Error: Debes declarar: int ${varName} = ${expectedValue};`);
            return false;
        }
        if (!code.includes('System.out.println')) {
            this.errors.push('Error: Debes imprimir la variable con System.out.println()');
            return false;
        }
        return true;
    }

    validateStringVariable(code, varName) {
        const regex = new RegExp(`String\\s+${varName}\\s*=\\s*"[^"]+"`);
        if (!regex.test(code)) {
            this.errors.push(`Error: Debes declarar: String ${varName} = "valor";`);
            return false;
        }
        return true;
    }

    validateSum(code) {
        if (!code.match(/int\s+resultado\s*=/)) {
            this.errors.push('Error: Debes declarar la variable: int resultado = ...');
            return false;
        }
        if (!code.match(/resultado\s*=\s*[ab]\s*\+\s*[ab]/)) {
            this.errors.push('Error: Debes asignar la suma: resultado = a + b;');
            return false;
        }
        return true;
    }

    validateIfElse(code) {
        if (!code.match(/if\s*\(/)) {
            this.errors.push('Error: Sintaxis incorrecta. Usa: if (condicion) { }');
            return false;
        }
        if (!code.match(/edad\s*>=\s*18|18\s*<=\s*edad/)) {
            this.errors.push('Error: La condición debe comparar edad con 18 usando >=');
            return false;
        }
        if (!code.includes('else')) {
            this.errors.push('Error: Falta la cláusula else');
            return false;
        }
        if (!code.match(/if\s*\([^)]+\)\s*\{/) || !code.match(/else\s*\{/)) {
            this.errors.push('Error: Debes usar llaves { } para delimitar los bloques if y else');
            return false;
        }
        return true;
    }

    validateComparison(code) {
        if (!code.match(/if\s*\(/)) {
            this.errors.push('Error: Debes usar una estructura if');
            return false;
        }
        if (!code.match(/num1\s*[><]\s*num2|num2\s*[><]\s*num1/)) {
            this.errors.push('Error: Debes comparar num1 y num2 con > o <');
            return false;
        }
        return true;
    }

    validateForLoop(code) {
        if (!code.match(/for\s*\(/)) {
            this.errors.push('Error: Sintaxis incorrecta. Usa: for (init; cond; inc) { }');
            return false;
        }
        if (!code.match(/int\s+i\s*=\s*1/)) {
            this.errors.push('Error: Debes inicializar: int i = 1');
            return false;
        }
        if (!code.match(/i\s*<=?\s*5/)) {
            this.errors.push('Error: La condición debe ser: i <= 5');
            return false;
        }
        if (!code.match(/i\s*\+\+|i\s*=\s*i\s*\+\s*1/)) {
            this.errors.push('Error: Debes incrementar i con i++');
            return false;
        }
        return true;
    }

    // C-18 lote 1, id 3 (+ ajuste 3: la línea vacía entre métodos es
    // formato, no concepto: no limita el veredicto): clase con métodos
    // a/b, indentación 4/8. LIBRE por decisión Belén 2026-10-04: P es la
    // única clase y ninguna lección/ejercicio la reutiliza → vale cualquier
    // nombre válido (con o sin public: la consigna no dice "pública").
    // Fijo por consigna: métodos a, b (void, println, 4/8). Textos libres
    // (pueden repetirse), orden de métodos libre, sin llamadas (la consigna
    // dice que la clase "No imprime nada por sí sola"). El mensaje NO
    // nombra la clase (conceptual).
    validateTwoMethods(code) {
        const s = stripJavaComments(code);
        const masked = maskJavaStrings(s);
        const declared = collectDeclaredVars(s);
        const mClass = matchClassDecl(masked, false);
        if (!mClass.ok) {
            if (mClass.reason === 'invalid-name') {
                this.errors.push('El nombre de la clase tiene que empezar con una letra y no llevar espacios ni símbolos.');
            } else {
                this.errors.push('Falta la clase con los dos métodos adentro.');
            }
            return false;
        }
        const cls = extractBlock(s, mClass.index);
        if (!cls) {
            this.errors.push('Falta cerrar alguna llave de la clase o de los métodos.');
            return false;
        }
        const clsMasked = maskJavaStrings(cls.body);
        const mA = /\bvoid\s+a\s*\(\s*\)/.exec(clsMasked);
        const mB = /\bvoid\s+b\s*\(\s*\)/.exec(clsMasked);
        if (!mA) {
            this.errors.push('Falta el método a dentro de la clase.');
            return false;
        }
        if (!mB) {
            this.errors.push('Falta el método b dentro de la clase.');
            return false;
        }
        const bodyA = extractBlock(cls.body, mA.index + mA[0].length);
        const bodyB = extractBlock(cls.body, mB.index + mB[0].length);
        if (!bodyA || !bodyB) {
            this.errors.push('Falta cerrar alguna llave de la clase o de los métodos.');
            return false;
        }
        const methodMsg = 'Cada método tiene que imprimir algo con System.out.println.';
        let ok = this._requirePrintableIn(
            findPrintCalls(bodyA.body).filter((c) => c.method === 'println'),
            declared,
            methodMsg
        );
        if (!this._requirePrintableIn(
            findPrintCalls(bodyB.body).filter((c) => c.method === 'println'),
            declared,
            methodMsg
        )) {
            ok = false;
        }
        // Ajuste 3: la línea vacía entre métodos es formato (no limita el
        // veredicto); solo se exige la indentación estructural de abajo.
        const indentMsg = structuralIndentMessage(s);
        if (indentMsg) {
            this.errors.push(indentMsg);
            ok = false;
        }
        return ok;
    }

    // C-18 lote 1, id 4 (+ ajuste 3: indentación estructural +4 por bloque
    // como en ids 1-3, decisión 6 del diseño): for + if par + println del
    // contador, con renombrado consistente del contador. Fijo (son la lógica
    // pedida): for, int, = 0, < 5, ++, if, % 2 == 0, println del contador.
    // Libres: nombre del contador y espacios dentro de cada línea.
    validateNestedLoop(code) {
        const s = stripJavaComments(code);
        const masked = maskJavaStrings(s);
        if (!/\bfor\s*\(/.test(masked)) {
            this.errors.push('Falta el bucle for que cuenta hasta 5.');
            return false;
        }
        const mFor = /\bfor\s*\(\s*int\s+([A-Za-z_$][\w$]*)\s*=\s*0\s*;\s*\1\s*<\s*5\s*;\s*(?:\1\s*\+\+|\+\+\s*\1|\1\s*\+=\s*1|\1\s*=\s*\1\s*\+\s*1)\s*\)/.exec(masked);
        if (!mFor) {
            this.errors.push('Falta el bucle for que cuenta hasta 5.');
            return false;
        }
        const counter = mFor[1];
        const forBlock = extractBlock(s, mFor.index + mFor[0].length);
        if (!forBlock) {
            this.errors.push('Falta cerrar alguna llave del for o del if.');
            return false;
        }
        const forMasked = maskJavaStrings(forBlock.body);
        // D-09 (cierre C-18): paréntesis de más pero válidos (`if (((k % 2 == 0)))`)
        // se aceptan; la condición `k % 2 == 0` sigue estricta.
        let mIf = null;
        for (let depth = 0; depth <= 3 && !mIf; depth++) {
            mIf = new RegExp('\\bif\\s*\\(\\s*(?:\\(\\s*){' + depth + '}' + counter + '\\s*%\\s*2\\s*==\\s*0\\s*(?:\\)\\s*){' + depth + '}\\)').exec(forMasked);
        }
        if (!mIf) {
            this.errors.push('Falta el if que pregunta si el número es par.');
            return false;
        }
        const ifBlock = extractBlock(forBlock.body, mIf.index + mIf[0].length);
        if (!ifBlock) {
            this.errors.push('Falta cerrar alguna llave del for o del if.');
            return false;
        }
        const prints = findPrintCalls(ifBlock.body).filter((c) => c.method === 'println');
        const unwrapParens = (a) => {
            let t = a.trim();
            while (/^\(.*\)$/.test(t)) t = t.slice(1, -1).trim();
            return t;
        };
        const withCounter = prints.filter((c) => c.ok && unwrapParens(c.arg) === counter);
        if (withCounter.length === 0) {
            this.errors.push('Falta imprimir el contador con System.out.println dentro del if.');
            return false;
        }
        for (const c of withCounter) {
            if (!c.hasSemicolon) {
                this.errors.push('Falta el punto y coma (;) al final de la instrucción.');
                return false;
            }
        }
        // Ajuste 3 (diseño C-18, decisión 6: ids 1-4 con indentación
        // estructural): el for, el if y el println van +4 por bloque.
        const indentMsg = structuralIndentMessage(s);
        if (indentMsg) {
            this.errors.push(indentMsg);
            return false;
        }
        return true;
    }

    // C-18 lote 1, id 5: programa con main + impresión de cualquier texto.
    // LIBRE por decisión Belén 2026-10-04: Hola es la única clase y
    // ninguna lección/ejercicio la reutiliza como clase (la lección 2
    // enseña con Saludo/Formatos) → vale cualquier nombre válido. Fijo:
    // clase PÚBLICA (la consigna dice "una clase pública") y main. La
    // impresión vale con print, println o printf (ajuste 2026-10-04: el
    // concepto es mostrar texto, el resultado visible es el mismo).
    // Texto libre (cualquier mayúscula, puntuación, p. ej. "hola mama").
    // Los mensajes NO nombran la clase.
    validateHolaMundo(code) {
        const s = stripJavaComments(code);
        const masked = maskJavaStrings(s);
        const declared = collectDeclaredVars(s);
        const mClass = matchClassDecl(masked, true);
        if (!mClass.ok) {
            if (mClass.reason === 'invalid-name') {
                this.errors.push('El nombre de la clase tiene que empezar con una letra y no llevar espacios ni símbolos.');
            } else {
                this.errors.push('Falta una clase pública con el método main.');
            }
            return false;
        }
        const cls = extractBlock(s, mClass.index);
        if (!cls) {
            this.errors.push('Falta cerrar alguna llave de la clase o del método.');
            return false;
        }
        const mMain = /\bpublic\s+static\s+void\s+main\s*\(\s*String\s*(?:\[\]\s*[A-Za-z_$][\w$]*|\.\.\.\s*[A-Za-z_$][\w$]*|[A-Za-z_$][\w$]*\s*\[\])\s*\)/.exec(maskJavaStrings(cls.body));
        if (!mMain) {
            this.errors.push('Falta el método main dentro de la clase.');
            return false;
        }
        const main = extractBlock(cls.body, mMain.index + mMain[0].length);
        if (!main) {
            this.errors.push('Falta cerrar alguna llave de la clase o del método.');
            return false;
        }
        return this._requirePrintableIn(
            findPrintCalls(main.body),
            declared,
            'falta imprimir algo con System.out.println'
        );
    }

    // C-18 lote 1, id 6: dos líneas con println. Textos libres, sin clase
    // obligatoria (la canónica no trae). Vale print con \n (hace dos
    // líneas); dos print sin salto se rechazan (decisión 4).
    validateTwoLines(code) {
        const s = stripJavaComments(code);
        const declared = collectDeclaredVars(s);
        const calls = findPrintCalls(s);
        const good = (c) => c.ok && c.hasSemicolon && checkPrintableArg(c.arg, declared).ok;
        const lines = calls.filter((c) => {
            if (!good(c)) return false;
            if (c.method === 'println') return true;
            if (c.method === 'print') {
                const parts = splitTopLevel(c.arg, '+').map((p) => p.trim());
                return parts.some((p) => /^"/.test(p) && /\\n/.test(p));
            }
            return false;
        });
        if (lines.length >= 2) return true;
        if (calls.length === 0) {
            this.errors.push('Faltan dos impresiones con System.out.println, una por línea.');
            return false;
        }
        for (const c of calls) {
            if (c.method !== 'print' && c.method !== 'println') continue;
            const defect = callDefect(c, declared);
            if (defect) {
                this.errors.push(defect);
                return false;
            }
        }
        if (calls.some((c) => c.method === 'print')) {
            this.errors.push('Con System.out.print el texto queda en la misma línea: usá System.out.println para cada línea.');
            return false;
        }
        this.errors.push('Faltan dos impresiones con System.out.println, una por línea.');
        return false;
    }

    // C-18 lote 1, id 7: print y después println. Fijo: distinción y orden
    // print→println (es el concepto). Textos libres.
    validatePrintVsPrintln(code) {
        const s = stripJavaComments(code);
        const declared = collectDeclaredVars(s);
        const calls = findPrintCalls(s);
        const prints = calls.filter((c) => c.method === 'print');
        const printlns = calls.filter((c) => c.method === 'println');
        const good = (c) => c.ok && c.hasSemicolon && checkPrintableArg(c.arg, declared).ok;
        const gp = prints.find(good);
        const gl = printlns.find(good);
        if (!gp) {
            this.errors.push(firstCallDefect(prints, declared) || 'Falta la primera impresión con System.out.print (sin salto de línea).');
            return false;
        }
        if (!gl) {
            this.errors.push(firstCallDefect(printlns, declared) || 'Falta la segunda impresión con System.out.println (con salto de línea).');
            return false;
        }
        if (gp.index > gl.index) {
            this.errors.push('La impresión con print va antes que la de println.');
            return false;
        }
        return true;
    }

    // C-18 lote 1, id 8: printf con %d y la variable e. Fijo por consigna
    // ("usa System.out.printf con el marcador %d", "La variable e ya está
    // declarada"): printf, %d, e. Resto del texto libre (decisión 1: el
    // prefijo "Edad: " es libre).
    validatePrintf(code) {
        const s = stripJavaComments(code);
        const calls = findPrintCalls(s).filter((c) => c.method === 'printf');
        if (calls.length === 0) {
            this.errors.push('Falta imprimir con System.out.printf.');
            return false;
        }
        const good = (c) => {
            if (!c.ok || !c.hasSemicolon) return false;
            const parts = splitTopLevel(c.arg, ',').map((p) => p.trim());
            if (parts.length < 2) return false;
            if (!/^"([^"\\\n]|\\.)*"$/.test(parts[0])) return false;
            if (parts[0].indexOf('%d') === -1) return false;
            if (!/^e$/.test(parts[1])) return false;
            return true;
        };
        if (calls.some(good)) return true;
        const c = calls[0];
        if (!c.ok) {
            this.errors.push('Falta cerrar el paréntesis de la impresión.');
            return false;
        }
        if (!c.hasSemicolon) {
            this.errors.push('Falta el punto y coma (;) al final de la instrucción.');
            return false;
        }
        const parts = splitTopLevel(c.arg, ',').map((p) => p.trim()).filter((p) => p.length > 0);
        if (parts.length === 0) {
            this.errors.push('Falta escribir algo para imprimir dentro del paréntesis.');
            return false;
        }
        if (!/^"([^"\\\n]|\\.)*"$/.test(parts[0]) || parts[0].indexOf('%d') === -1) {
            this.errors.push('Falta el marcador %d para el número dentro del texto.');
            return false;
        }
        this.errors.push('Falta pasar la variable e para mostrar su valor.');
        return false;
    }

    // Auxiliar del lote 1: exige al menos una llamada válida entre las
    // dadas; si ninguna lo es, publica el primer defecto (o el mensaje de
    // falta) y devuelve false. El código extra válido no molesta.
    _requirePrintableIn(calls, declared, missingMsg) {
        for (const c of calls) {
            if (callDefect(c, declared) === null) return true;
        }
        for (const c of calls) {
            const defect = callDefect(c, declared);
            if (defect) {
                this.errors.push(defect);
                return false;
            }
        }
        this.errors.push(missingMsg);
        return false;
    }

    // C-18 lotes 2+: validación estructural genérica por tokens.
    // La solución canónica debe aparecer como subsecuencia ordenada de
    // tokens en el código del estudiante: espacios, saltos, llaves de
    // más y código extra válido no molestan; comentarios nunca aprueban
    // (se quitan antes); textos fijos salvo regla `strings: 'free'`;
    // números y operadores siempre estrictos; nombres fijos salvo la
    // lista `free` (renombrado consistente y biyectivo). Mensajes
    // conceptuales sin la respuesta (regla `missing` + genéricos).
    validateStructural(code, exerciseId) {
        const rule = STRUCT_RULES[exerciseId];
        const stripped = stripJavaComments(code);
        if (rule.custom === 26) return this.validateEstructura26(stripped, rule);
        if (rule.custom === 30) return this.validateEstructura30(stripped, rule);
        if (rule.custom === 208) return this.validateEstructura208(code, stripped, rule);
        if (!stripped.trim()) {
            this.errors.push(rule.missing);
            return false;
        }
        const stuToks = normalizeStructToks(tokenizeJava(stripped), { strictIncr: !!rule.strictIncr });
        if (stuToks.some((t) => t.k === 'bad')) {
            this.errors.push('Hay un texto sin cerrar con comillas.');
            return false;
        }
        if (!parensBalanced(stuToks)) {
            this.errors.push('Falta cerrar un paréntesis.');
            return false;
        }
        const exercise = exercisesData.find((e) => e.id === exerciseId);
        const solBase = normalizeStructToks(tokenizeJava(stripJavaComments(exercise.solution)), { strictIncr: !!rule.strictIncr });
        const variants = [solBase];
        if (rule.forInitTypeOptional) variants.push(dropForInitType(solBase));
        // Formas alternativas que dicen lo mismo (p. ej. otro orden de
        // atributos o de asignaciones independientes): cada una vale.
        for (const alt of rule.alts || []) {
            variants.push(normalizeStructToks(tokenizeJava(stripJavaComments(alt)), { strictIncr: !!rule.strictIncr }));
        }
        const refIds = new Set(variants.flatMap((v) => v.filter((t) => t.k === 'id').map((t) => t.v)));
        const declared = collectStudentEntities(stripped);
        const context = new Set(rule.ctx || []);
        let used = null;
        let matchedVariant = null;
        const ok = variants.some((v) => {
            const refIds = new Set(v.filter((t) => t.k === 'id').map((t) => t.v));
            const fixed = new Set([...refIds].filter((n) => !(rule.free || []).includes(n)));
            const opts = { fixed, stringsFree: rule.strings === 'free', declared, context };
            const m = structuralMatchTokens(stuToks, v, opts);
            if (m.ok) { used = m.used; matchedVariant = { toks: v, align: m.align }; }
            return m.ok;
        });
        if (!ok) {
            this.errors.push(rule.missing);
            return false;
        }
        const badCall = checkCallParens(stuToks, used);
        if (badCall) {
            this.errors.push(badCall);
            return false;
        }
        const badEmpty = checkEmptyParens(stuToks, matchedVariant.toks, matchedVariant.align);
        if (badEmpty) {
            this.errors.push(badEmpty);
            return false;
        }
        if (rule.diamond) {
            const badDiamond = checkDiamond(stripped);
            if (badDiamond) {
                this.errors.push(badDiamond);
                return false;
            }
        }
        if (rule.bare) {
            const badBare = checkBareMethods(stripped, rule.bare);
            if (badBare) {
                this.errors.push(badBare);
                return false;
            }
        }
        const undecl = checkNoUndeclared(stuToks, refIds, declared, context);
        if (undecl) {
            this.errors.push(undecl);
            return false;
        }
        return true;
    }

    // C-18 lote 2, id 26 (tablas del 2 y del 3): bucles fijos por
    // consigna + impresión en dos formas válidas: println-concat con el
    // formato " x " / " = " y producto i*j, o printf con formato %d que
    // incluya x/= y salto de línea, con i, j y el producto.
    validateEstructura26(stripped, rule) {
        if (!stripped.trim()) {
            this.errors.push(rule.missing);
            return false;
        }
        const masked = maskJavaStrings(stripped);
        // D-09: `i++` vale igual que `i += 1` y que `i = i + 1` (la
        // consigna dice "recorre", no nombra `++`); igual para `j`.
        const incrI = '(?:i\\s*\\+\\+|\\+\\+\\s*i|i\\s*\\+=\\s*1|i\\s*=\\s*i\\s*\\+\\s*1)';
        const incrJ = '(?:j\\s*\\+\\+|\\+\\+\\s*j|j\\s*\\+=\\s*1|j\\s*=\\s*j\\s*\\+\\s*1)';
        const outer = new RegExp('\\bfor\\s*\\(\\s*int\\s+i\\s*=\\s*2\\s*;\\s*i\\s*<=\\s*3\\s*;\\s*' + incrI + '\\s*\\)').exec(masked);
        const inner = new RegExp('\\bfor\\s*\\(\\s*int\\s+j\\s*=\\s*1\\s*;\\s*j\\s*<=\\s*5\\s*;\\s*' + incrJ + '\\s*\\)').exec(masked);
        if (!outer || !inner || outer.index > inner.index) {
            this.errors.push(rule.missing);
            return false;
        }
        const innerBlock = extractBlock(stripped, inner.index + inner[0].length);
        if (!innerBlock) {
            this.errors.push('Falta cerrar alguna llave de los bucles.');
            return false;
        }
        const declared = collectStudentEntities(stripped);
        const calls = findPrintCalls(innerBlock.body);
        let printOk = false;
        let defect = null;
        for (const c of calls) {
            if (checkTablaPrint(c)) { printOk = true; break; }
            if (defect === null) defect = tablaPrintDefect(c);
        }
        if (!printOk) {
            this.errors.push(defect || rule.missing);
            return false;
        }
        const exercise = exercisesData.find((e) => e.id === 26);
        const refIds = new Set(tokenizeJava(stripJavaComments(exercise.solution)).filter((t) => t.k === 'id').map((t) => t.v));
        const stuToks = stripTernaryParens(tokenizeJava(stripped));
        if (stuToks.some((t) => t.k === 'bad')) {
            this.errors.push('Hay un texto sin cerrar con comillas.');
            return false;
        }
        if (!parensBalanced(stuToks)) {
            this.errors.push('Falta cerrar un paréntesis.');
            return false;
        }
        const undecl = checkNoUndeclared(stuToks, refIds, declared, new Set());
        if (undecl) {
            this.errors.push(undecl);
            return false;
        }
        return true;
    }

    // C-18 lote 15, id 208 (cobertura): la solución SON comentarios
    // ("solo comentarios" dice la consigna, sin código). Se verifican
    // 4 ideas en el código crudo (los comentarios cuentan acá) en vez
    // del texto exacto; un pegado sin ideas se rechaza. Si además hay
    // código, pasa las vigilancias básicas (comillas, paréntesis,
    // nombres declarados).
    validateEstructura208(raw, stripped, rule) {
        void rule;
        const dims = [/\bl[ií]neas?\b/i, /\bramas?\b/i, /\bm[eé]todos?\b/i]
            .filter((re) => re.test(raw)).length;
        const missing = !/jacoco/i.test(raw) ? 'Falta nombrar la herramienta con la que se mide la cobertura.'
            : !/80/.test(raw) ? 'Falta el objetivo de cobertura.'
            : dims < 2 ? 'Faltan las partes que se cubren (líneas, ramas, métodos).'
            : !/mvn\s+test\s+jacoco:report/.test(raw) ? 'Falta el comando para generar el informe.'
            : null;
        if (missing) {
            this.errors.push(missing);
            return false;
        }
        const toks = normalizeStructToks(tokenizeJava(stripped));
        if (toks.length === 0) return true;
        if (toks.some((t) => t.k === 'bad')) {
            this.errors.push('Hay un texto sin cerrar con comillas.');
            return false;
        }
        if (!parensBalanced(toks)) {
            this.errors.push('Falta cerrar un paréntesis.');
            return false;
        }
        const undecl = checkNoUndeclared(toks, new Set(), collectStudentEntities(stripped), new Set());
        if (undecl) {
            this.errors.push(undecl);
            return false;
        }
        return true;
    }

    // C-18 lote 2, id 30 (switch con fall-through): estructura genérica
    // + bloque COMPARTIDO exigido: los casos 12, 1 y 2 van seguidos, en
    // ese orden, sin código ni break entre ellos.
    validateEstructura30(stripped, rule) {
        if (!stripped.trim()) {
            this.errors.push(rule.missing);
            return false;
        }
        const masked = maskJavaStrings(stripped);
        if (!/\bcase\s+12\s*:\s*case\s+1\s*:\s*case\s+2\s*:/.test(masked)) {
            this.errors.push('Los tres casos tienen que compartir la misma impresión, sin código entre ellos.');
            return false;
        }
        const exercise = exercisesData.find((e) => e.id === 30);
        const solBase = normalizeStructToks(tokenizeJava(stripJavaComments(exercise.solution)));
        const stuToks = normalizeStructToks(tokenizeJava(stripped));
        if (stuToks.some((t) => t.k === 'bad')) {
            this.errors.push('Hay un texto sin cerrar con comillas.');
            return false;
        }
        if (!parensBalanced(stuToks)) {
            this.errors.push('Falta cerrar un paréntesis.');
            return false;
        }
        const refIds = new Set(solBase.filter((t) => t.k === 'id').map((t) => t.v));
        const opts = { fixed: refIds, stringsFree: false, declared: collectStudentEntities(stripped), context: new Set() };
        const m = structuralMatchTokens(stuToks, solBase, opts);
        if (!m.ok) {
            this.errors.push(rule.missing);
            return false;
        }
        const badCall = checkCallParens(stuToks, m.used);
        if (badCall) {
            this.errors.push(badCall);
            return false;
        }
        const badEmpty = checkEmptyParens(stuToks, solBase, m.align);
        if (badEmpty) {
            this.errors.push(badEmpty);
            return false;
        }
        const undecl = checkNoUndeclared(stuToks, refIds, opts.declared, opts.context);
        if (undecl) {
            this.errors.push(undecl);
            return false;
        }
        return true;
    }
}

// Aviso de llaves (c-11-editor-ux): helper PURO, solo texto para el
// estudiante. Cuenta `{` vs `}` ignorando el contenido entre comillas
// simples/dobles y los comentarios `//`. Devuelve `null` si están
// balanceadas, o la dirección (falta/sobra apertura/cierre) en español
// simple. NUNCA cambia veredictos: ninguna regla lo usa.
function braceNotice(code) {
    let open = 0;
    let close = 0;
    let inSingle = false;
    let inDouble = false;
    let inLineComment = false;
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        const next = code[i + 1];
        if (inLineComment) {
            if (ch === '\n') inLineComment = false;
            continue;
        }
        if (inSingle) {
            if (ch === '\\') { i++; continue; }
            if (ch === "'") inSingle = false;
            continue;
        }
        if (inDouble) {
            if (ch === '\\') { i++; continue; }
            if (ch === '"') inDouble = false;
            continue;
        }
        if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
        if (ch === "'") { inSingle = true; continue; }
        if (ch === '"') { inDouble = true; continue; }
        if (ch === '{') open++;
        else if (ch === '}') close++;
    }
    if (open === close) return null;
    if (open > close) {
        return 'Parece que falta una llave de cierre (}). Revisá que cada llave de apertura { tenga su cierre.';
    }
    if (open === 0) {
        return 'Parece que falta una llave de apertura ({). Revisá si hay una llave de cierre sin su apertura.';
    }
    return 'Parece que sobra una llave de cierre (}). Revisá si hay una llave de cierre de más.';
}

// ============================================
// C-18 lote 1 (ids 1-8): validación estructural
// ============================================
// Helpers para los validadores de los ids 1-8. Todo el análisis
// estructural se hace sobre el código SIN comentarios (la respuesta pegada
// en un comentario nunca aprueba) y SIN mirar dentro de los strings (un
// texto que menciona una palabra clave no cuenta como código). El
// comentario-quitado conserva longitud y saltos: los índices valen igual en
// el código original y en el procesado.

function stripJavaComments(code) {
    let out = '';
    let inSingle = false;
    let inDouble = false;
    let inTextBlock = false;
    let inLine = false;
    let inBlock = false;
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        const next = i + 1 < code.length ? code[i + 1] : '';
        if (inTextBlock) {
            out += ch;
            if (ch === '\\') { out += next; i++; continue; }
            if (ch === '"' && next === '"' && code[i + 2] === '"') { out += '""'; i += 2; inTextBlock = false; }
            continue;
        }
        if (inLine) {
            if (ch === '\n') { inLine = false; out += '\n'; }
            else out += ' ';
            continue;
        }
        if (inBlock) {
            if (ch === '*' && next === '/') { inBlock = false; out += '  '; i++; continue; }
            out += (ch === '\n') ? '\n' : ' ';
            continue;
        }
        if (inSingle) {
            out += ch;
            if (ch === '\\') { out += next; i++; continue; }
            if (ch === "'") inSingle = false;
            continue;
        }
        if (inDouble) {
            out += ch;
            if (ch === '\\') { out += next; i++; continue; }
            if (ch === '"') inDouble = false;
            continue;
        }
        if (ch === '/' && next === '/') { inLine = true; out += '  '; i++; continue; }
        if (ch === '/' && next === '*') { inBlock = true; out += '  '; i++; continue; }
        if (ch === "'") { inSingle = true; out += ch; continue; }
        if (ch === '"' && next === '"' && code[i + 2] === '"') { inTextBlock = true; out += '"""'; i += 2; continue; }
        if (ch === '"') { inDouble = true; out += ch; continue; }
        out += ch;
    }
    return out;
}

function maskJavaStrings(code) {
    // Reemplaza el CONTENIDO de "..." y '...' por espacios (conserva
    // comillas, longitud y saltos). Sirve para buscar palabras clave sin
    // que un texto las dispare.
    let out = '';
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        if (inDouble) {
            if (ch === '\\' && i + 1 < code.length) { out += '  '; i++; continue; }
            if (ch === '"') { inDouble = false; out += '"'; continue; }
            out += (ch === '\n') ? '\n' : ' ';
            continue;
        }
        if (inSingle) {
            if (ch === '\\' && i + 1 < code.length) { out += '  '; i++; continue; }
            if (ch === "'") { inSingle = false; out += "'"; continue; }
            out += (ch === '\n') ? '\n' : ' ';
            continue;
        }
        if (ch === '"') { inDouble = true; out += '"'; continue; }
        if (ch === "'") { inSingle = true; out += "'"; continue; }
        out += ch;
    }
    return out;
}

// Nombre de clase válido para las reglas de nombre libre (C-18): empieza
// con una letra, sigue con letras, números o guion bajo. Sin espacios ni
// símbolos (p. ej. `1Hola` o `Mi Clase` no valen).
function isValidJavaClassName(name) {
    return /^[A-Za-z][A-Za-z0-9_]*$/.test(name);
}

// Primera declaración `class <Nombre>` con nombre válido sobre código ya
// enmascarado. Si hay `class` pero el nombre no es válido (número al
// inicio, guion/espacio/símbolo, o texto pegado antes de la llave) o falta
// `public` cuando se exige, devuelve el motivo en vez de la coincidencia.
// Devuelve {ok, name, index} o {ok:false, reason}.
function matchClassDecl(masked, requirePublic) {
    const re = requirePublic
        ? /\bpublic\s+class\s+([A-Za-z][A-Za-z0-9_]*)(?![\w$-])/
        : /\b(?:public\s+)?class\s+([A-Za-z][A-Za-z0-9_]*)(?![\w$-])/;
    const m = re.exec(masked);
    if (m) {
        // El nombre tiene que cerrar la declaración: solo espacios (y a lo
        // sumo extends/implements) hasta la llave (`class Mi Clase {` no
        // vale aunque `Mi` parezca válido).
        if (/^\s*(?:extends\s+[\w$.]+\s*)?(?:implements\s+[\w$.,\s]+\s*)?\{/.test(masked.slice(m.index + m[0].length))) {
            return { ok: true, name: m[1], index: m.index };
        }
        return { ok: false, reason: 'invalid-name' };
    }
    const mAny = /\bclass\s+([^\s{]+)/.exec(masked);
    if (mAny) {
        if (!isValidJavaClassName(mAny[1])) return { ok: false, reason: 'invalid-name' };
        return { ok: false, reason: 'missing' };
    }
    return { ok: false, reason: 'missing' };
}

function splitTopLevel(s, sep) {
    // Parte por `sep` solo a tope (ignora separadores dentro de strings y
    // paréntesis).
    const parts = [];
    let depth = 0;
    let inS = false;
    let inD = false;
    let cur = '';
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inD) {
            cur += ch;
            if (ch === '\\' && i + 1 < s.length) { cur += s[i + 1]; i++; continue; }
            if (ch === '"') inD = false;
            continue;
        }
        if (inS) {
            cur += ch;
            if (ch === '\\' && i + 1 < s.length) { cur += s[i + 1]; i++; continue; }
            if (ch === "'") inS = false;
            continue;
        }
        if (ch === '"') { inD = true; cur += ch; continue; }
        if (ch === "'") { inS = true; cur += ch; continue; }
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (ch === sep && depth === 0) { parts.push(cur); cur = ''; continue; }
        cur += ch;
    }
    parts.push(cur);
    return parts;
}

function findPrintCalls(stripped) {
    // Busca System.out.print/println/printf sobre código ya sin comentarios.
    // Localiza en versión enmascarada (los strings no generan llamadas
    // falsas) y analiza paréntesis y argumento sobre el código real.
    const masked = maskJavaStrings(stripped);
    const calls = [];
    const re = /System\s*\.\s*out\s*\.(println|printf|print)\b/g;
    let m;
    let guard = 0;
    while ((m = re.exec(masked)) !== null && guard++ < 1000) {
        const method = m[1];
        let i = m.index + m[0].length;
        while (i < stripped.length && /\s/.test(stripped[i])) i++;
        if (stripped[i] !== '(') {
            calls.push({ method, ok: false, reason: 'no-paren', index: m.index });
            continue;
        }
        let depth = 0;
        let inS = false;
        let inD = false;
        let j = i;
        let closed = false;
        for (; j < stripped.length; j++) {
            const ch = stripped[j];
            if (inD) {
                if (ch === '\\') { j++; continue; }
                if (ch === '"') inD = false;
                continue;
            }
            if (inS) {
                if (ch === '\\') { j++; continue; }
                if (ch === "'") inS = false;
                continue;
            }
            if (ch === '"') { inD = true; continue; }
            if (ch === "'") { inS = true; continue; }
            if (ch === '(') depth++;
            else if (ch === ')') {
                depth--;
                if (depth === 0) { closed = true; break; }
            }
        }
        if (!closed) {
            calls.push({ method, ok: false, reason: 'unclosed-paren', index: m.index });
            continue;
        }
        const arg = stripped.slice(i + 1, j);
        let k = j + 1;
        while (k < stripped.length && /\s/.test(stripped[k])) k++;
        const hasSemicolon = stripped[k] === ';';
        calls.push({ method, ok: true, arg, hasSemicolon, index: m.index });
    }
    return calls;
}

function collectDeclaredVars(stripped) {
    // Nombres declarados en el código (tipos, contadores de for, cada
    // variable del for-each, catch y parámetro String[]/String... args).
    // Sirve para aceptar println(variable) solo si existe de verdad.
    const masked = maskJavaStrings(stripped);
    const found = new Set();
    const notNames = new Set(['int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'String', 'var',
        'void', 'public', 'private', 'protected', 'static', 'class', 'if', 'else', 'for', 'while', 'return', 'new', 'final']);
    const decl = /\b(?:int|long|double|float|boolean|char|byte|short|String|var)\b/g;
    let m;
    let guard = 0;
    while ((m = decl.exec(masked)) !== null && guard++ < 2000) {
        let depth = 0;
        let name = '';
        const flush = () => {
            if (/^[A-Za-z_$][\w$]*$/.test(name) && !notNames.has(name)) found.add(name);
            name = '';
        };
        let j = m.index + m[0].length;
        for (; j < masked.length; j++) {
            const ch = masked[j];
            if (ch === '(' || ch === '[') { flush(); depth++; continue; }
            if (ch === ')' || ch === ']') { flush(); depth--; continue; }
            if ((ch === ';' || ch === '{' || ch === '}') && depth <= 0) break;
            if (depth === 0) {
                if (/[A-Za-z_$0-9]/.test(ch)) name += ch;
                else flush();
            }
        }
        flush();
    }
    const counter = /\bfor\s*\(\s*(?:int|long|var)?\s*([A-Za-z_$][\w$]*)\s*=/g;
    while ((m = counter.exec(masked)) !== null && guard++ < 2000) found.add(m[1]);
    const each = /\bfor\s*\([^;()]*?\b([A-Za-z_$][\w$]*)\s*:/g;
    while ((m = each.exec(masked)) !== null && guard++ < 2000) found.add(m[1]);
    const catcher = /\bcatch\s*\(\s*[A-Za-z_$][\w$.$]*\s+([A-Za-z_$][\w$]*)\s*\)/g;
    while ((m = catcher.exec(masked)) !== null && guard++ < 2000) found.add(m[1]);
    const strParam = /\bString\s*(?:\[\]\s*|\.\.\.\s*)([A-Za-z_$][\w$]*)/g;
    while ((m = strParam.exec(masked)) !== null && guard++ < 2000) found.add(m[1]);
    const strParamPost = /\bString\s+([A-Za-z_$][\w$]*)\s*\[\]/g;
    while ((m = strParamPost.exec(masked)) !== null && guard++ < 2000) found.add(m[1]);
    return found;
}

function checkPrintableArg(arg, declared) {
    // Decisión 3 del lote 1: vale texto entre comillas dobles, variable
    // declarada antes, o suma (+) de esas partes. Lo demás se rechaza con
    // un mensaje conceptual (nunca la respuesta).
    if (arg === undefined || arg === null) {
        return { ok: false, message: 'Falta escribir algo para imprimir dentro del paréntesis.' };
    }
    const parts = splitTopLevel(arg, '+').map((p) => p.trim()).filter((p) => p.length > 0);
    if (parts.length === 0) {
        return { ok: false, message: 'Falta escribir algo para imprimir dentro del paréntesis.' };
    }
    for (const part of parts) {
        if (/^"([^"\\\n]|\\.)*"$/.test(part)) {
            if (part.length === 2) {
                return { ok: false, message: 'El texto a imprimir no puede estar vacío.' };
            }
            continue;
        }
        if (/^'([^'\\\n]|\\.)*'$/.test(part)) continue;
        if (/^[0-9]+(\.[0-9]+)?$/.test(part)) continue;
        if (/^[A-Za-z_$][\w$]*$/.test(part)) {
            if (!declared.has(part)) {
                // Ajuste 2026-10-04 (decisión Belén): pista conceptual sin
                // respuesta — si quería mostrar texto, va entrecomillado.
                return { ok: false, message: 'Esa variable no está declarada antes de usarla. Si querías mostrar un texto, va entre comillas dobles.' };
            }
            continue;
        }
        return { ok: false, message: 'El texto que querés imprimir va entre comillas dobles.' };
    }
    return { ok: true };
}

function callDefect(call, declared) {
    // Primer defecto de una llamada (null si está completa y válida).
    if (!call.ok) return 'Falta cerrar el paréntesis de la impresión.';
    if (!call.hasSemicolon) return 'Falta el punto y coma (;) al final de la instrucción.';
    // printf lleva formato + argumentos: el primero es el texto
    // entrecomillado (vale con %s/%d), el resto vale como en print.
    if (call.method === 'printf') {
        const parts = splitTopLevel(call.arg, ',').map((p) => p.trim()).filter((p) => p.length > 0);
        if (parts.length === 0) return 'Falta escribir algo para imprimir dentro del paréntesis.';
        if (!/^"([^"\\\n]|\\.)*"$/.test(parts[0]) || parts[0].length === 2) {
            return 'El texto que querés imprimir va entre comillas dobles.';
        }
        for (const part of parts.slice(1)) {
            const verdict = checkPrintableArg(part, declared);
            if (!verdict.ok) return verdict.message;
        }
        return null;
    }
    const verdict = checkPrintableArg(call.arg, declared);
    return verdict.ok ? null : verdict.message;
}

function firstCallDefect(calls, declared) {
    for (const c of calls) {
        const defect = callDefect(c, declared);
        if (defect) return defect;
    }
    return null;
}

function extractParens(stripped, openIndex) {
    // Texto entre el ( de openIndex y su ) gemelo (sensible a strings).
    // null si no cierra.
    let depth = 0;
    let inS = false;
    let inD = false;
    for (let j = openIndex; j < stripped.length; j++) {
        const ch = stripped[j];
        if (inD) {
            if (ch === '\\') { j++; continue; }
            if (ch === '"') inD = false;
            continue;
        }
        if (inS) {
            if (ch === '\\') { j++; continue; }
            if (ch === "'") inS = false;
            continue;
        }
        if (ch === '"') { inD = true; continue; }
        if (ch === "'") { inS = true; continue; }
        if (ch === '(') depth++;
        else if (ch === ')') {
            depth--;
            if (depth === 0) return stripped.slice(openIndex + 1, j);
        }
    }
    return null;
}

function nextOpenBrace(stripped, fromIndex) {
    // Primera { desde fromIndex (ignora strings). -1 si no hay.
    const masked = maskJavaStrings(stripped);
    for (let i = fromIndex; i < masked.length; i++) {
        if (masked[i] === '{') return i;
        if (masked[i] === ';' || masked[i] === '}') return -1;
    }
    return -1;
}

function lineOf(code, index) {
    let line = 1;
    for (let i = 0; i < index && i < code.length; i++) {
        if (code[i] === '\n') line++;
    }
    return line;
}

function extractBlock(stripped, fromIndex) {
    // Bloque { ... } que abre desde fromIndex. null si no hay o no cierra.
    const open = nextOpenBrace(stripped, fromIndex);
    if (open === -1) return null;
    const masked = maskJavaStrings(stripped);
    let depth = 0;
    for (let j = open; j < masked.length; j++) {
        if (masked[j] === '{') depth++;
        else if (masked[j] === '}') {
            depth--;
            if (depth === 0) return { start: open, end: j + 1, body: stripped.slice(open + 1, j) };
        }
    }
    return null;
}

function structuralIndentMessage(stripped) {
    // Indentación por estructura: cada bloque +4 respecto al anterior
    // (base relativa: la primera línea pone el piso). Además cada apertura
    // de bloque queda al final de su línea (nada de todo-en-una-línea).
    const lines = stripped.split('\n');
    let base = null;
    let depth = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        if (base === null) base = line.search(/\S/);
        const masked = maskJavaStrings(line);
        const trimmed = line.trim();
        let d = depth;
        if (trimmed.startsWith('}')) d = depth - 1;
        const expected = base + d * 4;
        const actual = line.search(/\S/);
        if (actual !== expected) {
            return 'La indentación no respeta la estructura: cada bloque va 4 espacios más adentro que el anterior.';
        }
        if (masked.includes('{') && !/\{\s*$/.test(masked.trim())) {
            return 'La indentación no respeta la estructura: cada bloque va 4 espacios más adentro que el anterior.';
        }
        const opens = (masked.match(/\{/g) || []).length;
        const closes = (masked.match(/\}/g) || []).length;
        depth += opens - closes;
        if (depth < 0) depth = 0;
    }
    return null;
}

// ============================================
// C-18 lotes 2+: motor estructural por tokens
// ============================================
// Todo el análisis se hace sobre código SIN comentarios (la respuesta
// pegada en un comentario nunca aprueba). El tokenizer emite tokens
// {k, v} con k en: kw (palabra reservada/tipo primitivo), id, num,
// str (texto entre comillas, contenido exacto), chr (carácter),
// op (operador), sym (símbolo), bad (texto sin cerrar: nunca iguala).

const JAVA_KEYWORDS = new Set((
    'abstract assert boolean break byte case catch char class const continue ' +
    'default do double else enum extends final finally float for goto if ' +
    'implements import instanceof int interface long module native new package ' +
    'permits private protected public record return sealed short static strictfp ' +
    'super switch synchronized this throw throws transient try var void volatile ' +
    'while yield true false null'
).split(' '));

const STRUCT_MULTI_OPS_4 = ['>>>='];
const STRUCT_MULTI_OPS_3 = ['>>>', '>>=', '<<=', '...'];
const STRUCT_MULTI_OPS_2 = [
    '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=',
    '/=', '%=', '&=', '|=', '^=', '<<', '>>', '->', '::'
];

function tokenizeJava(code) {
    const toks = [];
    let i = 0;
    const n = code.length;
    // Letras Unicode (p. ej. ñ en `tamaño`): un identificador Java
    // puede llevarlas; el tokenizer las trata como una sola palabra.
    const isIdStart = (ch) => /[\p{L}_$]/u.test(ch);
    const isIdPart = (ch) => /[\p{L}\p{N}_$]/u.test(ch);
    while (i < n) {
        const ch = code[i];
        if (/\s/.test(ch)) { i++; continue; }
        // Bloque de texto """ ... """ (id 99): un solo token str con el
        // contenido normalizado (cada línea recortada: el indentado
        // interno es formato, el contenido es concepto).
        if (ch === '"' && code[i + 1] === '"' && code[i + 2] === '"') {
            const end = code.indexOf('"""', i + 3);
            if (end === -1) { toks.push({ k: 'bad', v: 'str' }); i = n; continue; }
            const raw = code.slice(i + 3, end);
            toks.push({ k: 'str', v: raw.split('\n').map((l) => l.trim()).join('\n') });
            i = end + 3;
            continue;
        }
        if (ch === '"') {
            let j = i + 1;
            let closed = false;
            while (j < n) {
                if (code[j] === '\\') { j += 2; continue; }
                if (code[j] === '"') { closed = true; break; }
                if (code[j] === '\n') break;
                j++;
            }
            if (!closed) { toks.push({ k: 'bad', v: 'str' }); i = j + (code[j] === '\n' ? 0 : 1); continue; }
            toks.push({ k: 'str', v: code.slice(i + 1, j) });
            i = j + 1;
            continue;
        }
        if (ch === "'") {
            let j = i + 1;
            let closed = false;
            while (j < n) {
                if (code[j] === '\\') { j += 2; continue; }
                if (code[j] === "'") { closed = true; break; }
                if (code[j] === '\n') break;
                j++;
            }
            if (!closed) { toks.push({ k: 'bad', v: 'str' }); i = j + (code[j] === '\n' ? 0 : 1); continue; }
            toks.push({ k: 'chr', v: code.slice(i + 1, j) });
            i = j + 1;
            continue;
        }
        if (/[0-9]/.test(ch)) {
            const m = /^(?:0[xX][0-9a-fA-F_]+|\d[\d_]*(\.\d+)?([eE][+-]?\d+)?[fFdDlL]?)/.exec(code.slice(i));
            toks.push({ k: 'num', v: m[0] });
            i += m[0].length;
            continue;
        }
        if (isIdStart(ch)) {
            let j = i + 1;
            while (j < n && isIdPart(code[j])) j++;
            const w = code.slice(i, j);
            toks.push({ k: JAVA_KEYWORDS.has(w) ? 'kw' : 'id', v: w });
            i = j;
            continue;
        }
        const rest4 = code.slice(i, i + 4);
        const rest3 = code.slice(i, i + 3);
        const rest2 = code.slice(i, i + 2);
        if (STRUCT_MULTI_OPS_4.includes(rest4)) { toks.push({ k: 'op', v: rest4 }); i += 4; continue; }
        if (STRUCT_MULTI_OPS_3.includes(rest3)) { toks.push({ k: 'op', v: rest3 }); i += 3; continue; }
        if (STRUCT_MULTI_OPS_2.includes(rest2)) { toks.push({ k: 'op', v: rest2 }); i += 2; continue; }
        if ('{}()[];,.'.includes(ch)) { toks.push({ k: 'sym', v: ch }); i++; continue; }
        toks.push({ k: 'op', v: ch });
        i++;
    }
    return toks;
}

// Quita los paréntesis que envuelven justo la condición de un ternario
// (`(e >= 18) ? ...` vale igual que `e >= 18 ? ...`, decisión id 16).
// Se aplica a ambos lados, hasta punto fijo. Solo afecta a `( ... ) ?`.
function stripTernaryParens(toks) {
    let cur = toks;
    for (let round = 0; round < 10; round++) {
        let changed = false;
        const out = [];
        let i = 0;
        while (i < cur.length) {
            const t = cur[i];
            if (t.k === 'sym' && t.v === '(') {
                let depth = 0;
                let j = i;
                let ok = true;
                for (; j < cur.length; j++) {
                    const u = cur[j];
                    if (u.k === 'sym' && u.v === '(') depth++;
                    else if (u.k === 'sym' && u.v === ')') {
                        depth--;
                        if (depth === 0) break;
                    } else if (depth === 1 && u.k !== 'bad' &&
                        ((u.k === 'op' && (u.v === '?' || u.v === ':')) ||
                         (u.k === 'sym' && (u.v === ';' || u.v === ',')))) {
                        ok = false;
                        break;
                    }
                }
                const after = cur[j + 1];
                if (ok && j < cur.length && after && after.k === 'op' && after.v === '?') {
                    for (let k = i + 1; k < j; k++) out.push(cur[k]);
                    i = j + 1;
                    changed = true;
                    continue;
                }
            }
            out.push(t);
            i++;
        }
        cur = out;
        if (!changed) break;
    }
    return cur;
}

// Quita el tipo del init de un for (`for (int i = ...` → `for (i = ...`).
// Solo para reglas con forInitTypeOptional (id 22: `i` predeclarada).
function dropForInitType(toks) {
    const out = toks.slice();
    const types = new Set(['int', 'long', 'short', 'byte', 'var']);
    for (let i = 0; i + 4 < out.length; i++) {
        if (out[i].k === 'kw' && out[i].v === 'for' &&
            out[i + 1].k === 'sym' && out[i + 1].v === '(' &&
            (out[i + 2].k === 'kw') && types.has(out[i + 2].v) &&
            out[i + 3].k === 'id' &&
            out[i + 4].k === 'op' && out[i + 4].v === '=') {
            out.splice(i + 2, 1);
        }
    }
    return out;
}

// Llaves opcionales de una sola instrucción (`if (c) x();` vale igual
// que `if (c) { x(); }`): se quitan en ambos lados antes de comparar.
// Solo cuerpos de if/else/while/for vacíos o de una sola instrucción
// terminada en `;` y sin llaves adentro. Nunca métodos, clases,
// try/catch, do-while, switch, lambdas ni cuerpos con varias
// instrucciones.
function stripOptionalBraces(toks) {
    const findClose = (open) => {
        let depth = 0;
        for (let j = open; j < toks.length; j++) {
            if (toks[j].k === 'sym' && toks[j].v === '{') depth++;
            else if (toks[j].k === 'sym' && toks[j].v === '}') {
                depth--;
                if (depth === 0) return j;
            }
        }
        return -1;
    };
    const matchParen = (closeIdx) => {
        let depth = 0;
        for (let j = closeIdx; j >= 0; j--) {
            if (toks[j].k === 'sym' && toks[j].v === ')') depth++;
            else if (toks[j].k === 'sym' && toks[j].v === '(') {
                depth--;
                if (depth === 0) return j;
            }
        }
        return -1;
    };
    const removable = new Set();
    for (let i = 0; i < toks.length; i++) {
        if (!(toks[i].k === 'sym' && toks[i].v === '{')) continue;
        const prev = i > 0 ? toks[i - 1] : null;
        let allowed = false;
        if (prev && prev.k === 'kw' && prev.v === 'else') allowed = true;
        else if (prev && prev.k === 'sym' && prev.v === ')') {
            const open = matchParen(i - 1);
            const before = open > 0 ? toks[open - 1] : null;
            if (before && before.k === 'kw' && (before.v === 'if' || before.v === 'while' || before.v === 'for')) allowed = true;
        }
        if (!allowed) continue;
        const close = findClose(i);
        if (close === -1) continue;
        const inner = toks.slice(i + 1, close);
        if (inner.some((t) => t.k === 'sym' && (t.v === '{' || t.v === '}'))) continue;
        if (inner.filter((t) => t.k === 'sym' && t.v === ';').length > 1) continue;
        removable.add(i);
        removable.add(close);
    }
    if (removable.size === 0) return toks;
    return toks.filter((_, idx) => !removable.has(idx));
}

// Tras un match: un nombre usado por la solución seguido de un `(` de
// llamada no consumido es una llamada que no existe así (p. ej.
// `nums.length()` donde se pedía `nums.length`): se rechaza.
function checkCallParens(stuToks, usedIdx) {
    for (const j of usedIdx) {
        if (stuToks[j].k !== 'id') continue;
        const next = j + 1 < stuToks.length ? stuToks[j + 1] : null;
        if (next && next.k === 'sym' && next.v === '(' && !usedIdx.has(j + 1)) {
            return 'Revisá los paréntesis: hay una llamada que no coincide con lo pedido.';
        }
    }
    return null;
}

// Paréntesis vacíos de la solución (`()`, como en `() ->` o
// `println()`): en el código del estudiante van vacíos también
// (una `x` adentro cambia la aridad o la salida y se rechaza).
function checkEmptyParens(stuToks, solToks, align) {
    for (let si = 0; si + 1 < solToks.length; si++) {
        const a = solToks[si];
        const b = solToks[si + 1];
        if (a.k === 'sym' && a.v === '(' && b.k === 'sym' && b.v === ')') {
            if (align.get(si + 1) !== align.get(si) + 1) {
                return 'Revisá los paréntesis: van vacíos donde no hay nada que pasar.';
            }
        }
    }
    return null;
}

// `X++` vale igual que `X += 1` y que `X = X + 1`, pero SOLO con el 1
// literal (D-09, cierre C-18): se normalizan las tres formas a `X++` en
// ambos lados antes de comparar. `A += B` con otro valor NO se toca
// (`suma = suma + i` sigue exigiendo `+=`: decisión del lote 2). El `--`
// queda fuera (ninguna equivalencia para decremento). Solo aplica cuando
// al 1 le sigue fin de instrucción (;) , `)`, `,`, `}` o fin del código.
// Las reglas con `strictIncr` (la consigna exige la forma `++`/`--`:
// ids 21, 22, 23) no usan esta normalización.
function normalizeIncrements(toks) {
    const out = [];
    const isEnd = (t) => !t || (t.k === 'sym' && (t.v === ';' || t.v === ')' || t.v === ',' || t.v === '}'));
    for (let i = 0; i < toks.length; i++) {
        const t = toks[i];
        const a = toks[i + 1];
        const b = toks[i + 2];
        const c = toks[i + 3];
        const d = toks[i + 4];
        const e = toks[i + 5];
        if (t.k === 'id' && a && a.k === 'op' && a.v === '=' &&
            b && b.k === 'id' && b.v === t.v &&
            c && c.k === 'op' && c.v === '+' &&
            d && d.k === 'num' && d.v === '1' && isEnd(e)) {
            out.push(t, { k: 'op', v: '++' });
            i += 4;
            continue;
        }
        if (t.k === 'id' && a && a.k === 'op' && a.v === '+=' &&
            b && b.k === 'num' && b.v === '1' && isEnd(c)) {
            out.push(t, { k: 'op', v: '++' });
            i += 2;
            continue;
        }
        out.push(t);
    }
    return out;
}

// Quita capas externas de paréntesis que envuelven todo el texto
// (`((k))` → `k`): solo cuando el primer `(` cierra justo al final, así
// los paréntesis con significado (`(a) + (b)`) quedan intactos. Si hay
// paréntesis dentro de un texto se prefiere no quitar (seguro).
function stripOuterParens(s) {
    let t = s.trim();
    for (let round = 0; round < 10; round++) {
        if (t.length < 2 || t[0] !== '(' || t[t.length - 1] !== ')') break;
        let depth = 0;
        let closesAtEnd = false;
        for (let i = 0; i < t.length; i++) {
            if (t[i] === '(') depth++;
            else if (t[i] === ')') {
                depth--;
                if (depth === 0) { closesAtEnd = (i === t.length - 1); break; }
            }
        }
        if (!closesAtEnd) break;
        t = t.slice(1, -1).trim();
    }
    return t;
}

function normalizeStructToks(toks, flags) {
    const base = (flags && flags.strictIncr) ? toks : normalizeIncrements(toks);
    return sortModifierRuns(stripTernaryParens(stripOptionalBraces(base)));
}

// El orden de los modificadores no es concepto (`static public final`
// dice lo mismo que `public static final`): rachas de 2+ modificadores
// seguidos se ordenan igual en ambos lados antes de comparar.
const MODIFIER_RANK = {
    public: 0, private: 1, protected: 2, static: 3, final: 4, abstract: 5,
    synchronized: 6, transient: 7, volatile: 8, native: 9, strictfp: 10, default: 11,
};

function sortModifierRuns(toks) {
    const out = toks.slice();
    let i = 0;
    while (i < out.length) {
        if (out[i].k === 'kw' && Object.prototype.hasOwnProperty.call(MODIFIER_RANK, out[i].v)) {
            let j = i;
            while (j < out.length && out[j].k === 'kw' &&
                Object.prototype.hasOwnProperty.call(MODIFIER_RANK, out[j].v)) j++;
            if (j - i >= 2) {
                const run = out.slice(i, j).sort((a, b) => MODIFIER_RANK[a.v] - MODIFIER_RANK[b.v]);
                for (let k = 0; k < run.length; k++) out[i + k] = run[k];
            }
            i = j;
        } else i++;
    }
    return out;
}
// Subsecuencia ordenada con renombrado consistente y biyectivo:
// cada token de `sol` debe aparecer en orden en `stu`; los nombres no
// fijos se ligan al primer candidato válido (declarado o de contexto,
// nunca un nombre fijo ni uno ya ligado) y después exigen el mismo.
// Los textos comparan exacto salvo stringsFree (cualquier texto vale,
// pero tiene que haber texto entre comillas). Devuelve los índices
// usados, para la vigilancia de paréntesis de llamada.
function structuralMatchTokens(stu, sol, opts) {
    const findNext = (from, pred) => {
        for (let k = from; k < stu.length; k++) {
            if (pred(stu[k])) return k;
        }
        return -1;
    };
    const bound = new Map();
    const used = new Set();
    const usedIdx = new Set();
    const align = new Map();
    const take = (k, si) => { usedIdx.add(k); align.set(si, k); return k; };
    let j = 0;
    let si = 0;
    for (const t of sol) {
        if (t.k === 'str') {
            if (opts.stringsFree) j = findNext(j, (s) => s.k === 'str' || s.k === 'chr');
            else j = findNext(j, (s) => s.k === 'str' && s.v === t.v);
            if (j === -1) return { ok: false };
            j = take(j, si) + 1;
        } else if (t.k === 'id') {
            if (opts.fixed.has(t.v)) {
                j = findNext(j, (s) => s.k === 'id' && s.v === t.v);
                if (j === -1) return { ok: false };
                used.add(t.v);
                j = take(j, si) + 1;
            } else if (bound.has(t.v)) {
                const want = bound.get(t.v);
                j = findNext(j, (s) => s.k === 'id' && s.v === want);
                if (j === -1) return { ok: false };
                j = take(j, si) + 1;
            } else {
                let found = -1;
                for (let k = j; k < stu.length; k++) {
                    const s = stu[k];
                    if (s.k !== 'id') continue;
                    if (opts.fixed.has(s.v)) continue;
                    if (used.has(s.v)) continue;
                    if (!opts.declared.has(s.v) && !opts.context.has(s.v)) continue;
                    found = k;
                    break;
                }
                if (found === -1) return { ok: false };
                bound.set(t.v, stu[found].v);
                used.add(stu[found].v);
                j = take(found, si) + 1;
            }
        } else {
            j = findNext(j, (s) => s.k === t.k && s.v === t.v);
            if (j === -1) return { ok: false };
            j = take(j, si) + 1;
        }
        si++;
    }
    return { ok: true, used: usedIdx, align };
}

// Nombres que el estudiante declara: variables (reutiliza
// collectDeclaredVars) + clases/interfaces/enums/records del código +
// declaraciones `Tipo nombre` de cualquier tipo (p. ej. `Runnable r`,
// `Persona otra`, `T item`: el primer nombre no puede ser palabra de
// control, para no tragar `return x` o `new Y`).
const STRUCT_NONTYPE_WORDS = new Set((
    'if else for while do switch case default break continue return new ' +
    'throw throws try catch finally class interface enum record extends ' +
    'implements import package instanceof assert synchronized super this ' +
    'void goto const'
).split(' '));

function collectStudentEntities(stripped) {
    const set = collectDeclaredVars(stripped);
    const masked = maskJavaStrings(stripped);
    let m;
    let guard = 0;
    const reClass = /\b(?:class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/g;
    while ((m = reClass.exec(masked)) !== null && guard++ < 500) set.add(m[1]);
    const reDecl = /\b([A-Za-z_$][\w$]*)\s+([A-Za-z_$][\w$]*)\s*(?=[=;,:)\]])/g;
    while ((m = reDecl.exec(masked)) !== null && guard++ < 2000) {
        if (!STRUCT_NONTYPE_WORDS.has(m[1])) set.add(m[2]);
    }
    // Parámetros de lambda (`s ->`, `(a, b) ->`): nombres declarados
    // donde aparecen, para el renombrado y la vigilancia.
    const reLambda1 = /(?:^|[^A-Za-z_$0-9])([A-Za-z_$][\w$]*)\s*->/g;
    while ((m = reLambda1.exec(masked)) !== null && guard++ < 2000) set.add(m[1]);
    const reLambdaN = /\(([^()@]*)\)\s*->/g;
    while ((m = reLambdaN.exec(masked)) !== null && guard++ < 2000) {
        for (const item of m[1].split(',')) {
            const name = item.trim().split(/\s+/).pop();
            if (/^[A-Za-z_$][\w$]*$/.test(name)) set.add(name);
        }
    }
    return set;
}

// Métodos que van sin modificador de visibilidad (p. ej. setUp con
// visibilidad de paquete): si aparece `public/protected/... void
// nombre(`, se rechaza aunque el resto esté bien.
function checkBareMethods(stripped, names) {
    if (!names || names.length === 0) return null;
    const masked = maskJavaStrings(stripped);
    for (const name of names) {
        const re = new RegExp('\\b(?:public|private|protected|static|final|synchronized|native|transient|volatile|abstract)\\s+void\\s+' + name + '\\s*\\(');
        if (re.test(masked)) {
            return 'El método va sin modificador de visibilidad.';
        }
    }
    return null;
}
// El diamante `<>` vacío en el `new` es concepto (no vale repetir el
// tipo: `new ArrayList<String>()`): si la regla lo exige, todo
// `new Tipo<...>` con argumentos explícitos se rechaza.
function checkDiamond(stripped) {
    const masked = maskJavaStrings(stripped);
    const re = /\bnew\s+[A-Za-z_$][\w$]*\s*</g;
    let m;
    let guard = 0;
    while ((m = re.exec(masked)) !== null && guard++ < 200) {
        const after = masked.slice(m.index + m[0].length).replace(/^\s+/, '');
        if (!after.startsWith('>')) {
            return 'Usá el diamante <> vacío en el new, sin repetir el tipo.';
        }
    }
    return null;
}
// Nombres propios de la plataforma/JDK y de frameworks de test: nunca
// cuentan como estrictura ni como "no declarado".
const COMMON_NAMES = new Set((
    'String System out err in Math Object Class Integer Long Double Float ' +
    'Boolean Character Byte Short Void StringBuilder StringBuffer ArrayList ' +
    'LinkedList HashSet TreeSet HashMap TreeMap LinkedHashMap ConcurrentHashMap ' +
    'CopyOnWriteArrayList List Set Map Collection Collections Arrays Optional ' +
    'Stream Collectors Files Path Paths Scanner Random Thread Runnable Callable ' +
    'Future CompletableFuture ExecutorService Executors CountDownLatch CyclicBarrier ' +
    'Semaphore BlockingQueue ArrayBlockingQueue ReentrantLock ReadWriteLock ' +
    'ReentrantReadWriteLock AtomicInteger AtomicBoolean Predicate Function Consumer ' +
    'Supplier Comparator Comparable Iterable Iterator Exception RuntimeException ' +
    'IOException SQLException NumberFormatException NullPointerException ' +
    'ArrayIndexOutOfBoundsException IllegalArgumentException IllegalStateException ' +
    'InterruptedException Override Test BeforeEach AfterEach ParameterizedTest ' +
    'ValueSource MethodSource assertEquals assertNotEquals assertTrue assertFalse ' +
    'assertNull assertNotNull assertThrows assertDoesNotThrow assertThat isNotNull ' +
    'isNull startsWith endsWith hasSize contains isEqualTo mock when verify ' +
    'thenReturn given any eq PrintStream BufferedReader BufferedWriter FileReader ' +
    'FileWriter InputStream OutputStream Serializable Cloneable'
).split(' '));

// Tras un match exitoso: todo nombre pelado del estudiante (no tras `.`,
// no llamada ni declaración `nombre(`) tiene que venir de la solución,
// estar declarado, venir del contexto o ser API conocida. Así un nombre
// inventado y sin declarar (p. ej. `println(zz)`) se rechaza aunque el
// resto de la estructura esté presente.
function checkNoUndeclared(stuToks, solIds, declared, context) {
    let inImport = false;
    for (let p = 0; p < stuToks.length; p++) {
        const t = stuToks[p];
        if (t.k === 'kw' && (t.v === 'import' || t.v === 'package')) { inImport = true; continue; }
        if (inImport) {
            if (t.k === 'sym' && t.v === ';') inImport = false;
            continue;
        }
        if (t.k !== 'id') continue;
        const prev = p > 0 ? stuToks[p - 1] : null;
        const next = p + 1 < stuToks.length ? stuToks[p + 1] : null;
        if (prev && prev.k === 'sym' && prev.v === '.') continue;
        if (next && next.k === 'sym' && next.v === '(') continue;
        if (solIds.has(t.v)) continue;
        if (declared.has(t.v)) continue;
        if (context.has(t.v)) continue;
        if (COMMON_NAMES.has(t.v)) continue;
        return 'Esa variable no está declarada antes de usarla. Si querías mostrar un texto, va entre comillas dobles.';
    }
    return null;
}

function parensBalanced(toks) {
    let d = 0;
    for (const t of toks) {
        if (t.k === 'sym' && t.v === '(') d++;
        else if (t.k === 'sym' && t.v === ')') {
            d--;
            if (d < 0) return false;
        }
    }
    return d === 0;
}

// Impresión de la tabla del id 26: println-concat con formato " x " /
// " = " y producto i*j, o printf con formato %d que incluya x/= y salto
// de línea, con i, j y el producto entre los argumentos.
function checkTablaPrint(c) {
    if (!c.ok || !c.hasSemicolon) return false;
    if (c.method === 'println') {
        const toks = tokenizeJava(c.arg);
        const has = (pred) => toks.some(pred);
        if (!has((t) => t.k === 'id' && t.v === 'i')) return false;
        if (!has((t) => t.k === 'id' && t.v === 'j')) return false;
        if (!has((t) => t.k === 'str' && t.v === ' x ')) return false;
        if (!has((t) => t.k === 'str' && t.v === ' = ')) return false;
        for (let k = 0; k + 2 < toks.length; k++) {
            if (toks[k].k === 'id' && toks[k].v === 'i' &&
                toks[k + 1].k === 'op' && toks[k + 1].v === '*' &&
                toks[k + 2].k === 'id' && toks[k + 2].v === 'j') return true;
        }
        return false;
    }
    if (c.method === 'printf') {
        const parts = splitTopLevel(c.arg, ',').map((p) => p.trim());
        if (parts.length < 2) return false;
        const fmt = parts[0];
        if (!/^"([^"\\\n]|\\.)*"$/.test(fmt)) return false;
        if (!fmt.includes('%d') || !fmt.includes('x') || !fmt.includes('=')) return false;
        if (!/\\n|%n/.test(fmt)) return false;
        const rest = tokenizeJava(parts.slice(1).join(','));
        if (!rest.some((t) => t.k === 'id' && t.v === 'i')) return false;
        if (!rest.some((t) => t.k === 'id' && t.v === 'j')) return false;
        if (!rest.some((t) => t.k === 'op' && t.v === '*')) return false;
        return true;
    }
    return false;
}

function tablaPrintDefect(c) {
    if (!c.ok) return 'Falta cerrar el paréntesis de la impresión.';
    if (!c.hasSemicolon) return 'Falta el punto y coma (;) al final de la instrucción.';
    return null;
}

// Reglas estructurales por ejercicio (lotes 2+):
// ctx = nombres que da el contexto (la consigna dice "ya está…");
// free = nombres libres (renombrado consistente; el resto es fijo);
// strings = 'fixed' (textos exactos) o 'free' (cualquier texto);
// forInitTypeOptional = el for vale con o sin tipo en el init;
// strictIncr = la consigna exige la forma `++`/`--` (ids 21, 22, 23):
//   no aplica la equivalencia `X++` = `X += 1` = `X = X + 1`;
// custom = validador propio (26: printf alternativo; 30: bloque común);
// missing = mensaje conceptual ante estructura ausente (sin respuesta).
const STRUCT_RULES = {
    9: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar la variable con su tipo y su valor.' },
    10: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar la variable de texto con su valor.' },
    11: { ctx: ['d'], free: [], strings: 'fixed', missing: 'Falta declarar la variable convirtiendo el valor con (int).' },
    12: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar la constante con final, su tipo y su valor.' },
    13: { ctx: ['a', 'b'], free: [], strings: 'fixed', missing: 'Falta declarar la variable con la suma de los dos valores usando +.' },
    14: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar la variable con el resto de la división usando %.' },
    15: { ctx: ['a', 'b'], free: [], strings: 'fixed', missing: 'Falta declarar la variable combinando los dos valores con AND (&&).' },
    16: { ctx: ['e'], free: [], strings: 'fixed', missing: 'Falta declarar la variable eligiendo entre los dos valores con el operador ternario.' },
    17: { ctx: ['x'], free: [], strings: 'fixed', missing: 'Falta el if con su condición y la impresión adentro.' },
    18: { ctx: ['n'], free: [], strings: 'fixed', missing: 'Falta el if-else que distingue los dos casos, con su impresión cada uno.' },
    19: { ctx: ['n', 's'], free: [], strings: 'fixed', missing: 'Falta la cadena if / else if / else con los tres resultados.' },
    20: { ctx: ['a', 'b', 'c'], free: [], strings: 'fixed', missing: 'Falta el if con la condición combinada usando &&, || y paréntesis.' },
    // D-09 estrictos (la consigna nombra la forma exacta como parte de lo
    // pedido: 21 "lo incremente con `i++`", 22 "baja con `i--`", 23
    // "súmale 1 con `i++`"). El resto de los `++` acepta `+= 1` y `= + 1`.
    21: { ctx: ['i'], free: [], strings: 'fixed', strictIncr: true, missing: 'Falta el while con su condición, la impresión y el incremento.' },
    22: { ctx: [], free: [], strings: 'fixed', forInitTypeOptional: true, strictIncr: true, missing: 'Falta el for descendente con sus límites y la impresión.' },
    23: { ctx: [], free: [], strings: 'fixed', strictIncr: true, missing: 'Falta el do-while con la inicialización, la impresión, el incremento y la condición.' },
    24: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el for con el if que sale con break y la impresión después.' },
    25: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el for con el if que salta la vuelta con continue y la impresión.' },
    26: { ctx: [], free: [], strings: 'fixed', custom: 26, missing: 'Faltan los dos bucles anidados con la impresión de cada cuenta.' },
    27: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el while que acumula con +=, incrementa y después imprime el total.' },
    28: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta recorrer cada elemento con for-each y la impresión.' },
    29: { ctx: ['dia'], free: [], strings: 'fixed', missing: 'Falta el switch con sus casos, cada impresión y su break.' },
    30: { ctx: [], free: [], strings: 'fixed', custom: 30, missing: 'Falta el switch con los casos compartidos, su impresión y el break.' },
    31: { ctx: ['color'], free: [], strings: 'fixed', missing: 'Falta el switch sobre el texto con sus casos, cada impresión y su break.' },
    32: { ctx: ['nota'], free: [], strings: 'fixed', missing: 'Falta la switch expression con flechas, sus casos y el punto y coma final.' },
    33: { ctx: [], free: [], strings: 'fixed', missing: 'Falta crear el lector, mostrar el texto y leer el número con nextInt.' },
    34: { ctx: [], free: [], strings: 'fixed', missing: 'Falta crear el lector, mostrar el texto y leer la línea con nextLine.' },
    35: { ctx: [], free: [], strings: 'fixed', missing: 'Falta pedir primero el nombre y después la edad, cada uno con su lectura.' },
    36: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el if con hasNextInt, la lectura en un caso y el aviso en el otro.' },
    37: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el do-while que pide y lee hasta que el número sea cero.' },
    38: { ctx: ['sc'], free: [], strings: 'fixed', missing: 'Falta cerrar el lector con close al final.', alts: ['sc.close();'] },
    39: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el try-with-resources con el lector, la lectura y la impresión.' },
    40: { ctx: [], free: [], strings: 'fixed', missing: 'Falta crear el lector, mostrar el texto y leer el decimal con nextDouble.' },
    41: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar el array con new y su tamaño.' },
    42: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar el array inicializado con los tres valores entre llaves.' },
    43: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta imprimir el primer elemento usando su índice.' },
    44: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta cambiar el segundo elemento por el valor pedido usando su índice.' },
    45: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta imprimir cuántos elementos tiene usando length sin paréntesis.' },
    46: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta el for con length que imprime cada elemento.' },
    47: { ctx: ['nums'], free: ['n'], strings: 'fixed', missing: 'Falta acumular cada elemento con += e imprimir el total.' },
    48: { ctx: ['nums'], free: ['n'], strings: 'fixed', missing: 'Falta buscar el mayor comparando cada elemento e imprimirlo.' },
    49: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar la matriz de 2x2 con new.' },
    50: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar la matriz con las dos filas entre llaves anidadas.' },
    51: { ctx: ['m'], free: [], strings: 'fixed', missing: 'Falta imprimir el elemento de la fila y columna pedidas con dos índices.' },
    52: { ctx: ['m'], free: [], strings: 'fixed', missing: 'Falta recorrer filas y columnas imprimiendo cada número con print y el salto por fila.' },
    53: { ctx: ['texto'], free: [], strings: 'fixed', missing: 'Falta imprimir la cantidad de caracteres usando length con paréntesis.' },
    54: { ctx: ['a', 'b'], free: [], strings: 'fixed', missing: 'Falta unir los dos textos con un espacio en el medio e imprimir.' },
    55: { ctx: ['texto'], free: [], strings: 'fixed', missing: 'Falta pasar el texto a mayúsculas con toUpperCase e imprimir.' },
    56: { ctx: ['texto'], free: [], strings: 'fixed', missing: 'Falta tomar la parte del texto con substring y el rango pedido.' },
    57: { ctx: ['a', 'b'], free: [], strings: 'fixed', missing: 'Falta el if que compara los textos con equals y su impresión.' },
    58: { ctx: [], free: [], strings: 'fixed', missing: 'Faltan las tres llamadas a append en orden y la impresión con toString.' },
    59: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método sin retorno que imprime el texto.' },
    60: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método con sus dos parámetros y el return de la suma.' },
    61: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con sus dos atributos y sus tipos.', alts: ['public class Persona {\n    int edad;\n    String nombre;\n}'] },
    62: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el constructor con sus parámetros y las asignaciones con this.', alts: ['public Persona(String nombre, int edad) {\n    this.edad = edad;\n    this.nombre = nombre;\n}'] },
    63: { ctx: [], free: [], strings: 'fixed', missing: 'Falta crear el objeto con new y los dos valores en la variable.' },
    64: { ctx: ['p'], free: [], strings: 'fixed', missing: 'Falta imprimir el atributo accediendo con el punto.' },
    65: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método que imprime el texto junto al atributo.' },
    66: { ctx: ['p'], free: [], strings: 'fixed', missing: 'Falta llamar al método sobre el objeto con el punto.' },
    67: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar el atributo como privado.' },
    68: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método que devuelve el atributo con return.' },
    69: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método que guarda el parámetro en el atributo con this.' },
    70: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método con el if que solo asigna cuando el valor no es negativo.' },
    71: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase hija con extends y su atributo.' },
    72: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el constructor con super en la primera línea y la asignación.' },
    73: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método con @Override que devuelve el texto junto al atributo.' },
    74: { ctx: [], free: [], strings: 'fixed', missing: 'Falta guardar el objeto hijo en la variable de tipo padre.' },
    75: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase abstracta con su método sin cuerpo.' },
    76: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase hija con @Override que imprime el texto.' },
    77: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la interfaz con su método sin cuerpo.' },
    78: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con implements, @Override y la impresión.' },
    79: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con las dos interfaces y sus dos métodos.', alts: ['public class Pato implements Volador, Nadador {\n    public void nadar() { }\n    public void volar() { }\n}'] },
    80: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método default con cuerpo y su impresión.' },
    81: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el atributo estático con su valor inicial.' },
    82: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método de clase con sus parámetros y el return.' },
    83: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la constante de clase con sus modificadores y su valor.' },
    84: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el bloque static que asigna el texto.' },
    85: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase interna con su método vacío.' },
    86: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase anónima con @Override que imprime el texto.' },
    87: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el enum con sus tres constantes en orden.' },
    88: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el enum con sus valores, el atributo privado y el constructor con this.' },
    89: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el equals con @Override, instanceof, la comparación y el false.' },
    90: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el hashCode con @Override que devuelve el del atributo.' },
    91: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el compareTo con @Override que compara con Integer.compare.' },
    92: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase genérica con su atributo y el método que guarda.' },
    93: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método genérico con su parámetro de tipo y la impresión.' },
    94: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con la cota, el método mayor y el ternario con compareTo.' },
    95: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método con wildcard que recorre e imprime cada elemento.' },
    96: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el record con sus dos componentes en orden.' },
    97: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase sellada con sealed y los permitidos.' },
    98: { ctx: ['obj'], free: [], strings: 'fixed', missing: 'Falta el if con pattern matching y la impresión en mayúsculas.' },
    99: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la variable con el bloque de texto de tres líneas.' },
    100: { ctx: ['dia'], free: [], strings: 'fixed', missing: 'Falta la switch expression con sus casos, el bloque con yield y el default.' },
    101: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta declarar la lista con su tipo y el new vacío.' },
    102: { ctx: ['lista'], free: [], strings: 'fixed', missing: 'Faltan los dos add en orden con sus textos.' },
    103: { ctx: ['lista'], free: [], strings: 'fixed', missing: 'Falta guardar el elemento de la posición 0 con get.' },
    104: { ctx: ['lista'], free: [], strings: 'fixed', missing: 'Falta eliminar el primer elemento con remove(0).' },
    105: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta guardar la cantidad de elementos con size().' },
    106: { ctx: ['lista'], free: [], strings: 'fixed', missing: 'Falta recorrer con for-each e imprimir cada elemento.' },
    107: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta declarar el conjunto con su tipo y el new vacío.' },
    108: { ctx: ['set'], free: [], strings: 'fixed', missing: 'Faltan los dos add iguales y la impresión del tamaño.' },
    109: { ctx: ['set'], free: [], strings: 'fixed', missing: 'Falta guardar si contiene el texto usando contains.' },
    110: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta declarar el mapa con sus tipos y el new vacío.' },
    111: { ctx: ['edades'], free: [], strings: 'fixed', missing: 'Faltan los dos put con sus pares.', alts: ['edades.put("Luis", 30);\nedades.put("Ana", 25);'] },
    112: { ctx: ['edades'], free: [], strings: 'fixed', missing: 'Falta guardar el valor de la clave usando get.' },
    113: { ctx: ['mapa'], free: [], strings: 'fixed', missing: 'Falta el if con containsKey y su impresión.' },
    114: { ctx: ['edades'], free: [], strings: 'fixed', missing: 'Falta recorrer con entrySet e imprimir cada par con getKey y getValue.' },
    115: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta declarar la lista enlazada con su tipo y el new vacío.' },
    116: { ctx: ['lista'], free: [], strings: 'fixed', missing: 'Falta agregar al inicio con addFirst y al final con addLast.' },
    117: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta declarar el conjunto ordenado y agregar los tres números en orden.' },
    118: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta ordenar de menor a mayor con sort.' },
    119: { ctx: ['lista'], free: [], strings: 'fixed', missing: 'Falta invertir el orden con reverse.' },
    120: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta guardar el mayor con max.' },
    121: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el try con la línea dada y el catch del tipo pedido con su impresión.' },
    122: { ctx: [], free: [], strings: 'fixed', missing: 'Faltan los dos catch en orden con sus impresiones.' },
    123: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el try con catch y el finally con su impresión.' },
    124: { ctx: ['edad'], free: [], strings: 'fixed', missing: 'Falta el if que lanza la excepción con su mensaje.', alts: ['if (edad < 0) {\n    throw new IllegalArgumentException("Edad negativa");\n}'] },
    125: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el método con throws en la firma.' },
    126: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con extends, el constructor y el super con el mensaje.' },
    127: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con extends, el constructor y el super con el mensaje.' },
    128: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el try-with-resources con la lectura y el catch que muestra la traza.' },
    129: { ctx: ['consultar'], free: [], strings: 'fixed', missing: 'Falta el multi-catch con | y su impresión.', alts: ['try { } catch (IOException | SQLException e) { System.out.println("Error de I/O o BD"); }', 'try {\n    // código\n} catch (IOException | SQLException e) {\n    System.out.println("Error de I/O o BD");\n}'] },
    130: { ctx: ['e'], free: [], strings: 'fixed', missing: 'Falta guardar el mensaje en la variable e imprimirla.' },
    131: { ctx: ['e'], free: [], strings: 'fixed', missing: 'Falta la llamada que muestra la traza.' },
    132: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el catch que lanza la nueva excepción con mensaje y causa.' },
    133: { ctx: ['edad'], free: [], strings: 'fixed', missing: 'Falta la aserción con su condición, los dos puntos y el mensaje.' },
    134: { ctx: ['texto'], free: [], strings: 'fixed', missing: 'Falta el try con la lectura, el catch del tipo pedido y su impresión.' },
    135: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar el Optional vacío con empty.' },
    136: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar el Optional con el texto usando of.' },
    137: { ctx: ['texto'], free: [], strings: 'fixed', missing: 'Falta crear el Optional desde la variable con ofNullable.' },
    138: { ctx: ['opt'], free: [], strings: 'fixed', missing: 'Falta el if con isPresent y la impresión con get.' },
    139: { ctx: ['opt'], free: [], strings: 'fixed', missing: 'Falta declarar la variable con orElse y su texto.' },
    140: { ctx: ['opt'], free: [], strings: 'fixed', missing: 'Falta el ifPresent con la lambda que imprime.' },
    141: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la lambda sin parámetros que imprime el texto.' },
    142: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la lambda de un parámetro que lo imprime.' },
    143: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la lambda de dos parámetros que devuelve la suma.' },
    144: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la lambda con bloque, la intermedia en mayúsculas y la impresión.' },
    145: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el Predicate par y la prueba con test.' },
    146: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la Function longitud y su aplicación con apply.' },
    147: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el Consumer que imprime y su llamada con accept.' },
    148: { ctx: [], free: [], strings: 'fixed', missing: 'Falta crear Random, el Supplier y su lectura con get.' },
    149: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la referencia al método estático con ::.' },
    150: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la referencia al método de instancia con ::.' },
    151: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la referencia al constructor con ::new.' },
    152: { ctx: ['nums'], free: ['n'], strings: 'fixed', missing: 'Falta el pipeline con filter de pares y collect.' },
    153: { ctx: ['nombres'], free: ['s'], strings: 'fixed', missing: 'Falta el pipeline con map a longitudes y collect.' },
    154: { ctx: ['lista'], free: ['s'], strings: 'fixed', missing: 'Falta el forEach con la lambda que imprime.' },
    155: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta contar los elementos con stream y count.' },
    156: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta el reduce con valor inicial y la lambda que suma.' },
    157: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta el pipeline con sorted y collect.' },
    158: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta el pipeline con distinct y collect.' },
    159: { ctx: ['nums'], free: [], strings: 'fixed', missing: 'Falta el pipeline con limit y su número.' },
    160: { ctx: ['nums'], free: ['n'], strings: 'fixed', missing: 'Falta el anyMatch con la condición de par.' },
    161: { ctx: ['nums'], free: ['n'], strings: 'fixed', missing: 'Falta el allMatch con la condición de par.' },
    162: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar el texto y escribirlo en el archivo.' },
    163: { ctx: [], free: [], strings: 'fixed', missing: 'Falta leer todo el archivo en la variable.' },
    164: { ctx: [], free: [], strings: 'fixed', missing: 'Falta guardar si el archivo existe.' },
    165: { ctx: [], free: [], strings: 'fixed', missing: 'Falta borrar el archivo si existe.' },
    166: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el try con el lector, el bucle hasta null y la impresión.' },
    167: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el try con el escritor, las dos líneas y el salto en el medio.' },
    169: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase que extiende con el método que imprime.' },
    170: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase que implementa con el método que imprime.' },
    171: { ctx: ['t'], free: [], strings: 'fixed', missing: 'Falta iniciar el hilo con start (no con run).' },
    172: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el try con sleep, el catch de interrupción y la traza.' },
    173: { ctx: ['t'], free: [], strings: 'fixed', missing: 'Falta iniciar el hilo y esperarlo con join dentro del try.' },
    174: { ctx: ['contador'], free: [], strings: 'fixed', missing: 'Falta el método synchronized que incrementa.' },
    175: { ctx: ['lock'], free: [], strings: 'fixed', missing: 'Falta el bloque synchronized con el candado dado.' },
    176: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar la variable con volatile y su valor.' },
    177: { ctx: [], free: [], strings: 'fixed', missing: 'Falta declarar el contador atómico e incrementarlo con su método.' },
    178: { ctx: [], free: [], strings: 'fixed', missing: 'Falta crear el pool, enviar la tarea y apagarlo con shutdown.' },
    179: { ctx: ['executor'], free: [], strings: 'fixed', missing: 'Falta la tarea, enviarla guardando el futuro, leer con get y apagar con shutdown.' },
    180: { ctx: [], free: ['s'], strings: 'fixed', missing: 'Falta la cadena con supplyAsync, thenApply, thenAccept y sus textos.' },
    181: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el latch con su cuenta y la espera con await.' },
    182: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la barrera para los hilos indicados.' },
    183: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el semáforo con acquire, el try y el release en finally.' },
    184: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta el mapa concurrente con su entrada.' },
    185: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta la lista concurrente con su elemento.' },
    186: { ctx: [], free: [], strings: 'fixed', diamond: true, missing: 'Falta la cola con capacidad, put, take y su variable.' },
    187: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el candado tomado con lock y liberado en finally.' },
    188: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el candado de lectura tomado y liberado en finally.' },
    189: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con el campo estático, el constructor privado y el método con la guarda null.' },
    190: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la fábrica con sus ramas por texto y el null final.' },
    191: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con su Builder, el return this y el build.' },
    192: { ctx: [], free: ['o'], strings: 'fixed', missing: 'Falta la interfaz, la lista con agregar y el notificar con forEach.' },
    193: { ctx: [], free: [], strings: 'fixed', missing: 'Faltan los tres tipos con la suma y el setter del algoritmo.' },
    194: { ctx: [], free: ['c'], strings: 'fixed', missing: 'Falta la interfaz, el decorador con su constructor y el texto decorado.' },
    195: { ctx: [], free: [], strings: 'fixed', missing: 'Faltan las tres clases separadas.' },
    196: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la jerarquía abstracta con la fórmula del área.' },
    197: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la clase con su método vacío.' },
    198: { ctx: [], free: [], strings: 'fixed', missing: 'Faltan las dos interfaces pequeñas con su método.', alts: ['interface Escaneable {\n    void escanear();\n}\ninterface Imprimible {\n    void imprimir();\n}'] },
    199: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la interfaz, el servicio con su campo y la asignación por constructor.' },
    200: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el test con el cálculo y la comprobación con el esperado primero.' },
    201: { ctx: [], free: [], strings: 'fixed', bare: ['setUp'], missing: 'Falta el método anotado sin retorno.' },
    202: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el test con assertThrows, el tipo y el bloque que lanza.' },
    203: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el mock con su configuración de when y thenReturn.' },
    204: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el mock, la llamada y después la verificación.' },
    205: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el test en rojo y el método mínimo que lo hace pasar.', alts: ['// 1. Red: escribe test que falla\n@Test void testFalla() { assertEquals(5, suma(2, 2)); }\n// 2. Green: implementa mínimo para pasar\nint suma(int a, int b) { return a + b; }\n// 3. Refactor: mejora el código'] },
    206: { ctx: [], free: [], strings: 'fixed', missing: 'Falta la cadena de aserciones con sus tres eslabones.' },
    207: { ctx: [], free: [], strings: 'fixed', missing: 'Falta el test parametrizado con sus valores y la comprobación.' },
    208: { ctx: [], free: [], strings: 'fixed', custom: 208, missing: 'Faltan las ideas de cobertura.' },
};

// Exposición para tests (patrón C-10: la clase se carga con vm).
JavaValidator._struct = {
    tokenizeJava, stripTernaryParens, stripOptionalBraces, sortModifierRuns,
    normalizeStructToks, dropForInitType, structuralMatchTokens,
    collectStudentEntities, checkNoUndeclared, checkCallParens, checkDiamond,
    checkEmptyParens, parensBalanced, STRUCT_RULES, COMMON_NAMES,
};

// Create global validator instance
const javaValidator = new JavaValidator();
