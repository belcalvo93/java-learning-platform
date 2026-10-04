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
        const skipRawIndentationIds = [1, 2, 3, 4, 5, 6, 7, 8];
        this.checkBasicSyntax(code, skipRawIndentationIds.includes(exerciseId));
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
        // Check for assignment in conditions
        if (code.match(/if\s*\([^)]*=[^=][^)]*\)/)) {
            this.warnings.push('Advertencia: Posible asignación (=) en lugar de comparación (==)');
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
                // Normalizar código y solución para comparación
                const normalizeCode = (str) => str
                    .replace(/\r\n/g, '\n')  // Windows line endings
                    .replace(/\r/g, '\n')    // Old Mac line endings
                    .trim();

                const userCode = normalizeCode(code);
                const expectedCode = normalizeCode(exercise.solution);

                isValid = userCode === expectedCode || userCode.includes(expectedCode);
                if (exerciseId === 168) {
                    const hasPipeline = code.includes('Files.lines') && code.includes('.filter(') && code.includes('.forEach(');
                    if (!hasPipeline) {
                        this.errors.push('Error: Debes usar el pipeline Files.lines(...).filter(...).forEach(...);');
                        isValid = false;
                    } else if (this.errors.length === 0) {
                        // Tolerar variaciones de formato con el pipeline
                        // presente y chequeos generales limpios.
                        isValid = true;
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
        const mIf = new RegExp('\\bif\\s*\\(\\s*' + counter + '\\s*%\\s*2\\s*==\\s*0\\s*\\)').exec(forMasked);
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
        const withCounter = prints.filter((c) => c.ok && c.arg.trim() === counter);
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
            if (c.ok && c.hasSemicolon && checkPrintableArg(c.arg, declared).ok) return true;
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
    let inLine = false;
    let inBlock = false;
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        const next = i + 1 < code.length ? code[i + 1] : '';
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

// Create global validator instance
const javaValidator = new JavaValidator();
