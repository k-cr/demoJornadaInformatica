// js/firebaseConfig.js

// Importar los módulos de Firebase desde el CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDAXQl2z9NpVIqH4RQ24fRinEkJXGtwss4",
    authDomain: "test-jornada.firebaseapp.com",
    projectId: "test-jornada",
    storageBucket: "test-jornada.appspot.com",
    messagingSenderId: "564575366633",
    appId: "1:564575366633:web:9b36589af64e9f1a8def78",
    measurementId: "G-PZJJ28LDN5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Exportar las instancias para que puedan ser usadas en otros archivos
export { app, db, auth, storage };
