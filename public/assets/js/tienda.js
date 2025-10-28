// js/tienda.js
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Seleccionar todos los botones de "Añadir al carrito"
    const botonesAgregar = document.querySelectorAll('.btn-add-cart');
    const toast = document.getElementById('toastNotification');

    // 2. Función para mostrar la notificación
    function showToast() {
        if (!toast) return; // Si no existe el elemento, no hace nada
        
        toast.classList.add('show');
        
        // Oculta la notificación después de 2.5 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // 3. Función principal: Agregar al carrito
    function agregarAlCarrito(evento) {
        const boton = evento.target;
        
        // Recolectamos los datos del producto desde los atributos 'data-' del botón
        const producto = {
            id: boton.dataset.id,
            nombre: boton.dataset.nombre,
            precio: parseInt(boton.dataset.precio, 10),
            imgSrc: boton.dataset.imgSrc,
            cantidad: 1 
        };

        // Obtenemos el carrito actual de localStorage (o creamos uno vacío)
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // Verificamos si el producto ya está en el carrito
        const productoExistenteIndex = carrito.findIndex(item => item.id === producto.id);

        if (productoExistenteIndex > -1) {
            // Si ya existe, solo aumentamos la cantidad
            carrito[productoExistenteIndex].cantidad++;
        } else {
            // Si es un producto nuevo, lo agregamos al arreglo
            carrito.push(producto);
        }

        // Guardamos el carrito actualizado de vuelta en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // Mostramos la notificación
        showToast();
    }

    // 4. Asignamos el evento 'click' a todos los botones
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });
});