/* ==========================================
 * ARCHIVO: js/tienda.js
 * ==========================================
 * OBJETIVO: Manejar los botones "Añadir al carrito"
 * de la página catalogo.html y actualizar el TOTAL.
*/

document.addEventListener('DOMContentLoaded', function() {
    
    // Selecciona TODOS los botones de añadir al carrito
    const botonesAgregar = document.querySelectorAll('.btn-add-cart');
    
    // Añade un "escuchador" de clics a cada botón
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function() {
            // 'this' se refiere al botón que fue clickeado
            const producto = {
                id: this.dataset.id,
                nombre: this.dataset.nombre,
                // Aseguramos que el precio sea un número
                precio: parseInt(this.dataset.precio, 10) || 0,
                // Mapeamos 'data-img-src' a 'imagen' para que coincida con tu carrito.js
                imagen: this.dataset.imgSrc,
                cantidad: 1 // Siempre se añade 1
            };

            // 1. Obtener la lista actual del carrito desde localStorage
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

            // 2. Verificar si el producto ya existe
            const productoExistente = carrito.find(item => item.id === producto.id);

            if (productoExistente) {
                // Si ya existe, solo aumenta la cantidad
                productoExistente.cantidad++;
            } else {
                // Si es nuevo, lo añade a la lista
                carrito.push(producto);
            }

            // 3. Guardar la LISTA de productos actualizada en localStorage
            localStorage.setItem('carrito', JSON.stringify(carrito));

            // --- ¡ESTA ES LA PARTE IMPORTANTE! ---
            // 4. Actualizar el TOTAL en localStorage
            
            // Obtener el total actual guardado
            let totalActual = parseInt(localStorage.getItem('cartTotal'), 10) || 0;
            
            // Sumarle el precio del producto nuevo
            totalActual += producto.precio;
            
            // Guardar el nuevo total
            localStorage.setItem('cartTotal', totalActual);

            // 5. Actualizar el botón del header INMEDIATAMENTE
            // (Esta función la creamos en global-cart.js)
            if (typeof window.actualizarHeaderCartGlobal === 'function') {
                window.actualizarHeaderCartGlobal();
            } else {
                console.error("La función global 'actualizarHeaderCartGlobal' no se encuentra. ¿Incluiste global-cart.js?");
            }

            // 6. Mostrar la notificación (tu HTML ya la tiene)
            mostrarNotificacionToast(`"${producto.nombre}" agregado al carrito`);
        });
    });
});

/**
 * Muestra la notificación toast (basado en el HTML de tu catalogo.html)
 */
function mostrarNotificacionToast(mensaje) {
    const notificacion = document.getElementById('toastNotification');
    if (!notificacion) return;

    notificacion.textContent = mensaje;
    notificacion.classList.add('show'); // Muestra la notificación

    // Oculta la notificación después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
    }, 3000);
}