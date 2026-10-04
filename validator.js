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
        this.checkBasicSyntax(code);
        this.checkBraces(code);
        this.checkSemicolons(code);
        this.checkOperators(code);

        // Validación específica por ejercicio
        return this.validateExercise(code, exerciseId);
    }

    checkBasicSyntax(code) {
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
        this.checkIndentation(code);
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

    validateHelloWorld(code) {
        if (!code.includes('System.out.println')) {
            this.errors.push('Error: Debes usar System.out.println() para imprimir');
            return false;
        }
        if (!code.match(/System\.out\.println\s*\([^)]+\)\s*;/)) {
            this.errors.push('Error: Sintaxis incorrecta de println. Formato: System.out.println("texto");');
            return false;
        }
        return true;
    }

    validateMultipleLines(code) {
        const printlnCount = (code.match(/System\.out\.println\s*\([^)]+\)\s*;/g) || []).length;
        if (printlnCount < 2) {
            this.errors.push(`Error: Necesitas exactamente 2 llamadas a println (encontradas: ${printlnCount})`);
            return false;
        }
        return true;
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

    validateTwoMethods(code) {
        if (!code.match(/void\s+a\s*\(\s*\)/)) {
            this.errors.push('Error: Debes declarar el método: void a()');
            return false;
        }
        if (!code.match(/void\s+b\s*\(\s*\)/)) {
            this.errors.push('Error: Debes declarar el método: void b()');
            return false;
        }
        const printlnCount = (code.match(/System\.out\.println\s*\([^)]+\)\s*;/g) || []).length;
        if (printlnCount < 2) {
            this.errors.push(`Error: Cada método debe imprimir con System.out.println (encontradas: ${printlnCount}, esperadas: 2)`);
            return false;
        }
        return true;
    }

    validateNestedLoop(code) {
        if (!code.match(/for\s*\(/)) {
            this.errors.push('Error: Debes usar un bucle for: for (init; cond; inc)');
            return false;
        }
        if (!code.match(/%\s*2\s*==\s*0/)) {
            this.errors.push('Error: Debes agregar la condición de número par: if (i % 2 == 0)');
            return false;
        }
        if (!code.includes('System.out.println')) {
            this.errors.push('Error: Debes imprimir con System.out.println()');
            return false;
        }
        return true;
    }

    validateHolaMundo(code) {
        if (!code.match(/System\.out\.println\s*\(\s*"Hola, Java!"\s*\)\s*;/)) {
            this.errors.push('Error: Debes imprimir "Hola, Java!" con System.out.println("Hola, Java!");');
            return false;
        }
        return true;
    }

    validateTwoLines(code) {
        if (!code.includes('Línea 1') || !code.includes('Línea 2')) {
            this.errors.push('Error: Debes imprimir "Línea 1" y "Línea 2" con dos System.out.println');
            return false;
        }
        const printlnCount = (code.match(/System\.out\.println\s*\([^)]+\)\s*;/g) || []).length;
        if (printlnCount < 2) {
            this.errors.push(`Error: Necesitas 2 llamadas a println (encontradas: ${printlnCount})`);
            return false;
        }
        return true;
    }

    validatePrintVsPrintln(code) {
        if (!code.match(/System\.out\.print\s*\(/)) {
            this.errors.push('Error: Debes usar System.out.print() para el primer tramo (sin salto de línea)');
            return false;
        }
        if (!code.match(/System\.out\.println\s*\(/)) {
            this.errors.push('Error: Debes usar System.out.println() para el segundo tramo (con salto de línea)');
            return false;
        }
        return true;
    }

    validatePrintf(code) {
        if (!code.match(/System\.out\.printf\s*\(/)) {
            this.errors.push('Error: Debes usar System.out.printf() para imprimir con formato');
            return false;
        }
        if (!code.includes('%d')) {
            this.errors.push('Error: Debes usar el especificador %d para el número entero');
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

// Create global validator instance
const javaValidator = new JavaValidator();
