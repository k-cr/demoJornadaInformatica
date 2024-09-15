// js/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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

export { app, db, auth, storage };
