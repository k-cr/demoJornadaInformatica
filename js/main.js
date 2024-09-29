import { app, auth, storage } from './firebaseConfig.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js';

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
const addArchivoBtn = document.getElementById('btn-add-archivo');

let materiaIdSeleccionada = null; // Guardar el ID de la materia que se va a editar


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
        // authSection.style.display = 'none';
        authSection.classList.remove("d-flex")
        authSection.classList.add("d-none")
        dashboardSection.style.display = 'block';
        mostrarMaterias();
    } else {
        authSection.classList.remove("d-none")
        authSection.classList.add("d-flex")
        authSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        archivoSection.style.display = 'none';
    }
});

// Mostrar materias en el dashboard
async function mostrarMaterias() {
    // Limpiamos el contenido actual de la lista de materias
    materiasList.innerHTML = '';

    // Obtenemos los documentos de la colección "materias" desde Firebase
    const querySnapshot = await getDocs(collection(db, "materias"));

    // Recorremos los documentos obtenidos
    querySnapshot.forEach((doc) => {
        const materia = doc.data();

        // Creamos un elemento <li> para mostrar la materia
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        li.addEventListener('click', () => mostrarArchivos(doc.id));

        // Creamos el contenido con el nombre de la materia
        const materiaNombre = document.createElement('span');
        materiaNombre.textContent = materia.nombre;

        // Añadir evento click para mostrar la lista de archivos
        materiaNombre.style.cursor = 'pointer';  // Cambiamos el cursor para indicar que es clicable

        // Creamos un contenedor para los botones de editar y eliminar
        const buttonGroup = document.createElement('div');

        // Botón de Editar
        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-primary', 'btn-sm', 'me-2');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => {
            // Lógica para editar la materia
            abrirModalEditarMateria(doc.id, materia.nombre);
        });

        // Botón de Eliminar
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => {
            // Lógica para eliminar la materia
            abrirModalEliminarMateria(doc.id, materia.nombre);
        });

        // Añadimos los botones al contenedor de botones
        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);

        // Añadimos el nombre de la materia y los botones al <li>
        li.appendChild(materiaNombre);
        li.appendChild(buttonGroup);

        // Añadimos el <li> al <ul> de la lista de materias
        materiasList.appendChild(li);
    });    
}

// Mostrar archivos de una materia en el dashboard
async function mostrarArchivos(materiaId) {
    dashboardSection.style.display = 'none';
    archivoSection.style.display = 'block';
    materiaIdSeleccionada = materiaId;  // Guardar el ID de la materia seleccionada
    archivosList.innerHTML = '';  // Limpiar lista de archivos

    // Referencia a la colección de archivos dentro de la materia en Firestore
    const archivosSnapshot = await getDocs(collection(db, 'materias', materiaId, 'archivos'));

    archivosSnapshot.forEach((archivoDoc) => {
        const archivo = archivoDoc.data();

        // Crear el elemento <li> para cada archivo
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        
        const archivoNombre = document.createElement('span');
        archivoNombre.textContent = archivo.nombre;

        const buttonGroup = document.createElement('div');

        // Botón para ver archivo
        const viewButton = document.createElement('button');
        viewButton.classList.add('btn', 'btn-info', 'btn-sm', 'me-2');
        viewButton.textContent = 'Ver';
        viewButton.addEventListener('click', () => {
            window.open(archivo.url, '_blank');  // Abrir el archivo en una nueva pestaña
        });

        // Botón para eliminar archivo
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => {
            eliminarArchivo(materiaId, archivoDoc.id, archivo.nombre);
        });

        // Añadir botones y nombre de archivo al <li>
        buttonGroup.appendChild(viewButton);
        buttonGroup.appendChild(deleteButton);
        li.appendChild(archivoNombre);
        li.appendChild(buttonGroup);

        archivosList.appendChild(li);  // Añadir el <li> a la lista de archivos
    });
}


