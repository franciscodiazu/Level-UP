// Archivo: public/assets/js/perfil-data.js
// Versión: 2.0 - Con correcciones para historial de compras

// ATENCIÓN: Este script asume que los archivos CDN de Firebase v8 (app, firestore, auth)
// ya están cargados globalmente en tu HTML, antes de este script.

const db = firebase.firestore();

/**
 * Obtiene el historial de órdenes de un usuario específico desde Firestore.
 * @param {string} userId El ID del usuario (puede ser UID de Auth o documento de usuario)
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con un array de objetos de órdenes.
 */
async function getOrdersByUserId(userId) {
    if (!userId) {
        console.error("Error: userId es requerido para buscar órdenes.");
        return [];
    }
    
    console.log("DEBUG-HIST: ID de Usuario a buscar:", userId);

    const comprasRef = db.collection("compras");
    
    try {
        // Array de campos posibles donde podría estar el ID del usuario
        const posiblesCampos = ["userId", "uid", "userUID", "usuarioId", "clienteId"];
        let orders = [];
        let campoEncontrado = null;
        
        // Intentar con cada campo posible
        for (const campo of posiblesCampos) {
            try {
                console.log(`DEBUG-HIST: Probando con campo '${campo}'...`);
                const q = comprasRef.where(campo, "==", userId).orderBy("date", "desc");
                const querySnapshot = await q.get();
                
                if (!querySnapshot.empty) {
                    console.log(`DEBUG-HIST: ¡ÉXITO! Encontradas ${querySnapshot.size} órdenes con campo '${campo}'`);
                    campoEncontrado = campo;
                    
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        
                        // Conversión robusta de Timestamp
                        let dateObject = null;
                        if (data.date && typeof data.date.toDate === 'function') {
                            dateObject = data.date.toDate();
                        } else if (data.fecha && typeof data.fecha.toDate === 'function') {
                            dateObject = data.fecha.toDate();
                        }
                        
                        orders.push({
                            id: doc.id,
                            ...data,
                            date: dateObject,
                            campoUsado: campo // Para depuración
                        });
                    });
                    break; // Salir del bucle al encontrar
                }
            } catch (error) {
                // Esto puede fallar si el campo no existe o no tiene índice
                console.log(`DEBUG-HIST: Campo '${campo}' no disponible o sin índice:`, error.message);
            }
        }
        
        // Si no encontramos con campos específicos, mostrar mensaje de depuración
        if (orders.length === 0) {
            console.log("DEBUG-HIST: No se encontraron órdenes. Mostrando estructura de Firestore...");
            
            // Traer algunos documentos para ver su estructura
            const muestraRef = await comprasRef.limit(5).get();
            if (!muestraRef.empty) {
                console.log("DEBUG-HIST: Muestra de documentos en colección 'compras':");
                muestraRef.forEach((doc) => {
                    const data = doc.data();
                    console.log(`Doc ${doc.id}:`, Object.keys(data));
                    
                    // Buscar campos que puedan contener IDs
                    const camposConId = Object.keys(data).filter(key => 
                        key.toLowerCase().includes('id') || 
                        key.toLowerCase().includes('uid') ||
                        key.toLowerCase().includes('user')
                    );
                    console.log(`  Posibles campos ID: ${camposConId.join(', ')}`);
                });
            }
        } else {
            console.log(`DEBUG-HIST: Total de órdenes encontradas: ${orders.length} (usando campo '${campoEncontrado}')`);
        }
        
        return orders;
        
    } catch (error) {
        console.error("DEBUG-HIST: ERROR FATAL al obtener órdenes:", error);
        return [];
    }
}

/**
 * Función para mostrar los datos del perfil en la sección "Mis Datos"
 */
