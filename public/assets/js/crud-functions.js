class CRUDFunctions {
    constructor(db) {
        this.db = db;
        this.init();
    }

    init() {
        console.log('CRUDFunctions: Iniciado');
        this.configurarGlobales();
        
        // Cargar datos automáticamente si la tabla existe
        if (document.getElementById('usuarios-tbody')) this.cargarUsuarios();
        if (document.getElementById('productos-tbody')) this.cargarProductos();
        if (document.getElementById('ordenes-tbody')) this.cargarOrdenes();
    }

    configurarGlobales() {
        // Exponemos las funciones al window para que los botones del HTML funcionen
        window.cargarUsuarios = () => this.cargarUsuarios();
        window.eliminarUsuario = (id) => this.eliminarUsuario(id);
        window.cargarProductos = () => this.cargarProductos();
        // ... agrega aquí el resto de funciones que necesites en el HTML
    }

    // ==================== USUARIOS ====================
    async cargarUsuarios() {
        const tbody = document.getElementById('usuarios-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';

        try {
            const snapshot = await this.db.collection("usuario").get();
            
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay usuarios registrados</td></tr>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const u = doc.data();
                html += `
                    <tr>
                        <td>${u.run || 'N/A'}</td>
                        <td>${u.nombre || 'N/A'}</td>
                        <td>${u.email || u.correo || 'N/A'}</td>
                        <td>${u.rol || 'cliente'}</td>
                        <td>
                            <span class="badge ${u.activo ? 'bg-success' : 'bg-danger'}">
                                ${u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${doc.id}')">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar datos</td></tr>';
        }
    }

    async eliminarUsuario(id) {
        if(!confirm('¿Estás seguro de eliminar este usuario?')) return;
        
        try {
            await this.db.collection("usuario").doc(id).delete();
            alert('Usuario eliminado');
            this.cargarUsuarios();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        }
    }

    // ==================== PRODUCTOS ====================
    async cargarProductos() {
        const tbody = document.getElementById('productos-tbody');
        if (!tbody) return;

        try {
            const snapshot = await this.db.collection("producto").get();
            let html = '';
            snapshot.forEach(doc => {
                const p = doc.data();
                html += `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>$${p.precio}</td>
                        <td>${p.stock || 0}</td>
                        <td>${p.categoria || 'General'}</td>
                        <td>Activo</td>
                        <td>
                            <button class="btn btn-sm btn-primary">Editar</button>
                        </td>
                    </tr>`;
            });
            tbody.innerHTML = html || '<tr><td colspan="6">No hay productos</td></tr>';
        } catch (error) {
            console.error(error);
        }
    }
}

// Exportar al objeto global para que CrudManager lo encuentre
window.CRUDFunctions = CRUDFunctions;