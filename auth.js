// ============================================
// AUTHENTICATION & PROGRESS CLOUD MANAGER (C-13)
// ============================================
// Maneja autenticación opcional con Firebase Auth y sincronización
// con Cloud Firestore. Degrada de forma transparente y sin errores a
// almacenamiento local si Firebase no está configurado o si el usuario no inicia sesión.

(function (global) {
    'use strict';

    // Obtener helper de sincronización
    const ProgressSync = (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports)
        ? require('./progress-sync.js')
        : (global.ProgressSync || {});

    class AuthManager {
        /**
         * @param {Object} [options]
         * @param {Storage} [options.storage] - Objeto localStorage o mock
         * @param {Object} [options.firebase] - Instancia mock o real de firebase
         * @param {Function} [options.isConfigured] - Checker de configuración
         * @param {number} [options.debounceMs] - Milisegundos de espera para el debounce
         */
        constructor(options = {}) {
            this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
            this.firebase = options.firebase || (typeof global.firebase !== 'undefined' ? global.firebase : null);
            this.isConfiguredFn = options.isConfigured || (typeof global.isFirebaseConfigured === 'function' ? global.isFirebaseConfigured : () => false);
            this.debounceMs = typeof options.debounceMs === 'number' ? options.debounceMs : 1500;
            this.reauthPrompt = options.reauthPrompt || null;

            this.currentUser = null;
            this.saveTimeout = null;
            this.listeners = [];

            // Solo inicializar escuchas si Firebase está configurado y presente
            if (this.isConfigured()) {
                this.init();
            }
        }

        isConfigured() {
            try {
                return !!(this.isConfiguredFn && this.isConfiguredFn());
            } catch (_) {
                return false;
            }
        }

        getFirebase() {
            if (this.firebase) return this.firebase;
            if (typeof global.firebase !== 'undefined') {
                this.firebase = global.firebase;
                return this.firebase;
            }
            return null;
        }

        async ensureFirebaseInitialized() {
            if (!this.isConfigured()) {
                throw new Error('Firebase no está configurado en este despliegue.');
            }
            if (typeof global.loadFirebaseSdk === 'function') {
                await global.loadFirebaseSdk();
            }
            const fb = this.getFirebase();
            if (!fb) {
                throw new Error('No se pudo cargar el SDK de Firebase.');
            }
            if (!fb.apps || fb.apps.length === 0) {
                const cfg = global.firebaseConfig || {};
                fb.initializeApp(cfg);
            }
            return fb;
        }

        init() {
            const fb = this.getFirebase();
            if (!fb || !fb.auth) return;

            try {
                fb.auth().onAuthStateChanged(async (user) => {
                    this.currentUser = user;
                    if (user) {
                        try {
                            await this.syncOnLogin(user.uid);
                        } catch (err) {
                            console.warn('Advertencia al sincronizar en login:', err);
                        }
                        this.updateUIForLoggedInUser(user);
                    } else {
                        this.updateUIForLoggedOutUser();
                    }
                    this.notifyListeners(user);
                });
            } catch (err) {
                console.warn('No se pudo iniciar listener de auth:', err);
            }
        }

        onAuthStateChanged(callback) {
            this.listeners.push(callback);
            if (this.currentUser) {
                callback(this.currentUser);
            }
        }

        notifyListeners(user) {
            for (const cb of this.listeners) {
                try {
                    cb(user);
                } catch (_) {}
            }
        }

        // Registro de usuario nuevo con minimización de datos (Ley 25.326)
        async signUp({ email, password, displayName = '', country = '', ageConfirmed = true }) {
            if (ageConfirmed === false) {
                return {
                    success: false,
                    error: 'Debes confirmar que tienes 13 años o más para crear una cuenta.'
                };
            }

            try {
                const fb = await this.ensureFirebaseInitialized();
                const cred = await fb.auth().createUserWithEmailAndPassword(email, password);
                const user = cred.user;

                if (displayName && user.updateProfile) {
                    await user.updateProfile({ displayName });
                }

                this.currentUser = user;

                // Crear documento en Firestore minimizando datos (sin fecha de nacimiento ni subregión)
                const userPayload = {
                    email: user.email,
                    displayName: displayName || '',
                    country: country || '',
                    ageConfirmed: true,
                    createdAt: new Date().toISOString()
                };

                const db = fb.firestore();
                await db.collection('users').doc(user.uid).set(userPayload, { merge: true });

                // Sincronizar el progreso actual local con la nueva cuenta
                await this.syncOnLogin(user.uid);
                this.updateUIForLoggedInUser(user);

                return { success: true, user };
            } catch (error) {
                return { success: false, error: this.getErrorMessage(error.code || error.message) };
            }
        }

        // Inicio de sesión con email y contraseña
        async signIn(email, password) {
            try {
                const fb = await this.ensureFirebaseInitialized();
                const cred = await fb.auth().signInWithEmailAndPassword(email, password);
                this.currentUser = cred.user;
                await this.syncOnLogin(this.currentUser.uid);
                this.updateUIForLoggedInUser(this.currentUser);
                return { success: true, user: this.currentUser };
            } catch (error) {
                return { success: false, error: this.getErrorMessage(error.code || error.message) };
            }
        }

        // Inicio de sesión con Google
        async signInWithGoogle() {
            try {
                const fb = await this.ensureFirebaseInitialized();
                const provider = new fb.auth.GoogleAuthProvider();
                const cred = await fb.auth().signInWithPopup(provider);
                this.currentUser = cred.user;
                await this.syncOnLogin(this.currentUser.uid);
                this.updateUIForLoggedInUser(this.currentUser);
                return { success: true, user: this.currentUser };
            } catch (error) {
                return { success: false, error: this.getErrorMessage(error.code || error.message) };
            }
        }

        // Cierre de sesión
        async signOut() {
            try {
                const fb = this.getFirebase();
                if (fb && fb.auth) {
                    await fb.auth().signOut();
                }
                this.currentUser = null;
                this.updateUIForLoggedOutUser();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        // Envío de correo para restablecer contraseña
        async sendPasswordResetEmail(email) {
            try {
                const fb = await this.ensureFirebaseInitialized();
                await fb.auth().sendPasswordResetEmail(email);
                return { success: true };
            } catch (error) {
                return { success: false, error: this.getErrorMessage(error.code || error.message) };
            }
        }

        // Fusión sin pérdida (lossless merge) al iniciar sesión
        async syncOnLogin(userId) {
            const fb = this.getFirebase();
            if (!fb || !fb.firestore) return;

            const db = fb.firestore();
            const docRef = db.collection('users').doc(userId);
            const doc = await docRef.get();

            const remoteDoc = (doc.exists && doc.data()) || {};
            const remoteProgress = remoteDoc.progress || {};
            const localProgress = ProgressSync.serializeLocalStorage
                ? ProgressSync.serializeLocalStorage(this.storage)
                : {};

            let merged = remoteProgress;
            let needsRemoteWrite = true;

            if (ProgressSync.mergeProgress) {
                const mergeRes = ProgressSync.mergeProgress(localProgress, remoteProgress);
                merged = mergeRes.merged;
                needsRemoteWrite = mergeRes.needsRemoteWrite;
            }

            // Aplicar fusión en localStorage local
            if (ProgressSync.applyMergedToLocalStorage) {
                ProgressSync.applyMergedToLocalStorage(merged, this.storage);
            }

            // Guardar fusión en Firestore si hay novedades o si el doc no existía
            if (!doc.exists || needsRemoteWrite) {
                await docRef.set({
                    progress: merged,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
            }

            // Notificar a progressManager si existe en el entorno
            if (typeof global.progressManager !== 'undefined' && global.progressManager.loadProgress) {
                try {
                    global.progressManager.loadProgress();
                    global.progressManager.updateUI();
                } catch (_) {}
            }
        }

        // Guardado de progreso con debounce (1500 ms) para proteger la cuota de Firebase Spark
        saveProgressDebounced() {
            if (!this.currentUser) return;

            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }

            this.saveTimeout = setTimeout(async () => {
                try {
                    await this.saveUserProgress();
                } catch (err) {
                    console.warn('Error en guardado diferido de progreso:', err);
                }
            }, this.debounceMs);
        }

        async saveUserProgress() {
            if (!this.currentUser) return;
            const fb = this.getFirebase();
            if (!fb || !fb.firestore) return;

            const localProgress = ProgressSync.serializeLocalStorage
                ? ProgressSync.serializeLocalStorage(this.storage)
                : {};

            const db = fb.firestore();
            await db.collection('users').doc(this.currentUser.uid).set({
                progress: localProgress,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
        }

        // Exportación de datos personales y progreso (Ley 25.326 - Derecho de Acceso)
        async exportUserData() {
            if (!this.currentUser) {
                throw new Error('No hay sesión activa para exportar datos.');
            }

            const fb = this.getFirebase();
            let remoteDocData = {};
            if (fb && fb.firestore) {
                try {
                    const doc = await fb.firestore().collection('users').doc(this.currentUser.uid).get();
                    if (doc.exists) {
                        remoteDocData = doc.data() || {};
                    }
                } catch (_) {}
            }

            const localProgress = ProgressSync.serializeLocalStorage
                ? ProgressSync.serializeLocalStorage(this.storage)
                : {};

            return {
                exportVersion: '1.0',
                exportedAt: new Date().toISOString(),
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                displayName: this.currentUser.displayName || remoteDocData.displayName || '',
                country: remoteDocData.country || '',
                ageConfirmed: remoteDocData.ageConfirmed || true,
                progress: remoteDocData.progress || localProgress,
                localProgressSnapshot: localProgress
            };
        }

        // Eliminación de cuenta y datos (Ley 25.326 - Derecho de Supresión)
        async deleteAccount(credentials = null) {
            if (!this.currentUser) {
                return { success: false, error: 'No hay sesión activa.' };
            }

            const user = this.currentUser;
            const fb = this.getFirebase();

            // Función auxiliar para reautenticar según el proveedor
            const attemptReauth = async () => {
                const providerId = (user.providerData && user.providerData[0] && user.providerData[0].providerId) || 'password';
                if (providerId === 'google.com') {
                    if (fb && fb.auth && fb.auth.GoogleAuthProvider) {
                        const provider = new fb.auth.GoogleAuthProvider();
                        if (user.reauthenticateWithPopup) {
                            await user.reauthenticateWithPopup(provider);
                            return true;
                        }
                    }
                } else {
                    // Contraseña / Password
                    let pass = credentials && credentials.password;
                    if (!pass && this.reauthPrompt) {
                        const res = await this.reauthPrompt('password');
                        pass = res && res.password;
                    }
                    if (!pass && typeof window !== 'undefined' && typeof window.prompt === 'function') {
                        pass = window.prompt('Por seguridad, ingresá tu contraseña actual para confirmar la eliminación definitiva:');
                    }
                    if (pass && fb && fb.auth && fb.auth.EmailAuthProvider) {
                        const cred = fb.auth.EmailAuthProvider.credential(user.email, pass);
                        if (user.reauthenticateWithCredential) {
                            await user.reauthenticateWithCredential(cred);
                            return true;
                        }
                    }
                }
                return false;
            };

            // Intentar eliminar primero en Firebase Auth (para no dejar estado a medias si Auth falla)
            let authDeleted = false;
            try {
                if (user.delete) {
                    await user.delete();
                    authDeleted = true;
                }
            } catch (err) {
                if (err.code === 'auth/requires-recent-login') {
                    try {
                        const reauthOk = await attemptReauth();
                        if (reauthOk && user.delete) {
                            await user.delete();
                            authDeleted = true;
                        } else {
                            return {
                                success: false,
                                error: 'Se requiere confirmar tu identidad antes de eliminar la cuenta.'
                            };
                        }
                    } catch (reauthErr) {
                        return {
                            success: false,
                            error: 'No se pudo verificar tu identidad: ' + (reauthErr.message || reauthErr)
                        };
                    }
                } else {
                    return {
                        success: false,
                        error: 'No se pudo eliminar la cuenta: ' + (err.message || err)
                    };
                }
            }

            if (!authDeleted) {
                return {
                    success: false,
                    error: 'No se pudo completar la eliminación en el sistema de autenticación.'
                };
            }

            // Una vez eliminado en Auth con éxito, limpiar Firestore
            if (fb && fb.firestore) {
                try {
                    await fb.firestore().collection('users').doc(user.uid).delete();
                } catch (fsErr) {
                    console.warn('Advertencia al borrar documento en Firestore:', fsErr);
                }
            }

            this.currentUser = null;
            this.updateUIForLoggedOutUser();
            return { success: true };
        }

        // Actualización de UI
        updateUIForLoggedInUser(user) {
            const authButton = (typeof document !== 'undefined') ? document.getElementById('auth-button') : null;
            if (authButton) {
                const name = user.displayName || user.email.split('@')[0];
                authButton.innerHTML = `
                    <svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span class="auth-btn-text">${name}</span>
                `;
                authButton.setAttribute('title', `Sesión iniciada como ${user.email}`);
            }

            const notice = (typeof document !== 'undefined') ? document.getElementById('local-only-notice') : null;
            if (notice) {
                notice.innerHTML = `
                    <svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
                        aria-hidden="true">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    <span>Progreso sincronizado en tu cuenta (${user.email}).</span>
                `;
            }

            // Actualizar campos del panel de perfil si están presentes
            if (typeof document !== 'undefined') {
                const pEmail = document.getElementById('profile-email');
                if (pEmail) pEmail.textContent = user.email || '-';
                const pName = document.getElementById('profile-name');
                if (pName) pName.textContent = user.displayName || 'No configurado';
            }
        }

        updateUIForLoggedOutUser() {
            const authButton = (typeof document !== 'undefined') ? document.getElementById('auth-button') : null;
            if (authButton) {
                authButton.innerHTML = `
                    <svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span class="auth-btn-text">Mi Cuenta</span>
                `;
                authButton.setAttribute('title', 'Iniciar sesión o registrarse');
            }

            const notice = (typeof document !== 'undefined') ? document.getElementById('local-only-notice') : null;
            if (notice) {
                notice.innerHTML = `
                    <svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
                        aria-hidden="true">
                        <circle cx="12" cy="12" r="9"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>Tu progreso se guarda solo en este navegador.</span>
                `;
            }
        }

        getErrorMessage(errorCode) {
            const messages = {
                'auth/email-already-in-use': 'Este email ya está registrado.',
                'auth/invalid-email': 'El formato de email no es válido.',
                'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
                'auth/user-not-found': 'No existe una cuenta con este email.',
                'auth/wrong-password': 'Contraseña incorrecta.',
                'auth/too-many-requests': 'Demasiados intentos seguidos. Esperá unos minutos y volvé a probar.',
                'auth/network-request-failed': 'Error de conexión. Verificá tu acceso a internet.',
                'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión de Google.',
                'auth/requires-recent-login': 'Por seguridad, debes volver a iniciar sesión antes de realizar esta acción.'
            };
            return messages[errorCode] || errorCode || 'Ocurrió un error. Intenta nuevamente.';
        }
    }

    // Instancia global en navegador
    const authManager = new AuthManager();

    // Hook seguro para interceptar guardado de progreso si ProgressManager existe
    if (typeof global.ProgressManager !== 'undefined' && global.ProgressManager.prototype) {
        const originalMark = global.ProgressManager.prototype.markAsCompleted;
        if (typeof originalMark === 'function') {
            global.ProgressManager.prototype.markAsCompleted = function (lessonId) {
                originalMark.call(this, lessonId);
                if (authManager.currentUser) {
                    authManager.saveProgressDebounced();
                }
            };
        }
    }

    // ============================================
    // FUNCIONES UI DE LA VENTANA MODAL (BROWSER)
    // ============================================
    function showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;

        const isCfg = authManager.isConfigured();
        const unconfiguredBanner = document.getElementById('auth-unconfigured-banner');
        if (unconfiguredBanner) {
            unconfiguredBanner.style.display = isCfg ? 'none' : 'flex';
        }

        if (authManager.currentUser) {
            switchAuthTab('profile');
        } else {
            switchAuthTab('signin');
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function switchAuthTab(tabName) {
        const navTabs = document.getElementById('auth-nav-tabs');
        const signinPanel = document.getElementById('signin-panel');
        const signupPanel = document.getElementById('signup-panel');
        const resetPanel = document.getElementById('reset-panel');
        const profilePanel = document.getElementById('profile-panel');

        const tabSignIn = document.getElementById('tab-btn-signin');
        const tabSignUp = document.getElementById('tab-btn-signup');

        // Ocultar todos los paneles primero
        if (signinPanel) signinPanel.style.display = 'none';
        if (signupPanel) signupPanel.style.display = 'none';
        if (resetPanel) resetPanel.style.display = 'none';
        if (profilePanel) profilePanel.style.display = 'none';

        if (tabSignIn) {
            tabSignIn.classList.remove('active');
            tabSignIn.setAttribute('aria-selected', 'false');
        }
        if (tabSignUp) {
            tabSignUp.classList.remove('active');
            tabSignUp.setAttribute('aria-selected', 'false');
        }

        if (tabName === 'signin') {
            if (navTabs) navTabs.style.display = 'flex';
            if (signinPanel) signinPanel.style.display = 'block';
            if (tabSignIn) {
                tabSignIn.classList.add('active');
                tabSignIn.setAttribute('aria-selected', 'true');
            }
        } else if (tabName === 'signup') {
            if (navTabs) navTabs.style.display = 'flex';
            if (signupPanel) signupPanel.style.display = 'block';
            if (tabSignUp) {
                tabSignUp.classList.add('active');
                tabSignUp.setAttribute('aria-selected', 'true');
            }
        } else if (tabName === 'reset') {
            if (navTabs) navTabs.style.display = 'none';
            if (resetPanel) resetPanel.style.display = 'block';
        } else if (tabName === 'profile') {
            if (navTabs) navTabs.style.display = 'none';
            if (profilePanel) profilePanel.style.display = 'block';
        }
    }

    async function handleSignIn(e) {
        if (e && e.preventDefault) e.preventDefault();
        const emailInput = document.getElementById('signin-email');
        const passInput = document.getElementById('signin-password');
        const errorBox = document.getElementById('signin-error');
        const submitBtn = document.getElementById('btn-signin-submit');

        if (!emailInput || !passInput) return;
        if (errorBox) errorBox.style.display = 'none';

        if (submitBtn) submitBtn.disabled = true;

        const res = await authManager.signIn(emailInput.value.trim(), passInput.value);
        if (submitBtn) submitBtn.disabled = false;

        if (res.success) {
            closeAuthModal();
        } else {
            if (errorBox) {
                errorBox.textContent = res.error;
                errorBox.style.display = 'block';
            } else {
                alert(res.error);
            }
        }
    }

    async function handleSignUp(e) {
        if (e && e.preventDefault) e.preventDefault();
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passInput = document.getElementById('signup-password');
        const countryInput = document.getElementById('signup-country');
        const ageCheck = document.getElementById('signup-age-confirm');
        const errorBox = document.getElementById('signup-error');
        const submitBtn = document.getElementById('btn-signup-submit');

        if (errorBox) errorBox.style.display = 'none';

        // La aceptación de edad se confirma al enviar el formulario (línea legal per ítem 3)

        if (submitBtn) submitBtn.disabled = true;

        const res = await authManager.signUp({
            email: emailInput.value.trim(),
            password: passInput.value,
            displayName: nameInput ? nameInput.value.trim() : '',
            country: countryInput ? countryInput.value.trim() : '',
            ageConfirmed: true
        });

        if (submitBtn) submitBtn.disabled = false;

        if (res.success) {
            closeAuthModal();
        } else {
            if (errorBox) {
                errorBox.textContent = res.error;
                errorBox.style.display = 'block';
            } else {
                alert(res.error);
            }
        }
    }

    async function handleGoogleSignIn() {
        const errorBox = document.getElementById('signin-error');
        if (errorBox) errorBox.style.display = 'none';

        const res = await authManager.signInWithGoogle();
        if (res.success) {
            closeAuthModal();
        } else {
            if (errorBox) {
                errorBox.textContent = res.error;
                errorBox.style.display = 'block';
            } else {
                alert(res.error);
            }
        }
    }

    async function handlePasswordReset(e) {
        if (e && e.preventDefault) e.preventDefault();
        const emailInput = document.getElementById('reset-email');
        const msgBox = document.getElementById('reset-message');
        const errBox = document.getElementById('reset-error');
        const submitBtn = document.getElementById('btn-reset-submit');

        if (msgBox) msgBox.style.display = 'none';
        if (errBox) errBox.style.display = 'none';

        if (!emailInput || !emailInput.value.trim()) return;

        if (submitBtn) submitBtn.disabled = true;
        const res = await authManager.sendPasswordResetEmail(emailInput.value.trim());
        if (submitBtn) submitBtn.disabled = false;

        if (res.success) {
            if (msgBox) {
                msgBox.textContent = 'Enviamos las instrucciones a tu correo. Revisa tu bandeja de entrada o spam.';
                msgBox.style.display = 'block';
            }
        } else {
            if (errBox) {
                errBox.textContent = res.error;
                errBox.style.display = 'block';
            }
        }
    }

    async function handleSignOut() {
        await authManager.signOut();
        closeAuthModal();
    }

    async function handleExportUserData() {
        try {
            const data = await authManager.exportUserData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `javamaster-datos-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error al exportar datos: ' + (err.message || err));
        }
    }

    async function handleDeleteAccount() {
        const confirmed = confirm('¿Estás seguro/a de que querés eliminar tu cuenta? Esta acción borrará permanentemente todos tus datos de la nube y es irreversible.');
        if (!confirmed) return;

        const res = await authManager.deleteAccount();
        if (res.success) {
            closeAuthModal();
            alert('Tu cuenta y tus datos asociados han sido eliminados.');
        } else {
            alert(res.error);
        }
    }

    // Exponer helpers de UI a global
    global.showAuthModal = showAuthModal;
    global.closeAuthModal = closeAuthModal;
    global.switchAuthTab = switchAuthTab;
    global.handleSignIn = handleSignIn;
    global.handleSignUp = handleSignUp;
    global.handleGoogleSignIn = handleGoogleSignIn;
    global.handlePasswordReset = handlePasswordReset;
    global.handleSignOut = handleSignOut;
    global.handleExportUserData = handleExportUserData;
    global.handleDeleteAccount = handleDeleteAccount;

    global.AuthManager = AuthManager;
    global.authManager = authManager;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            AuthManager,
            authManager
        };
    }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

