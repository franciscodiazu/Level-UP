import { db } from "../config/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

export class CrudService {

  // ==================== ÓRDENES ====================
  static async getOrdenes() {
    try {
      const q = query(collection(db, "compras"), orderBy("fecha", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate ? doc.data().fecha.toDate() : doc.data().fecha
      }));
    } catch (error) {
      console.error("Error obteniendo órdenes:", error);
      return [];
    }
  }

  static async updateEstadoOrden(id, nuevoEstado) {
    try {
      const ordenRef = doc(db, "compras", id);
      await updateDoc(ordenRef, {
        estado: nuevoEstado,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error actualizando orden:", error);
      return false;
    }
  }

  // ==================== PRODUCTOS ====================
  static async getProductos() {
    try {
      const snapshot = await getDocs(collection(db, "producto"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      return [];
    }
  }

  static async crearProducto(productoData) {
    try {
      await addDoc(collection(db, "producto"), {
        ...productoData,
        activo: true,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error creando producto:", error);
      return false;
    }
  }

  static async actualizarProducto(id, productoData) {
    try {
      const productoRef = doc(db, "producto", id);
      await updateDoc(productoRef, {
        ...productoData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error actualizando producto:", error);
      return false;
    }
  }

  static async eliminarProducto(id) {
    try {
      await deleteDoc(doc(db, "producto", id));
      return true;
    } catch (error) {
      console.error("Error eliminando producto:", error);
      return false;
    }
  }

  // ==================== CATEGORÍAS ====================
  static async getCategorias() {
    try {
      // Extraemos categorías únicas de los productos existentes
      const productos = await this.getProductos();
      const categoriasSet = new Set();
      
      productos.forEach(p => {
        if (p.categoria) categoriasSet.add(p.categoria);
      });

      return Array.from(categoriasSet).map((cat, index) => ({
        id: `cat-${index}`,
        nombre: cat,
        productosCount: productos.filter(p => p.categoria === cat).length
      }));
    } catch (error) {
      console.error("Error cargando categorías:", error);
      return [];
    }
  }

  // ==================== USUARIOS ====================
  static async getUsuarios() {
    try {
      const snapshot = await getDocs(collection(db, "usuario"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      return [];
    }
  }

  static async crearUsuario(usuarioData) {
    try {
        await addDoc(collection(db, "usuario"), {
            ...usuarioData,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error creando usuario:", error);
        return false;
    }
  }

  static async eliminarUsuario(id) {
    try {
      await deleteDoc(doc(db, "usuario", id));
      return true;
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      return false;
    }
  }
}