// Obtener URL del archivo en Storage
async function obtenerURLArchivo(archivoRef) {
    const url = await getDownloadURL(archivoRef);
    window.open(url, '_blank');
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
            bootstrap.Modal.getInstance(document.getElementById('addMateriaModal')).hide(); // Cerramos el modal
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

addArchivoBtn.addEventListener('click', () => {
    const addArchivoModal = new bootstrap.Modal(document.getElementById('modalAnadirArchivo'));
    addArchivoModal.show();
})

const btnSubirArchivo = document.getElementById('btn-subir-archivo');
btnSubirArchivo.addEventListener('click', async () => {
    subirArchivo();
});
// Función para subir un archivo a Firebase Storage y Firestore
async function subirArchivo() {
    const archivo = document.getElementById('inputArchivo').files[0];
    const materiaId = materiaIdSeleccionada; // Obtén este valor dinámicamente según la materia

    if (archivo) {
        try {
            // Crear una referencia en Firebase Storage para el archivo
            const storageRef = ref(storage, `materias/${materiaId}/archivos/${archivo.name}`);
            
            // Subir el archivo a Firebase Storage
            const uploadTaskSnapshot = await uploadBytes(storageRef, archivo);
            
            // Obtener la URL de descarga del archivo
            const urlArchivo = await getDownloadURL(uploadTaskSnapshot.ref);

            // Guardar la referencia del archivo en Firestore, asociada a la materia
            await addDoc(collection(db, 'materias', materiaId, 'archivos'), {
                nombre: archivo.name,
                url: urlArchivo,
                fechaSubida: new Date()
            });

            alert('Archivo subido exitosamente');
            // Actualizar la lista de archivos
            mostrarArchivos(materiaId);  
            // Cerrar el modal
            const addArchivoModal = new bootstrap.Modal(document.getElementById('modalAnadirArchivo'));
            addArchivoModal.hide();
        } catch (error) {
            alert('Error al subir el archivo: ' + error.message);
        }
    } else {
        alert('Por favor, selecciona un archivo.');
    }
}

/* -------------------------------------------------------------------------- */
/*                                  Eliminar                                  */
/* -------------------------------------------------------------------------- */
// Función para abrir el modal de eliminación
function abrirModalEliminarMateria(id, nombreActual) {
    materiaIdSeleccionada = id; // Guardamos el ID de la materia
    document.getElementById('nombreMateriaEliminar').textContent = nombreActual; // Mostramos el nombre de la materia en el modal
    const modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminarMateria'));
    modalEliminar.show(); // Mostramos el modal
}

// Función para confirmar la eliminación
document.getElementById('btnConfirmarEliminar').addEventListener('click', async () => {
    try {
        // Referencia al documento en Firestore
        const materiaRef = doc(db, "materias", materiaIdSeleccionada);
        
        // Eliminamos la materia
        await deleteDoc(materiaRef);

        alert('Materia eliminada con éxito.');
        mostrarMaterias(); // Refrescamos la lista
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarMateria')).hide(); // Cerramos el modal
    } catch (error) {
        console.error('Error al eliminar la materia:', error);
        alert('Hubo un problema al eliminar la materia.');
    }
});

// Eliminar archivo en Storage
async function eliminarArchivo(materiaId, archivoId, nombreArchivo) {
    if (confirm(`¿Estás seguro de que deseas eliminar el archivo "${nombreArchivo}"?`)) {
        try {
            // Eliminar archivo de Firebase Storage
            const storageRef = ref(storage, `materias/${materiaId}/archivos/${nombreArchivo}`);
            await deleteObject(storageRef);

            // Eliminar archivo de Firestore
            await deleteDoc(doc(db, 'materias', materiaId, 'archivos', archivoId));

            alert('Archivo eliminado correctamente');
            mostrarArchivos(materiaId);  // Actualizar la lista de archivos
        } catch (error) {
            alert('Error al eliminar el archivo: ' + error.message);
        }
    }
}


/* -------------------------------------------------------------------------- */
/*                                    Edit                                    */
/* -------------------------------------------------------------------------- */

// Función para abrir el modal de edición
function abrirModalEditarMateria(id, nombreActual) {
    materiaIdSeleccionada = id; // Guardamos el ID de la materia
    document.getElementById('nombreMateria').value = nombreActual; // Precargamos el nombre actual
    const modalEditar = new bootstrap.Modal(document.getElementById('modalEditarMateria'));
    modalEditar.show(); // Mostramos el modal
}

// Función para guardar los cambios de la edición
document.getElementById('btnGuardarCambios').addEventListener('click', async () => {
    const nuevoNombre = document.getElementById('nombreMateria').value;

    if (nuevoNombre) {
        try {
            // Referencia al documento en Firestore
            const materiaRef = doc(db, "materias", materiaIdSeleccionada);
            
            // Actualizamos el nombre de la materia
            await updateDoc(materiaRef, { nombre: nuevoNombre });

            alert('Materia actualizada con éxito.');
            mostrarMaterias(); // Refrescamos la lista
            bootstrap.Modal.getInstance(document.getElementById('modalEditarMateria')).hide(); // Cerramos el modal
        } catch (error) {
            console.error('Error al actualizar la materia:', error);
            alert('Hubo un problema al actualizar la materia.');
        }
    } else {
        alert('El nombre de la materia no puede estar vacío.');
    }
});

/* -------------------------------------------------------------------------- */
/*                               Volver al dash                               */
/* -------------------------------------------------------------------------- */

// Volver al dashboard
backToDashboardBtn.addEventListener('click', () => {
    archivoSection.style.display = 'none';
    dashboardSection.style.display = 'block';
});