/* ==========================================
 * ARCHIVO: js/catalogo.js
 * (Tu código 100% funcional + lógica de filtrado visual añadida)
 * ==========================================
*/
document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const dropdownCategorias = document.getElementById("dropdownCategorias");
  const cardsCategorias = document.getElementById("cardsCategorias");
  const productosGrid = document.getElementById("productosGrid");
  const tituloProductos = document.getElementById("tituloProductos");
  const buscador = document.getElementById("buscador");
  const btnBuscar = document.getElementById("btnBuscar");
  const carritoTotal = document.querySelector('.carrito-total');
  
  // ----- MODIFICACIÓN 1 -----
  // Cambiamos el ID para que coincida con el HTML que hicimos
  const btnVerTodos = document.getElementById("show-all-btn"); 
  // --------------------------

  const btnCarrito = document.querySelector('.btn-carrito');

  let productosGlobal = []; 
  let carrito = JSON.parse(localStorage.getItem('carrito')) || []; 
  let categoriaActiva = 'todos'; 

  // Configuración de Firebase
    const firebaseConfig = {
    // Tu API key está visible aquí. Por seguridad, deberías 
    // moverla a un lugar seguro en un proyecto real.
    apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs", 
    authDomain: "tienda-level-up.firebaseapp.com",
    projectId: "tienda-level-up"
};

  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // --- PEGA ESTA FUNCIÓN AQUÍ ---
  /**
   * Formatea un número como moneda chilena (CLP).
   * @param {number} precio - El número a formatear.
   * @returns {string} El precio formateado.
   */
  function formatearPrecio(precio) {
      // Asegurarse de que el precio sea un número antes de formatear
      const numericPrice = Number(precio) || 0;
      return new Intl.NumberFormat('es-CL', { 
          style: 'currency', 
          currency: 'CLP' 
      }).format(numericPrice);
  }
  // --- FIN DEL CÓDIGO A PEGAR ---

  // Inicializar la aplicación
  actualizarCarritoTotal();
  cargarProductos();

  // Función para cargar productos desde Firestore
  async function cargarProductos() {
    try {
      if (tituloProductos) {
          tituloProductos.textContent = "Cargando productos...";
      }
      
      const snapshot = await db.collection("producto").get(); 
      productosGlobal = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log("Productos cargados:", productosGlobal); 
      inicializarInterfaz(productosGlobal); 
      
    } catch (error) {
      console.error("Error cargando productos:", error);
      if (tituloProductos) {
          tituloProductos.textContent = "Error al cargar productos";
      }
      if (productosGrid) {
          productosGrid.innerHTML = "<p class'error'>No se pudieron cargar los productos. Intenta recargar la página.</p>";
      }
    }
  }

  // Inicializar la interfaz con categorías y productos
  function inicializarInterfaz(productos) {
    const categorias = obtenerCategoriasUnicas(productos);
    
    if (dropdownCategorias) {
        mostrarDropdownCategorias(categorias);
    }
    
    if (cardsCategorias) {
        mostrarCardsCategorias(categorias);
    }
    
    // ----- MODIFICACIÓN 2 -----
    // Cambiamos el estado inicial para que muestre "Todos"
    // Esto soluciona el bug de "Juegos de Mesa" siempre activo
    mostrarTodosLosProductos();
    // --------------------------
    
    configurarEventos();
    escucharCambiosStock();
  }

  // Obtener categorías únicas
  function obtenerCategoriasUnicas(productos) {
    const categoriasSet = new Set(); 
    productos.forEach(producto => { 
      if (producto.categoria) { 
        categoriasSet.add(producto.categoria); 
      }
    });
    return Array.from(categoriasSet);
  }

  // Mostrar categorías en el dropdown
  function mostrarDropdownCategorias(categorias) { 
    dropdownCategorias.innerHTML = categorias.map(categoria => `
      <a href="#" class="dropdown-item" data-categoria="${categoria}">
        ${categoria}
      </a>
    `).join("");

    dropdownCategorias.addEventListener('click', (e) => { 
      e.preventDefault(); 
      if (e.target.classList.contains('dropdown-item')) { 
        const categoria = e.target.dataset.categoria;
        filtrarPorCategoria(categoria); 
      }
    });
  }

  // Mostrar categorías como cards
  function mostrarCardsCategorias(categorias) {
    // ----- MODIFICACIÓN 3 -----
    // Cambiamos la clase 'categoria-card' por 'category-selector-card'
    // para que coincida con el CSS que ya tienes.
    // También usamos una etiqueta <a> en lugar de <div> para que sea clickeable.
    cardsCategorias.innerHTML = categorias.map(categoria => {
      // Obtenemos una imagen de un producto de esa categoría para el ícono
      const imgProducto = productosGlobal.find(p => p.categoria === categoria)?.imagen;
      const icono = imgProducto || 'https://placehold.co/100x100/333/FFF?text=Icono';

      return `
        <a href="#" class="category-selector-card" data-category="${categoria}">
          <img src="${icono}" alt="${categoria}">
          <span>${categoria}</span>
        </a>
      `;
    }).join("");
    // --------------------------

    // Evento para cards de categorías
    cardsCategorias.addEventListener('click', (e) => { 
      e.preventDefault(); // Prevenir que el <a> nos mueva
      const card = e.target.closest('.category-selector-card'); 
      if (card) {
        const categoria = card.dataset.category; 
        
        // ----- MODIFICACIÓN 4 -----
        // Obtenemos el nombre del span para el título
        const nombre = card.querySelector('span').textContent;
        filtrarPorCategoria(categoria, nombre); 
        // --------------------------
      }
    });
  }

  // (Esta función ya no es necesaria, usamos imágenes reales)
  // function obtenerIconoCategoria(categoria) { ... }

  // Filtrar productos por categoría
  function filtrarPorCategoria(categoria, nombreCategoria) {
    // Si el nombre no se pasó, lo buscamos (para el dropdown)
    if (!nombreCategoria) {
        nombreCategoria = categoria;
    }

    const productosFiltrados = productosGlobal.filter(p => p.categoria === categoria); 
    if (tituloProductos) {
        tituloProductos.textContent = `${nombreCategoria} (${productosFiltrados.length} productos)`; 
    }
    categoriaActiva = categoria; 
    mostrarProductos(productosFiltrados);
    
    // ----- MODIFICACIÓN 5: LÓGICA DE CLASE 'ACTIVE' -----
    // Esto añade el borde verde a la categoría seleccionada
    const selectores = document.querySelectorAll('.category-selector-card');
    selectores.forEach(selector => {
        if (selector.dataset.category === categoria) {
            selector.classList.add('active');
        } else {
            selector.classList.remove('active');
        }
    });
    // --------------------------------------------------
  }

  // Mostrar todos los productos
  function mostrarTodosLosProductos() {
    if (tituloProductos) {
        tituloProductos.textContent = `Todos los productos (${productosGlobal.length})`; 
    }
    categoriaActiva = 'todos'; 
    mostrarProductos(productosGlobal); 
    if (buscador) {
        buscador.value = ''; 
    }

    // ----- MODIFICACIÓN 6: LÓGICA DE CLASE 'ACTIVE' -----
    // Esto quita el borde verde de TODAS las categorías
    const selectores = document.querySelectorAll('.category-selector-card');
    selectores.forEach(selector => {
        selector.classList.remove('active');
    });
    // --------------------------------------------------
  }

  // Renderizar productos en el grid
  function mostrarProductos(productos) {
    if (!productosGrid) return; 

    if (productos.length === 0) {
      productosGrid.innerHTML = `
        <div class="no-productos" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="font-size: 18px; color: #666; margin-bottom: 15px;">No se encontraron productos</p>
          <button id="btnVerTodosNoProductos" class="btn btn-primary">Ver todos los productos</button>
        </div>
      `;
      // Usamos 'btn-primary' para que se vea bien
      document.getElementById('btnVerTodosNoProductos').addEventListener('click', mostrarTodosLosProductos);
      return;
    }

    // --- INICIO DE LA MODIFICACIÓN (Paso 34) ---
    productosGrid.innerHTML = ''; // Limpiamos el grid
    
    productos.forEach(producto => {
        // 1. Lógica para el precio (Muestra ofertas)
        let precioHTML = '';
        // Revisa si 'precioAnterior' existe Y es mayor que 0
        if (producto.precioAnterior && producto.precioAnterior > 0) {
            // Es OFERTA
            precioHTML = `
                <div>
                    <span class="product-price-old">${formatearPrecio(producto.precioAnterior)}</span>
                    <span class="product-price-offer">${formatearPrecio(producto.precio)} CLP</span>
                </div>
            `;
        } else {
            // Es PRECIO NORMAL
            precioHTML = `
                <p class="product-price">${formatearPrecio(producto.precio)} CLP</p>
            `;
        }

        // 2. Creamos el elemento de la tarjeta
        const article = document.createElement('article');
        article.className = 'product-card';
        article.dataset.category = producto.categoria;

        // 3. Rellenamos la tarjeta con el HTML (usando la variable precioHTML)
        article.innerHTML = `
            <a href="producto-detalle.html?id=${producto.id}" style="text-decoration: none;">
                <img src="${producto.imagen || 'https://placehold.co/400x200/333/FFF?text=Sin+Imagen'}" 
                     alt="${producto.nombre}" 
                     class="producto-imagen"
                     onerror="this.src='https://placehold.co/400x200/cccccc/969696?text=Error+Cargando'">
                <h3>${producto.nombre || 'Sin nombre'}</h3>
            </a>
        ${precioHTML}        <p class="producto-stock" style="font-size: 0.9em; color: #aaa;">Stock: ${producto.stock}</p>
        <button class="btn btn-primary btn-agregar" data-id="${producto.id}">
          Añadir al carrito
        </button>
        `;
        
        // 4. Añadimos la tarjeta al grid
        productosGrid.appendChild(article);
    });
    // --- FIN DE LA MODIFICACIÓN ---

    // Agregar eventos a los botones de comprar
    document.querySelectorAll('.btn-agregar').forEach(btn => { 
      btn.addEventListener('click', function() { 
        const productId = this.dataset.id; 
        agregarAlCarrito(productId); 
      });
    });
  }

  // Agregar producto al carrito
  function agregarAlCarrito(productId) { 
    const producto = productosGlobal.find(p => p.id === productId); 
    
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
        carrito.push({
          ...producto,
          cantidad: 1
        });
      }

      
      localStorage.setItem('carrito', JSON.stringify(carrito)); 
      actualizarCarritoTotal(); 
      
      actualizarStockFirebase(productId, 1);
      mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
      console.log('Producto agregado al carrito:', producto); 
    }
  }

  // Actualizar el total del carrito en el DOM
  function actualizarCarritoTotal() {
    const total = carrito.reduce((sum, producto) => sum + ((producto.precio || 0) * (producto.cantidad || 1)), 0); 
    
    if (carritoTotal) {
        carritoTotal.textContent = total.toLocaleString('es-CL'); 
    }
    localStorage.setItem('cartTotal', total);
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal();
    }
    // ----- AÑADIDO -----
    actualizarContadorItemsCarrito(); // Asegurarse de que el (contador) también se actualice
    // -------------------
  }

  // Mostrar una notificación flotante
  function mostrarNotificacion(mensaje,  tipo = 'success') { 
    const notificacion = document.createElement('div'); 
    const backgroundColor = tipo === 'success' ? '#28a745' : '#dc3545';
    notificacion.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${backgroundColor}; 
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      font-weight: 600;
      transition: all 0.3s ease;
    `;
    notificacion.textContent = mensaje; 
    document.body.appendChild(notificacion); 
    
    setTimeout(() => { 
      notificacion.remove(); 
    }, 3000);
  }

  // Configurar eventos de botones y buscador
  function configurarEventos() {
    if (btnVerTodos) {
        btnVerTodos.addEventListener('click', mostrarTodosLosProductos);
    }
    if (btnBuscar) {
        btnBuscar.addEventListener('click', buscarProductos);
    }
    if (buscador) {
        buscador.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarProductos();
        });
    }
    if (btnCarrito) {
        btnCarrito.addEventListener('click', () => {
            window.location.href = 'carrito.html';
        });
    }
  }

  // Buscar productos
  function buscarProductos() {
    if (!buscador) return; 
    const termino = buscador.value.toLowerCase().trim();
    if (!termino) {
      if (categoriaActiva === 'todos') {
        mostrarTodosLosProductos();
      } else {
        filtrarPorCategoria(categoriaActiva, categoriaActiva); // Pasamos el nombre
      }
      return;
    }
    
    const productosFiltrados = productosGlobal.filter(p => 
      p.nombre?.toLowerCase().includes(termino) ||
      p.categoria?.toLowerCase().includes(termino) ||
      p.descripcion?.toLowerCase().includes(termino)
    );
    
    if (tituloProductos) {
        tituloProductos.textContent = `Resultados para "${termino}" (${productosFiltrados.length})`;
    }
    mostrarProductos(productosFiltrados);
  }

  // Funciones globales
  window.mostrarTodosLosProductos = mostrarTodosLosProductos;
  window.getProductosGlobal = () => productosGlobal;
  window.getCarrito = () => carrito;

  // Obtener el número total de items
  function obtenerTotalItemsCarrito() {
    return carrito.reduce((total, producto) => total + (producto.cantidad || 1), 0);
  }

  // Actualizar el contador de items
  function actualizarContadorItemsCarrito() {
    const contadorItems = document.querySelector('.carrito-count');
    if (contadorItems) {
      contadorItems.textContent = `(${obtenerTotalItemsCarrito()})`;
    }
  }

  //INICIALIZACIÓN ADICIONAL
  actualizarContadorItemsCarrito();

  //NUEVAS FUNCIONES GLOBALES
  window.irAlCarrito = () => {
    window.location.href = 'carrito.html';
  };

  window.limpiarCarrito = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el carrito?')) {
      limpiarCarritoYRestaurarStock();
    }
  };

    // Actualizar stock en Firebase
  async function actualizarStockFirebase(productId, cantidad) {
      try {
          const productoRef = db.collection("producto").doc(productId);
          const productoDoc = await productoRef.get();
          
          if (productoDoc.exists) {
              const stockActual = productoDoc.data().stock;
              const nuevoStock = stockActual - cantidad;
              
              await productoRef.update({
                  stock: nuevoStock
              });
              
              console.log(`Stock actualizado: ${productoDoc.data().nombre} - Nuevo stock: ${nuevoStock}`);
          }
      } catch (error) {
          console.error("Error actualizando stock en Firebase:", error);
      }
  }

  // Restaurar stock
  async function restaurarStockFirebase(productId, cantidad) {
      try {
          const productoRef = db.collection("producto").doc(productId);
          const productoDoc = await productoRef.get();
          
          if (productoDoc.exists) {
              const stockActual = productoDoc.data().stock;
              const nuevoStock = stockActual + cantidad;
              
              await productoRef.update({
                  stock: nuevoStock
              });
              
              console.log(`Stock restaurado: ${productoDoc.data().nombre} - Nuevo stock: ${nuevoStock}`);
          }
      } catch (error) {
          console.error("Error restaurando stock en Firebase:", error);
      }
  }

  // Escuchar cambios en el stock en tiempo real
  function escucharCambiosStock() {
      db.collection("producto").onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
              if (change.type === "modified") {
                  const productoActualizado = {
                      id: change.doc.id,
                      ...change.doc.data()
                  };
                  
                  const index = productosGlobal.findIndex(p => p.id === productoActualizado.id);
                  if (index !== -1) {
                      productosGlobal[index] = productoActualizado;
                      
                      const productosActuales = categoriaActiva === 'todos' 
                          ? productosGlobal 
                          : productosGlobal.filter(p => p.categoria === categoriaActiva);
                      
                      if (productosActuales.some(p => p.id === productoActualizado.id)) {
                          mostrarProductos(productosActuales);
                      }
                  }
              }
          });
      });
  }

  // Limpiar carrito y restaurar todo el stock
  async function limpiarCarritoYRestaurarStock() {
      if (carrito.length === 0) return;
      
      try {
          for (const producto of carrito) {
              await restaurarStockFirebase(producto.id, producto.cantidad || 1);
          }
          
          carrito = [];
          localStorage.removeItem('carrito');
         actualizarCarritoTotal();
          actualizarContadorItemsCarrito();
          mostrarNotificacion('Carrito limpiado y stock restaurado');
      } catch (error) {
          console.error("Error limpiando carrito:", error);
      }
  }

  // Reemplazar la función global existente
  window.limpiarCarrito = limpiarCarritoYRestaurarStock;

  console.log("Catálogo inicializado correctamente");
});