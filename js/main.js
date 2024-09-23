import { app, auth, storage } from './firebaseConfig.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

const db = getFirestore(app);

// Referencias a los elementos del DOM
const loginForm = document.getElementById('login-form');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const materiasList = document.getElementById('materias-list');
const archivoSection = document.getElementById('archivo-section');
const archivosList = document.getElementById('archivos-list');
const backToDashboardBtn = document.getElementById('back-to-dashboard');
const materiaTitle = document.getElementById('materia-title');


// Escuchar el envío del formulario de login
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Obtener los valores de los inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Autenticación con Firebase (ajusta esto a tu configuración si ya la tienes)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Mostrar el dashboard y ocultar el formulario de autenticación
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';

        // console.log('Usuario autenticado:', user.email);
        // Aquí puedes cargar las materias del usuario o cualquier lógica adicional que tengas

    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);
        alert('Hubo un problema al iniciar sesión: ' + error.message);
    }
});

// Registrarse
registerBtn.addEventListener('click', async () => {
    const email = prompt("Correo:");
    const password = prompt("Contraseña:");
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error en registro:", error);
    }
});

// Cerrar sesión
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});

// Monitorear cambios en el estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        mostrarMaterias();
    } else {
        authSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        archivoSection.style.display = 'none';
    }
});

// Mostrar materias en el dashboard
async function mostrarMaterias() {
    materiasList.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "materias"));
    querySnapshot.forEach((doc) => {
        const materia = doc.data();
        const li = document.createElement('li');
        li.textContent = materia.nombre;
        li.addEventListener('click', () => mostrarArchivos(doc.id, materia.nombre));
        materiasList.appendChild(li);
    });
}

// Mostrar archivos de una materia
async function mostrarArchivos(materiaId, nombreMateria) {
    dashboardSection.style.display = 'none';
    archivoSection.style.display = 'block';
    materiaTitle.textContent = nombreMateria;

    archivosList.innerHTML = '';
    const materiaRef = doc(db, "materias", materiaId);
    const materiaSnap = await materiaRef.get();

    const archivos = materiaSnap.data().archivos || [];
    archivos.forEach((archivo) => {
        const li = document.createElement('li');
        li.textContent = archivo;
        archivosList.appendChild(li);
    });
}

// Volver al dashboard
backToDashboardBtn.addEventListener('click', () => {
    archivoSection.style.display = 'none';
    dashboardSection.style.display = 'block';
});
