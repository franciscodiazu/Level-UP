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
    
    // --- Carrito (copiado de tu catalogo.js) ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || []; 

    // --- Funciones de Ayuda (copiadas de tu catalogo.js) ---

    /**
     * Formatea un número como moneda chilena (CLP).
     */
    function formatearPrecio(precio) {
        return new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP' 
        }).format(precio);
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
        if (!gridContenedor) return; // Salir si no estamos en la página correcta
        
        gridContenedor.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Cargando ofertas...</p>';

        try {
            // 1. Definir la consulta a Firebase
            const productosRef = db.collection("producto");
            
            // 2. ¡LA MAGIA! Buscar productos donde "precioAnterior" sea mayor que 0
            const q = productosRef.where("precioAnterior", ">", 0);
            
            // 3. Ejecutar la consulta
            const snapshot = await q.get();
            
            if (snapshot.empty) {
                gridContenedor.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No hay ofertas disponibles en este momento.</p>';
                return;
            }
            
            // 4. Limpiar el grid y mostrar los productos
            gridContenedor.innerHTML = ''; 
            snapshot.forEach(doc => {
                const producto = { id: doc.id, ...doc.data() };
                
                // 5. ¡Lógica de precios de oferta!
                // (Necesitarás los estilos de la Parte 3 para que esto se vea bien)
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
            
            // 7. Añadir eventos a los botones (copiado de tu catalogo.js)
            document.querySelectorAll('.btn-agregar').forEach(btn => { 
              btn.addEventListener('click', function() { 
                const productId = this.dataset.id; 
                agregarAlCarrito(productId, snapshot.docs); // Pasamos los docs para encontrar el producto
              });
            });

        } catch (error) {
            console.error("Error al cargar los productos en oferta:", error);
            gridContenedor.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Error al cargar las ofertas. Intenta más tarde.</p>';
        }
    }

    /**
     * Añade un producto al carrito (copiado de tu catalogo.js)
     */
    function agregarAlCarrito(productId, productosDocs) { 
        // Encontramos el producto desde los documentos de Firebase
        const doc = productosDocs.find(d => d.id === productId);
        if (!doc) return;
        
        const producto = { id: doc.id, ...doc.data() };
        
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
            
            // Actualizamos el contador global del header
            if (typeof window.actualizarHeaderCartGlobal === 'function') {
                window.actualizarHeaderCartGlobal();
            }
        }
    }

    // --- Ejecución Inicial ---
    cargarOfertas();
});