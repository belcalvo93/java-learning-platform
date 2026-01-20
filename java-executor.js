/**
 * Cliente para ejecutar código Java en el backend
 */
class JavaExecutor {
    constructor(apiUrl = 'http://localhost:3000/api/execute') {
        this.apiUrl = apiUrl;
    }

    /**
     * Ejecuta código Java en el backend
     * @param {string} code - Código Java a ejecutar
     * @param {string} className - Nombre de la clase principal (default: 'Main')
     * @returns {Promise<Object>} Resultado de la ejecución
     */
    async execute(code, className = 'Main') {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, className })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: result.success,
                output: result.output || '',
                errors: result.errors || [],
                executionTime: result.executionTime || 0,
                stage: result.stage || 'unknown'
            };
        } catch (error) {
            console.error('Error ejecutando código:', error);
            return {
                success: false,
                output: '',
                errors: [`Error de conexión con el servidor: ${error.message}`],
                executionTime: 0,
                stage: 'connection'
            };
        }
    }

    /**
     * Verifica si el backend está disponible
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
        try {
            const response = await fetch(this.apiUrl.replace('/api/execute', '/health'));
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.JavaExecutor = JavaExecutor;
}
