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
// 2. VERIFICACIÓN DE ROL VENDEDOR
// ==========================================
function verificarRolVendedor() {
    try {
        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) {
            // No hay usuario, redirigir a login
            window.location.href = '../../index.html';
            return false;
        }
        
        const usuario = JSON.parse(usuarioStr);
        
        // Verificar si es vendedor o admin
        if (usuario.rol !== 'vendedor' && usuario.rol !== 'admin') {
            // No tiene permisos, redirigir
            alert('Acceso denegado. Solo vendedores y administradores pueden acceder.');
            window.location.href = '../../index.html';
            return false;
        }
        
        console.log('Usuario autorizado:', usuario.rol);
        return true;
        
    } catch (error) {
        console.error('Error verificando rol:', error);
        window.location.href = '../../index.html';
        return false;
    }
}

// ==========================================
// 3. LÓGICA DE LA PÁGINA
// ==========================================
$(document).ready(() => {
    console.log('Vendedor Logic Cargado');
    
    // Verificar rol antes de cargar contenido
    if (!verificarRolVendedor()) {
        return;
    }
    
    cargarInfoSesion();
    $('#logout-btn').on('click', cerrarSesion);
    
    // Cargar datos específicos según la página
    if (document.getElementById('total-ordenes')) {
        cargarDashboardData();
    }
    
    if (document.getElementById('ordenes-list')) {
        cargarOrdenesVendedor();
    }
    
    if (document.getElementById('productos-list')) {
        cargarProductosVendedor();
    }
});

// ==========================================
// 4. FUNCIONES
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
            ordenesList.innerHTML = '<tr><td colspan="7" class="text-center">No hay órdenes de compra.</td></tr>';
            return;
        }

        let rows = '';
        snapshot.forEach(doc => {
            const orden = doc.data();
            const fecha = orden.fecha && orden.fecha.toDate ? 
                orden.fecha.toDate().toLocaleDateString('es-CL') : 'Fecha no disponible';
            
            // Determinar estado y color del badge
            let estadoBadge = 'bg-secondary';
            let estadoTexto = orden.estado || 'Pendiente';
            
            switch(estadoTexto.toLowerCase()) {
                case 'completado':
                case 'entregado':
                    estadoBadge = 'bg-success';
                    break;
                case 'pendiente':
                    estadoBadge = 'bg-warning';
                    break;
                case 'cancelado':
                    estadoBadge = 'bg-danger';
                    break;
                case 'en proceso':
                    estadoBadge = 'bg-info';
                    break;
            }
            
            rows += `
                <tr>
                    <td><span class="badge bg-dark">${doc.id.substring(0, 8)}...</span></td>
                    <td>
                        ${orden.cliente ? 
                            `<strong>${orden.cliente.nombre || ''} ${orden.cliente.apellidos || ''}</strong><br>
                             <small class="text-muted">${orden.cliente.email || ''}</small>` : 
                            'Cliente no disponible'}
                    </td>
                    <td>${fecha}</td>
                    <td><strong>$${(orden.total || 0).toLocaleString('es-CL')}</strong></td>
                    <td><span class="badge ${estadoBadge}">${estadoTexto}</span></td>
                    <td>${orden.items ? orden.items.length : 0} productos</td>
                    <td>
                        <button class="btn btn-sm btn-info me-1" onclick="verDetalleOrden('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="actualizarEstadoOrden('${doc.id}')">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        ordenesList.innerHTML = rows;
    } catch (error) {
        console.error("Error al cargar órdenes:", error);
        ordenesList.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar las órdenes</td></tr>';
    }
}

/**
 * Ver detalle de una orden específica
 */
window.verDetalleOrden = async function(ordenId) {
    try {
        const ordenDoc = await db.collection('compras').doc(ordenId).get();
        if (!ordenDoc.exists) {
            alert('Orden no encontrada');
            return;
        }
        
        const orden = ordenDoc.data();
        let detallesHTML = '<h5>Detalles de la Orden</h5>';
        detallesHTML += `<p><strong>ID:</strong> ${ordenId}</p>`;
        detallesHTML += `<p><strong>Cliente:</strong> ${orden.cliente?.nombre || 'N/A'} ${orden.cliente?.apellidos || ''}</p>`;
        detallesHTML += `<p><strong>Email:</strong> ${orden.cliente?.email || 'N/A'}</p>`;
        detallesHTML += `<p><strong>Fecha:</strong> ${orden.fecha?.toDate().toLocaleString('es-CL') || 'N/A'}</p>`;
        detallesHTML += `<p><strong>Total:</strong> $${(orden.total || 0).toLocaleString('es-CL')}</p>`;
        detallesHTML += `<p><strong>Estado:</strong> <span class="badge bg-info">${orden.estado || 'Pendiente'}</span></p>`;
        
        if (orden.items && orden.items.length > 0) {
            detallesHTML += '<h6>Productos:</h6><ul>';
            orden.items.forEach(item => {
                detallesHTML += `<li>${item.nombre || 'Producto'} - $${(item.precio || 0).toLocaleString('es-CL')} x ${item.cantidad || 1}</li>`;
            });
            detallesHTML += '</ul>';
        }
        
        Swal.fire({
            title: `Orden #${ordenId.substring(0, 8)}`,
            html: detallesHTML,
            width: 600,
            confirmButtonText: 'Cerrar'
        });
        
    } catch (error) {
        console.error('Error al ver detalle:', error);
        Swal.fire('Error', 'No se pudo cargar el detalle de la orden', 'error');
    }
};

