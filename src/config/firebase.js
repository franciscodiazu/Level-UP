import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

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
const analytics = getAnalytics(app);
export const db = getFirestore(app);