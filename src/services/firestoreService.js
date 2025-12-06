import { db } from "../config/firebase";
// Importaciones de Firestore:
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    orderBy,
    doc,         // Para referenciar un documento por ID
    setDoc,      // Para crear o sobrescribir un documento por ID
    getDoc       // Para obtener un documento por ID
} from "firebase/firestore";

// Importaciones de Firebase Authentication:
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, // <--- ESTA ES LA FUNCIÓN QUE FALTA
    // Puedes añadir signOut, etc., aquí si las usas
} from "firebase/auth";

// Inicializa Auth
const auth = getAuth(); 

// ----------------------------------------------------------------------
// --- FUNCIONES ESENCIALES PARA LA AUTENTICACIÓN Y ROLES ---
// ----------------------------------------------------------------------

/**
 * Obtiene el perfil de un usuario por su ID de Firebase Auth (UID).
 * Esta función es crucial para que el UserContext recargue la sesión.
 * @param {string} uid El ID único (UID) del usuario.
 * @returns {Promise<Object | null>} El objeto del usuario (incluyendo el rol) o null si no existe.
 */
export async function getUserProfileByUID(uid) {
    if (!uid) return null;

    const userDocRef = doc(db, "usuario", uid); // Usando la colección 'usuario'
    
    try {
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
            return { 
                id: docSnap.id, 
                ...docSnap.data() 
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el perfil de usuario:", error);
        throw error;
    }
}


/**
 * Registra un nuevo usuario en Firebase Auth y guarda sus datos como VENDEDOR en Firestore.
 * El ID del documento de Firestore es el UID de Auth.
 * @param {string} email - Correo electrónico del nuevo vendedor.
 * @param {string} password - Contraseña del nuevo vendedor.
 * @param {string} nombre - Nombre del vendedor.
 * @param @param {string} apellido - Apellido del vendedor.
 * @returns {Promise<Object>} El objeto del nuevo usuario (sin contraseña).
 */
export const registerVendedor = async (email, password, nombre, apellido) => {
    try {
        // 1. Crear el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        // 2. Definir los datos del usuario con el rol 'vendedor'
        const vendedorData = {
            email: email,
            rol: 'vendedor', // <--- ROL CLAVE PARA LAS RUTAS
            nombre: nombre,
            apellido: apellido,
            createdAt: new Date(),
        };

        // 3. Guardar los datos en Firestore en la colección 'usuario' usando el UID como ID
        const userDocRef = doc(db, "usuario", uid);
        await setDoc(userDocRef, vendedorData);

        console.log("Vendedor registrado con éxito:", email);
        return { id: uid, ...vendedorData };

    } catch (error) {
        console.error("Error al registrar el vendedor:", error);
        throw error; 
    }
};

/**
 * Inicia sesión en Firebase Auth y luego obtiene el perfil de Firestore para el rol.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} El objeto de usuario completo con el rol.
 */
export async function loginUser(email, password) {
    try {
        // 1. Iniciar sesión en Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2. Obtener el perfil de Firestore para conseguir el rol (Vendedor o Admin)
        const userProfile = await getUserProfileByUID(uid);

        if (!userProfile) {
            throw new Error("Perfil de usuario no encontrado en la base de datos de roles. Asegúrese de que el usuario fue registrado correctamente.");
        }
        
        // 3. Devolver el perfil completo, que incluye el campo 'rol'
        return userProfile; 
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        // El error de credenciales incorrectas de Firebase se propagará aquí
        throw error;
    }
}


// ----------------------------------------------------------------------
// --- FUNCIONES GENERALES (REEMPLAZANDO mockDataService) ---
// ----------------------------------------------------------------------

/**
 * Obtiene todos los documentos de una colección (e.g., 'productos' o 'orders').
 * @param {string} collectionName Nombre de la colección ('productos', 'orders', etc.).
 * @returns {Promise<Array<Object>>} Array de documentos.
 */
export async function getCollection(collectionName) {
    const colRef = collection(db, collectionName);
    const q = query(colRef);
    
    try {
        const querySnapshot = await getDocs(q); 
        const items = [];
        querySnapshot.forEach((documento) => {
            items.push({
                id: documento.id, 
                ...documento.data()
            });
        });
        return items;
    } catch (error) {
        console.error(`Error al obtener la colección ${collectionName}:`, error);
        throw error;
    }
}


// ----------------------------------------------------------------------
// --- FUNCIONES EXISTENTES DEL USUARIO ---
// ----------------------------------------------------------------------

export async function addUser(user){
    // Usada probablemente para el registro de clientes
    try {
        const docRef = await addDoc(collection(db,"usuario"),{
            ...user,
            createdAt: new Date(),
        });
        console.log("Usuario Registrado con ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error al registrar usuario: ", error);
        throw error; 
    }
}

/**
 * Obtiene el historial de órdenes de un usuario específico desde Firestore.
 * @param {string} userId El ID único (UID) del usuario logueado.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con un array de objetos de órdenes.
 */
export async function getOrdersByUserId(userId) {
    if (!userId) {
        console.error("Error: userId es requerido para buscar órdenes.");
        return [];
    }

    const ordersRef = collection(db, "orders"); 
    
    // Consulta
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