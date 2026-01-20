/**
 * Integración con Gemini API (GRATUITA) para validación inteligente de código
 * API Key gratuita en: https://makersuite.google.com/app/apikey
 */
class GeminiValidator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
    }

    /**
     * Analiza código Java con IA
     * @param {string} userCode - Código del estudiante
     * @param {Object} exercise - Datos del ejercicio
     * @param {string} executionOutput - Output de la ejecución
     * @returns {Promise<Object>} Resultado de la validación
     */
    async analyzeCode(userCode, exercise, executionOutput = '') {
        const prompt = this.buildValidationPrompt(userCode, exercise, executionOutput);

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Gemini API error: ${error.error?.message || response.status}`);
            }

            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
            return this.parseValidationResponse(responseText);

        } catch (error) {
            console.error('Error llamando a Gemini API:', error);
            return {
                success: false,
                isCorrect: false,
                functionalityScore: 0,
                styleScore: 0,
                errors: [{ type: 'api', message: error.message, severity: 'error' }],
                explanation: 'No se pudo validar el código con IA. Por favor, intenta nuevamente.',
                suggestions: []
            };
        }
    }

    /**
     * Construye el prompt para Gemini
     */
    buildValidationPrompt(userCode, exercise, executionOutput) {
        const { title, description, validation } = exercise;
        const expectedBehavior = validation?.criteria?.expectedOutput ||
            validation?.testCases?.[0]?.expectedOutput ||
            'Según la descripción del ejercicio';

        return `Eres un profesor de Java siguiendo los estándares de Harvard CS50. Tu trabajo es evaluar el código de un estudiante de forma educativa y constructiva.

**EJERCICIO**: ${title}
**DESCRIPCIÓN**: ${description}
**COMPORTAMIENTO ESPERADO**: ${expectedBehavior}

**CÓDIGO DEL ESTUDIANTE**:
\`\`\`java
${userCode}
\`\`\`

**OUTPUT DE EJECUCIÓN**:
\`\`\`
${executionOutput || 'No ejecutado aún'}
\`\`\`

**INSTRUCCIONES**:
Analiza el código y responde ÚNICAMENTE en formato JSON válido (sin markdown, sin explicaciones adicionales):

{
  "isCorrect": boolean,
  "functionalityScore": 0-100,
  "styleScore": 0-100,
  "errors": [
    {
      "type": "syntax|logic|style|naming",
      "message": "Descripción clara del error",
      "line": número_de_línea_o_null,
      "severity": "error|warning|info"
    }
  ],
  "explanation": "Explicación educativa detallada en español sobre qué está bien y qué debe mejorar",
  "suggestions": [
    "Sugerencia práctica 1",
    "Sugerencia práctica 2"
  ],
  "acceptsAlternativeSolution": boolean
}

**CRITERIOS DE EVALUACIÓN**:
1. **FUNCIONALIDAD** (más importante): ¿El código produce el resultado esperado? Acepta MÚLTIPLES soluciones válidas.
2. **ESTILO**: Indentación (4 espacios), nombres descriptivos, buenas prácticas Java.
3. **SINTAXIS**: Código compilable y ejecutable.

**IMPORTANTE**:
- NO exijas coincidencia literal del código
- ACEPTA diferentes formas de lograr el mismo resultado
- Por ejemplo: "System.out.println(resultado)" y "System.out.println("Resultado: " + resultado)" son AMBAS válidas si imprimen el resultado
- Sé constructivo y educativo en tu feedback
- Responde SOLO el JSON, sin texto adicional`;
    }

    /**
     * Parsea la respuesta de Gemini
     */
    parseValidationResponse(responseText) {
        try {
            // Limpiar markdown si existe
            let jsonText = responseText.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }

            // Intentar extraer JSON si hay texto adicional
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
            }

            const parsed = JSON.parse(jsonText);

            return {
                success: parsed.isCorrect || false,
                isCorrect: parsed.isCorrect || false,
                functionalityScore: parsed.functionalityScore || 0,
                styleScore: parsed.styleScore || 0,
                errors: parsed.errors || [],
                explanation: parsed.explanation || '',
                suggestions: parsed.suggestions || [],
                acceptsAlternativeSolution: parsed.acceptsAlternativeSolution || false
            };
        } catch (error) {
            console.error('Error parseando respuesta de Gemini:', error);
            console.log('Respuesta original:', responseText);

            return {
                success: false,
                isCorrect: false,
                functionalityScore: 0,
                styleScore: 0,
                errors: [{ type: 'parsing', message: 'Error procesando respuesta de IA', severity: 'error' }],
                explanation: 'Hubo un error procesando la validación. Por favor, intenta nuevamente.',
                suggestions: []
            };
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.GeminiValidator = GeminiValidator;
}
