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
// Para Usuarios
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const rowsPerPage = 5;

// Para Productos (Cache para edición)
let productosCache = {};

// ==========================================
// 3. ROUTER (DETECTAR PÁGINA)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Logic Cargado - Versión Completa');

    // Cargar Info de Sesión (Header)
    if (document.getElementById('header-username')) cargarInfoSesion();

    // Detectar en qué página estamos y cargar su lógica
    if (document.getElementById('stat-compras')) cargarDashboard();
    if (document.getElementById('usuarios-tbody')) cargarUsuarios();
    if (document.getElementById('pedidos-tbody')) cargarPedidos();
    if (document.getElementById('productos-tbody')) cargarProductos();
});

// ==========================================
// 4. LÓGICA DE SESIÓN Y HEADER
// ==========================================
function cargarInfoSesion() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Nombre
            const nameElement = document.getElementById('header-username');
            if (nameElement) nameElement.textContent = user.nombre ? user.nombre.split(' ')[0] : 'Admin';
            
            // Avatar
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
// 5. LÓGICA DASHBOARD (Estadísticas)
// ==========================================
async function cargarDashboard() {
    try {
        const c = await db.collection("compras").get();
        const p = await db.collection("producto").get();
        const u = await db.collection("usuario").get();
        
        if(document.getElementById('stat-compras')) 
            document.getElementById('stat-compras').textContent = c.size;
        if(document.getElementById('stat-productos'))
            document.getElementById('stat-productos').textContent = p.size;
        if(document.getElementById('stat-usuarios'))
            document.getElementById('stat-usuarios').textContent = u.size;
            
        let stock = 0;
        p.forEach(doc => stock += parseInt(doc.data().stock || doc.data().cantidad || 0));
        if(document.getElementById('desc-stock')) 
            document.getElementById('desc-stock').textContent = `Inventario total: ${stock} un.`;
            
    } catch (e) { console.log("Error stats: ", e); }
}

