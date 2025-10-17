// Espera a que todo el contenido del HTML se cargue antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', function() {

    // Seleccionar todos los elementos del DOM que necesitaremos manipular.
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElem = document.getElementById('subtotal');
    const totalElem = document.getElementById('total');
    
    // Si no estamos en la página del carrito, estos elementos no existirán. Salimos para evitar errores.
    if (!cartItemsContainer) {
        return;
    }

    // Costo de envío fijo. Podría venir de una configuración o API en un futuro.
    const costoEnvio = 4990;

    /**
     * Función para formatear un número como moneda chilena (CLP).
     * Ejemplo: 599980 se convierte en "$599.980".
     * @param {number} valor - El número a formatear.
     * @returns {string} El valor formateado como moneda.
     */
    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP' 
        }).format(valor);
    }

    /**
     * Función para leer un texto de moneda (ej: "$549.990 CLP") y convertirlo a un número.
     * @param {string} texto - El texto con formato de moneda.
     * @returns {number} El valor numérico.
     */
    function parsearMoneda(texto) {
        // Elimina todo lo que no sea un dígito numérico.
        const numeroLimpio = texto.replace(/[^0-9]/g, '');
        return parseInt(numeroLimpio, 10);
    }
    
    /**
     * Función principal para calcular y actualizar los totales del carrito.
     * Lee cada producto, multiplica su precio por la cantidad y suma los resultados.
     */
    function actualizarTotales() {
        let subtotal = 0;
        
        // Obtener todos los productos que están actualmente en el carrito.
        const items = cartItemsContainer.querySelectorAll('.cart-item');
        
        // Si no hay productos, mostramos el carrito vacío y ponemos los totales en cero.
        if (items.length === 0) {
            subtotalElem.textContent = formatearMoneda(0);
            totalElem.textContent = formatearMoneda(0); // El total sin productos es 0.
            cartItemsContainer.innerHTML = '<p class="cart-empty">Tu carrito está vacío. <a href="productos.html">¡Añade productos!</a></p>';
            return;
        }

        // Recorrer cada item del carrito para sumar sus precios.
        items.forEach(item => {
            const precioTexto = item.querySelector('.cart-item-price').textContent;
            const cantidad = parseInt(item.querySelector('.cart-item-quantity').value, 10);
            const precio = parsearMoneda(precioTexto);
            
            // Sumamos al subtotal el resultado de (precio unitario * cantidad).
            subtotal += precio * cantidad;
        });

        // Calculamos el total final sumando el envío.
        const total = subtotal + costoEnvio;

        // Actualizamos el HTML con los nuevos valores formateados.
        subtotalElem.textContent = formatearMoneda(subtotal);
        totalElem.textContent = formatearMoneda(total);
    }

    /**
     * Se utiliza la "delegación de eventos" en el contenedor principal del carrito.
     * Esto es más eficiente que añadir un 'listener' a cada botón individualmente.
     */

    // Escuchador para los clics (ej: botón de eliminar).
    cartItemsContainer.addEventListener('click', function(evento) {
        // Comprobar si el elemento que originó el clic tiene la clase 'btn-remove'.
        if (evento.target.classList.contains('btn-remove')) {
            // .closest() encuentra el ancestro más cercano que sea un '.cart-item'.
            const itemParaEliminar = evento.target.closest('.cart-item');
            if (itemParaEliminar) {
                itemParaEliminar.remove(); // Elimina el elemento del producto del DOM.
                actualizarTotales(); // Vuelve a calcular todo.
            }
        }
    });

    // Escuchador para los cambios en los inputs (ej: cambiar la cantidad).
    cartItemsContainer.addEventListener('input', function(evento) {
        // Comprobar si el cambio ocurrió en un campo de cantidad.
        if (evento.target.classList.contains('cart-item-quantity')) {
            // Si cambia la cantidad, vuelve a calcular todo.
            actualizarTotales();
        }
    });

    // --- Ejecución Inicial ---
    // Llama a la función una vez al cargar la página para calcular los totales de los productos de ejemplo.
    actualizarTotales();
});