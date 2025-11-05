/* ==========================================
 * ARCHIVO MODIFICADO: js/carrito.js
 * (Incluye Firebase + localStorage para el total)
 * + LÓGICA PARA RENDERIZAR OFERTAS
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
let productosOferta = []; // (AHORA SE LLAMA 'productosCargados')
// Cambié el nombre para evitar confusión: 
// esta variable ahora guarda TODOS los productos para la lógica de stock.
let productosCargados = []; 

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarCarrito();
    // AHORA SE LLAMA 'cargarTodosLosProductos' para más claridad
    cargarTodosLosProductos(); 
    configurarEventos();
});

/**
 * Función para formatear un número como moneda chilena (CLP).
 * @param {number} valor - El número a formatear.
 * @returns {string} El valor formateado como moneda.
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
 * @param {string} texto - El texto con formato de moneda.
 * @returns {number} El valor numérico.
 */
function parsearMoneda(texto) {
    if (typeof texto !== 'string') return 0;
    const numeroLimpio = texto.replace(/[^0-9]/g, '');
    return parseInt(numeroLimpio, 10) || 0;
}

/**
 * Actualiza el botón del carrito en el header (si existe la función global).
 * Lee el total guardado en localStorage.
 */
function actualizarHeaderCart() {
    // Verifica si la función global existe (de global-cart.js)
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal(); // Llama a la función global
    } else {
        // Fallback: Intenta actualizar el botón directamente si no existe la global
        // (Esto solo funcionará si estás en una página que tiene el botón)
        const cartButton = document.getElementById('header-cart-button');
        if (cartButton) {
            const totalGuardado = parseInt(localStorage.getItem('cartTotal'), 10) || 0;
            cartButton.textContent = 'Carrito ' + formatearMoneda(totalGuardado);
        }
    }
}


/**
 * Inicializa la interfaz del carrito
 */
function inicializarCarrito() {
    // No necesitamos actualizar el header aquí, calcularTotal lo hará
    renderizarCarrito();
    calcularTotal(); // Esto ahora también guarda en localStorage y actualiza header
}

/**
 * (FUNCIÓN RENOMBRADA) Carga TODOS los productos de Firestore
 * y luego llama a renderizar las ofertas.
 */
