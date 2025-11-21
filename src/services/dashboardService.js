import { db } from "../config/firebase";
import { 
  collection, 
  getCountFromServer, 
  query, 
  where 
} from "firebase/firestore";

export class DashboardService {
  
  static async getEstadisticas() {
    try {
      console.log("Calculando estadísticas del Dashboard (v9)...");

      // 1. Total Compras
      const comprasRef = collection(db, "compras");
      const snapCompras = await getCountFromServer(comprasRef);
      const totalCompras = snapCompras.data().count;

      // 2. Proyección (Lógica simplificada para ejemplo)
      const proyeccion = 15; // Aquí puedes implementar la lógica de fechas si lo requieres

      // 3. Total Productos
      const productosRef = collection(db, "producto");
      const snapProductos = await getCountFromServer(productosRef);
      const totalProductos = snapProductos.data().count;

      // 4. Total Usuarios
      const usuariosRef = collection(db, "usuario");
      const snapUsuarios = await getCountFromServer(usuariosRef);
      const totalUsuarios = snapUsuarios.data().count;

      // 5. Nuevos Usuarios (Este Mes)
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0,0,0,0);
      
      const qNuevos = query(usuariosRef, where("createdAt", ">=", inicioMes));
      const snapNuevos = await getCountFromServer(qNuevos);
      const nuevosUsuarios = snapNuevos.data().count;

      return {
        totalCompras,
        proyeccionCompras: proyeccion,
        totalProductos,
        inventarioTotal: totalProductos * 10, // Estimado si no hay campo cantidad
        totalUsuarios,
        nuevosUsuariosMes: nuevosUsuarios
      };

    } catch (error) {
      console.error("Error en DashboardService:", error);
      return {
        totalCompras: 0, proyeccionCompras: 0, 
        totalProductos: 0, inventarioTotal: 0, 
        totalUsuarios: 0, nuevosUsuariosMes: 0
      };
    }
  }
}