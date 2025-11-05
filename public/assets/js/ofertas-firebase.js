document.addEventListener("DOMContentLoaded", () => {
    // --- Configuración de Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs", 
        authDomain: "tienda-level-up.firebaseapp.com",
        projectId: "tienda-level-up"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // --- Selectores del DOM ---
    const gridContenedor = document.getElementById('ofertas-product-grid');
    
    // --- Estado del Carrito y Array de Productos ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || []; 
    let productosEnOferta = []; // Array local para esta página

    
    // ==================================================================
    //  INICIO DE FUNCIONES
    // ==================================================================

    /**
     * Formatea un número como moneda chilena (CLP).
     */
    function formatearPrecio(precio) {
        const numericPrice = Number(precio) || 0;
        return new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP' 
        }).format(numericPrice);
    }

    /**
     * Muestra una notificación flotante.
     */
    function mostrarNotificacion(mensaje, tipo = 'success') { 
        const notificacion = document.createElement('div'); 
        const backgroundColor = tipo === 'success' ? '#28a745' : '#dc3545';
        notificacion.style.cssText = `
          position: fixed; top: 100px; right: 20px; background: ${backgroundColor}; 
          color: white; padding: 15px 20px; border-radius: 5px; z-index: 10000;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2); font-weight: 600;
        `;
        notificacion.textContent = mensaje; 
        document.body.appendChild(notificacion); 
        setTimeout(() => { notificacion.remove(); }, 3000);
    }

    /**
     * Lógica principal para cargar SOLO productos en oferta
     */
    async function cargarOfertas() {
        if (!gridContenedor) {
            console.error("Error: No se encontró el contenedor 'ofertas-product-grid'");
            return;
        }
        gridContenedor.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Cargando ofertas...</p>';

        try {
            const productosRef = db.collection("producto");
            const q = productosRef.where("precioAnterior", ">", 0);
            const snapshot = await q.get();
            
            if (snapshot.empty) {
                gridContenedor.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No hay ofertas disponibles en este momento.</p>';
                return;
            }
            
            // Limpia el array local
            productosEnOferta = []; 
            snapshot.forEach(doc => {
                productosEnOferta.push({ id: doc.id, ...doc.data() });
            });
            
            // Llama a la función que "dibuja" los productos
            renderizarGridOfertas(); 

        } catch (error) {
            console.error("Error al cargar los productos en oferta:", error);
            gridContenedor.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Error al cargar las ofertas. Revise la consola (F12).</p>';
        }
    }
    
    /**
     * NUEVA FUNCIÓN: Dibuja las tarjetas en el HTML.
     * Lee los datos del array 'productosEnOferta'.
     */
    function renderizarGridOfertas() {
        if (!gridContenedor) return;
        
        // Limpiar el grid
        gridContenedor.innerHTML = ''; 
        
        productosEnOferta.forEach(producto => {
            const precioHTML = `
                <div>
                    <span class="product-price-old">${formatearPrecio(producto.precioAnterior)}</span>
                    <span class="product-price-offer">${formatearPrecio(producto.precio)} CLP</span>
                </div>
            `;

            const article = document.createElement('article');
            article.className = 'product-card';
            article.innerHTML = `
                <a href="producto-detalle.html?id=${producto.id}" style="text-decoration: none;">
                    <img src="${producto.imagen || 'https://placehold.co/400x200/333/FFF?text=Sin+Imagen'}" 
                         alt="${producto.nombre}" 
                         class="producto-imagen"
                         onerror="this.src='https://placehold.co/400x200/cccccc/969696?text=Error+Cargando'">
                    <h3>${producto.nombre || 'Sin nombre'}</h3>
                </a>
                ${precioHTML} 
                <p class="producto-stock" style="font-size: 0.9em; color: #aaa;">Stock: ${producto.stock}</p>
                <button class="btn btn-primary btn-agregar" data-id="${producto.id}">
                  Añadir al carrito
                </button>
            `;
            gridContenedor.appendChild(article);
        });
        
        // Re-asignar eventos a los nuevos botones
        document.querySelectorAll('.btn-agregar').forEach(btn => { 
            btn.addEventListener('click', function() { 
                const productId = this.dataset.id; 
                agregarAlCarrito(productId);
            });
        });
    }


    /**
     * Añade un producto al carrito
     */
    function agregarAlCarrito(productId) { 
        const producto = productosEnOferta.find(p => p.id === productId); 
        if (!producto) return; 
        
        const stockActual = producto.stock !== undefined ? producto.stock : 100;
        if (producto && stockActual <= 0) {
            mostrarNotificacion('Producto sin stock disponible', 'error');
            return;
        }
        
        if (producto) { 
            const productoExistente = carrito.find(item => item.id === productId);
            
            if (productoExistente) {
                productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
            } else {
                carrito.push({ ...producto, cantidad: 1 });
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito)); 
            
            // --- CORRECCIÓN 1: BUG ARREGLADO ---
            // Llamamos con -1 para RESTAR stock (antes tenías 1)
            actualizarStockFirebase(productId, -1); 
            
            mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
            
            if (typeof window.actualizarHeaderCartGlobal === 'function') {
                window.actualizarHeaderCartGlobal();
            }
        }
    }
    
    /**
     * Actualiza el stock en Firebase Y EN LA PÁGINA ACTUAL.
     * @param {string} productId - ID del producto
     * @param {number} cantidadASumar - El número a sumar (ej: -1 para restar)
     */
    async function actualizarStockFirebase(productId, cantidadASumar) {
        try {
            const productoRef = db.collection("producto").doc(productId);
            const productoDoc = await productoRef.get();
            
            if (productoDoc.exists) {
                const stockActual = productoDoc.data().stock;
                const nuevoStock = stockActual + cantidadASumar; // Suma el número (que es -1)
                
                // Asegura que el stock no sea negativo
                const stockFinal = Math.max(0, nuevoStock); 
                
                await productoRef.update({ stock: stockFinal });
                
                // --- CORRECCIÓN 2: ACTUALIZAR DATOS LOCALES Y REDIBUJAR ---
                // 1. Actualiza el stock en el array local 'productosEnOferta'
                const productoLocal = productosEnOferta.find(p => p.id === productId);
                if (productoLocal) {
                    productoLocal.stock = stockFinal;
                }
                
                // 2. Vuelve a dibujar el grid con el stock actualizado
                renderizarGridOfertas();
                // --- FIN DE LA CORRECCIÓN ---
            }
        } catch (error) {
            console.error("Error actualizando stock en Firebase:", error);
        }
    }

    // --- Ejecución Inicial ---
    cargarOfertas();
});