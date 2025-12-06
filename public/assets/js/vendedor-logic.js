// public/assets/js/vendedor-logic.js

// ==========================================
// 1. CONFIGURACIÓN FIREBASE (API v8 - Compatible con scripts)
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

// Solo inicializa Firebase si no se ha hecho antes.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// ==========================================
// 2. LÓGICA DE LA PÁGINA
// ==========================================
$(document).ready(() => {
    console.log('Vendedor Logic Cargado');
    cargarInfoSesion();
    $('#logout-btn').on('click', cerrarSesion);
});

// ==========================================
// 3. FUNCIONES
// ==========================================

/**
 * Carga el nombre del vendedor en la UI.
 */
function cargarInfoSesion() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const nameElement = document.getElementById('vendedor-name');
            if (nameElement) {
                nameElement.textContent = user.nombre || 'Vendedor';
            }
        } catch (e) {
            console.error("Error al parsear datos de usuario:", e);
        }
    }
}

/**
 * Carga las estadísticas del dashboard (total de órdenes y productos).
 */
async function cargarDashboardData() {
    const totalOrdenesEl = document.getElementById('total-ordenes');
    const totalProductosEl = document.getElementById('total-productos');

    if (!totalOrdenesEl || !totalProductosEl) return;

    try {
        // Mostrar un estado de carga
        totalOrdenesEl.textContent = 'Cargando...';
        totalProductosEl.textContent = 'Cargando...';

        // Obtener colecciones de Firestore
        const ordenesSnap = await db.collection("compras").get();
        const productosSnap = await db.collection("producto").get();

        // Actualizar la UI con los totales
        totalOrdenesEl.textContent = `${ordenesSnap.size} órdenes en total`;
        totalProductosEl.textContent = `${productosSnap.size} productos en total`;

    } catch (e) {
        console.error("Error al cargar totales del dashboard: ", e);
        totalOrdenesEl.textContent = 'Error al cargar';
        totalProductosEl.textContent = 'Error al cargar';
    }
}

/**
 * Carga y muestra las órdenes de compra en la tabla.
 */
async function cargarOrdenesVendedor() {
    const ordenesList = document.getElementById('ordenes-list');
    if (!ordenesList) return;

    try {
        const snapshot = await db.collection('compras').orderBy('fecha', 'desc').get();
        if (snapshot.empty) {
            ordenesList.innerHTML = '<tr><td colspan="6" class="text-center">No hay órdenes de compra.</td></tr>';
            return;
        }

        let rows = '';
        snapshot.forEach(doc => {
            const orden = doc.data();
            const fecha = orden.fecha.toDate().toLocaleDateString('es-CL');
            rows += `
                <tr>
                    <td>${doc.id}</td>
                    <td>${
                        orden.clienteInfo ? `${orden.clienteInfo.nombre} ${orden.clienteInfo.apellidos}` : 'Cliente no disponible'
                    }</td>
                    <td>${fecha}</td>
                    <td>$${orden.total.toLocaleString('es-CL')}</td>
                    <td><span class="badge bg-success">${orden.estado || 'Completado'}</span></td>
                    <td><button class="btn btn-sm btn-info" onclick="verDetalle('${doc.id}')">Ver</button></td>
                </tr>
            `;
        });
        ordenesList.innerHTML = rows;
    } catch (error) {
        console.error("Error al cargar órdenes:", error);
        ordenesList.innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar las órdenes.</td></tr>';
    }
}

// TODO: Implementar la función verDetalle(ordenId)
function verDetalle(ordenId) {
    alert('Viendo detalle de la orden: ' + ordenId);
}

/**
 * Carga y muestra los productos en la tabla del vendedor.
 */
async function cargarProductosVendedor() {
    const productosList = document.getElementById('productos-list');
    if (!productosList) return;

    try {
        const snapshot = await db.collection('producto').orderBy('nombre').get();
        if (snapshot.empty) {
            productosList.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos registrados.</td></tr>';
            return;
        }

        let rows = '';
        snapshot.forEach(doc => {
            const producto = doc.data();
            rows += `
                <tr>
                    <td>${doc.id}</td>
                    <td>${producto.nombre || 'N/A'}</td>
                    <td>${producto.categoria || 'Sin categoría'}</td>
                    <td>$${(producto.precio || 0).toLocaleString('es-CL')}</td>
                    <td>${producto.stock || 0}</td>
                    <td>${producto.descripcion || 'Sin descripción'}</td>
                </tr>
            `;
        });
        productosList.innerHTML = rows;
    } catch (error) {
        console.error("Error al cargar productos:", error);
        productosList.innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar los productos.</td></tr>';
    }
}

/**
 * Cierra la sesión del usuario.
 */
function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('usuario');
        
        // Cerrar sesión en Firebase Auth
        auth.signOut().then(() => {
            // Redirigir al login (ajusta la ruta si es necesario)
            window.location.href = '../../login.html';
        }).catch(error => {
            console.error("Error al cerrar sesión en Firebase:", error);
            // Aún así, intenta redirigir
            window.location.href = '../../login.html';
        });
    }
}
