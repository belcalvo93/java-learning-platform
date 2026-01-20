// ============================================
// AUTHENTICATION MANAGER
// ============================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Escuchar cambios en el estado de autenticación
        firebase.auth().onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                console.log('✅ Usuario autenticado:', user.email);
                this.loadUserProgress(user.uid);
                this.updateUIForLoggedInUser(user);
            } else {
                console.log('ℹ️ Usuario no autenticado');
                this.updateUIForLoggedOutUser();
            }
        });
    }

    // Registro de nuevo usuario
    async signUp(email, password, displayName) {
        try {
            const userCredential = await firebase.auth()
                .createUserWithEmailAndPassword(email, password);

            // Actualizar nombre de usuario
            await userCredential.user.updateProfile({
                displayName: displayName
            });

            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Inicio de sesión
    async signIn(email, password) {
        try {
            const userCredential = await firebase.auth()
                .signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Inicio de sesión con Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await firebase.auth().signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Cerrar sesión
    async signOut() {
        try {
            await firebase.auth().signOut();
            // Limpiar progreso local
            progressManager.progress = {};
            progressManager.updateUI();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Cargar progreso del usuario desde Firestore
    async loadUserProgress(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                progressManager.progress = data.progress || {};
                progressManager.updateUI();
                console.log('✅ Progreso cargado desde la nube');
            } else {
                // Primera vez del usuario, crear documento
                await this.saveUserProgress(userId, {});
            }
        } catch (error) {
            console.error('Error cargando progreso:', error);
        }
    }

    // Guardar progreso del usuario en Firestore
    async saveUserProgress(userId, progress) {
        try {
            await db.collection('users').doc(userId).set({
                progress: progress,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log('✅ Progreso guardado en la nube');
        } catch (error) {
            console.error('Error guardando progreso:', error);
        }
    }

    // Actualizar UI para usuario autenticado
    updateUIForLoggedInUser(user) {
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            authButton.innerHTML = `
        <span>${user.displayName || user.email}</span>
        <button onclick="authManager.signOut()" class="sign-out-btn">Cerrar Sesión</button>
      `;
        }
    }

    // Actualizar UI para usuario no autenticado
    updateUIForLoggedOutUser() {
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            authButton.innerHTML = `
        <button onclick="showAuthModal()" class="sign-in-btn">Iniciar Sesión</button>
      `;
        }
    }

    // Mensajes de error en español
    getErrorMessage(errorCode) {
        const messages = {
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/invalid-email': 'Email inválido',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
        };
        return messages[errorCode] || 'Error desconocido. Intenta nuevamente';
    }
}

// Inicializar el gestor de autenticación
const authManager = new AuthManager();

// Modificar ProgressManager para sincronizar con Firebase
const originalMarkAsCompleted = ProgressManager.prototype.markAsCompleted;
ProgressManager.prototype.markAsCompleted = function (lessonId) {
    originalMarkAsCompleted.call(this, lessonId);

    // Sincronizar con Firebase si hay usuario autenticado
    if (authManager.currentUser) {
        authManager.saveUserProgress(authManager.currentUser.uid, this.progress);
    }
};

// ============================================
// UI FUNCTIONS
// ============================================

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function handleSignUp() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const result = await authManager.signUp(email, password, name);
    if (result.success) {
        closeAuthModal();
        alert('¡Registro exitoso! Bienvenida a JavaMaster');
    } else {
        alert(result.error);
    }
}

async function handleSignIn() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const result = await authManager.signIn(email, password);
    if (result.success) {
        closeAuthModal();
    } else {
        alert(result.error);
    }
}

async function handleGoogleSignIn() {
    const result = await authManager.signInWithGoogle();
    if (result.success) {
        closeAuthModal();
    } else {
        alert(result.error);
    }
}

function switchToSignUp() {
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function switchToSignIn() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signin-form').style.display = 'block';
}
