// public/assets/js/admin-logic.js

// ==========================================
// 1. CONFIGURACIÓN FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
    authDomain: "tienda-level-up.firebaseapp.com",
    projectId: "tienda-level-up",
    storageBucket: "tienda-level-up.appspot.com",
    messagingSenderId: "210482166049",
    appId: "1:210482166049:web:15dadb935d28d9f7d02660",
    measurementId: "G-85R23XKYYM"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const rowsPerPage = 5;
let productosCache = {};
let categoriasCache = {};

// ==========================================
// 3. ROUTER (DETECTAR PÁGINA)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Logic Cargado - Versión Final Singular');

    // Cargar Info de Sesión (Header)
    if (document.getElementById('header-username')) cargarInfoSesion();

    // Detectar página y cargar lógica
    if (document.getElementById('stat-compras')) cargarDashboard();
    if (document.getElementById('usuarios-tbody')) cargarUsuarios();
    if (document.getElementById('pedidos-tbody')) cargarPedidos(); // Ahora esta función existirá
    if (document.getElementById('productos-tbody')) cargarProductos();
    
    // NUEVO: Categorías y Reportes
    if (document.getElementById('lista-categorias')) cargarCategorias();
    if (document.getElementById('ventasChart')) cargarReportes(); 
});

// ==========================================
// 4. LÓGICA DE SESIÓN
// ==========================================
function cargarInfoSesion() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const nameElement = document.getElementById('header-username');
            if (nameElement) nameElement.textContent = user.nombre ? user.nombre.split(' ')[0] : 'Admin';
            
            const avatarElement = document.getElementById('header-avatar');
            if (avatarElement) {
                const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || 'A')}&background=39FF14&color=000`;
                avatarElement.src = avatarUrl;
            }
        } catch (e) { console.error(e); }
    }
}

window.cerrarSesion = function() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('usuario');
        if (firebase.auth) firebase.auth().signOut();
        window.location.href = '../../index.html';
    }
}

// ==========================================
// 5. DASHBOARD
// ==========================================
async function cargarDashboard() {
    try {
        const c = await db.collection("compras").get();
        const p = await db.collection("producto").get();
        const u = await db.collection("usuario").get();
        
        if(document.getElementById('stat-compras')) document.getElementById('stat-compras').textContent = c.size;
        if(document.getElementById('stat-productos')) document.getElementById('stat-productos').textContent = p.size;
        if(document.getElementById('stat-usuarios')) document.getElementById('stat-usuarios').textContent = u.size;
    } catch (e) { console.log("Error stats: ", e); }
}

// ==========================================
// 6. LÓGICA DE PEDIDOS (NUEVA FUNCIÓN)
// ==========================================
async function cargarPedidos() {
    const tbody = document.getElementById('pedidos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">Cargando pedidos...</td></tr>';

    try {
        const snap = await db.collection("compras").orderBy("fecha", "desc").get();

        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No se han realizado pedidos todavía.</td></tr>';
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const pedido = doc.data();
            const fecha = pedido.fecha.toDate().toLocaleDateString('es-CL');
            
            // Definir el estilo del badge según el estado
            let badgeClass = '';
            switch (pedido.estado) {
                case 'entregado': badgeClass = 'bg-success'; break;
                case 'pendiente': badgeClass = 'bg-warning'; break;
                case 'cancelado': badgeClass = 'bg-danger'; break;
                default: badgeClass = 'bg-secondary';
            }

            html += `
                <tr>
                    <td><span style="font-family:monospace; color:#39FF14;">${doc.id.substring(0, 8)}...</span></td>
                    <td>${pedido.cliente.nombre} ${pedido.cliente.apellidos}</td>
                    <td>$${pedido.total.toLocaleString('es-CL')}</td>
                    <td><span class="badge ${badgeClass}">${pedido.estado}</span></td>
                    <td>${fecha}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

    } catch (e) {
        console.error("Error al cargar pedidos: ", e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar los pedidos. Revisa la consola (F12).</td></tr>';
    }
}


