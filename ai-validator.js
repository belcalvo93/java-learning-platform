/**
 * Validador multi-nivel para ejercicios de Java
 * Combina validación sintáctica, de estilo y funcional con IA
 */
class AIValidator {
    constructor(geminiApiKey) {
        this.geminiValidator = geminiApiKey ? new GeminiValidator(geminiApiKey) : null;
    }

    /**
     * Validación rápida de sintaxis básica
     */
    validateSyntax(code, exercise) {
        const errors = [];

        // Verificar llaves balanceadas
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push({
                type: 'syntax',
                message: `Llaves desbalanceadas: ${openBraces} aperturas, ${closeBraces} cierres`,
                severity: 'error'
            });
        }

        // Verificar paréntesis balanceados
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push({
                type: 'syntax',
                message: `Paréntesis desbalanceados: ${openParens} aperturas, ${closeParens} cierres`,
                severity: 'error'
            });
        }

        // Verificar que tenga al menos una clase (SOLO si NO es ejercicio de indentación)
        // Los ejercicios de indentación pueden ser fragmentos de código
        const isIndentationOnly = exercise && exercise.validation && exercise.validation.checkIndentation;
        if (!isIndentationOnly && !code.includes('class ')) {
            errors.push({
                type: 'syntax',
                message: 'El código debe contener al menos una clase',
                severity: 'error'
            });
        }

        return {
            success: errors.length === 0,
            errors
        };
    }

    /**
     * Validación de estilo y buenas prácticas
     */
    validateStyle(code) {
        const warnings = [];
        const lines = code.split('\n');

        // Verificar indentación básica
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) return;

            const actualIndent = line.search(/\S/);

            // Detectar indentación inconsistente (no múltiplo de 4)
            if (actualIndent > 0 && actualIndent % 4 !== 0) {
                warnings.push({
                    type: 'style',
                    message: `Indentación inconsistente (usa 4 espacios por nivel)`,
                    line: index + 1,
                    severity: 'warning'
                });
            }
        });

        // Verificar nombres de variables (camelCase)
        const varDeclarations = code.match(/(?:int|double|float|String|boolean|char)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
        if (varDeclarations) {
            varDeclarations.forEach(decl => {
                const varName = decl.split(/\s+/)[1];
                if (varName && varName[0] === varName[0].toUpperCase() && !varName.match(/^[A-Z_]+$/)) {
                    warnings.push({
                        type: 'naming',
                        message: `La variable "${varName}" debería usar camelCase (primera letra minúscula)`,
                        severity: 'info'
                    });
                }
            });
        }

        return {
            success: true, // Warnings no impiden la ejecución
            warnings
        };
    }

    /**
     * Validación simplificada sin IA
     * Si el código compila y ejecuta correctamente, es exitoso
     */
    async validateWithAI(code, exercise, executionResult) {
        // Paso 1: Validación sintáctica básica
        const syntaxCheck = this.validateSyntax(code, exercise);
        if (!syntaxCheck.success) {
            return {
                success: false,
                isCorrect: false,
                errors: syntaxCheck.errors,
                explanation: 'El código tiene errores de sintaxis que deben corregirse.',
                suggestions: ['Verifica que todas las llaves y paréntesis estén balanceados']
            };
        }

        // Paso 2: Validación de estilo (solo warnings, no bloquean)
        const styleCheck = this.validateStyle(code);

        // Paso 3: Si la compilación falló, es un error
        if (!executionResult.success) {
            return {
                success: false,
                isCorrect: false,
                errors: [...syntaxCheck.errors, ...(executionResult.errors || [])],
                explanation: 'El código tiene errores de compilación o ejecución.',
                suggestions: ['Revisa los mensajes de error del compilador']
            };
        }

        // Paso 4: Si compiló y ejecutó correctamente, es EXITOSO
        // Para ejercicios de indentación, verificar que el código coincida con la solución
        if (exercise.validation && exercise.validation.checkIndentation) {
            // Función para normalizar código: elimina comentarios y líneas vacías
            const normalizeCode = (str) => {
                return str
                    .replace(/\r\n/g, '\n')  // Windows line endings
                    .replace(/\r/g, '\n')    // Old Mac line endings
                    .split('\n')
                    .map(line => line.replace(/\/\/.*$/, '').trimEnd()) // Eliminar comentarios de línea
                    .filter(line => line.trim().length > 0) // Eliminar líneas vacías
                    .join('\n')
                    .trim();
            };

            const userCode = normalizeCode(code);
            const expectedCode = normalizeCode(exercise.solution);

            if (userCode === expectedCode) {
                return {
                    success: true,
                    isCorrect: true,
                    functionalityScore: 100,
                    styleScore: 100,
                    errors: [],
                    explanation: '¡Perfecto! Tu código está correctamente indentado.',
                    suggestions: []
                };
            } else {
                return {
                    success: false,
                    isCorrect: false,
                    errors: [{
                        type: 'indentation',
                        message: 'La indentación no coincide con la solución esperada',
                        severity: 'error'
                    }],
                    explanation: 'Revisa la indentación. Recuerda usar 4 espacios por cada nivel.',
                    suggestions: [
                        'Cada vez que abres una llave {, el código dentro debe tener 4 espacios más',
                        'Verifica que todas las líneas estén correctamente alineadas',
                        'Asegúrate de no usar tabulaciones, solo espacios'
                    ]
                };
            }
        }

        // Las sugerencias de estilo son solo informativas
        return {
            success: true,
            isCorrect: true,
            functionalityScore: 100,
            styleScore: styleCheck.warnings.length === 0 ? 100 : 85,
            errors: styleCheck.warnings, // Solo warnings informativos
            explanation: '¡Excelente! Tu código compila y ejecuta correctamente.',
            suggestions: styleCheck.warnings.length > 0
                ? ['Considera mejorar el estilo del código para seguir las mejores prácticas de Java']
                : []
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AIValidator = AIValidator;
}
