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
// ==========================================
// FUNCIONES CRUD PARA USUARIOS - CORREGIDAS (P1)
// ==========================================

/**
 * ABRIR MODAL PARA EDITAR USUARIO
 */
window.abrirModalUsuario = async function(userId) {
    console.log('Editando usuario ID:', userId);
    
    try {
        // Obtener datos del usuario desde Firestore
        const userDoc = await db.collection("usuario").doc(userId).get();
        
        if (!userDoc.exists) {
            Swal.fire('Error', 'Usuario no encontrado', 'error');
            return;
        }
        
        const userData = userDoc.data();
        
        // Llenar el formulario del modal (debes tener un modal similar al de productos)
        document.getElementById('usuarioId').value = userId;
        document.getElementById('usuarioNombre').value = userData.nombre || '';
        document.getElementById('usuarioEmail').value = userData.email || '';
        
        // IMPORTANTE: Campo email como READONLY para seguridad
        document.getElementById('usuarioEmail').readOnly = true;
        
        document.getElementById('usuarioTelefono').value = userData.telefono || '';
        document.getElementById('usuarioDireccion').value = userData.direccion || '';
        
        // Campo de rol (debes tener select con opciones)
        const rolSelect = document.getElementById('usuarioRol');
        if (rolSelect) {
            rolSelect.value = userData.rol || 'cliente';
        }
        
        // Campo de estado
        const estadoSelect = document.getElementById('usuarioActivo');
        if (estadoSelect) {
            estadoSelect.value = userData.activo === false ? 'false' : 'true';
        }
        
        // Mostrar el modal (debes tener un modal similar al de productos)
        const modalEl = document.getElementById('modalUsuario');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        } else {
            console.error('No se encontró el modal de usuario');
            // Mostrar un modal simple si no existe
            abrirModalSimpleUsuario(userData, userId);
        }
        
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        Swal.fire('Error', 'No se pudo cargar el usuario: ' + error.message, 'error');
    }
};

/**
 * FUNCIÓN DE EMERGENCIA SI NO TIENES MODAL
 */
function abrirModalSimpleUsuario(userData, userId) {
    const nuevoNombre = prompt('Nuevo nombre:', userData.nombre || '');
    if (nuevoNombre !== null) {
        const nuevoRol = prompt('Nuevo rol (admin/vendedor/cliente):', userData.rol || 'cliente');
        if (nuevoRol !== null) {
            const nuevoActivo = confirm('¿Usuario activo?');
            actualizarUsuario(userId, {
                nombre: nuevoNombre,
                rol: nuevoRol,
                activo: nuevoActivo
            });
        }
    }
}

/**
 * ACTUALIZAR USUARIO (PUT) - CORREGIDA
 */
window.actualizarUsuario = async function(userId, datosActualizados) {
    try {
        console.log('Actualizando usuario:', userId, datosActualizados);
        
        // Validar que el usuario existe
        const userRef = db.collection("usuario").doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            throw new Error('Usuario no encontrado');
        }
        
        // Preparar datos para actualizar (SEGURIDAD)
        const camposPermitidos = {
            nombre: datosActualizados.nombre || userDoc.data().nombre,
            telefono: datosActualizados.telefono || userDoc.data().telefono,
            direccion: datosActualizados.direccion || userDoc.data().direccion,
            rol: datosActualizados.rol || userDoc.data().rol,
            activo: datosActualizados.activo !== undefined ? datosActualizados.activo : userDoc.data().activo,
            actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // CRÍTICO: NO permitir cambiar email (SEGURIDAD P2)
        // Si viene email en los datos, lo ignoramos
        if (datosActualizados.email) {
            console.warn('Intento de modificar email bloqueado');
            delete datosActualizados.email;
        }
        
        // Actualizar en Firestore
        await userRef.update(camposPermitidos);
        
        console.log('Usuario actualizado correctamente');
        
        // Mostrar éxito y recargar
        Swal.fire('¡Éxito!', 'Usuario actualizado correctamente', 'success');
        cargarUsuarios(); // Recargar la tabla
        
        // Cerrar modal si existe
        const modalEl = document.getElementById('modalUsuario');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        
        return true;
        
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        Swal.fire('Error', 'No se pudo actualizar el usuario: ' + error.message, 'error');
        return false;
    }
};