async function cargarTodosLosProductos() { // Nombre cambiado
    try {
        const snapshot = await db.collection("producto").get(); // Tu colección es 'producto'
        
        // Llena la variable global que usa el resto de tu lógica (stock, etc.)
        productosCargados = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // --- INICIO DE MODIFICACIÓN ---
        // Ahora, filtra esta lista para encontrar las ofertas
        // Asumo que tu campo se llama 'enOferta' y es 'true'
        
const productosConOferta = productosCargados
    .filter(producto => producto.precioAnterior) // <-- ¡CÁMBIALA POR ESTA LÍNEA!
    .slice(0, 6);

        // Llama a la nueva función para "pintarlos" en el HTML
        renderizarProductosOferta(productosConOferta);
        // --- FIN DE MODIFICACIÓN ---

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// ==========================================================================
//  NUEVA FUNCIÓN PARA "PINTAR" LOS PRODUCTOS EN OFERTA EN EL HTML
// ==========================================================================
function renderizarProductosOferta(productosParaRenderizar) {
    const ofertasContainer = document.getElementById('productosOferta');
    if (!ofertasContainer) return; // Salir si el div no existe

    if (productosParaRenderizar.length === 0) {
        ofertasContainer.innerHTML = "<p>No hay ofertas disponibles en este momento.</p>";
        return;
    }

    let ofertasHTML = '';
    productosParaRenderizar.forEach(producto => {
        const id = producto.id;
        
        // Asumo que tus campos se llaman 'url', 'imagen', 'nombre' y 'precio'
        const urlPagina = producto.url || '#'; // Link a la pág. del producto
        const imagenUrl = producto.imagen || 'https://via.placeholder.com/200'; // Imagen
        const nombre = producto.nombre || 'Producto sin nombre';
        const precioFormateado = formatearMoneda(producto.precio || 0);

        ofertasHTML += `
            <article class="product-card">
                <a href="${urlPagina}" style="text-decoration: none;">
                    <img src="${imagenUrl}" alt="${nombre}" />
                    <h3>${nombre}</h3>
                </a>
                <p class="product-price">${precioFormateado} CLP</p>
                
                <button class="btn btn-primary btn-agregar-oferta" data-id="${id}">Añadir al carrito</button>
            </article>
        `;
    });

    ofertasContainer.innerHTML = ofertasHTML;
}


/**
 * Renderiza los productos en el carrito
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
}

/**
 * Agrega un producto al carrito (Asumiendo que viene de otra página o sección)
 * Esta función es llamada por el event listener de la sección de ofertas.
 */
function agregarProductoAlCarrito(productId) {
    // USA 'productosCargados' (la lista completa)
    const producto = productosCargados.find(p => p.id === productId); 

    if (producto) {
        const stockActualProducto = producto.stock || 0; // Obtener stock actual del producto fuente

        if (stockActualProducto <= 0) {
            mostrarNotificacion('Producto sin stock disponible', 'error');
            return;
        }

        const productoExistente = carrito.find(item => item.id === productId);
        let cantidadAAgregar = 1;

        if (productoExistente) {
             // Verificar si agregar uno más excede el stock
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

        guardarCarrito();
        renderizarCarrito();
        calcularTotal(); // Esto actualiza total, localStorage y header

        // Actualizar stock en Firebase (RESTA stock)
        actualizarStockFirebase(productId, -cantidadAAgregar); // Pasa negativo para restar

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

            // Evitar stock negativo
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
            if (productoLocal.stock < 0) productoLocal.stock = 0; // Asegurar no negativo localmente
            
            // --- INICIO MODIFICACIÓN ---
            // Volver a renderizar las ofertas para que se actualice el stock
            // (si el producto quitado del carrito era una oferta)
            const productosConOferta = productosCargados
                .filter(producto => producto.enOferta === true)
                .slice(0, 6);
            renderizarProductosOferta(productosConOferta);
            // --- FIN MODIFICACIÓN ---
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

    // Busca el producto en la lista general para verificar stock real
    // USA 'productosCargados'
    const productoGeneral = productosCargados.find(p => p.id === productoCarrito.id);
    const stockDisponible = productoGeneral ? (productoGeneral.stock || 0) : 0; // Stock actual real

    // Ajuste: El stock disponible es el stock *actual* de firebase,
    // NO el stock - lo que ya tengo en el carrito, porque tu lógica de stock
    // ya resta de firebase al añadir.
    // Por lo tanto, comparamos la cantidad en el carrito con el stock total del producto.
    
    // CORRECCIÓN LÓGICA:
    // El stock en 'productosCargados' refleja el stock *restante* en la BD.
    // La cantidad en 'productoCarrito' es lo que el usuario *ya tiene*.
    // El stock *total* original era (productosCargados.stock + productoCarrito.cantidad)
    // Pero es más fácil: ¿El stock restante (productosCargados.stock) es > 0?
    
    // Tu lógica original:
    // if (productoCarrito.cantidad >= stockDisponible) {
    
    // Nueva lógica (más simple):
    if (stockDisponible <= 0) {
        mostrarNotificacion(`No hay más stock disponible para "${productoCarrito.nombre}".`, 'error');
        return;
    }

    productoCarrito.cantidad = (productoCarrito.cantidad || 1) + 1;
    guardarCarrito();
    renderizarCarrito();
    calcularTotal(); // Actualiza total, localStorage y header

    // Actualizar stock en Firebase (RESTA stock)
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
        calcularTotal(); // Actualiza total, localStorage y header

        // Actualizar stock en Firebase (SUMA stock)
        actualizarStockFirebase(productoCarrito.id, 1);
    } else {
        // Si la cantidad es 1, disminuir significa eliminar
        eliminarDelCarrito(index);
    }
}

/**
 * Elimina un producto del carrito
 */
function eliminarDelCarrito(index) {
    if (index < 0 || index >= carrito.length) return; // Validación

    const productoEliminado = carrito[index];
    const cantidadRestaurar = productoEliminado.cantidad || 1;

    // Elimina del array local
    carrito.splice(index, 1);

    guardarCarrito();
    renderizarCarrito();
    calcularTotal(); // Actualiza total, localStorage y header
    mostrarNotificacion(`"${productoEliminado.nombre}" eliminado del carrito`);

    // Actualizar stock en Firebase (SUMA stock)
    actualizarStockFirebase(productoEliminado.id, cantidadRestaurar);
}

/**
 * Calcula el total del carrito y lo guarda en localStorage
 */
function calcularTotal() {
    const total = carrito.reduce((sum, producto) => {
        return sum + ((producto.precio || 0) * (producto.cantidad || 1));
    }, 0);

    // Actualiza el elemento en la página del carrito (si existe)
    const totalCarritoElement = document.getElementById('totalCarrito');
    if (totalCarritoElement) {
        totalCarritoElement.textContent = total.toLocaleString('es-CL');
    }

    // --- ¡MODIFICACIÓN IMPORTANTE! ---
    // Guarda el total calculado en localStorage para que otras páginas lo lean
    localStorage.setItem('cartTotal', total);

    // Actualiza el header (usará el valor recién guardado en localStorage)
    actualizarHeaderCart();
    // --- FIN MODIFICACIÓN ---
}


/**
 * Guarda el carrito (lista de productos) en localStorage
 */
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    calcularTotal(); // Asegura que el total se recalcule y guarde cada vez que cambia el carrito
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
        // Antes de vaciar, restaura el stock de todos los productos
        const restaurarPromises = carrito.map(producto => {
            return actualizarStockFirebase(producto.id, producto.cantidad || 1);
        });

        // Espera a que todas las actualizaciones de stock terminen
        Promise.all(restaurarPromises).then(() => {
            carrito = []; // Vacía el carrito local
            guardarCarrito(); // Guarda el carrito vacío (y recalcula total a 0)
            renderizarCarrito(); // Actualiza la vista
            mostrarNotificacion('Carrito limpiado y stock restaurado');
        }).catch(error => {
            console.error("Error al restaurar stock al limpiar carrito:", error);
            mostrarNotificacion("Error al limpiar el carrito, el stock podría no haberse restaurado.", 'error');
            // Opcionalmente, podrías decidir no limpiar el carrito si falla la restauración de stock
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
    // Guarda el carrito una última vez por si acaso
    guardarCarrito();
    window.location.href = 'checkout.html'; // Asegúrate que esta es la página correcta
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

    // Pequeña animación de fade-in y slide-in
    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateX(0)';
    }, 10);


    setTimeout(() => {
         // Animación fade-out y slide-out
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateX(100%)';
        // Espera a que termine la animación para eliminar
        setTimeout(() => {
            if (notificacion.parentNode) {
                 notificacion.remove();
            }
        }, 300);
    }, 3000); // Duración de la notificación
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

     // --- INICIO MODIFICACIÓN ---
     // Eventos para botones de añadir en sección de ofertas (¡YA LO TENÍAS!)
     // Esto funcionará perfectamente con el HTML que genera 'renderizarProductosOferta'
    const contenedorOfertas = document.getElementById('productosOferta');
    if (contenedorOfertas) {
        contenedorOfertas.addEventListener('click', function(event) {
            
            // Busca el botón aunque el clic sea en un hijo (ej. el texto del botón)
            const boton = event.target.closest('.btn-agregar-oferta'); 
            
            if (boton) { // Si se hizo clic en un botón de agregar
                const productId = boton.getAttribute('data-id');
                if (productId) {
                    agregarProductoAlCarrito(productId);
                }
            }
        });
    }
    // --- FIN MODIFICACIÓN ---
}

// Hacer funciones cruciales disponibles globalmente para los botones inline (onclick)
// Es mejor usar addEventListener, pero si ya usas onclick, esto es necesario.
window.aumentarCantidad = aumentarCantidad;
window.disminuirCantidad = disminuirCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;