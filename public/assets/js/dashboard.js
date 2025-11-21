class DashboardManager {
    constructor(db) {
        this.db = db;
        this.cargarEstadisticas();
    }

    async cargarEstadisticas() {
        console.log('DashboardManager: Cargando estadísticas...');
        
        try {
            // 1. Compras
            const comprasSnap = await this.db.collection("compras").get();
            this.actualizarDato('totalCompras', comprasSnap.size);

            // 2. Productos
            const productosSnap = await this.db.collection("producto").get();
            this.actualizarDato('totalProductos', productosSnap.size);
            
            // Calculamos inventario sumando stock
            let inventario = 0;
            productosSnap.forEach(doc => {
                inventario += parseInt(doc.data().stock || doc.data().cantidad || 0);
            });
            this.actualizarDato('inventarioTotal', inventario);

            // 3. Usuarios
            const usuariosSnap = await this.db.collection("usuario").get();
            this.actualizarDato('totalUsuarios', usuariosSnap.size);

            // Nuevos usuarios este mes (Ejemplo)
            const inicioMes = new Date();
            inicioMes.setDate(1);
            // Nota: Para consultas complejas en v8 necesitas índices o hacerlo en cliente
            // Aquí lo haremos en cliente por simplicidad
            let nuevos = 0;
            usuariosSnap.forEach(doc => {
                const fecha = doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt);
                if (fecha >= inicioMes) nuevos++;
            });
            this.actualizarDato('nuevosUsuariosMes', nuevos);

        } catch (error) {
            console.error('Error en Dashboard:', error);
        }
    }

    actualizarDato(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            // Efecto visual simple
            elemento.style.opacity = 0;
            setTimeout(() => elemento.style.opacity = 1, 100);
        }
    }
}

// Exportar al objeto global
window.DashboardManager = DashboardManager;