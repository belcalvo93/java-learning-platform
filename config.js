/**
 * Configuración de API Keys y constantes del sistema
 */

// API Key de Gemini (GRATUITA)
const GEMINI_API_KEY = 'AIzaSyCLhUtDIJAkecznxR1KX3ilQLhkR_HapHA';

// URL del backend (cambiar si despliegas en otro servidor)
const BACKEND_URL = 'https://java-learning-platform.onrender.com';

// Configuración del sistema
const CONFIG = {
    // API de IA
    geminiApiKey: GEMINI_API_KEY,

    // Backend
    backendUrl: BACKEND_URL,
    executeEndpoint: `${BACKEND_URL}/api/execute`,
    healthEndpoint: `${BACKEND_URL}/health`,

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
