// js/main.js

import { db, auth, storage } from './firebaseConfig.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Manejo de la autenticación
const loginForm = document.getElementById('login-form');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const authSection = document.getElementById('auth-section');
const materiasSection = document.getElementById('materias-section');
const archivoSection = document.getElementById('archivo-section');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginForm.reset();
    } catch (error) {
        console.error("Error en inicio de sesión:", error);
    }
});

registerBtn.addEventListener('click', async () => {
    const email = prompt("Correo:");
    const password = prompt("Contraseña:");
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error en registro:", error);
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.style.display = 'none';
        logoutBtn.style.display = 'block';
        materiasSection.style.display = 'block';
        archivoSection.style.display = 'block';
        mostrarMaterias();
    } else {
        authSection.style.display = 'block';
        logoutBtn.style.display = 'none';
        materiasSection.style.display = 'none';
        archivoSection.style.display = 'none';
    }
});

// Manejo de las materias
const materiaForm = document.getElementById('materia-form');
const materiasList = document.getElementById('materias-list');

materiaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('materia-nombre').value;
    try {
        await db.collection("materias").add({ nombre });
        materiaForm.reset();
        mostrarMaterias();
    } catch (error) {
        console.error("Error al agregar materia:", error);
    }
});

async function mostrarMaterias() {
    materiasList.innerHTML = '';
    const querySnapshot = await db.collection("materias").get();
    querySnapshot.forEach((doc) => {
        const materia = doc.data();
        const li = document.createElement('li');
        li.textContent = materia.nombre;
        materiasList.appendChild(li);
    });
}

// Manejo de archivos
const archivoForm = document.getElementById('archivo-form');
const archivoInput = document.getElementById('archivo');
const archivosList = document.getElementById('archivos-list');

archivoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const archivo = archivoInput.files[0];
    const materiaId = prompt("ID de la materia:");

    const storageRef = storage.ref(`materias/${materiaId}/${archivo.name}`);
    try {
        const snapshot = await storageRef.put(archivo);
        const url = await snapshot.ref.getDownloadURL();

        const materiaRef = db.collection("materias").doc(materiaId);
        await materiaRef.update({
            archivos: firebase.firestore.FieldValue.arrayUnion(url)
        });

        const li = document.createElement('li');
        li.textContent = `${archivo.name} - ${url}`;
        archivosList.appendChild(li);

        archivoForm.reset();
    } catch (error) {
        console.error("Error al subir archivo:", error);
    }
});
