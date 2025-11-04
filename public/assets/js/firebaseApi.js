/* ==========================================
 * ARCHIVO: js/api/firebaseApi.js
 * - Contiene las funciones para interactuar con la base de datos de Firebase.
 * ==========================================
*/

import { db } from '../firebase-config.js'; // Importamos la base de datos centralizada

/**
 * FUNCIÓN "READ" (Leer)
 * Obtiene SÓLO los productos donde el campo "enOferta" sea "true"
 */
export const getProductosEnOferta = async () => {
    
    // 1. Apuntamos a nuestra colección "producto" en Firestore
    const productosCollection = db.collection('producto');
    
    // 2. Creamos la consulta (query):
    // Pedimos todos los documentos de "producto" DONDE (where)
    // el campo "enOferta" sea (==) true
    const q = productosCollection.where("enOferta", "==", true);

    // 3. Ejecutamos la consulta
    const querySnapshot = await q.get();

    // 4. Mapeamos los resultados para convertirlos a un array simple
    const productosEnOferta = [];
    querySnapshot.forEach((doc) => {
        productosEnOferta.push({
            id: doc.id,       // El ID del documento (ej. "catan")
            ...doc.data()     // Todos los campos (nombre, precio, enOferta, etc.)
        });
    });

    return productosEnOferta;
};