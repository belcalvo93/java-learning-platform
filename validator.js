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

            // Check if indentation is correct (must be multiple of 4)
            if (leadingSpaces % indentSize !== 0) {
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

    checkBraces(code) {
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;

        if (openBraces !== closeBraces) {
            this.errors.push(`Error: Llaves desbalanceadas (${openBraces} aperturas, ${closeBraces} cierres)`);
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

        switch (exerciseId) {
            case 1: // Hola Java
                isValid = this.validateHelloWorld(code);
                if (isValid) output = this.extractOutput(code);
                break;

            case 2: // Múltiples líneas
                isValid = this.validateMultipleLines(code);
                if (isValid) output = this.extractOutput(code);
                break;

            case 3: // Variable edad
                isValid = this.validateIntVariable(code, 'edad', 25);
                if (isValid) output = '25';
                break;

            case 4: // Variable String
                isValid = this.validateStringVariable(code, 'nombre');
                if (isValid) output = this.extractOutput(code);
                break;

            case 5: // Suma
                isValid = this.validateSum(code);
                if (isValid) output = 'Resultado: 15';
                break;

            case 6: // If-Else
                isValid = this.validateIfElse(code);
                if (isValid) output = this.simulateIfElse(code, 20);
                break;

            case 7: // Comparar números
                isValid = this.validateComparison(code);
                if (isValid) output = this.simulateComparison(code, 15, 20);
                break;

            case 8: // Bucle for
                isValid = this.validateForLoop(code);
                if (isValid) output = '1\n2\n3\n4\n5';
                break;

            default:
                isValid = code.includes(exercise.solution);
                output = 'Código ejecutado';
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

    extractOutput(code) {
        const matches = code.match(/System\.out\.println\s*\(\s*([^)]+)\s*\)/g);
        if (!matches) return '';

        return matches.map(match => {
            const content = match.match(/\(\s*([^)]+)\s*\)/)[1];
            // Remove quotes and clean up
            return content.replace(/^["']|["']$/g, '').trim();
        }).join('\n');
    }

    simulateIfElse(code, edadValue) {
        // Extract the condition
        const conditionMatch = code.match(/if\s*\(([^)]+)\)/);
        if (!conditionMatch) return '';

        // Simulate: edad = 20
        const condition = conditionMatch[1].replace(/edad/g, edadValue);
        let isTrue = false;

        try {
            // Simple evaluation for >= 18
            if (condition.includes('>=')) {
                isTrue = edadValue >= 18;
            } else if (condition.includes('<=')) {
                isTrue = 18 <= edadValue;
            }
        } catch (e) {
            return '';
        }

        // Extract the appropriate block
        const ifMatch = code.match(/if\s*\([^)]+\)\s*\{([^}]+)\}/);
        const elseMatch = code.match(/else\s*\{([^}]+)\}/);

        const block = isTrue ? (ifMatch ? ifMatch[1] : '') : (elseMatch ? elseMatch[1] : '');
        const printMatch = block.match(/System\.out\.println\s*\(\s*"([^"]+)"\s*\)/);

        return printMatch ? printMatch[1] : '';
    }

    simulateComparison(code, num1, num2) {
        // Determine which is greater
        const greater = num1 > num2 ? num1 : num2;
        return greater.toString();
    }
}

// Create global validator instance
const javaValidator = new JavaValidator();
