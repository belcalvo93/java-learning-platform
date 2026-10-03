/**
 * Cliente para ejecutar código Java en el backend.
 *
 * v1.0 sin backend (Render suspendido hasta ejecución segura, RN-SEG-02):
 * si no hay endpoint configurado, NO hace red y degrada a validación por
 * reglas con mensaje honesto. Un solo intento, sin reintentos.
 */

const DEGRADED_MESSAGE = 'ejecución no disponible — validando por reglas';

/**
 * ¿Hay backend configurado? Ambos valores deben ser no vacíos.
 * @param {string} backendUrl
 * @param {string} executeEndpoint
 * @returns {boolean}
 */
function isBackendConfigured(backendUrl, executeEndpoint) {
    return Boolean(
        typeof backendUrl === 'string' && backendUrl.trim() !== '' &&
        typeof executeEndpoint === 'string' && executeEndpoint.trim() !== ''
    );
}

/**
 * Decide el plan de ejecución antes de cualquier red (puro, sin DOM).
 * @param {{ backendUrl: string, executeEndpoint: string }} config
 * @returns {{ mode: 'rules' | 'remote', message: string }}
 */
function resolveExecutionPlan(config) {
    const cfg = config || {};
    if (isBackendConfigured(cfg.backendUrl, cfg.executeEndpoint)) {
        return { mode: 'remote', message: '' };
    }
    return { mode: 'rules', message: DEGRADED_MESSAGE };
}

/** Timeout de ejecución: reutiliza CONFIG.executionTimeout (5000 ms). */
function getExecutionTimeoutMs() {
    if (typeof CONFIG !== 'undefined' && CONFIG && Number(CONFIG.executionTimeout) > 0) {
        return Number(CONFIG.executionTimeout);
    }
    return 5000;
}

/**
 * Error legible con stage, en español (puro, sin DOM).
 * Nunca incluye URLs internas ni stacktrace crudo.
 * @param {string} stage - 'compilation' | 'execution' | 'connection'
 * @param {unknown} cause
 * @returns {string}
 */
function formatStageError(stage, cause) {
    const labels = { compilation: 'compilación', execution: 'ejecución', connection: 'conexión' };
    const label = labels[stage] || 'ejecución';
    const token = typeof stage === 'string' && stage !== '' ? stage : 'execution';
    const msg = (cause && cause.message) || '';
    let reason = 'hubo un problema de conexión';
    if ((cause && cause.name === 'AbortError') || /abort|timeout/i.test(msg)) {
        reason = 'se agotó el tiempo de espera';
    } else {
        const status = msg.match(/status:\s*(\d+)/i);
        if (status) {
            reason = `el servidor devolvió el código ${status[1]}`;
        } else if (/HTTP error/i.test(msg)) {
            reason = 'el servidor devolvió un error';
        }
    }
    return `No se pudo completar la ${label} (etapa: ${token}): ${reason}.`;
}

function degradedResult() {
    return {
        success: false,
        output: '',
        errors: [DEGRADED_MESSAGE],
        executionTime: 0,
        stage: 'connection',
        degraded: true,
        notice: DEGRADED_MESSAGE,
        attempts: 0
    };
}

class JavaExecutor {
    constructor(apiUrl = '', timeoutMs) {
        this.apiUrl = typeof apiUrl === 'string' ? apiUrl : '';
        this.timeoutMs = typeof timeoutMs === 'number' && timeoutMs > 0
            ? timeoutMs
            : getExecutionTimeoutMs();
    }

    /**
     * Ejecuta código Java en el backend (un único intento con timeout).
     * Con endpoint vacío rechaza la vía de red sin hacer ningún fetch.
     * @param {string} code - Código Java a ejecutar
     * @param {string} className - Nombre de la clase principal (default: 'Main')
     * @returns {Promise<Object>} Resultado de la ejecución
     */
    async execute(code, className = 'Main') {
        if (!this.apiUrl || this.apiUrl.trim() === '') {
            return degradedResult();
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, className }),
                signal: controller.signal
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
                stage: result.stage || 'unknown',
                degraded: false,
                attempts: 1
            };
        } catch (error) {
            const aborted = error && error.name === 'AbortError';
            return {
                success: false,
                output: '',
                errors: [DEGRADED_MESSAGE, formatStageError(aborted ? 'execution' : 'connection', error)],
                executionTime: 0,
                stage: aborted ? 'execution' : 'connection',
                degraded: true,
                notice: DEGRADED_MESSAGE,
                attempts: 1
            };
        } finally {
            clearTimeout(timer);
        }
    }

    /**
     * Verifica si el backend está disponible (sin red si no está configurado).
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
        if (!this.apiUrl || this.apiUrl.trim() === '') {
            return false;
        }
        const healthUrl = this.apiUrl.replace('/api/execute', '/health');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(healthUrl, { signal: controller.signal });
            return response.ok;
        } catch (error) {
            return false;
        } finally {
            clearTimeout(timer);
        }
    }
}

// Exportar para uso global en el navegador
if (typeof window !== 'undefined') {
    window.JavaExecutor = JavaExecutor;
    window.isBackendConfigured = isBackendConfigured;
    window.resolveExecutionPlan = resolveExecutionPlan;
    window.formatStageError = formatStageError;
    window.DEGRADED_MESSAGE = DEGRADED_MESSAGE;
}

// Exportar para tests Node (node --test, sin dependencias)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        JavaExecutor,
        isBackendConfigured,
        resolveExecutionPlan,
        formatStageError,
        getExecutionTimeoutMs,
        DEGRADED_MESSAGE
    };
}
