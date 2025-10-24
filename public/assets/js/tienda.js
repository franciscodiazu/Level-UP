// js/tienda.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("tienda.js cargado y ejecutándose."); // Mensaje para verificar carga

    const botonesAgregar = document.querySelectorAll('.btn-add-cart');
    const toast = document.getElementById('toastNotification');

    console.log(`Encontrados ${botonesAgregar.length} botones para añadir.`); // Verifica si encuentra botones
    if (!toast) {
        console.error("Elemento de notificación con ID 'toastNotification' NO encontrado.");
    }

    function showToast() {
        if (!toast) return; 
        console.log("Mostrando notificación toast."); // Verifica si se llama
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500); 
    }

    function agregarAlCarrito(evento) {
        console.log("Botón 'Añadir al carrito' clickeado."); // Verifica clic
        const boton = evento.target;
        
        // Verifica que los data-attributes existan
        if (!boton.dataset.id || !boton.dataset.nombre || !boton.dataset.precio || !boton.dataset.imgSrc) {
            console.error("ERROR: Faltan data-attributes en el botón:", boton);
            alert("Error al obtener datos del producto. Revisa la consola.");
            return;
        }

        const producto = {
            id: boton.dataset.id,
            nombre: boton.dataset.nombre,
            precio: parseInt(boton.dataset.precio, 10),
            // CORRECCIÓN IMPORTANTE DE RUTA: Guarda la ruta tal cual está en catálogo.
            // carrito.js se encargará de ajustarla si es necesario.
            imgSrc: boton.dataset.imgSrc, 
            cantidad: 1 
        };
        console.log("Producto a agregar:", producto); // Muestra qué se va a guardar

        // Validar precio
        if (isNaN(producto.precio)) {
             console.error("ERROR: El precio no es un número válido:", boton.dataset.precio);
             alert("Error: El precio del producto no es válido.");
             return;
        }

        try {
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            console.log("Carrito actual (antes de añadir):", carrito);

            const productoExistenteIndex = carrito.findIndex(item => item.id === producto.id);

            if (productoExistenteIndex > -1) {
                console.log("Producto ya existe, aumentando cantidad.");
                carrito[productoExistenteIndex].cantidad++;
            } else {
                console.log("Producto nuevo, añadiendo al carrito.");
                carrito.push(producto);
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
            console.log("Carrito guardado en localStorage:", JSON.parse(localStorage.getItem('carrito'))); // Verifica guardado
            
            showToast();
            
        } catch (error) {
            console.error("Error al procesar el carrito en localStorage:", error);
            alert("Hubo un error al guardar el carrito. Revisa la consola.");
        }
    }

    if (botonesAgregar.length > 0) {
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', agregarAlCarrito);
        });
        console.log("Listeners de clic añadidos a los botones.");
    } else {
        console.warn("No se encontraron botones con la clase '.btn-add-cart'. Asegúrate de que existan en catalogo.html.");
    }
});