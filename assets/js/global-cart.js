/* ==========================================
 * ARCHIVO NUEVO: js/global-cart.js
 * ==========================================
 * OBJETIVO: Leer el total de localStorage y actualizar
 * el header en TODAS las páginas.
*/

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
        currency: 'CLP',
        minimumFractionDigits: 0, // Sin decimales
        maximumFractionDigits: 0 // Sin decimales
    }).format(numero);
}

/**
 * Función para leer un texto de moneda (ej: "$549.990") y convertirlo a un número.
 * @param {string} texto - El texto con formato de moneda.
 * @returns {number} El valor numérico.
 */
function parsearMoneda(texto) {
    if (typeof texto !== 'string') return 0;
    const numeroLimpio = texto.replace(/[^0-9]/g, '');
    return parseInt(numeroLimpio, 10) || 0;
}

/**
 * ESTA ES LA FUNCIÓN GLOBAL que tu carrito.js intenta llamar.
 * Lee de localStorage y actualiza el botón del header.
 */
window.actualizarHeaderCartGlobal = function() {
    const cartButton = document.getElementById('header-cart-button');
    if (!cartButton) {
        // Si no hay botón en esta página (poco probable), no hace nada.
        return; 
    }

    // Lee el total guardado en localStorage. Si no hay nada, es 0.
    const totalGuardado = parseInt(localStorage.getItem('cartTotal'), 10) || 0;
    
    // Actualiza el texto del botón del header.
    cartButton.textContent = 'Carrito ' + formatearMoneda(totalGuardado);
}

// ---- EJECUCIÓN INICIAL ----
// Se ejecuta cuando CUALQUIER página (index, catalogo, etc.) termina de cargar.
document.addEventListener('DOMContentLoaded', function() {
    // Llama a la función global para asegurar que el header 
    // muestre el total correcto apenas se carga la página.
    window.actualizarHeaderCartGlobal();
});