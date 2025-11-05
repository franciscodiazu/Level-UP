/* ==========================================
 * ARCHIVO MODIFICADO: js/carrito.js
 * (Corregido: 1. El filtro de recarga de ofertas)
 * (Corregido: 2. Se añade el stock a las tarjetas de oferta)
 * ==========================================
*/

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs", // ¡Considera usar variables de entorno para esto!
    authDomain: "tienda-level-up.firebaseapp.com",
    projectId: "tienda-level-up"
};
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productosCargados = []; 

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarCarrito();
    cargarTodosLosProductos(); 
    configurarEventos();
});

/**
 * Función para formatear un número como moneda chilena (CLP).
 */
function formatearMoneda(valor) {
    const numero = Number(valor);
    if (isNaN(numero)) return "$0";
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(numero);
}

/**
 * Función para leer un texto de moneda (ej: "$549.990 CLP") y convertirlo a un número.
 */
function parsearMoneda(texto) {
    if (typeof texto !== 'string') return 0;
    const numeroLimpio = texto.replace(/[^0-9]/g, '');
    return parseInt(numeroLimpio, 10) || 0;
}

/**
 * Actualiza el botón del carrito en el header (si existe la función global).
 */
function actualizarHeaderCart() {
    // Llama a la función global (de global-cart.js)
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal(); 
    }
}


/**
 * Inicializa la interfaz del carrito
 */
function inicializarCarrito() {
    renderizarCarrito();
    // Llama a la función global para que calcule el total y actualice
    // tanto localStorage['cartTotal'] como el header.
    actualizarHeaderCart();
}

/**
 * Carga TODOS los productos de Firestore
 * y luego llama a renderizar las ofertas.
 */
