/* ==========================================
 * ARCHIVO: js/global-cart.js
 * - Se encarga de actualizar el botón del carrito en el header.
 * - Es llamado por loadHeader.js después de que el header se carga.
 * ==========================================
*/

/**
 * Formatea un número como moneda chilena (CLP).
 * @param {number | string} valor - El número a formatear.
 * @returns {string} El valor formateado como moneda.
 */
function formatearMoneda(valor) {
    const numero = Number(valor);
    if (isNaN(numero)) return "$0";
    return new Intl.NumberFormat('es-CL').format(numero);
}

function actualizarHeaderCartGlobal() {
    const total = localStorage.getItem('cartTotal') || 0;
    const cartButton = document.getElementById('header-cart-button');
    if (cartButton) {
        cartButton.textContent = `🛒 Carrito ${formatearMoneda(total)}`;
    }
}