// ==========================================
// 9. LÓGICA DE CATEGORÍAS (SINGULAR)
// ==========================================
async function cargarCategorias() {
    const tbody = document.getElementById('lista-categorias');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">Cargando categorías y conteos...</td></tr>';

    try {
        // 1. Cargar Categorías
        const catSnap = await db.collection("categoria").get();
        // 2. Cargar Productos (para contarlos)
        const prodSnap = await db.collection("producto").get();
        
        categoriasCache = {}; 

        if (catSnap.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No hay categorías creadas.</td></tr>';
            return;
        }

        let html = '';
        
        catSnap.forEach(doc => {
            const d = doc.data();
            categoriasCache[doc.id] = d;

            // Calcular cuántos productos tienen esta categoría
            // Comparamos el nombre de la categoría con el campo "categoria" del producto
            const cantidadProductos = prodSnap.docs.filter(p => p.data().categoria === d.nombre).length;

            html += `
                <tr>
                    <td><span style="font-family:monospace; color:#39FF14;">${doc.id.substring(0,8)}...</span></td>
                    <td style="font-weight:bold; color:white;">${d.nombre}</td>
                    <td style="color:#aaa;">${d.descripcion || 'Sin descripción'}</td>
                    <td class="text-center">
                        <span class="badge bg-light text-dark" style="font-size:0.9em;">${cantidadProductos}</span>
                    </td>
                    <td class="text-end">
                        <button onclick="window.abrirModalCategoria('${doc.id}')" class="btn btn-sm btn-warning me-2"><i class="fas fa-pencil-alt"></i></button>
                        <button onclick="window.eliminarCategoria('${doc.id}')" class="btn btn-sm btn-danger"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

    } catch (e) {
        console.error("Error al cargar categorías: ", e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar datos.</td></tr>';
    }
}

window.abrirModalCategoria = function(id = null) {
    const form = document.getElementById('formCategoria');
    if (!form) return;
    form.reset();
    document.getElementById('categoriaId').value = '';
    
    // Abrir modal manualmente con Bootstrap
    const modalEl = document.getElementById('modalCategoria');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    if (id && categoriasCache[id]) {
        const cat = categoriasCache[id];
        document.getElementById('categoriaId').value = id;
        document.getElementById('nombreCategoria').value = cat.nombre;
        document.getElementById('descripcionCategoria').value = cat.descripcion || '';
    }
}

window.guardarCategoria = async function(e) {
    e.preventDefault(); 
    const id = document.getElementById('categoriaId').value;
    const datos = {
        nombre: document.getElementById('nombreCategoria').value,
        descripcion: document.getElementById('descripcionCategoria').value,
    };

    try {
        if (id) {
            await db.collection("categoria").doc(id).update(datos);
            alert('Categoría actualizada');
        } else {
            await db.collection("categoria").add({ ...datos, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            alert('Categoría creada');
        }
        cargarCategorias();
        // Cerrar modal (truco simple para cerrar el backdrop)
        document.querySelector('.btn-close').click(); 
    } catch (error) {
        alert('Error al guardar: ' + error.message);
    }
}

window.eliminarCategoria = async function(id) {
    if (confirm('¿Eliminar esta categoría?')) {
        try {
            await db.collection("categoria").doc(id).delete();
            alert('Categoría eliminada');
            cargarCategorias();
        } catch (e) { alert('Error al eliminar: ' + e.message); }
    }
}

// ==========================================
// 10. REPORTES (KPIs)
// ==========================================
async function cargarReportes() {
    console.log('Cargando KPIs...');
    const ventasEl = document.getElementById('ventas-mes'); 
    const stockEl = document.getElementById('stock-total'); 
    const pendientesEl = document.getElementById('pedidos-pendientes'); 

    try {
        const pedidosSnap = await db.collection("compras").get();
        const productosSnap = await db.collection("producto").get();

        // Ventas
        const totalVentas = pedidosSnap.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
        if(ventasEl) ventasEl.textContent = '$' + totalVentas.toLocaleString('es-CL'); 

        // Stock
        const totalStock = productosSnap.docs.reduce((sum, doc) => sum + parseInt(doc.data().stock || 0), 0);
        if(stockEl) stockEl.textContent = totalStock.toLocaleString('es-CL');
        
        // Pendientes
        const pendientes = pedidosSnap.docs.filter(doc => doc.data().estado === 'pendiente').length;
        if(pendientesEl) pendientesEl.textContent = pendientes.toLocaleString('es-CL');

    } catch (e) {
        console.error("Error Reportes: ", e);
    }

    // --- LÓGICA PARA DIBUJAR EL GRÁFICO ---
    const ctx = document.getElementById('ventasChart');
    if (ctx) {
        console.log("Canvas encontrado. Dibujando gráfico...");

        // Datos fijos para el gráfico (Visualización)
        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Ventas Mensuales (CLP)',
                data: [3500000, 4200000, 3000000, 5000000, 4500000, 6000000, 5500000, 7000000, 8000000, 7500000, 9000000, 12000000],
                backgroundColor: 'rgba(57, 255, 20, 0.2)', // Relleno verde transparente
                borderColor: '#39FF14', // Línea verde neón
                borderWidth: 2,
                tension: 0.4, // Curva suave
                fill: true,
                pointBackgroundColor: '#fff',
                pointRadius: 4
            }]
        };

        // Configuración del diseño del gráfico
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: 'white' } // Texto blanco en la leyenda
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#aaa' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#aaa' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        beginAtZero: true
                    }
                }
            }
        };

        // Crear el gráfico usando la librería Chart.js
        new Chart(ctx, config);
    } else {
        console.log("No se encontró el elemento #ventasChart.");
    }
}

// ==========================================
// LÓGICA DE PRODUCTOS Y USUARIOS (COMPACTA)
// ==========================================
async function cargarProductos() { /* ... (Tu código original de productos aquí) ... */ }
async function cargarProductos() {
    const tbody = document.getElementById('productos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-5"><i class="fas fa-spinner fa-spin"></i> Cargando inventario...</td></tr>';

    try {
        const snap = await db.collection("producto").orderBy("nombre").get();
        productosCache = {}; // Limpiar caché antes de llenar

        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-5">No hay productos en el inventario.</td></tr>';
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const p = doc.data();
            productosCache[doc.id] = p; // Guardar en caché para editar

            html += `
                <tr>
                    <td>
                        <img src="${p.imagen || 'https://via.placeholder.com/50'}" alt="${p.nombre}" class="img-prod">
                    </td>
                    <td class="fw-bold">${p.nombre}</td>
                    <td>$${(p.precio || 0).toLocaleString('es-CL')}</td>
                    <td>${p.stock || p.cantidad || 0}</td>
                    <td><span class="badge bg-secondary">${p.categoria || 'Sin categoría'}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-warning" onclick="window.abrirModalEditar('${doc.id}')">
                            <i class="fas fa-pencil-alt"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.eliminarProducto('${doc.id}')">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

    } catch (e) {
        console.error("Error al cargar productos: ", e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger p-5">Error al cargar productos. Revisa la consola (F12).</td></tr>';
    }
}
async function cargarUsuarios() {
    const tbody = document.getElementById('usuarios-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center p-5 text-muted"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</td></tr>';

    try {
        const snap = await db.collection("usuario").get();
        allUsers = []; // Limpiar antes de llenar
        snap.forEach(doc => {
            allUsers.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar por fecha de creación si existe, si no, por nombre
        allUsers.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return (a.nombre || '').localeCompare(b.nombre || '');
        });

        filtrarUsuarios(); // Llama a filtrar para mostrar la primera página

    } catch (e) {
        console.error("Error al cargar usuarios: ", e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger p-5">Error al cargar usuarios. Revisa la consola (F12).</td></tr>';
    }
}

function mostrarUsuariosPagina() {
    const tbody = document.getElementById('usuarios-tbody');
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedUsers = filteredUsers.slice(start, end);

    if (paginatedUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-5 text-muted">No se encontraron usuarios.</td></tr>';
        document.getElementById('pagination-info').textContent = 'Mostrando 0 usuarios';
        return;
    }

    tbody.innerHTML = paginatedUsers.map(user => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || 'U')}&background=random`}" class="rounded-circle" style="width: 45px; height: 45px" alt="Avatar">
                    <div class="ms-3">
                        <p class="fw-bold mb-1 text-white">${user.nombre || 'Sin nombre'}</p>
                        <p class="text-muted mb-0">${user.email}</p>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-info-subtle text-info-emphasis rounded-pill">${user.rol || 'cliente'}</span></td>
            <td><span class="badge ${user.activo ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'} rounded-pill">${user.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td>${user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-link btn-sm text-warning" onclick="window.abrirModalUsuario('${user.id}')"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn btn-link btn-sm text-danger" onclick="window.eliminarUsuario('${user.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    document.getElementById('pagination-info').textContent = `Mostrando ${start + 1}-${Math.min(end, filteredUsers.length)} de ${filteredUsers.length} usuarios`;
}

// ==========================================
//  FUNCIONES DE FILTRADO Y PAGINACIÓN (USUARIOS)
// ==========================================

window.filtrarUsuarios = function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm) {
        filteredUsers = allUsers.filter(user => 
            (user.nombre && user.nombre.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm))
        );
    } else {
        filteredUsers = [...allUsers];
    }
    
    currentPage = 1;
    mostrarUsuariosPagina();
}

window.cambiarPagina = function(direccion) {
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    currentPage += direccion;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    mostrarUsuariosPagina();
}
// ==========================================
//  FUNCIONES DE PRODUCTOS (AGREGAR AL FINAL DE admin-logic.js)
// ==========================================

window.abrirModalCrear = function() {
    const form = document.getElementById('productoForm');
    if(form) form.reset();
    document.getElementById('prodId').value = '';
    const title = document.getElementById('modalTitle');
    if(title) title.textContent = 'Nuevo Producto';
    
    // Abrir con Bootstrap
    const modalEl = document.getElementById('modalProducto');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

window.abrirModalEditar = function(id) {
    const prod = productosCache[id]; // Usa la caché global
    if (!prod) return;

    document.getElementById('prodId').value = id;
    document.getElementById('prodNombre').value = prod.nombre;
    document.getElementById('prodPrecio').value = prod.precio;
    document.getElementById('prodStock').value = prod.stock || prod.cantidad || 0;
    document.getElementById('prodCategoria').value = prod.categoria || '';
    document.getElementById('prodImagen').value = prod.imagen || '';

    const title = document.getElementById('modalTitle');
    if(title) title.textContent = 'Editar Producto';
    
    const modalEl = document.getElementById('modalProducto');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

window.guardarProducto = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnGuardarProd');
    const originalText = btn.textContent;
    btn.textContent = 'Guardando...';
    btn.disabled = true;

    const id = document.getElementById('prodId').value;
    const datos = {
        nombre: document.getElementById('prodNombre').value,
        precio: parseFloat(document.getElementById('prodPrecio').value),
        stock: parseInt(document.getElementById('prodStock').value),
        categoria: document.getElementById('prodCategoria').value,
        imagen: document.getElementById('prodImagen').value,
        activo: true
    };

    try {
        if (id) {
            await db.collection("producto").doc(id).update(datos);
            Swal.fire('¡Éxito!', 'Producto actualizado', 'success');
        } else {
            await db.collection("producto").add({
                ...datos,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            Swal.fire('¡Éxito!', 'Producto creado', 'success');
        }
        
        // Cerrar modal y recargar
        const modalEl = document.getElementById('modalProducto');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();
        
        cargarProductos();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

window.eliminarProducto = async function(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
        try {
            await db.collection("producto").doc(id).delete();
            Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
            cargarProductos();
        } catch (e) { 
            Swal.fire('Error', 'No se pudo eliminar.', 'error');
        }
    }
}
// ==========================================
//  FUNCIONES DE PRODUCTOS (AGREGAR AL FINAL DE admin-logic.js)
// ==========================================

window.abrirModalCrear = function() {
    const form = document.getElementById('productoForm');
    if(form) form.reset();
    document.getElementById('prodId').value = '';
    const title = document.getElementById('modalTitle');
    if(title) title.textContent = 'Nuevo Producto';
    
    // Abrir con Bootstrap
    const modalEl = document.getElementById('modalProducto');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

window.abrirModalEditar = function(id) {
    const prod = productosCache[id]; // Usa la caché global
    if (!prod) return;

    document.getElementById('prodId').value = id;
    document.getElementById('prodNombre').value = prod.nombre;
    document.getElementById('prodPrecio').value = prod.precio;
    document.getElementById('prodStock').value = prod.stock || prod.cantidad || 0;
    document.getElementById('prodCategoria').value = prod.categoria || '';
    document.getElementById('prodImagen').value = prod.imagen || '';

    const title = document.getElementById('modalTitle');
    if(title) title.textContent = 'Editar Producto';
    
    const modalEl = document.getElementById('modalProducto');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

window.guardarProducto = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnGuardarProd');
    const originalText = btn.textContent;
    btn.textContent = 'Guardando...';
    btn.disabled = true;

    const id = document.getElementById('prodId').value;
    const datos = {
        nombre: document.getElementById('prodNombre').value,
        precio: parseFloat(document.getElementById('prodPrecio').value),
        stock: parseInt(document.getElementById('prodStock').value),
        categoria: document.getElementById('prodCategoria').value,
        imagen: document.getElementById('prodImagen').value,
        activo: true
    };

    try {
        if (id) {
            await db.collection("producto").doc(id).update(datos);
            Swal.fire('¡Éxito!', 'Producto actualizado', 'success');
        } else {
            await db.collection("producto").add({
                ...datos,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            Swal.fire('¡Éxito!', 'Producto creado', 'success');
        }
        
        // Cerrar modal y recargar
        const modalEl = document.getElementById('modalProducto');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();
        
        cargarProductos();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

window.eliminarProducto = async function(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
        try {
            await db.collection("producto").doc(id).delete();
            Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
            cargarProductos();
        } catch (e) { 
            Swal.fire('Error', 'No se pudo eliminar.', 'error');
        }
    }
}