async function cargarTodosLosProductos() {
    try {
        const snapshot = await db.collection("producto").get(); // Tu colección es 'producto'
        
        productosCargados = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filtra para encontrar las ofertas
        // (Usa el filtro de 'precioAnterior' que sí te funciona)
        const productosConOferta = productosCargados
            .filter(producto => producto.precioAnterior) // <-- TU FILTRO CORRECTO
            .slice(0, 6); 

        // Llama a la nueva función para "pintarlos" en el HTML
        renderizarProductosOferta(productosConOferta);

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// ==========================================================================
//  FUNCIÓN PARA "PINTAR" LOS PRODUCTOS EN OFERTA EN EL HTML
// ==========================================================================
function renderizarProductosOferta(productosParaRenderizar) {
    const ofertasContainer = document.getElementById('productosOferta');
    if (!ofertasContainer) return; 

    if (productosParaRenderizar.length === 0) {
        ofertasContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; border: 1px dashed #555; border-radius: 8px;">
                No hay ofertas disponibles en este momento.
            </div>
        `;
        return;
    }

    let ofertasHTML = '';
    productosParaRenderizar.forEach(producto => {
        const id = producto.id;
        
        const urlPagina = producto.url || '#';
        const imagenUrl = producto.imagen || 'https://via.placeholder.com/200';
        const nombre = producto.nombre || 'Producto sin nombre';
        const precioFormateado = formatearMoneda(producto.precio || 0);
        // === INICIO CORRECCIÓN 2: Mostrar Stock ===
        // Usamos el mismo estilo que tenías en ofertas-firebase.js
        const stockHtml = `<p class="producto-stock" style="font-size: 0.9em; color: #aaa; margin: 8px 0;">Stock: ${producto.stock || 0}</p>`;
        // === FIN CORRECCIÓN 2 ===

        ofertasHTML += `
            <article class="product-card">
                <a href="${urlPagina}" style="text-decoration: none;">
                    <img src="${imagenUrl}" alt="${nombre}" />
                    <h3>${nombre}</h3>
                </a>
                <div>
                    <p class="product-price">${precioFormateado} CLP</p>
                    ${stockHtml} </div>
                <button class="btn btn-primary btn-agregar-oferta" data-id="${id}">Añadir al carrito</button>
            </article>
        `;
    });

    ofertasContainer.innerHTML = ofertasHTML;
}


/**
 * Renderiza los productos en el carrito (la tabla de la derecha)
 */
function renderizarCarrito() {
    const tbody = document.getElementById('tablaCarritoBody');
    if (!tbody) return;

    if (carrito.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="carrito-vacio">
                    <div class="icono">🛒</div>
                    <h3>Tu carrito está vacío</h3>
                    <p>Agrega algunos productos para continuar</p>
                    <a href="catalogo.html" class="btn-ir-catalogo">Ir al Catálogo</a>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = carrito.map((producto, index) => `
        <tr>
            <td>
                <img src="${producto.imagen}"
                     alt="${producto.nombre}"
                     class="imagen-tabla"
                     onerror="this.src='https://via.placeholder.com/100x100/cccccc/969696?text=Imagen'">
            </td>
            <td>${producto.nombre}</td>
            <td>$${(producto.precio || 0).toLocaleString('es-CL')}</td>
            <td>
                <div class="controles-cantidad">
                    <button class="btn-cantidad" onclick="disminuirCantidad(${index})">-</button>
                    <span class="cantidad-actual">${producto.cantidad || 1}</span>
                    <button class="btn-cantidad" onclick="aumentarCantidad(${index})">+</button>
                </div>
            </td>
            <td>$${((producto.precio || 0) * (producto.cantidad || 1)).toLocaleString('es-CL')}</td>
            <td>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
    
    // Actualiza el total de la página del carrito
    calcularTotalPagina();
}

/**
 * Agrega un producto al carrito (llamada por los botones de oferta)
 */
function agregarProductoAlCarrito(productId) {
    const producto = productosCargados.find(p => p.id === productId); 

    if (producto) {
        const stockActualProducto = producto.stock || 0; 

        if (stockActualProducto <= 0) {
            mostrarNotificacion('Producto sin stock disponible', 'error');
            return;
        }

        const productoExistente = carrito.find(item => item.id === productId);
        let cantidadAAgregar = 1;

        if (productoExistente) {
            if (productoExistente.cantidad >= stockActualProducto) {
                mostrarNotificacion(`No puedes agregar más "${producto.nombre}", stock máximo alcanzado.`, 'error');
                return;
            }
            productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
        } else {
            carrito.push({
                ...producto,
                cantidad: 1
            });
        }

        guardarCarrito(); // Guarda la lista
        renderizarCarrito(); // Dibuja la tabla de la derecha
        actualizarStockFirebase(productId, -cantidadAAgregar); // Actualiza DB y redibuja ofertas
        mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
    } else {
        console.error("Producto no encontrado para agregar:", productId);
        mostrarNotificacion("Error al agregar el producto", 'error');
    }
}


/**
 * Actualiza stock en Firebase. Recibe cantidad a sumar (puede ser negativa para restar).
 */
async function actualizarStockFirebase(productId, cantidadASumar) {
    try {
        const productoRef = db.collection("producto").doc(productId);
        await db.runTransaction(async (transaction) => {
            const productoDoc = await transaction.get(productoRef);
            if (!productoDoc.exists) {
                throw "¡El producto no existe!";
            }
            const stockActual = productoDoc.data().stock || 0;
            const nuevoStock = stockActual + cantidadASumar;

            if (nuevoStock < 0) {
                 console.warn(`Intento de dejar stock negativo para ${productId}. Se dejará en 0.`);
                 transaction.update(productoRef, { stock: 0 });
            } else {
                 transaction.update(productoRef, { stock: nuevoStock });
            }
        });
        console.log(`Stock actualizado para ${productId}: ${cantidadASumar > 0 ? '+' : ''}${cantidadASumar}.`);

        // Actualizar el stock en la variable local 'productosCargados'
        const productoLocal = productosCargados.find(p => p.id === productId);
        if(productoLocal) {
            productoLocal.stock = (productoLocal.stock || 0) + cantidadASumar;
            if (productoLocal.stock < 0) productoLocal.stock = 0; 
            
            // === INICIO CORRECCIÓN 1: Filtro Arreglado ===
            // Volver a renderizar las ofertas para que se actualice el stock
            const productosConOferta = productosCargados
                .filter(producto => producto.precioAnterior) // <-- FILTRO CORREGIDO
                .slice(0, 6);
            renderizarProductosOferta(productosConOferta);
            // === FIN CORRECCIÓN 1 ===
        }

    } catch (error) {
        console.error("Error actualizando stock en Firebase:", error);
        mostrarNotificacion("Error al actualizar el stock del producto.", 'error');
    }
}


/**
 * Aumenta la cantidad de un producto en el carrito
 */
function aumentarCantidad(index) {
    const productoCarrito = carrito[index];
    if (!productoCarrito) return;

    const productoGeneral = productosCargados.find(p => p.id === productoCarrito.id);
    const stockDisponible = productoGeneral ? (productoGeneral.stock || 0) : 0;

    if (stockDisponible <= 0) {
        mostrarNotificacion(`No hay más stock disponible para "${productoCarrito.nombre}".`, 'error');
        return;
    }

    productoCarrito.cantidad = (productoCarrito.cantidad || 1) + 1;
    guardarCarrito();
    renderizarCarrito();
    actualizarStockFirebase(productoCarrito.id, -1);
}

/**
 * Disminuye la cantidad de un producto en el carrito
 */
function disminuirCantidad(index) {
    const productoCarrito = carrito[index];
    if (!productoCarrito) return;

    if (productoCarrito.cantidad > 1) {
        productoCarrito.cantidad--;
        guardarCarrito();
        renderizarCarrito();
        actualizarStockFirebase(productoCarrito.id, 1);
    } else {
        eliminarDelCarrito(index);
    }
}

/**
 * Elimina un producto del carrito
 */
function eliminarDelCarrito(index) {
    if (index < 0 || index >= carrito.length) return; 

    const productoEliminado = carrito[index];
    const cantidadRestaurar = productoEliminado.cantidad || 1;

    carrito.splice(index, 1);

    guardarCarrito();
    renderizarCarrito();
    mostrarNotificacion(`"${productoEliminado.nombre}" eliminado del carrito`);
    actualizarStockFirebase(productoEliminado.id, cantidadRestaurar);
}

/**
 * (Lógica de tu sugerencia)
 * Guarda el carrito (lista) en localStorage y llama a la función global.
 */
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Llama a la función global para que calcule, guarde el total y actualice el header
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal();
    }
    
    // Actualiza el total en la *página del carrito*
    calcularTotalPagina(); 
}

/**
 * (Lógica de tu sugerencia)
 * Calcula el total y actualiza SOLO los elementos de la página del carrito.
 */
function calcularTotalPagina() {
    const total = carrito.reduce((sum, producto) => {
        return sum + ((producto.precio || 0) * (producto.cantidad || 1));
    }, 0);

    const totalCarritoElement = document.getElementById('totalCarrito');
    if (totalCarritoElement) {
        // Usamos el formateador de 'global-cart.js' para ser consistentes
        totalCarritoElement.textContent = formatearMoneda(total);
    }
}


/**
 * Limpia todo el carrito
 */
function limpiarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }

    if (confirm('¿Estás seguro de que quieres limpiar todo el carrito? Esta acción restaurará el stock de los productos.')) {
        const restaurarPromises = carrito.map(producto => {
            return actualizarStockFirebase(producto.id, producto.cantidad || 1);
        });

        Promise.all(restaurarPromises).then(() => {
            carrito = []; 
            guardarCarrito(); 
            renderizarCarrito(); 
            mostrarNotificacion('Carrito limpiado y stock restaurado');
        }).catch(error => {
            console.error("Error al restaurar stock al limpiar carrito:", error);
            mostrarNotificacion("Error al limpiar el carrito, el stock podría no haberse restaurado.", 'error');
        });
    }
}