/**
 * ELIMINAR USUARIO (DELETE) - CORREGIDA
 */
window.eliminarUsuario = async function(userId) {
    // Confirmación de seguridad
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará permanentemente al usuario",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        console.log('Eliminando usuario:', userId);
        
        // Opción 1: Eliminar completamente
        await db.collection("usuario").doc(userId).delete();
        
        // Opción 2: Marcar como inactivo (RECOMENDADO para auditoría)
        // await db.collection("usuario").doc(userId).update({
        //     activo: false,
        //     eliminadoEn: firebase.firestore.FieldValue.serverTimestamp()
        // });
        
        console.log('Usuario eliminado correctamente');
        
        Swal.fire('Eliminado', 'El usuario ha sido eliminado correctamente', 'success');
        cargarUsuarios(); // Recargar la tabla
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        Swal.fire('Error', 'No se pudo eliminar el usuario: ' + error.message, 'error');
    }
};

/**
 * MANEJADOR DEL FORMULARIO DE USUARIO
 */
if (document.getElementById('formUsuario')) {
    document.getElementById('formUsuario').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('usuarioId').value;
        const datosActualizados = {
            nombre: document.getElementById('usuarioNombre').value,
            email: document.getElementById('usuarioEmail').value, // Solo lectura
            telefono: document.getElementById('usuarioTelefono').value,
            direccion: document.getElementById('usuarioDireccion').value,
            rol: document.getElementById('usuarioRol').value,
            activo: document.getElementById('usuarioActivo').value === 'true'
        };
        
        await actualizarUsuario(userId, datosActualizados);
    });
}

/**
 * CREAR NUEVO USUARIO (POST) - Para completar el CRUD
 */
