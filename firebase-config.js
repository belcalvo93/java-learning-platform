// ============================================
// EJEMPLO NO OPERATIVO — sin login real en v1.0
// Progreso solo en este navegador. Retomar en C-08.
// ============================================
// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
    apiKey: "REEMPLAZAR",
    authDomain: "REEMPLAZAR",
    projectId: "REEMPLAZAR",
    storageBucket: "REEMPLAZAR",
    messagingSenderId: "REEMPLAZAR",
    appId: "REEMPLAZAR"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
