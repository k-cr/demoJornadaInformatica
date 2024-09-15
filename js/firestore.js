// firestore.js
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './firebaseConfig';

// Agregar una nueva materia
async function agregarMateria(nombre) {
  try {
    const docRef = await addDoc(collection(db, "materias"), {
      nombre: nombre
    });
    
    console.log("Materia agregada con ID: ", docRef.id);
  } catch (error) {
    console.error("Error al agregar materia: ", error);
  }
}

// Obtener todas las materias
async function obtenerMaterias() {
  const querySnapshot = await getDocs(collection(db, "materias"));
  
  // ! Cambiar por listar las materias en el front 
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data().nombre}`);
  });
}

// Actualizar materia
async function actualizarMateria(id, nuevoNombre) {
  const materiaRef = doc(db, "materias", id);
  await updateDoc(materiaRef, {
    nombre: nuevoNombre
  });
}

// Eliminar materia
async function eliminarMateria(id) {
  await deleteDoc(doc(db, "materias", id));
}

export { agregarMateria, obtenerMaterias, actualizarMateria, eliminarMateria };
