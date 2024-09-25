import { app, auth, storage } from './firebaseConfig.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

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

// Referencias adicionales añadir
const addMateriaBtn = document.getElementById('add-materia-btn');
const deleteMateriaBtn = document.getElementById('delete-materia-btn');
const saveMateriaBtn = document.getElementById('save-materia-btn');
const materiaNameInput = document.getElementById('materia-name');

/* -------------------------------------------------------------------------- */
/*                                    Login                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                     Get                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Añadir                                   */
/* -------------------------------------------------------------------------- */
// Mostrar modal al hacer clic en "Añadir Materia"
addMateriaBtn.addEventListener('click', () => {
    const addMateriaModal = new bootstrap.Modal(document.getElementById('addMateriaModal'));
    addMateriaModal.show();
});

// Guardar nueva materia
saveMateriaBtn.addEventListener('click', async () => {
    const nombreMateria = materiaNameInput.value.trim();
    if (nombreMateria) {
        try {
            // Añadir nueva materia a Firestore
            await addDoc(collection(db, "materias"), { nombre: nombreMateria, archivos: [] });
            alert('Materia añadida con éxito');
            materiaNameInput.value = ''; // Limpiar input
            mostrarMaterias(); // Actualizar la lista de materias
        } catch (error) {
            console.error('Error al añadir materia:', error);
            alert('Hubo un error al añadir la materia.');
        }
    } else {
        alert('Por favor, ingresa un nombre para la materia.');
    }
});

// Eliminar materia seleccionada
deleteMateriaBtn.addEventListener('click', async () => {
    const nombreMateria = prompt('Ingrese el nombre de la materia a eliminar:');
    if (nombreMateria) {
        try {
            const querySnapshot = await getDocs(collection(db, "materias"));
            let materiaId = null;

            // Encontrar el documento que coincida con el nombre de la materia
            querySnapshot.forEach((doc) => {
                if (doc.data().nombre === nombreMateria) {
                    materiaId = doc.id;
                }
            });

            if (materiaId) {
                // Eliminar la materia de Firestore
                await deleteDoc(doc(db, "materias", materiaId));
                alert('Materia eliminada con éxito.');
                mostrarMaterias(); // Actualizar la lista de materias
            } else {
                alert('No se encontró una materia con ese nombre.');
            }
        } catch (error) {
            console.error('Error al eliminar la materia:', error);
            alert('Hubo un error al eliminar la materia.');
        }
    } else {
        alert('Por favor, ingresa el nombre de la materia a eliminar.');
    }
});

// Volver al dashboard
backToDashboardBtn.addEventListener('click', () => {
    archivoSection.style.display = 'none';
    dashboardSection.style.display = 'block';
});
