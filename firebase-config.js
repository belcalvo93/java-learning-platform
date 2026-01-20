// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyDEMO_KEY_REPLACE_WITH_REAL",
    authDomain: "javamaster-demo.firebaseapp.com",
    projectId: "javamaster-demo",
    storageBucket: "javamaster-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo123456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase inicializado correctamente');
