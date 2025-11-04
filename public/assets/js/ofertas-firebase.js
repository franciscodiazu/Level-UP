document.addEventListener("DOMContentLoaded", () => {
    // --- Configuración de Firebase (Copiada de tu catalogo.js) ---
    const firebaseConfig = {
        apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs", 
        authDomain: "tienda-level-up.firebaseapp.com",
        projectId: "tienda-level-up"
    };

    // Inicializar Firebase
    if (!firebase.apps.length) { // Evita reinicializar si ya lo hizo otro script
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // --- Selectores del DOM ---
    const gridContenedor = document.getElementById('ofertas-product-grid');
    
    // --- Estado del Carrito y Array de Productos ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || []; 
    let productosEnOferta = []; // Array local para esta página

    // --- Funciones de Ayuda (copiadas de tu catalogo.js) ---

    /**
     * Formatea un número como moneda chilena (CLP).
     */
    function formatearPrecio(precio) {
        // Asegurarse de que el precio sea un número antes de formatear
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
     * Actualiza el stock en Firebase (decrementa).
     */
    async function actualizarStockFirebase(productId, cantidad) {
      try {
          const productoRef = db.collection("producto").doc(productId);
          const productoDoc = await productoRef.get();
          
          if (productoDoc.exists) {
              const stockActual = productoDoc.data().stock;
              const nuevoStock = stockActual - cantidad;
              await productoRef.update({ stock: nuevoStock });
              console.log(`Stock actualizado: ${productoDoc.data().nombre} - Nuevo stock: ${nuevoStock}`);
          }
      } catch (error) {
          console.error("Error actualizando stock en Firebase:", error);
      }
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
            // 1. Definir la consulta a Firebase
            const productosRef = db.collection("producto");
            
            // 2. Buscar productos donde "precioAnterior" sea mayor que 0
            const q = productosRef.where("precioAnterior", ">", 0);
            
            // 3. Ejecutar la consulta
            const snapshot = await q.get();
            
            if (snapshot.empty) {
                gridContenedor.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No hay ofertas disponibles en este momento.</p>';
                return;
            }
            
            // 4. Limpiar el grid y preparar para mostrar productos
            gridContenedor.innerHTML = ''; 
            
            snapshot.forEach(doc => {
                const producto = { id: doc.id, ...doc.data() };
                productosEnOferta.push(producto); // Llenamos nuestro array local
                
                // 5. Lógica de precios de oferta (Usa los estilos CSS que ya existen)
                const precioHTML = `
                    <div>
                        <span class="product-price-old">${formatearPrecio(producto.precioAnterior)}</span>
                        <span class="product-price-offer">${formatearPrecio(producto.precio)} CLP</span>
                    </div>
                `;

                // 6. Crear la tarjeta del producto
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
                    ${precioHTML} <p class="producto-stock" style="font-size: 0.9em; color: #aaa;">Stock: ${producto.stock}</p>
                    <button class="btn btn-primary btn-agregar" data-id="${producto.id}">
                      Añadir al carrito
                    </button>
                `;
                gridContenedor.appendChild(article);
            });
            
            // 7. Añadir eventos a los botones
            document.querySelectorAll('.btn-agregar').forEach(btn => { 
              btn.addEventListener('click', function() { 
                const productId = this.dataset.id; 
                agregarAlCarrito(productId);
              });
            });

        } catch (error) {
            console.error("Error al cargar los productos en oferta:", error);
            gridContenedor.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Error al cargar las ofertas. Revise la consola (F12).</p>';
        }
    }

    /**
     * Añade un producto al carrito (Usa el array local 'productosEnOferta')
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
            actualizarStockFirebase(productId, 1);
            mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
            
            if (typeof window.actualizarHeaderCartGlobal === 'function') {
                window.actualizarHeaderCartGlobal();
            }
        }
    }

    // --- Ejecución Inicial ---
    cargarOfertas();
});