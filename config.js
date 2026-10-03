/**
 * Configuración del sistema (frontend — SIN secretos)
 *
 * v1.0 sin login ni base de datos; progreso solo en este navegador.
 * IA DESACTIVADA hasta diseño servidor-only (C-02): `geminiApiKey` queda
 * vacío — NUNCA poner una key real en el frontend.
 */

// Backend desactivado en v1.0 (Render suspendido hasta ejecución segura,
// RN-SEG-02). Sin default: el frontend degrada a validación por reglas.
const BACKEND_URL = '';

// Configuración del sistema
const CONFIG = {
    // IA desactivada en el navegador hasta diseño servidor-only (C-02)
    AI_ENABLED: false,
    geminiApiKey: '',

    // Backend (inactivo en v1.0)
    backendUrl: BACKEND_URL,
    executeEndpoint: '',
    healthEndpoint: '',

    // Timeouts
    executionTimeout: 5000, // 5 segundos
    aiTimeout: 10000, // 10 segundos

    // Límites
    maxCodeLength: 10000, // 10KB de código
    maxOutputLength: 10000, // 10KB de output
};

// Exportar configuración
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
