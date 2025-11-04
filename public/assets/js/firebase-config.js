/* ==========================================
 * ARCHIVO: js/firebase-config.js
 * - Centraliza la configuración e inicialización de Firebase.
 * - Exporta las instancias de los servicios para ser usadas en otros archivos.
 * ==========================================
*/

const firebaseConfig = {
    apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
    authDomain: "tienda-level-up.firebaseapp.com",
    projectId: "tienda-level-up"
};

// Inicializar Firebase (solo si no se ha hecho antes)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Exportar los servicios que necesitas
export const db = firebase.firestore();
export const auth = firebase.auth();