// Configuración de Firebase (solicitada por el usuario)
const firebaseConfig = {
  apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
  authDomain: "tienda-level-up.firebaseapp.com",
  projectId: "tienda-level-up"
};

// --- LÓGICA DEL CARRITO ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("carrito.js cargado y ejecutándose."); // Verifica carga

    // Seleccionar elementos
    const tablaBody = document.getElementById('tablaCarritoBody');
    const totalElem = document.getElementById('totalCarrito');
    const btnLimpiar = document.getElementById('btnLimpiarCarrito');
    const btnComprar = document.getElementById('btnComprarAhora'); 

    // Verificación crucial de elementos
    if (!tablaBody) console.error("Elemento 'tablaCarritoBody' NO encontrado.");
    if (!totalElem) console.error("Elemento 'totalCarrito' NO encontrado.");
    if (!btnLimpiar) console.error("Botón 'btnLimpiarCarrito' NO encontrado.");
    if (!btnComprar) console.error("Botón 'btnComprarAhora' NO encontrado.");

    // Salir si falta algún elemento esencial
    if (!tablaBody || !totalElem || !btnLimpiar || !btnComprar) {
        alert("Error crítico: Faltan elementos HTML esenciales para el carrito. Revisa la consola.");
        return;
    }

    function formatearMoneda(valor) {
        const numero = Number(valor);
        if (isNaN(numero)) {
            console.warn("Intentando formatear valor no numérico:", valor);
            return "$?"; 
        }
        return new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP',
            minimumFractionDigits: 0 
        }).format(numero);
    }

    function actualizarTotalGeneral() {
        console.log("Actualizando total general...");
        try {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            let total = 0;
            
            carrito.forEach(producto => {
                const precio = Number(producto.precio) || 0;
                const cantidad = Number(producto.cantidad) || 0;
                if (precio === 0) console.warn(`Producto ${producto.id} tiene precio 0 o inválido.`);
                if (cantidad === 0) console.warn(`Producto ${producto.id} tiene cantidad 0 o inválida.`);
                total += precio * cantidad;
            });
            
            totalElem.textContent = total.toLocaleString('es-CL'); 
            console.log("Total general calculado:", total);
        } catch (error) {
            console.error("Error al leer/calcular total desde localStorage:", error);
        }
    }

    function actualizarFila(inputElement) {
        console.log("Actualizando fila por cambio de cantidad...");
        const tr = inputElement.closest('tr');
        if (!tr) {
            console.error("No se pudo encontrar la fila (tr) para actualizar.");
            return;
        }
        
        const id = tr.dataset.id;
        let nuevaCantidad = parseInt(inputElement.value, 10);
        
        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
            console.warn(`Cantidad inválida (${inputElement.value}) para producto ${id}. Estableciendo a 1.`);
            nuevaCantidad = 1;
            inputElement.value = 1; 
        }

        try {
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            let precioUnitario = 0;
            let productoEncontrado = false;
            
            const carritoActualizado = carrito.map(producto => {
                if (producto.id === id) {
                    producto.cantidad = nuevaCantidad;
                    precioUnitario = Number(producto.precio) || 0;
                    productoEncontrado = true;
                }
                return producto;
            });
            
            if (!productoEncontrado) {
                 console.error(`No se encontró el producto con id ${id} en el carrito de localStorage al actualizar fila.`);
                 return;
            }

            localStorage.setItem('carrito', JSON.stringify(carritoActualizado));
            console.log(`Cantidad actualizada a ${nuevaCantidad} para producto ${id} en localStorage.`);

            const subtotalCell = tr.querySelector('.subtotal-celda');
            if (subtotalCell) {
                subtotalCell.textContent = formatearMoneda(precioUnitario * nuevaCantidad);
            } else {
                 console.error("No se encontró la celda de subtotal (.subtotal-celda) en la fila.");
            }

            actualizarTotalGeneral();
        } catch (error) {
            console.error("Error al actualizar fila en localStorage:", error);
        }
    }

    function eliminarProducto(botonElement) {
        console.log("Intentando eliminar producto...");
        const tr = botonElement.closest('tr');
         if (!tr) {
             console.error("No se pudo encontrar la fila (tr) para eliminar.");
             return;
         }
        const id = tr.dataset.id;
        console.log("ID del producto a eliminar:", id);

        try {
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const carritoAntes = carrito.length;
            
            const carritoActualizado = carrito.filter(producto => producto.id !== id);
            const carritoDespues = carritoActualizado.length;

            if (carritoAntes === carritoDespues) {
                console.warn(`El producto con ID ${id} no se encontró en localStorage para eliminar.`);
            } else {
                 console.log(`Producto ${id} eliminado de localStorage.`);
            }

            localStorage.setItem('carrito', JSON.stringify(carritoActualizado));
            
            cargarProductosDelCarrito(); // Recargar tabla
        } catch (error) {
             console.error("Error al eliminar producto de localStorage:", error);
        }
    }

    function cargarProductosDelCarrito() {
        console.log("Cargando productos del carrito desde localStorage...");
        try {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            console.log("Productos encontrados en localStorage:", carrito);
            
            tablaBody.innerHTML = ''; 

            if (carrito.length === 0) {
                console.log("Carrito vacío.");
                tablaBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px;">
                            Tu carrito está vacío. <a href="catalogo.html">¡Añade productos!</a>
                        </td>
                    </tr>
                `;
                btnLimpiar.disabled = true;
                btnComprar.disabled = true;
            } else {
                console.log(`Cargando ${carrito.length} productos en la tabla.`);
                btnLimpiar.disabled = false;
                btnComprar.disabled = false;
                
                carrito.forEach((producto, index) => {
                    const precio = Number(producto.precio) || 0;
                    const cantidad = Number(producto.cantidad) || 0;
                    const subtotal = precio * cantidad;
                    
                    // AJUSTE DE RUTA DE IMAGEN MÁS ROBUSTO:
                    // Asume que las rutas guardadas son como '../img/producto.jpg' (desde catalogo.html)
                    // y carrito.html está en la misma carpeta que catalogo.html.
                    // Si carrito.html estuviera en OTRA carpeta, habría que ajustar diferente.
                    let imgSrcCorrecta = producto.imgSrc; 
                    // No se necesita ajuste si carrito.html y catalogo.html están en la misma carpeta 'html'.
                    // Si estuvieran en carpetas diferentes, aquí ajustaríamos la ruta.
                    // Ejemplo: si carrito estuviera en raiz y catalogo en html:
                    // imgSrcCorrecta = producto.imgSrc.replace('../', 'assets/'); 
                    
                    console.log(`Producto ${index}: ID=${producto.id}, Nombre=${producto.nombre}, Precio=${precio}, Cant=${cantidad}, Subtotal=${subtotal}, Img=${imgSrcCorrecta}`);

                    const itemHTML = `
                        <tr data-id="${producto.id}">
                            <td><img src="${imgSrcCorrecta}" alt="${producto.nombre}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 4px;"></td>
                            <td>${producto.nombre}</td>
                            <td>${formatearMoneda(precio)}</td>
                            <td>
                                <input type="number" class="cart-item-quantity" value="${cantidad}" min="1" style="width: 60px; padding: 5px; text-align: center;">
                            </td>
                            <td class="subtotal-celda">${formatearMoneda(subtotal)}</td>
                            <td>
                                <button class="btn-remove" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 0.9em;">Eliminar</button>
                            </td>
                        </tr>
                    `;
                    tablaBody.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
            
            actualizarTotalGeneral();
        } catch (error) {
            console.error("Error fatal al cargar productos del carrito:", error);
             tablaBody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center; padding: 20px;">Error al cargar el carrito. Revisa la consola.</td></tr>`;
             btnLimpiar.disabled = true;
             btnComprar.disabled = true;
        }
    }

    // --- MANEJO DE EVENTOS ---

    tablaBody.addEventListener('click', function(evento) {
        if (evento.target.classList.contains('btn-remove')) {
            eliminarProducto(evento.target);
        }
    });

    tablaBody.addEventListener('input', function(evento) {
        if (evento.target.classList.contains('cart-item-quantity')) {
            actualizarFila(evento.target);
        }
    });
    
    btnLimpiar.addEventListener('click', function() {
        console.log("Botón 'Limpiar Carrito' clickeado.");
        if (confirm("¿Estás seguro de que quieres vaciar tu carrito?")) {
            console.log("Confirmado. Limpiando carrito...");
            try {
                localStorage.removeItem('carrito'); 
                console.log("Carrito eliminado de localStorage.");
                cargarProductosDelCarrito(); 
            } catch (error) {
                 console.error("Error al limpiar el carrito en localStorage:", error);
            }
        } else {
             console.log("Limpieza de carrito cancelada.");
        }
    });
    
    btnComprar.addEventListener('click', function() {
        console.log("Botón 'Comprar Ahora' clickeado.");
        alert("Procediendo a la compra... (Lógica de pago no implementada)");
        // Lógica de pago aquí
    });

    // --- EJECUCIÓN INICIAL ---
    cargarProductosDelCarrito(); 

});