window.crearNuevoUsuario = async function() {
    try {
        const { value: formValues } = await Swal.fire({
            title: 'Crear Nuevo Usuario',
            html: `
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre" required>
                <input id="swal-email" type="email" class="swal2-input" placeholder="Email" required>
                <input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña" required minlength="6">
                <select id="swal-rol" class="swal2-input">
                    <option value="cliente">Cliente</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Administrador</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    nombre: document.getElementById('swal-nombre').value,
                    email: document.getElementById('swal-email').value,
                    password: document.getElementById('swal-password').value,
                    rol: document.getElementById('swal-rol').value
                };
            }
        });
        
        if (formValues) {
            // Crear usuario en Authentication (si usas Firebase Auth)
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                formValues.email, 
                formValues.password
            );
            
            const userId = userCredential.user.uid;
            
            // Guardar datos adicionales en Firestore
            await db.collection("usuario").doc(userId).set({
                nombre: formValues.nombre,
                email: formValues.email,
                rol: formValues.rol,
                activo: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            Swal.fire('¡Éxito!', 'Usuario creado correctamente', 'success');
            cargarUsuarios(); // Recargar tabla
        }
        
    } catch (error) {
        console.error('Error al crear usuario:', error);
        Swal.fire('Error', 'No se pudo crear el usuario: ' + error.message, 'error');
    }
};

// ==========================================
// VERIFICACIÓN DE CONEXIÓN FIRESTORE
// ==========================================

/**
 * DIAGNÓSTICO: Verificar conexión con Firestore
 */
window.diagnosticarConexion = async function() {
    try {
        console.log('=== DIAGNÓSTICO DE CONEXIÓN FIRESTORE ===');
        
        // 1. Verificar inicialización
        console.log('Firebase inicializado:', firebase.apps.length > 0);
        
        // 2. Verificar colección "usuario"
        const usuariosSnapshot = await db.collection("usuario").limit(1).get();
        console.log('Colección "usuario" accesible:', !usuariosSnapshot.empty);
        console.log('Número de usuarios:', usuariosSnapshot.size);
        
        // 3. Verificar una operación de escritura simple
        const testDoc = db.collection("test").doc("conexion");
        await testDoc.set({
            test: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Escritura en Firestore: OK');
        
        // 4. Verificar una operación de lectura
        await testDoc.get();
        console.log('Lectura en Firestore: OK');
        
        // 5. Limpiar documento de prueba
        await testDoc.delete();
        console.log('Eliminación en Firestore: OK');
        
        Swal.fire('Conexión Exitosa', 'Firestore está funcionando correctamente', 'success');
        
        return true;
        
    } catch (error) {
        console.error('Error en diagnóstico:', error);
        
        let mensaje = 'Error: ' + error.message;
        if (error.code === 'permission-denied') {
            mensaje += '\n\nProblema: Permisos de Firestore insuficientes.';
            mensaje += '\nSolución: Revisa las reglas de seguridad en Firebase Console.';
        } else if (error.code === 'not-found') {
            mensaje += '\n\nProblema: Colección no encontrada.';
            mensaje += '\nSolución: Verifica que la colección "usuario" existe.';
        }
        
        Swal.fire('Error de Conexión', mensaje, 'error');
        return false;
    }
};
// ==========================================
// FUNCIÓN PARA CREAR VENDEDOR CORRECTAMENTE
// ==========================================

window.crearVendedorCorrectamente = async function() {
    try {
        console.log('=== CREANDO VENDEDOR EN AMBOS SISTEMAS ===');
        
        // 1. SOLICITAR DATOS
        const { value: formValues } = await Swal.fire({
            title: 'Crear Nuevo Vendedor',
            html: `
                <div class="text-start">
                    <label class="form-label">Nombre Completo *</label>
                    <input id="swal-nombre" class="swal2-input" placeholder="Ej: Carlos Vendedor" required>
                    
                    <label class="form-label mt-3">Email *</label>
                    <input id="swal-email" type="email" class="swal2-input" placeholder="vendedor@empresa.com" required>
                    
                    <label class="form-label mt-3">Contraseña *</label>
                    <input id="swal-password" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres" required minlength="6">
                    
                    <small class="text-muted d-block mt-2">
                        <i class="fas fa-info-circle"></i> Se creará en Firebase Authentication y Firestore
                    </small>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear Vendedor',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value.trim();
                const email = document.getElementById('swal-email').value.trim();
                const password = document.getElementById('swal-password').value;
                
                // VALIDACIONES
                if (!nombre) {
                    Swal.showValidationMessage('El nombre es requerido');
                    return false;
                }
                if (!email.includes('@') || !email.includes('.')) {
                    Swal.showValidationMessage('Email inválido');
                    return false;
                }
                if (!password || password.length < 6) {
                    Swal.showValidationMessage('Contraseña mínima: 6 caracteres');
                    return false;
                }
                
                return { nombre, email, password };
            }
        });
        
        if (!formValues) return;
        
        console.log('Datos recibidos:', formValues);
        
        // 2. VERIFICAR QUE FIREBASE ESTÉ INICIALIZADO
        if (!firebase.apps.length) {
            console.error('Firebase no está inicializado');
            Swal.fire('Error', 'Firebase no está configurado', 'error');
            return;
        }
        
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // 3. VERIFICAR SI EL EMAIL YA EXISTE EN AUTH (OPCIONAL)
        try {
            console.log('Verificando si email existe...');
            // Intentar iniciar sesión para ver si existe
            await auth.signInWithEmailAndPassword(formValues.email, 'tempPassword123');
            // Si llega aquí, el usuario existe
            Swal.fire('Error', 'Este email ya está registrado en Authentication', 'error');
            return;
        } catch (authError) {
            // Error esperado si el usuario no existe
            console.log('Email no existe en Auth, procediendo...');
        }
        
        // 4. CREAR EN FIREBASE AUTHENTICATION (CRÍTICO)
        console.log('Creando en Firebase Authentication...');
        let userCredential;
        try {
            userCredential = await auth.createUserWithEmailAndPassword(
                formValues.email, 
                formValues.password
            );
            console.log('✅ CREADO EN AUTHENTICATION:', userCredential.user.uid);
        } catch (authError) {
            console.error('Error creando en Auth:', authError);
            
            let mensaje = 'Error en Authentication: ';
            switch(authError.code) {
                case 'auth/email-already-in-use':
                    mensaje = 'El email YA ESTÁ REGISTRADO en Firebase Authentication. Ve a Firebase Console → Authentication → Users';
                    break;
                case 'auth/invalid-email':
                    mensaje = 'Email inválido';
                    break;
                case 'auth/weak-password':
                    mensaje = 'Contraseña muy débil (mínimo 6 caracteres)';
                    break;
                case 'auth/operation-not-allowed':
                    mensaje = 'Registro con email/contraseña no está habilitado. Ve a Firebase Console → Authentication → Métodos de inicio de sesión';
                    break;
                default:
                    mensaje += authError.message;
            }
            
            Swal.fire('Error Authentication', mensaje, 'error');
            return;
        }
        
        const userId = userCredential.user.uid;
        console.log('User ID generado:', userId);
        
        // 5. CREAR EN FIRESTORE
        console.log('Creando en Firestore...');
        try {
            const vendedorData = {
                // DATOS BÁSICOS
                id: userId,
                nombre: formValues.nombre,
                email: formValues.email,
                rol: 'vendedor',
                
                // METADATOS
                activo: true,
                verificado: false,
                requiereCambioPassword: true,
                
                // AUDITORÍA
                creadoPor: 'admin_panel',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                actualizadoEn: firebase.firestore.FieldValue.serverTimestamp(),
                
                // ESTADÍSTICAS INICIALES
                totalVentas: 0,
                ordenesAtendidas: 0
            };
            
            await db.collection('usuario').doc(userId).set(vendedorData);
            console.log('✅ CREADO EN FIRESTORE');
            
        } catch (firestoreError) {
            console.error('Error en Firestore:', firestoreError);
            
            // Si falla Firestore, eliminar el usuario de Auth para mantener consistencia
            try {
                await userCredential.user.delete();
                console.log('Usuario eliminado de Auth por fallo en Firestore');
            } catch (deleteError) {
                console.error('Error eliminando usuario:', deleteError);
            }
            
            Swal.fire('Error Firestore', 'No se pudo guardar en base de datos: ' + firestoreError.message, 'error');
            return;
        }
        
        // 6. PROBAR LOGIN INMEDIATAMENTE
        console.log('Probando login automático...');
        try {
            // Cerrar sesión actual
            await auth.signOut();
            
            // Intentar login con las nuevas credenciales
            const testLogin = await auth.signInWithEmailAndPassword(
                formValues.email, 
                formValues.password
            );
            
            console.log('✅ LOGIN DE PRUEBA EXITOSO:', testLogin.user.email);
            
            // Cerrar sesión de prueba
            await auth.signOut();
            
        } catch (loginError) {
            console.error('Error en login de prueba:', loginError);
            // Continuar aunque falle la prueba
        }
        
        // 7. MOSTRAR RESULTADO FINAL
        Swal.fire({
            icon: 'success',
            title: '✅ Vendedor Creado Correctamente',
            html: `
                <div class="text-start">
                    <h5>Credenciales Generadas:</h5>
                    <div class="alert alert-success">
                        <p><strong>📧 Email:</strong> ${formValues.email}</p>
                        <p><strong>🔑 Contraseña:</strong> ${formValues.password}</p>
                        <p><strong>👤 Rol:</strong> <span class="badge bg-warning">Vendedor</span></p>
                        <p><strong>🆔 ID:</strong> <code>${userId.substring(0, 10)}...</code></p>
                    </div>
                    
                    <h5>Próximos pasos:</h5>
                    <ol class="text-start small">
                        <li>El vendedor debe iniciar sesión en <strong>vendedor-dashboard.html</strong></li>
                        <li>Cambiar contraseña en primer inicio (recomendado)</li>
                        <li>Verificar que aparece en Firebase Console → Authentication</li>
                    </ol>
                    
                    <div class="mt-3">
                        <button class="btn btn-primary btn-sm" onclick="probarLoginVendedor('${formValues.email}', '${formValues.password}')">
                            <i class="fas fa-sign-in-alt"></i> Probar Login Ahora
                        </button>
                        <button class="btn btn-info btn-sm ms-2" onclick="verificarEnFirebaseConsole()">
                            <i class="fas fa-external-link-alt"></i> Ver en Firebase Console
                        </button>
                    </div>
                </div>
            `,
            width: 600,
            confirmButtonText: 'Entendido'
        });
        
    } catch (error) {
        console.error('Error general:', error);
        Swal.fire('Error Inesperado', 'Error: ' + error.message, 'error');
    }
};

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Función para probar login
window.probarLoginVendedor = async function(email, password) {
    try {
        Swal.fire({
            title: 'Probando Login...',
            text: 'Verificando credenciales',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const auth = firebase.auth();
        
        // Cerrar cualquier sesión activa
        await auth.signOut();
        
        // Intentar login
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        Swal.fire({
            icon: 'success',
            title: '✅ Login Exitoso',
            html: `
                <div class="text-start">
                    <p><strong>Usuario:</strong> ${userCredential.user.email}</p>
                    <p><strong>ID:</strong> ${userCredential.user.uid.substring(0, 10)}...</p>
                    <p><strong>Email verificado:</strong> ${userCredential.user.emailVerified ? 'Sí' : 'No'}</p>
                    <hr>
                    <p>Las credenciales funcionan correctamente.</p>
                </div>
            `,
            confirmButtonText: 'Continuar'
        }).then(() => {
            // Cerrar sesión de prueba
            auth.signOut();
        });
        
    } catch (error) {
        console.error('Error probando login:', error);
        
        let mensaje = 'Error: ' + error.message;
        if (error.code === 'auth/user-not-found') {
            mensaje = 'Usuario NO EXISTE en Firebase Authentication';
        } else if (error.code === 'auth/wrong-password') {
            mensaje = 'Contraseña incorrecta o usuario no existe';
        } else if (error.code === 'auth/user-disabled') {
            mensaje = 'Usuario deshabilitado en Firebase Console';
        }
        
        Swal.fire('Error Login', mensaje, 'error');
    }
};

// Función para verificar en Firebase Console
window.verificarEnFirebaseConsole = function() {
    Swal.fire({
        title: 'Verificar en Firebase Console',
        html: `
            <div class="text-start">
                <p>Sigue estos pasos:</p>
                <ol>
                    <li>Ve a <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a></li>
                    <li>Selecciona tu proyecto "tienda-level-up"</li>
                    <li>Ve a <strong>Authentication → Users</strong></li>
                    <li>Busca el email del vendedor</li>
                    <li>Verifica que esté en la lista</li>
                </ol>
                <p class="text-muted">Si no aparece, el usuario no se creó en Authentication</p>
            </div>
        `,
        confirmButtonText: 'Entendido'
    });
};

// ==========================================
// FUNCIÓN PARA MIGRAR USUARIOS EXISTENTES
// ==========================================

/**
 * Si ya tienes usuarios en Firestore pero NO en Authentication,
 * usa esta función para crearlos en Authentication
 */
window.migrarUsuariosAAuthentication = async function() {
    try {
        console.log('=== MIGRANDO USUARIOS A AUTHENTICATION ===');
        
        const db = firebase.firestore();
        const auth = firebase.auth();
        
        // Obtener todos los usuarios de Firestore
        const usuariosSnap = await db.collection('usuario').get();
        
        if (usuariosSnap.empty) {
            Swal.fire('Info', 'No hay usuarios en Firestore', 'info');
            return;
        }
        
        let resultados = {
            exitos: 0,
            errores: 0,
            existentes: 0
        };
        
        let detalleHTML = '<h6>Resultados de migración:</h6><ul>';
        
        for (const doc of usuariosSnap.docs) {
            const usuario = doc.data();
            const email = usuario.email;
            
            if (!email) {
                detalleHTML += `<li>❌ ${usuario.nombre || 'Sin nombre'}: Sin email</li>`;
                resultados.errores++;
                continue;
            }
            
            try {
                // Verificar si ya existe en Auth
                try {
                    // Intentar crear contraseña temporal
                    const passwordTemporal = 'Temp123456';
                    await auth.createUserWithEmailAndPassword(email, passwordTemporal);
                    
                    // Actualizar en Firestore con ID de Auth
                    await db.collection('usuario').doc(doc.id).update({
                        authId: auth.currentUser.uid,
                        requiereCambioPassword: true,
                        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Cerrar sesión
                    await auth.signOut();
                    
                    detalleHTML += `<li>✅ ${usuario.nombre} (${email}): CREADO</li>`;
                    resultados.exitos++;
                    
                } catch (authError) {
                    if (authError.code === 'auth/email-already-in-use') {
                        detalleHTML += `<li>⚠️ ${usuario.nombre} (${email}): YA EXISTE</li>`;
                        resultados.existentes++;
                    } else {
                        detalleHTML += `<li>❌ ${usuario.nombre} (${email}): ${authError.message}</li>`;
                        resultados.errores++;
                    }
                }
                
            } catch (error) {
                console.error(`Error con ${email}:`, error);
                detalleHTML += `<li>❌ ${usuario.nombre} (${email}): ${error.message}</li>`;
                resultados.errores++;
            }
        }
        
        detalleHTML += '</ul>';
        
        Swal.fire({
            title: 'Migración Completa',
            html: `
                <div class="text-start">
                    <p><strong>Total procesado:</strong> ${usuariosSnap.size} usuarios</p>
                    <p><strong>✅ Creados en Auth:</strong> ${resultados.exitos}</p>
                    <p><strong>⚠️ Ya existían:</strong> ${resultados.existentes}</p>
                    <p><strong>❌ Errores:</strong> ${resultados.errores}</p>
                    <hr>
                    ${detalleHTML}
                </div>
            `,
            width: 700,
            confirmButtonText: 'Cerrar'
        });
        
    } catch (error) {
        console.error('Error en migración:', error);
        Swal.fire('Error', 'Error en migración: ' + error.message, 'error');
    }
    
};
// En admin-logic.js
window.crearVendedorLocal = function() {
    const nombre = prompt('Nombre del vendedor:');
    if (!nombre) return;
    
    const email = prompt('Email:');
    if (!email) return;
    
    const password = prompt('Contraseña:');
    if (!password) return;
    
    // Generar ID único
    const id = 'vendedor_' + Date.now();
    
    // Obtener vendedores existentes
    const vendedores = JSON.parse(localStorage.getItem('vendedoresUsers') || '[]');
    
    // Agregar nuevo
    vendedores.push({
        id: id,
        email: email,
        password: password,
        nombre: nombre,
        rol: 'vendedor',
        activo: true,
        createdAt: new Date().toISOString()
    });
    
    // Guardar
    localStorage.setItem('vendedoresUsers', JSON.stringify(vendedores));
    
    alert(`Vendedor creado:\n\nEmail: ${email}\nContraseña: ${password}`);
    
    // Opcional: También guardar en Firestore para consistencia
    if (typeof db !== 'undefined') {
        db.collection('usuario').doc(id).set({
            nombre: nombre,
            email: email,
            rol: 'vendedor',
            activo: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
};