/**
 * Redirige al checkout
 */
function irAlCheckout() {
    if (carrito.length === 0) {
        mostrarNotificacion('Agrega productos al carrito antes de continuar', 'info');
        return;
    }
    guardarCarrito();
    window.location.href = 'checkout.html'; 
}

/**
 * Muestra una notificación temporal
 */
function mostrarNotificacion(mensaje, tipo = 'success') { // tipo puede ser 'success', 'error', 'info'
    const notificacion = document.createElement('div');
    let bgColor = '#28a745'; // Verde por defecto (success)
    if (tipo === 'error') bgColor = '#dc3545'; // Rojo
    if (tipo === 'info') bgColor = '#17a2b8'; // Azul claro

    notificacion.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        transform: translateX(100%);
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateX(0)';
    }, 10);


    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notificacion.parentNode) {
                 notificacion.remove();
            }
        }, 300);
    }, 3000); 
}

/**
 * Configura los eventos de la página del carrito
 */
function configurarEventos() {
    const btnLimpiar = document.getElementById('btnLimpiarCarrito');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarCarrito);
    }

    const btnComprar = document.getElementById('btnComprarAhora');
    if (btnComprar) {
        btnComprar.addEventListener('click', irAlCheckout);
    }

    const contenedorOfertas = document.getElementById('productosOferta');
    if (contenedorOfertas) {
        contenedorOfertas.addEventListener('click', function(event) {
            const boton = event.target.closest('.btn-agregar-oferta'); 
            if (boton) { 
                const productId = boton.getAttribute('data-id');
                if (productId) {
                    agregarProductoAlCarrito(productId);
                }
            }
        });
    }
}

// Hacer funciones cruciales disponibles globalmente para los botones inline (onclick)
window.aumentarCantidad = aumentarCantidad;
window.disminuirCantidad = disminuirCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;