// ==========================================
// 6. LÓGICA DE PEDIDOS / ÓRDENES
// ==========================================
async function cargarPedidos() {
    const tbody = document.getElementById('pedidos-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">Cargando pedidos...</td></tr>';

    try {
        const snap = await db.collection("compras").orderBy("fecha", "desc").get();
        
        if(snap.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No hay pedidos registrados.</td></tr>';
            return;
        }
        
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            const fecha = d.fecha?.toDate ? d.fecha.toDate().toLocaleDateString() : 'N/A';
            
            // Color del estado
            let badgeColor = '#ffc107'; // Pendiente (Amarillo)
            let textColor = '#000';
            if(d.estado === 'completado') { badgeColor = '#28a745'; textColor = '#fff'; } // Verde
            if(d.estado === 'cancelado') { badgeColor = '#dc3545'; textColor = '#fff'; } // Rojo

            html += `
                <tr>
                    <td style="font-family:monospace; color:#39FF14;">${doc.id.substring(0,8)}...</td>
                    <td>${d.usuarioNombre || d.cliente || 'Cliente Anónimo'}</td>
                    <td style="font-weight:bold;">$${d.total || 0}</td>
                    <td>
                        <span style="background:${badgeColor}; color:${textColor}; padding:4px 10px; border-radius:12px; font-size:0.85em; font-weight:bold; text-transform:uppercase;">
                            ${d.estado || 'pendiente'}
                        </span>
                    </td>
                    <td style="color:#aaa;">${fecha}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar pedidos.</td></tr>';
    }
}

// ==========================================
// 7. LÓGICA DE PRODUCTOS (Inventario)
// ==========================================
async function cargarProductos() {
    const tbody = document.getElementById('productos-tbody');
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">Cargando inventario...</td></tr>';

    try {
        const snap = await db.collection("producto").get();
        productosCache = {}; // Limpiar cache

        if(snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay productos.</td></tr>';
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            productosCache[doc.id] = d; // Guardar para editar

            html += `
                <tr>
                    <td><img src="${d.imagen || 'https://via.placeholder.com/50'}" class="img-prod" style="width:50px; height:50px; object-fit:cover; border-radius:8px; border:1px solid #444;"></td>
                    <td style="font-weight:bold; color:white;">${d.nombre}</td>
                    <td style="color:#39FF14;">$${d.precio}</td>
                    <td>${d.stock || d.cantidad || 0}</td>
                    <td><span style="background:#333; padding:3px 8px; border-radius:4px; font-size:0.9em;">${d.categoria || 'General'}</span></td>
                    <td>
                        <button onclick="abrirModalEditar('${doc.id}')" style="background:none; border:none; cursor:pointer; color:#ffc107; margin-right:10px; font-size:1.1em;" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button onclick="eliminarProducto('${doc.id}')" style="background:none; border:none; cursor:pointer; color:#ff4444; font-size:1.1em;" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar inventario.</td></tr>';
    }
}

// --- FUNCIONES DEL MODAL DE PRODUCTOS ---
// (Estas funciones usan los nombres que definimos en admin-productos.html en la respuesta 9)

window.abrirModalCrear = function() {
    const form = document.getElementById('productoForm');
    if(form) form.reset();
    document.getElementById('prodId').value = '';
    if(document.getElementById('modalTitle')) document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    document.getElementById('modalProducto').style.display = 'flex';
}

window.abrirModalEditar = function(id) {
    const prod = productosCache[id];
    if (!prod) return;

    document.getElementById('prodId').value = id;
    document.getElementById('prodNombre').value = prod.nombre;
    document.getElementById('prodPrecio').value = prod.precio;
    document.getElementById('prodStock').value = prod.stock || prod.cantidad || 0;
    document.getElementById('prodCategoria').value = prod.categoria || '';
    document.getElementById('prodImagen').value = prod.imagen || '';

    if(document.getElementById('modalTitle')) document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('modalProducto').style.display = 'flex';
}

window.cerrarModal = function() {
    document.getElementById('modalProducto').style.display = 'none';
}

window.guardarProducto = async function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
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
            alert('Producto actualizado');
        } else {
            await db.collection("producto").add({
                ...datos,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('Producto creado');
        }
        window.cerrarModal();
        cargarProductos();
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

window.eliminarProducto = async function(id) {
    if(confirm('¿Eliminar producto?')) {
        try {
            await db.collection("producto").doc(id).delete();
            alert('Producto eliminado');
            cargarProductos();
        } catch (e) { alert('Error al eliminar'); }
    }
}


// ==========================================
// 8. LÓGICA DE USUARIOS (Completa con Paginación)
// ==========================================
async function cargarUsuarios() {
    const tbody = document.getElementById('usuarios-tbody');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#888;">Cargando usuarios...</td></tr>';

    try {
        let snap;
        try {
            snap = await db.collection("usuario").orderBy("createdAt", "desc").get();
        } catch (e) {
            snap = await db.collection("usuario").get();
        }
        
        allUsers = [];
        snap.forEach(doc => {
            allUsers.push({ id: doc.id, ...doc.data() });
        });

        filteredUsers = [...allUsers];
        renderTableUsuarios();

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar usuarios.</td></tr>';
    }
}

function renderTableUsuarios() {
    const tbody = document.getElementById('usuarios-tbody');
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedUsers = filteredUsers.slice(start, end);

    if (paginatedUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#666;">No se encontraron usuarios.</td></tr>';
        actualizarInfoPaginacion();
        return;
    }

    let html = '';
    paginatedUsers.forEach(user => {
        const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || 'User')}&background=random`;
        const rolClass = user.rol === 'admin' ? 'border:1px solid #39FF14; color:#39FF14; background:rgba(57,255,20,0.1)' : 'border:1px solid #007bff; color:#007bff; background:rgba(0,123,255,0.1)';
        const rolText = user.rol === 'admin' ? 'ADMIN' : 'CLIENTE';
        const statusColor = user.activo !== false ? '#28a745' : '#dc3545';
        const statusText = user.activo !== false ? 'Activo' : 'Inactivo';
        const fecha = user.createdAt && user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A';

        html += `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${avatarUrl}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; background:#333;">
                        <div>
                            <div style="font-weight:bold; color:white;">${user.nombre || 'Sin Nombre'}</div>
                            <div style="font-size:0.85em; color:#888;">${user.email || 'No Email'}</div>
                        </div>
                    </div>
                </td>
                <td><span style="padding:4px 10px; border-radius:12px; font-size:0.75em; font-weight:bold; ${rolClass}">${rolText}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <span style="height:8px; width:8px; border-radius:50%; background:${statusColor};"></span>
                        <span style="font-size:0.9em;">${statusText}</span>
                    </div>
                </td>
                <td style="color:#aaa;">${fecha}</td>
                <td>
                    <button onclick="editarUsuario('${user.id}')" style="background:none; border:none; cursor:pointer; color:#ffc107; margin-right:10px; font-size:1.1em;"><i class="fas fa-pencil-alt"></i></button>
                    <button onclick="eliminarUsuario('${user.id}')" style="background:none; border:none; cursor:pointer; color:#ff4444; font-size:1.1em;"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    actualizarInfoPaginacion();
}

window.filtrarUsuarios = function() {
    const texto = document.getElementById('searchInput').value.toLowerCase();
    filteredUsers = allUsers.filter(user => 
        (user.nombre && user.nombre.toLowerCase().includes(texto)) || 
        (user.email && user.email.toLowerCase().includes(texto))
    );
    currentPage = 1;
    renderTableUsuarios();
}

function actualizarInfoPaginacion() {
    const total = filteredUsers.length;
    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, total);
    
    const info = document.getElementById('pagination-info');
    if(info) info.textContent = `Mostrando ${start} a ${end} de ${total} entradas`;
    
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    if(prev) prev.disabled = currentPage === 1;
    if(next) next.disabled = end >= total;
}

window.cambiarPagina = function(delta) {
    currentPage += delta;
    renderTableUsuarios();
}

// --- MODALES DE USUARIO ---
window.abrirModalUsuario = function() {
    document.getElementById('usuarioForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('modalUsuario').style.display = 'flex';
}

window.cerrarModalUsuario = function() {
    document.getElementById('modalUsuario').style.display = 'none';
}

window.editarUsuario = function(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userId').value = id;
    document.getElementById('userNombre').value = user.nombre || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userRol').value = user.rol || 'cliente';
    document.getElementById('userEstado').value = user.activo !== false ? "true" : "false";
    document.getElementById('userAvatar').value = user.avatar || '';

    document.getElementById('modalTitle').textContent = 'Editar Usuario';
    document.getElementById('modalUsuario').style.display = 'flex';
}

window.guardarUsuario = async function(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const data = {
        nombre: document.getElementById('userNombre').value,
        email: document.getElementById('userEmail').value,
        rol: document.getElementById('userRol').value,
        activo: document.getElementById('userEstado').value === "true",
        avatar: document.getElementById('userAvatar').value
    };

    try {
        if (id) {
            await db.collection("usuario").doc(id).update({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            alert('Usuario actualizado');
        } else {
            await db.collection("usuario").add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            alert('Usuario creado');
        }
        cerrarModalUsuario();
        cargarUsuarios();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

window.eliminarUsuario = async function(id) {
    if (confirm('¿Eliminar usuario?')) {
        try {
            await db.collection("usuario").doc(id).delete();
            alert('Eliminado');
            cargarUsuarios();
        } catch (e) { alert('Error al eliminar'); }
    }
}