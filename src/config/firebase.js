import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


import { getAuth } from "firebase/auth"; //Importar auth

// Inicializar Firebase
    const firebaseConfig = {
  apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
  authDomain: "tienda-level-up.firebaseapp.com",
  projectId: "tienda-level-up",
  storageBucket: "tienda-level-up.appspot.com",//actualizar de esto firebasestorage.app a esto appspot.com
  messagingSenderId: "210482166049",
  appId: "1:210482166049:web:15dadb935d28d9f7d02660",
  measurementId: "G-85R23XKYYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app); //Se exporta auth 
