// storage.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebaseConfig';

// Subir archivo
async function subirArchivo(materiaId, archivo) {
  const storageRef = ref(storage, `materias/${materiaId}/${archivo.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(snapshot.ref);
    console.log("Archivo subido. URL:", url);
    return url;
  } catch (error) {
    console.error("Error al subir archivo:", error);
  }
}

export { subirArchivo };
