export function formatearMoneda(valor) {
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
export function parsearMoneda(texto) {
        // Elimina todo lo que no sea un dígito numérico.
        const numeroLimpio = texto.replace(/[^0-9]/g, '');
        return parseInt(numeroLimpio, 10);
    }
    
    /**
     * Función principal para calcular y actualizar los totales del carrito.
     * Lee cada producto, multiplica su precio por la cantidad y suma los resultados.
     */
export function actualizarTotales() {
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