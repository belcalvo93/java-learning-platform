// ============================================
// CONFIGURACIÓN DE FIREBASE (C-13)
// ============================================
// Cero secretos en el repositorio: las credenciales se dejan vacías.
// Cuando están vacías, la plataforma degrada de forma transparente y
// 100% segura al almacenamiento local (localStorage), sin errores en consola.
// Para habilitar sincronización en la nube, completar con los valores de la
// consola de Firebase (ver docs/firebase-setup.md).

(function (global) {
    'use strict';

    const firebaseConfig = {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    };

    /**
     * Verifica si Firebase tiene una configuración válida y completa.
     * @param {Object} [cfg] - Configuración opcional para chequear.
     * @returns {boolean}
     */
    function isFirebaseConfigured(cfg) {
        const configToCheck = cfg || global.firebaseConfig || firebaseConfig;
        if (!configToCheck || typeof configToCheck !== 'object') return false;
        const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
        return required.every(key => typeof configToCheck[key] === 'string' && configToCheck[key].trim().length > 0);
    }

    let sdkLoadPromise = null;

    /**
     * Carga diferida (lazy loading) de los scripts del SDK de Firebase v9 compat.
     * Solo inyecta los scripts si no están presentes y si el entorno lo soporta.
     * @returns {Promise<void>}
     */
    function loadFirebaseSdk() {
        if (typeof global.firebase !== 'undefined' && global.firebase.auth && global.firebase.firestore) {
            return Promise.resolve();
        }

        if (sdkLoadPromise) {
            return sdkLoadPromise;
        }

        if (typeof document === 'undefined') {
            // Entorno de prueba / headless sin DOM
            if (typeof global.firebase !== 'undefined') return Promise.resolve();
            return Promise.reject(new Error('DOM no disponible para inyectar scripts de Firebase'));
        }

        const scripts = [
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
        ];

        function loadScript(src) {
            return new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    if (existing.dataset.loaded === 'true') {
                        return resolve();
                    }
                    existing.addEventListener('load', () => resolve());
                    existing.addEventListener('error', () => reject(new Error(`Error cargando ${src}`)));
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => {
                    script.dataset.loaded = 'true';
                    resolve();
                };
                script.onerror = () => reject(new Error(`Error cargando ${src}`));
                document.head.appendChild(script);
            });
        }

        sdkLoadPromise = (async () => {
            for (const src of scripts) {
                await loadScript(src);
            }
        })();

        return sdkLoadPromise;
    }

    // Exponer al objeto global (window en navegador o global en tests)
    global.firebaseConfig = firebaseConfig;
    global.isFirebaseConfigured = isFirebaseConfigured;
    global.loadFirebaseSdk = loadFirebaseSdk;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            firebaseConfig,
            isFirebaseConfigured,
            loadFirebaseSdk
        };
    }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

