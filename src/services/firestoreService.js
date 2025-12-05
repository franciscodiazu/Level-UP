import { db } from "../config/firebase";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore"; // Nuevas importaciones

export async function addUser(user){
    try {
        // Nota: Asumo que esta función registra usuarios en una colección llamada "usuario"
        const docRef = await addDoc(collection(db,"usuario"),{
            ...user,
            createdAt: new Date(),
        });
        console.log("Usuario Registrado con ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error al registrar usuario: ", error);
        return error
    }
}

/**
 * Obtiene el historial de órdenes de un usuario específico desde Firestore.
 * Requiere que en Firestore exista la colección 'orders' con un campo 'userId' y 'date'.
 * @param {string} userId El ID único (UID) del usuario logueado.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con un array de objetos de órdenes.
 */
export async function getOrdersByUserId(userId) {
    if (!userId) {
        console.error("Error: userId es requerido para buscar órdenes.");
        return [];
    }

    const ordersRef = collection(db, "orders"); 
    
    // Consulta:
    // 1. Filtrar documentos donde 'userId' coincida con el usuario.
    // 2. Ordenar por el campo 'date' de forma descendente (más reciente primero).
    const q = query(
        ordersRef, 
        where("userId", "==", userId),
        orderBy("date", "desc") 
    ); 

    try {
        const querySnapshot = await getDocs(q); 
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Si 'date' es un Timestamp, lo convertimos a un objeto Date de JS para el renderizado
            const dateObject = data.date && data.date.toDate ? data.date.toDate() : null;

            orders.push({
                id: doc.id, 
                ...data,
                date: dateObject, // Objeto Date de JS
            });
        });
        
        return orders;
    } catch (error) {
        console.error("Error al obtener órdenes del usuario:", error);
        throw error;
    }
}