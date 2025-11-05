/* ==========================================
 * ARCHIVO: js/global-cart.js
 * (Versión MEJORADA con tu sugerencia)
 * ==========================================
*/

/**
 * Formatea un número como moneda chilena (CLP).
 */
function formatearMoneda(valor) {
    const numero = Number(valor);
    if (isNaN(numero)) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(0);
    }
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(numero);
}

/**
 * ¡FUNCIÓN ACTUALIZADA!
 * Ahora lee la LISTA del carrito, calcula el TOTAL, 
 * guarda el TOTAL, y actualiza el HEADER.
 */
function actualizarHeaderCartGlobal() {
    
    // 1. LEER LA LISTA DE PRODUCTOS (no el total)
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // 2. CALCULAR EL TOTAL (Lógica centralizada aquí)
    const total = carrito.reduce((sum, producto) => {
        return sum + ((producto.precio || 0) * (producto.cantidad || 1));
    }, 0);

    // 3. GUARDAR EL TOTAL CALCULADO (¡Muy importante!)
    localStorage.setItem('cartTotal', total);
    
    // 4. ACTUALIZAR EL BOTÓN DEL HEADER
    const cartButton = document.getElementById('header-cart-button');
    if (cartButton) {
        cartButton.textContent = `🛒 Carrito ${formatearMoneda(total)}`;
    }
}

// --- HACER PÚBLICA LA FUNCIÓN ---
// Esto permite que 'ofertas-firebase.js', 'carrito.js' y 'loadHeader.js' la llamen.
window.actualizarHeaderCartGlobal = actualizarHeaderCartGlobal;

// NOTA: No usamos 'DOMContentLoaded' aquí, porque 'loadHeader.js'
// ya se encarga de llamar a esta función cuando el header está listo.