/**
 * Actualizar estado de una orden
 */
window.actualizarEstadoOrden = async function(ordenId) {
    const { value: nuevoEstado } = await Swal.fire({
        title: 'Actualizar Estado',
        input: 'select',
        inputOptions: {
            'pendiente': 'Pendiente',
            'en proceso': 'En Proceso',
            'completado': 'Completado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        },
        inputPlaceholder: 'Selecciona un estado',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'Debes seleccionar un estado';
            }
        }
    });
    
    if (nuevoEstado) {
        try {
            await db.collection('compras').doc(ordenId).update({
                estado: nuevoEstado,
                actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            Swal.fire('¡Éxito!', `Estado actualizado a: ${nuevoEstado}`, 'success');
            cargarOrdenesVendedor(); // Recargar tabla
            
        } catch (error) {
            console.error('Error actualizando estado:', error);
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    }
};

/**
 * Carga y muestra los productos en la tabla del vendedor.
 */
async function cargarProductosVendedor() {
    const productosList = document.getElementById('productos-list');
    if (!productosList) return;

    try {
        const snapshot = await db.collection('producto').orderBy('nombre').get();
        if (snapshot.empty) {
            productosList.innerHTML = '<tr><td colspan="7" class="text-center">No hay productos registrados.</td></tr>';
            return;
        }

        let rows = '';
        snapshot.forEach(doc => {
            const producto = doc.data();
            const productoId = doc.id;
            
            // Determinar estado
            const estado = producto.stock > 0 ? 
                `<span class="badge bg-success">Disponible</span>` : 
                `<span class="badge bg-danger">Agotado</span>`;
            
            rows += `
                <tr>
                    <td><span class="badge bg-dark">${productoId.substring(0, 8)}...</span></td>
                    <td><strong>${producto.nombre || 'N/A'}</strong></td>
                    <td><span class="badge bg-info">${producto.categoria || 'General'}</span></td>
                    <td><strong>$${(producto.precio || 0).toLocaleString('es-CL')}</strong></td>
                    <td>
                        <span class="badge ${producto.stock > 10 ? 'bg-success' : producto.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                            ${producto.stock || 0} unidades
                        </span>
                    </td>
                    <td>${estado}</td>
                    <td>
                        <button class="btn btn-sm btn-warning me-1" onclick="editarProductoVendedor('${productoId}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info me-1" onclick="actualizarStockProducto('${productoId}')" title="Actualizar Stock">
                            <i class="fas fa-box"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crearNuevoProducto()" title="Nuevo Producto">
                            <i class="fas fa-plus"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        productosList.innerHTML = rows;
    } catch (error) {
        console.error("Error al cargar productos:", error);
        productosList.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar los productos</td></tr>';
    }
}

/**
 * Editar producto desde perfil vendedor
 */
window.editarProductoVendedor = async function(productoId) {
    try {
        const productoDoc = await db.collection('producto').doc(productoId).get();
        if (!productoDoc.exists) {
            alert('Producto no encontrado');
            return;
        }
        
        const producto = productoDoc.data();
        
        const { value: formValues } = await Swal.fire({
            title: 'Editar Producto',
            html: `
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${producto.nombre || ''}" required>
                <input id="swal-precio" type="number" class="swal2-input" placeholder="Precio" value="${producto.precio || 0}" required min="0" step="0.01">
                <input id="swal-stock" type="number" class="swal2-input" placeholder="Stock" value="${producto.stock || 0}" required min="0">
                <input id="swal-categoria" class="swal2-input" placeholder="Categoría" value="${producto.categoria || ''}">
                <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción">${producto.descripcion || ''}</textarea>
                <input id="swal-imagen" class="swal2-input" placeholder="URL de imagen" value="${producto.imagen || ''}">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value;
                const precio = document.getElementById('swal-precio').value;
                const stock = document.getElementById('swal-stock').value;
                
                if (!nombre.trim()) {
                    Swal.showValidationMessage('El nombre es requerido');
                    return false;
                }
                if (!precio || parseFloat(precio) <= 0) {
                    Swal.showValidationMessage('El precio debe ser mayor a 0');
                    return false;
                }
                if (!stock || parseInt(stock) < 0) {
                    Swal.showValidationMessage('El stock no puede ser negativo');
                    return false;
                }
                
                return {
                    nombre: nombre,
                    precio: parseFloat(precio),
                    stock: parseInt(stock),
                    categoria: document.getElementById('swal-categoria').value,
                    descripcion: document.getElementById('swal-descripcion').value,
                    imagen: document.getElementById('swal-imagen').value,
                    actualizadoEn: new Date().toISOString()
                };
            }
        });
        
        if (formValues) {
            await db.collection('producto').doc(productoId).update(formValues);
            
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Producto actualizado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Recargar tabla después de un breve delay
            setTimeout(() => {
                cargarProductosVendedor();
            }, 500);
        }
        
    } catch (error) {
        console.error('Error al editar producto:', error);
        Swal.fire('Error', 'No se pudo actualizar el producto: ' + error.message, 'error');
    }
};

/**
 * Actualizar stock de un producto
 */
window.actualizarStockProducto = async function(productoId) {
    const { value: cantidad } = await Swal.fire({
        title: 'Actualizar Stock',
        input: 'number',
        inputLabel: 'Nueva cantidad en stock',
        inputPlaceholder: 'Ej: 50',
        showCancelButton: true,
        inputAttributes: {
            min: '0',
            step: '1'
        },
        inputValidator: (value) => {
            if (!value || isNaN(value) || parseInt(value) < 0) {
                return 'Ingresa una cantidad válida (número positivo)';
            }
        }
    });
    
    if (cantidad) {
        try {
            await db.collection('producto').doc(productoId).update({
                stock: parseInt(cantidad),
                actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Stock Actualizado',
                text: `Nuevo stock: ${cantidad} unidades`,
                timer: 2000,
                showConfirmButton: false
            });
            
            // Recargar tabla
            setTimeout(() => {
                cargarProductosVendedor();
            }, 500);
            
        } catch (error) {
            console.error('Error actualizando stock:', error);
            Swal.fire('Error', 'No se pudo actualizar el stock', 'error');
        }
    }
};

/**
 * Crear nuevo producto
 */
window.crearNuevoProducto = async function() {
    const { value: formValues } = await Swal.fire({
        title: 'Crear Nuevo Producto',
        html: `
            <input id="swal-nombre" class="swal2-input" placeholder="Nombre del producto" required>
            <input id="swal-precio" type="number" class="swal2-input" placeholder="Precio" required min="0" step="0.01">
            <input id="swal-stock" type="number" class="swal2-input" placeholder="Stock inicial" required min="0">
            <input id="swal-categoria" class="swal2-input" placeholder="Categoría">
            <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>
            <input id="swal-imagen" class="swal2-input" placeholder="URL de imagen (opcional)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Crear',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value;
            const precio = document.getElementById('swal-precio').value;
            const stock = document.getElementById('swal-stock').value;
            
            if (!nombre.trim()) {
                Swal.showValidationMessage('El nombre es requerido');
                return false;
            }
            if (!precio || parseFloat(precio) <= 0) {
                Swal.showValidationMessage('El precio debe ser mayor a 0');
                return false;
            }
            if (!stock || parseInt(stock) < 0) {
                Swal.showValidationMessage('El stock no puede ser negativo');
                return false;
            }
            
            return {
                nombre: nombre,
                precio: parseFloat(precio),
                stock: parseInt(stock),
                categoria: document.getElementById('swal-categoria').value,
                descripcion: document.getElementById('swal-descripcion').value,
                imagen: document.getElementById('swal-imagen').value,
                activo: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
        }
    });
    
    if (formValues) {
        try {
            await db.collection('producto').add(formValues);
            
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Producto creado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Recargar tabla
            setTimeout(() => {
                cargarProductosVendedor();
            }, 500);
            
        } catch (error) {
            console.error('Error creando producto:', error);
            Swal.fire('Error', 'No se pudo crear el producto: ' + error.message, 'error');
        }
    }
};

/**
 * Cierra la sesión del usuario.
 */
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: 'Se cerrará tu sesión actual',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar datos de sesión
            localStorage.removeItem('usuario');
            
            // Cerrar sesión en Firebase Auth
            auth.signOut().then(() => {
                // Redirigir al inicio
                window.location.href = '../../index.html';
            }).catch(error => {
                console.error("Error al cerrar sesión en Firebase:", error);
                // Aún así, intenta redirigir
                window.location.href = '../../index.html';
            });
        }
    });
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Crear usuarios de prueba (ejecutar desde consola)
 */
window.crearUsuariosPrueba = async function() {
    try {
        // Credenciales para pruebas
        const usuariosPrueba = [
            {
                email: 'vendedor@levelup.com',
                password: 'Vendedor123',
                nombre: 'Carlos Vendedor',
                rol: 'vendedor',
                telefono: '+56912345678',
                direccion: 'Calle Vendedores 123'
            },
            {
                email: 'cliente@levelup.com',
                password: 'Cliente123',
                nombre: 'Ana Cliente',
                rol: 'cliente',
                telefono: '+56987654321',
                direccion: 'Avenida Clientes 456'
            }
        ];
        
        for (const usuario of usuariosPrueba) {
            try {
                // Crear en Firebase Auth
                const userCredential = await auth.createUserWithEmailAndPassword(
                    usuario.email, 
                    usuario.password
                );
                
                // Guardar datos en Firestore
                await db.collection('usuario').doc(userCredential.user.uid).set({
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    telefono: usuario.telefono,
                    direccion: usuario.direccion,
                    activo: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log(`✅ Usuario creado: ${usuario.email} (${usuario.rol})`);
                
            } catch (authError) {
                // Si el usuario ya existe, solo actualizar Firestore
                if (authError.code === 'auth/email-already-in-use') {
                    console.log(`ℹ️ Usuario ${usuario.email} ya existe, actualizando datos...`);
                    
                    // Buscar usuario existente
                    const userQuery = await db.collection('usuario')
                        .where('email', '==', usuario.email)
                        .limit(1)
                        .get();
                    
                    if (!userQuery.empty) {
                        const userId = userQuery.docs[0].id;
                        await db.collection('usuario').doc(userId).update({
                            rol: usuario.rol,
                            telefono: usuario.telefono,
                            direccion: usuario.direccion,
                            activo: true
                        });
                        console.log(`✅ Usuario ${usuario.email} actualizado`);
                    }
                } else {
                    console.error(`❌ Error con ${usuario.email}:`, authError);
                }
            }
        }
        
        console.log('✅ Usuarios de prueba configurados exitosamente');
        Swal.fire('Listo', 'Usuarios de prueba creados/actualizados', 'success');
        
    } catch (error) {
        console.error('❌ Error general:', error);
        Swal.fire('Error', 'Error creando usuarios: ' + error.message, 'error');
    }
};

// Función para simular login (para pruebas)
window.simularLoginVendedor = function() {
    const usuarioVendedor = {
        nombre: 'Carlos Vendedor',
        email: 'vendedor@levelup.com',
        rol: 'vendedor',
        telefono: '+56912345678',
        direccion: 'Calle Vendedores 123'
    };
    
    localStorage.setItem('usuario', JSON.stringify(usuarioVendedor));
    console.log('✅ Login simulado como vendedor');
    alert('Login simulado como vendedor. Recarga la página.');
};

console.log('✅ Módulo Vendedor cargado correctamente');