function setupEditarPerfil() {
    const datosContainer = document.getElementById("datos-cliente");
    
    console.log("DEBUG-PERFIL: Iniciando setupEditarPerfil...");
    console.log("DEBUG-PERFIL: Contenedor encontrado:", !!datosContainer);

    const usuarioJson = localStorage.getItem("usuario");
    
    if (!datosContainer) {
        console.error("DEBUG-PERFIL: Error: Contenedor #datos-cliente no encontrado en el DOM");
        return;
    }

    if (!usuarioJson) {
        console.log("DEBUG-PERFIL: Usuario NO encontrado en localStorage");
        datosContainer.innerHTML = `
            <div class="error-message">
                <p>⚠️ No se encontró información del usuario.</p>
                <p>Por favor, <a href="login.html">inicia sesión</a> nuevamente.</p>
            </div>
        `;
        return;
    }

    try {
        console.log("DEBUG-PERFIL: Parseando usuario JSON...");
        const usuario = JSON.parse(usuarioJson);
        
        console.log("DEBUG-PERFIL: Usuario parseado:", {
            nombre: usuario.nombre,
            correo: usuario.correo,
            idUsuario: usuario.idUsuario,
            uidAuth: firebase.auth().currentUser?.uid
        });
        
        const fullName = `${usuario.nombre || ''} ${usuario.apellidos || usuario.apellido || ''}`.trim();

        // Generar el HTML del formulario de perfil
        datosContainer.innerHTML = `
            <div class="profile-card">
                <div class="profile-header">
                    <h2><i class="fas fa-user-circle"></i> Información Personal</h2>
                </div>
                
                <form class="form-perfil">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nombre">
                                <i class="fas fa-user"></i> Nombre Completo:
                            </label>
                            <input type="text" id="nombre" value="${fullName || 'No especificado'}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label for="correo">
                                <i class="fas fa-envelope"></i> Correo Electrónico:
                            </label>
                            <input type="email" id="correo" value="${usuario.correo || 'No especificado'}" readonly>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="user-id">
                            <i class="fas fa-id-card"></i> ID de Usuario:
                        </label>
                        <input type="text" id="user-id" value="${usuario.idUsuario || 'No disponible'}" readonly>
                        <small class="form-text">Este es tu identificador único en el sistema</small>
                    </div>

                    <div class="profile-header" style="margin-top: 30px;">
                        <h2><i class="fas fa-map-marker-alt"></i> Dirección de Envío</h2>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="calle">Calle/Avenida:</label>
                            <input type="text" id="calle" value="${usuario.calle || 'No especificada'}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label for="numero">Número:</label>
                            <input type="text" id="numero" value="${usuario.numero || ''}" readonly>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="departamento">Depto/Casa:</label>
                            <input type="text" id="departamento" value="${usuario.departamento || 'No especificado'}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label for="comuna">Comuna:</label>
                            <input type="text" id="comuna" value="${usuario.comuna || 'No especificada'}" readonly>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="region">Región:</label>
                        <input type="text" id="region" value="${usuario.region || 'No especificada'}" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label for="indicaciones">
                            <i class="fas fa-info-circle"></i> Indicaciones Adicionales:
                        </label>
                        <textarea id="indicaciones" rows="3" readonly>${usuario.indicaciones || 'Sin indicaciones adicionales'}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <p class="nota">
                            <i class="fas fa-tools"></i> <strong>Funcionalidad de Edición en Desarrollo</strong><br>
                            Pronto podrás modificar tus datos directamente desde aquí.
                        </p>
                    </div>
                </form>
            </div>
        `;
        
        console.log("DEBUG-PERFIL: HTML de perfil inyectado con éxito.");

    } catch (error) {
        console.error("DEBUG-PERFIL: ERROR al procesar datos del usuario:", error);
        datosContainer.innerHTML = `
            <div class="error-message">
                <p>❌ Ocurrió un error al cargar tus datos de perfil.</p>
                <p>Detalles: ${error.message}</p>
                <button onclick="location.reload()" class="btn-refresh">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }
}

/**
 * Función para mostrar el historial de compras
 */
async function setupHistorialCompras() {
    const historialContainer = document.getElementById("historial-container");
    const usuarioJson = localStorage.getItem("usuario");
    
    console.log("DEBUG-HIST: Iniciando setupHistorialCompras...");
    console.log("DEBUG-HIST: Contenedor encontrado:", !!historialContainer);

    if (!historialContainer) {
        console.error("DEBUG-HIST: Error: Contenedor #historial-container no encontrado");
        return;
    }

    if (!usuarioJson) {
        historialContainer.innerHTML = `
            <div class="auth-required">
                <div class="auth-icon">
                    <i class="fas fa-sign-in-alt"></i>
                </div>
                <h3>Acceso Requerido</h3>
                <p>Debes iniciar sesión para ver tu historial de compras.</p>
                <a href="login.html" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                </a>
            </div>
        `;
        return;
    }

    try {
        const usuario = JSON.parse(usuarioJson);
        
        // Obtener el ID del usuario de diferentes fuentes posibles
        let userId = usuario.idUsuario || usuario.uid;
        
        // Si no tenemos ID en localStorage, intentar con Firebase Auth
        if (!userId) {
            const userAuth = firebase.auth().currentUser;
            if (userAuth && userAuth.uid) {
                userId = userAuth.uid;
                console.log("DEBUG-HIST: Usando UID de Firebase Auth:", userId);
            }
        }
        
        console.log("DEBUG-HIST: ID de usuario a usar:", userId);
        console.log("DEBUG-HIST: Correo del usuario:", usuario.correo);
        
        if (!userId) {
            historialContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ No se pudo identificar tu cuenta.</p>
                    <p>Por favor, cierra sesión y vuelve a iniciar.</p>
                    <button id="btnCerrarSesion" class="btn-logout">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </button>
                </div>
            `;
            
            // Agregar funcionalidad al botón de cerrar sesión
            document.getElementById('btnCerrarSesion')?.addEventListener('click', () => {
                localStorage.removeItem('usuario');
                firebase.auth().signOut();
                window.location.href = 'login.html';
            });
            
            return;
        }

        // Mostrar estado de carga
        historialContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <h3>Cargando historial de compras...</h3>
                <p>Buscando tus pedidos en el sistema</p>
                <div class="loading-details">
                    <p><small>ID de búsqueda: ${userId.substring(0, 8)}...</small></p>
                </div>
            </div>
        `;
        
        // Obtener las órdenes
        console.log("DEBUG-HIST: Llamando a getOrdersByUserId...");
        const orders = await getOrdersByUserId(userId);
        console.log("DEBUG-HIST: Órdenes obtenidas:", orders.length);

        if (orders.length === 0) {
            historialContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>No hay compras registradas</h3>
                    <p>Aún no has realizado ninguna compra en nuestra tienda.</p>
                    <p>¡Explora nuestro catálogo y encuentra productos increíbles!</p>
                    <a href="catalogo.html" class="btn-primary">
                        <i class="fas fa-store"></i> Ir al Catálogo
                    </a>
                    
                    <!-- Botón de depuración -->
                    <div style="margin-top: 20px; padding: 15px; background: #2a2a2a; border-radius: 5px;">
                        <p><small>¿Deberías tener compras?</small></p>
                        <button id="debugFirestoreBtn" class="btn-secondary" style="font-size: 0.9em;">
                            <i class="fas fa-bug"></i> Verificar Firestore
                        </button>
                    </div>
                </div>
            `;
            
            // Botón de depuración
            document.getElementById('debugFirestoreBtn')?.addEventListener('click', async () => {
                try {
                    const db = firebase.firestore();
                    const allCompras = await db.collection('compras').limit(10).get();
                    
                    console.log('=== DEPURACIÓN FIRESTORE ===');
                    console.log('Colección: compras');
                    console.log('Total documentos:', allCompras.size);
                    
                    if (allCompras.empty) {
                        alert('❌ La colección "compras" está VACÍA');
                        console.log('La colección "compras" no tiene documentos.');
                    } else {
                        console.log('=== ESTRUCTURA DE DOCUMENTOS ===');
                        allCompras.forEach(doc => {
                            console.log(`\n📄 Documento: ${doc.id}`);
                            const data = doc.data();
                            console.log('Campos:', Object.keys(data));
                            
                            // Mostrar campos relacionados con usuarios
                            const userFields = Object.keys(data).filter(key => 
                                key.toLowerCase().includes('id') || 
                                key.toLowerCase().includes('uid') ||
                                key.toLowerCase().includes('user')
                            );
                            
                            if (userFields.length > 0) {
                                console.log('📌 Campos de usuario:', userFields);
                                userFields.forEach(field => {
                                    console.log(`   ${field}: ${data[field]}`);
                                });
                            }
                        });
                        alert(`✅ Firestore tiene ${allCompras.size} documentos. Revisa la consola para más detalles.`);
                    }
                } catch (error) {
                    console.error('Error en depuración:', error);
                    alert('❌ Error al acceder a Firestore');
                }
            });
            
            return;
        }

        // Ordenar por fecha (más reciente primero)
        orders.sort((a, b) => {
            const dateA = a.date ? a.date.getTime() : 0;
            const dateB = b.date ? b.date.getTime() : 0;
            return dateB - dateA;
        });

        // Generar HTML del historial
        let html = `
            <div class="history-header">
                <h2><i class="fas fa-history"></i> Historial de Compras</h2>
                <p class="history-summary">Tienes <strong>${orders.length}</strong> compra${orders.length !== 1 ? 's' : ''} registrada${orders.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div class="orders-grid">
        `;

        orders.forEach((order, index) => {
            // Formatear fecha
            let dateStr = 'Fecha desconocida';
            if (order.date) {
                dateStr = order.date.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else if (order.fecha) {
                dateStr = order.fecha;
            }
            
            // Formatear total
            const total = order.total ? 
                order.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) :
                '$0';
            
            // Determinar estado
            const orderStatus = order.status || order.estado || 'Pendiente';
            const statusClass = orderStatus.toLowerCase().replace(/\s/g, '-');
            
            // Items
            const items = order.items || order.productos || [];
            let itemsHtml = '';
            
            if (items.length > 0) {
                itemsHtml = '<ul class="order-items-list">';
                items.forEach(item => {
                    const itemName = item.name || item.nombre || 'Producto';
                    const itemQuantity = item.quantity || item.cantidad || 1;
                    const itemPrice = item.price || item.precio || 0;
                    const itemTotal = itemPrice * itemQuantity;
                    
                    itemsHtml += `
                        <li>
                            <span class="item-name">${itemName}</span>
                            <span class="item-details">
                                ${itemQuantity} x ${itemPrice.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} = 
                                ${itemTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                            </span>
                        </li>
                    `;
                });
                itemsHtml += '</ul>';
            } else {
                itemsHtml = '<p class="no-items">No se especificaron productos</p>';
            }
            
            // Dirección
            const direccion = order.direccion || order.shippingAddress || 
                (usuario.calle ? `${usuario.calle} ${usuario.numero || ''}, ${usuario.comuna || ''}` : 'No especificada');
            
            // ID corto para mostrar
            const shortId = order.id ? `ORD-${order.id.substring(0, 8).toUpperCase()}` : `ORD-${index + 1}`;
            
            html += `
                <div class="order-card ${statusClass}">
                    <div class="order-card-header">
                        <div class="order-id-status">
                            <span class="order-id">${shortId}</span>
                            <span class="order-status-badge status-${statusClass}">
                                ${orderStatus}
                            </span>
                        </div>
                        <div class="order-date-total">
                            <span class="order-date">${dateStr}</span>
                            <span class="order-total">${total}</span>
                        </div>
                    </div>
                    
                    <div class="order-card-body">
                        <div class="order-section">
                            <h4><i class="fas fa-boxes"></i> Productos</h4>
                            ${itemsHtml}
                        </div>
                        
                        <div class="order-section">
                            <h4><i class="fas fa-map-marker-alt"></i> Dirección de Entrega</h4>
                            <p class="order-address">${direccion}</p>
                        </div>
                        
                        ${order.metodoPago ? `
                        <div class="order-section">
                            <h4><i class="fas fa-credit-card"></i> Método de Pago</h4>
                            <p>${order.metodoPago}</p>
                        </div>
                        ` : ''}
                        
                        ${order.notas ? `
                        <div class="order-section">
                            <h4><i class="fas fa-sticky-note"></i> Notas</h4>
                            <p>${order.notas}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="order-card-footer">
                        <button class="btn-order-action" onclick="viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i> Ver Detalles
                        </button>
                        <button class="btn-order-action" onclick="downloadInvoice('${order.id}')">
                            <i class="fas fa-download"></i> Descargar Factura
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            
            <div class="history-footer">
                <p class="help-text">
                    <i class="fas fa-info-circle"></i> 
                    Si encuentras algún error en tus pedidos, contacta a nuestro 
                    <a href="soporte.html">soporte técnico</a>.
                </p>
            </div>
        `;

        historialContainer.innerHTML = html;
        console.log("DEBUG-HIST: Historial de compras cargado exitosamente.");

    } catch (error) {
        console.error("DEBUG-HIST: ERROR FATAL:", error);
        historialContainer.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error al cargar el historial</h3>
                <p>Hubo un problema al obtener tus compras. Por favor, intenta más tarde.</p>
                <p class="error-details"><small>Detalles: ${error.message}</small></p>
                <button onclick="location.reload()" class="btn-primary">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }
}

/**
 * Función auxiliar para ver detalles de una orden (placeholder)
 */
function viewOrderDetails(orderId) {
    alert(`Detalles de la orden ${orderId}\n\nEsta funcionalidad estará disponible pronto.`);
}

/**
 * Función auxiliar para descargar factura (placeholder)
 */
function downloadInvoice(orderId) {
    alert(`Descargando factura para la orden ${orderId}\n\nEsta funcionalidad estará disponible pronto.`);
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("DEBUG: DOM cargado, iniciando perfil-data.js");
    
    // Verificar si Firebase está disponible
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error("ERROR CRÍTICO: Firebase no está disponible");
        
        // Mostrar mensaje de error en todos los contenedores posibles
        const errorMsg = `
            <div class="error-message" style="padding: 20px; text-align: center;">
                <h3>⚠️ Error de Configuración</h3>
                <p>No se pudo cargar Firebase. Asegúrate de tener conexión a Internet.</p>
                <button onclick="location.reload()" class="btn-primary">
                    Recargar Página
                </button>
            </div>
        `;
        
        const datosContainer = document.getElementById("datos-cliente");
        const historialContainer = document.getElementById("historial-container");
        
        if (datosContainer) datosContainer.innerHTML = errorMsg;
        if (historialContainer) historialContainer.innerHTML = errorMsg;
        
        return;
    }
    
    console.log("DEBUG: Firebase disponible, procediendo...");
    
    // Configurar perfil si el contenedor existe
    const datosContainer = document.getElementById("datos-cliente");
    if (datosContainer) {
        console.log("DEBUG: Configurando editar perfil...");
        setupEditarPerfil();
    }
    
    // Configurar historial si el contenedor existe
    const historialContainer = document.getElementById("historial-container");
    if (historialContainer) {
        console.log("DEBUG: Configurando historial de compras...");
        setupHistorialCompras();
    }
    
    console.log("DEBUG: perfil-data.js inicializado correctamente");
});

/**
 * Función para recargar datos (puede ser llamada desde otros scripts)
 */
function recargarPerfil() {
    console.log("DEBUG: Recargando datos del perfil...");
    
    const datosContainer = document.getElementById("datos-cliente");
    if (datosContainer) setupEditarPerfil();
    
    const historialContainer = document.getElementById("historial-container");
    if (historialContainer) setupHistorialCompras();
}

// Hacer la función recargarPerfil disponible globalmente
window.recargarPerfil = recargarPerfil;
window.setupEditarPerfil = setupEditarPerfil;
window.setupHistorialCompras = setupHistorialCompras;

// Función de diagnóstico para Firestore - AGREGAR AL FINAL DE perfil-data.js
window.diagnosticarFirestore = async function() {
    try {
        console.log('=== DIAGNÓSTICO FIRESTORE INICIADO ===');
        
        // 1. Verificar conexión a Firebase
        console.log('1. Verificando conexión Firebase...');
        const db = firebase.firestore();
        console.log('✅ Firebase Firestore disponible');
        
        // 2. Verificar usuario autenticado
        console.log('2. Verificando usuario autenticado...');
        const user = firebase.auth().currentUser;
        if (user) {
            console.log('✅ Usuario autenticado:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            });
        } else {
            console.log('❌ NO hay usuario autenticado en Firebase Auth');
        }
        
        // 3. Verificar localStorage
        console.log('3. Verificando localStorage...');
        const usuarioJson = localStorage.getItem('usuario');
        if (usuarioJson) {
            const usuario = JSON.parse(usuarioJson);
            console.log('✅ localStorage usuario:', {
                idUsuario: usuario.idUsuario,
                correo: usuario.correo,
                nombre: usuario.nombre
            });
        } else {
            console.log('❌ NO hay usuario en localStorage');
        }
        
        // 4. Listar TODAS las colecciones disponibles (si es posible)
        console.log('4. Verificando colección "compras"...');
        try {
            const comprasRef = db.collection('compras');
            const snapshot = await comprasRef.limit(5).get();
            
            console.log(`📊 Total documentos en "compras": ${snapshot.size}`);
            
            if (snapshot.empty) {
                console.log('⚠️ La colección "compras" está VACÍA');
            } else {
                console.log('📄 Primeros documentos encontrados:');
                snapshot.forEach((doc, index) => {
                    console.log(`\n   Documento ${index + 1}: ${doc.id}`);
                    const data = doc.data();
                    
                    // Mostrar campos importantes
                    console.log('   Campos:', Object.keys(data));
                    
                    // Mostrar campos relacionados con usuarios
                    const camposUsuario = Object.keys(data).filter(key => 
                        key.toLowerCase().includes('id') || 
                        key.toLowerCase().includes('uid') ||
                        key.toLowerCase().includes('user')
                    );
                    
                    if (camposUsuario.length > 0) {
                        console.log('   Campos de usuario:', camposUsuario);
                        camposUsuario.forEach(campo => {
                            console.log(`      ${campo}: ${data[campo]}`);
                        });
                    }
                    
                    // Mostrar estructura de items si existe
                    if (data.items || data.productos) {
                        const items = data.items || data.productos;
                        console.log(`   Items: ${Array.isArray(items) ? items.length : 'no es array'}`);
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Error al acceder a colección "compras":', error.message);
            console.log('⚠️ Posibles causas:');
            console.log('   - La colección no existe');
            console.log('   - Problemas con las reglas de seguridad');
            console.log('   - Error de permisos');
        }
        
        // 5. Verificar colección "pedidos" (por si usas otro nombre)
        console.log('5. Verificando colección "pedidos"...');
        try {
            const pedidosRef = db.collection('pedidos');
            const pedidosSnapshot = await pedidosRef.limit(3).get();
            console.log(`📊 Total documentos en "pedidos": ${pedidosSnapshot.size}`);
            
            if (!pedidosSnapshot.empty) {
                console.log('⚠️ ¡ENCONTRADA colección "pedidos"!');
                pedidosSnapshot.forEach(doc => {
                    console.log(`   Documento: ${doc.id}`, doc.data());
                });
            }
        } catch (error) {
            console.log('ℹ️ Colección "pedidos" no accesible o no existe');
        }
        
        // 6. Verificar reglas de Firestore (intento de escritura)
        console.log('6. Probando reglas de seguridad...');
        try {
            const testRef = db.collection('_test_diagnostico').doc('temp');
            await testRef.set({
                timestamp: new Date(),
                test: 'diagnóstico'
            });
            console.log('✅ Reglas permiten escritura');
            
            // Limpiar documento de prueba
            await testRef.delete();
            console.log('✅ Documento de prueba eliminado');
            
        } catch (error) {
            console.log('⚠️ Reglas de seguridad pueden estar bloqueando:', error.message);
        }
        
        console.log('=== DIAGNÓSTICO COMPLETADO ===');
        
        // Mostrar resumen en alert
        const summary = `
DIAGNÓSTICO COMPLETADO:

1. Firebase: ✅ Conectado
2. Usuario Auth: ${user ? '✅ Autenticado' : '❌ No autenticado'}
3. localStorage: ${usuarioJson ? '✅ Con usuario' : '❌ Sin usuario'}
4. Colección "compras": ${snapshot?.size || 0} documentos
5. Colección "pedidos": ${pedidosSnapshot?.size || 0} documentos

Revisa la consola (F12 → Console) para detalles completos.
`;
        
        alert(summary);
        
    } catch (error) {
        console.error('❌ ERROR en diagnóstico:', error);
        alert(`Error en diagnóstico: ${error.message}\n\nRevisa la consola para más detalles.`);
    }
};

// También modifica setupHistorialCompras para mejor diagnóstico
async function setupHistorialCompras() {
    const historialContainer = document.getElementById("historial-container");
    
    console.log("🔍 SETUP HISTORIAL INICIADO");
    
    // Limpiar y mostrar estado de carga
    historialContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">
                <i class="fas fa-search fa-spin"></i>
            </div>
            <h3>Buscando tus compras...</h3>
            <p id="debug-info" style="font-size: 0.9em; color: #888; margin-top: 10px;">
                Verificando base de datos...
            </p>
        </div>
    `;
    
    try {
        // 1. Verificar autenticación
        const user = firebase.auth().currentUser;
        console.log("🔍 Usuario Firebase Auth:", user);
        
        // 2. Verificar localStorage
        const usuarioJson = localStorage.getItem('usuario');
        console.log("🔍 localStorage usuario:", usuarioJson);
        
        if (!usuarioJson && !user) {
            historialContainer.innerHTML = `
                <div class="error-message">
                    <h3><i class="fas fa-exclamation-triangle"></i> Sesión no encontrada</h3>
                    <p>No se detectó una sesión activa. Por favor:</p>
                    <ol style="text-align: left; margin: 15px 0;">
                        <li>Recarga la página</li>
                        <li>Si persiste, cierra sesión y vuelve a iniciar</li>
                        <li>Contacta a soporte si el problema continúa</li>
                    </ol>
                    <button onclick="location.reload()" class="btn-primary">
                        <i class="fas fa-redo"></i> Recargar Página
                    </button>
                </div>
            `;
            return;
        }
        
        let usuario = null;
        if (usuarioJson) {
            try {
                usuario = JSON.parse(usuarioJson);
                console.log("🔍 Usuario parseado:", usuario);
            } catch (error) {
                console.error("Error parseando usuario:", error);
            }
        }
        
        // 3. Determinar qué ID usar
        let userId = null;
        if (usuario?.idUsuario) {
            userId = usuario.idUsuario;
            console.log("🔍 Usando idUsuario de localStorage:", userId);
        } else if (user?.uid) {
            userId = user.uid;
            console.log("🔍 Usando UID de Firebase Auth:", userId);
        } else if (usuario?.uid) {
            userId = usuario.uid;
            console.log("🔍 Usando uid de localStorage:", userId);
        }
        
        if (!userId) {
            historialContainer.innerHTML = `
                <div class="error-message">
                    <h3><i class="fas fa-exclamation-triangle"></i> ID de usuario no encontrado</h3>
                    <p>No se pudo identificar tu cuenta. Posibles causas:</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>Los datos de sesión están corruptos</li>
                        <li>La sesión expiró</li>
                        <li>Problema con el almacenamiento local</li>
                    </ul>
                    <div style="margin-top: 20px;">
                        <button onclick="location.reload()" class="btn-primary">
                            <i class="fas fa-redo"></i> Recargar
                        </button>
                        <button onclick="cerrarSesion()" class="btn-secondary">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Actualizar información de depuración
        document.getElementById('debug-info').innerHTML = `
            Buscando compras para ID: <code>${userId.substring(0, 8)}...</code><br>
            Usuario: ${usuario?.nombre || user?.email || 'Desconocido'}
        `;
        
        // 4. Buscar en Firestore
        console.log("🔍 Buscando órdenes para userId:", userId);
        const db = firebase.firestore();
        
        // Intentar diferentes nombres de colección
        const colecciones = ['compras', 'pedidos', 'orders', 'purchases'];
        let orders = [];
        let coleccionEncontrada = null;
        
        for (const coleccion of colecciones) {
            try {
                console.log(`🔍 Probando colección "${coleccion}"...`);
                const q = db.collection(coleccion)
                    .where('userId', '==', userId)
                    .limit(10);
                
                const snapshot = await q.get();
                
                if (!snapshot.empty) {
                    coleccionEncontrada = coleccion;
                    console.log(`✅ Encontradas ${snapshot.size} órdenes en "${coleccion}"`);
                    
                    snapshot.forEach(doc => {
                        orders.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    break;
                } else {
                    console.log(`ℹ️ Colección "${coleccion}" existe pero está vacía para este usuario`);
                }
            } catch (error) {
                console.log(`ℹ️ Colección "${coleccion}" no accesible o no existe:`, error.message);
            }
        }
        
        // Si no encontramos con 'userId', probar otros campos
        if (orders.length === 0) {
            console.log("🔍 Probando otros campos de identificación...");
            
            const campos = ['uid', 'usuarioId', 'clienteId', 'userUID', 'user_id'];
            for (const campo of campos) {
                try {
                    const q = db.collection('compras')
                        .where(campo, '==', userId)
                        .limit(10);
                    
                    const snapshot = await q.get();
                    
                    if (!snapshot.empty) {
                        console.log(`✅ Encontradas ${snapshot.size} órdenes con campo "${campo}"`);
                        
                        snapshot.forEach(doc => {
                            orders.push({
                                id: doc.id,
                                ...doc.data(),
                                campoUsado: campo
                            });
                        });
                        break;
                    }
                } catch (error) {
                    // Ignorar errores de campos que no existen
                }
            }
        }
        
        console.log("🔍 Órdenes encontradas:", orders.length);
        
        // 5. Mostrar resultados
        if (orders.length === 0) {
            historialContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>No hay compras registradas</h3>
                    <p>Aún no has realizado ninguna compra en nuestra tienda.</p>
                    <p>¡Explora nuestro catálogo y encuentra productos increíbles!</p>
                    <a href="catalogo.html" class="btn-primary">
                        <i class="fas fa-store"></i> Ir al Catálogo
                    </a>
                    
                    <!-- Panel de diagnóstico -->
                    <div style="margin-top: 30px; padding: 20px; background: rgba(40, 40, 40, 0.7); border-radius: 10px; text-align: left;">
                        <h4 style="color: var(--color-primary); margin-bottom: 15px;">
                            <i class="fas fa-bug"></i> Información de Diagnóstico
                        </h4>
                        <p style="font-size: 0.9em; color: #aaa; margin-bottom: 10px;">
                            <strong>Usuario ID:</strong> <code>${userId}</code>
                        </p>
                        <p style="font-size: 0.9em; color: #aaa; margin-bottom: 10px;">
                            <strong>Email:</strong> ${usuario?.correo || user?.email || 'No disponible'}
                        </p>
                        <p style="font-size: 0.9em; color: #aaa; margin-bottom: 15px;">
                            <strong>Colección encontrada:</strong> ${coleccionEncontrada || 'Ninguna'}
                        </p>
                        
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button onclick="diagnosticarFirestore()" class="btn-secondary">
                                <i class="fas fa-search"></i> Verificar Firestore
                            </button>
                            <button onclick="verEstructuraCompras()" class="btn-secondary">
                                <i class="fas fa-database"></i> Ver Estructura
                            </button>
                            <button onclick="probarNuevaCompra()" class="btn-secondary">
                                <i class="fas fa-plus"></i> Probar Nueva Compra
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Mostrar las órdenes encontradas
            let html = `
                <div class="history-header">
                    <h2><i class="fas fa-history"></i> Historial de Compras</h2>
                    <p class="history-summary">Encontradas <strong>${orders.length}</strong> compra${orders.length !== 1 ? 's' : ''}</p>
                </div>
                
                <div class="orders-grid">
            `;
            
            orders.forEach(order => {
                // Formatear cada orden...
                // (Mantén tu código existente para mostrar órdenes)
            });
            
            historialContainer.innerHTML = html;
        }
        
    } catch (error) {
        console.error("❌ ERROR en setupHistorialCompras:", error);
        
        historialContainer.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error al cargar el historial</h3>
                <p>Detalles: ${error.message}</p>
                
                <div style="margin-top: 20px; text-align: left; background: rgba(255, 0, 0, 0.1); padding: 15px; border-radius: 5px;">
                    <h4 style="color: #ff4444;">Información técnica:</h4>
                    <p style="font-size: 0.9em;">
                        <strong>Error:</strong> ${error.name}<br>
                        <strong>Mensaje:</strong> ${error.message}<br>
                        <strong>Stack:</strong> ${error.stack?.split('\n')[0]}
                    </p>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="location.reload()" class="btn-primary">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                    <button onclick="diagnosticarFirestore()" class="btn-secondary">
                        <i class="fas fa-bug"></i> Diagnóstico
                    </button>
                </div>
            </div>
        `;
    }
}

// Funciones auxiliares adicionales
window.verEstructuraCompras = async function() {
    try {
        const db = firebase.firestore();
        const comprasRef = db.collection('compras');
        const snapshot = await comprasRef.limit(5).get();
        
        if (snapshot.empty) {
            alert('La colección "compras" está completamente vacía.');
            return;
        }
        
        let mensaje = 'ESTRUCTURA DE COMPRAS:\n\n';
        snapshot.forEach(doc => {
            const data = doc.data();
            mensaje += `📄 Documento: ${doc.id}\n`;
            mensaje += `Campos: ${Object.keys(data).join(', ')}\n`;
            
            // Mostrar valores importantes
            const camposImportantes = ['userId', 'uid', 'usuarioId', 'email', 'total', 'items'];
            camposImportantes.forEach(campo => {
                if (data[campo] !== undefined) {
                    mensaje += `${campo}: ${JSON.stringify(data[campo]).substring(0, 100)}...\n`;
                }
            });
            mensaje += '---\n';
        });
        
        console.log('Estructura de compras:', mensaje);
        alert(mensaje.substring(0, 2000)); // Limitar tamaño del alert
        
    } catch (error) {
        console.error('Error viendo estructura:', error);
        alert('Error: ' + error.message);
    }
};

window.probarNuevaCompra = function() {
    alert('Para probar una nueva compra:\n\n1. Ve al catálogo\n2. Añade productos al carrito\n3. Completa el proceso de checkout\n\nEsto creará una nueva compra en Firestore.');
};