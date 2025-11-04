/* ==========================================
 * ARCHIVO: js/catalogo.js
 * (Tu código 100% funcional + comprobaciones de nulos)
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
  const btnVerTodos = document.getElementById("btnVerTodos");
  const btnCarrito = document.querySelector('.btn-carrito');

  let productosGlobal = []; 
  let carrito = JSON.parse(localStorage.getItem('carrito')) || []; 
  let categoriaActiva = 'todos'; 

  // Configuración de Firebase
    const firebaseConfig = {
  apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
  authDomain: "tienda-level-up.firebaseapp.com",
  projectId: "tienda-level-up"
};

  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Inicializar la aplicación
  actualizarCarritoTotal();
  cargarProductos();

  // Función para cargar productos desde Firestore
  async function cargarProductos() {
    try {
      // --- MODIFICACIÓN ---
      // Comprobar si el elemento existe antes de usarlo
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
      // --- MODIFICACIÓN ---
      if (tituloProductos) {
          tituloProductos.textContent = "Error al cargar productos";
      }
      if (productosGrid) {
          productosGrid.innerHTML = "<p class='error'>No se pudieron cargar los productos. Intenta recargar la página.</p>";
      }
    }
  }

  // Inicializar la interfaz con categorías y productos
  function inicializarInterfaz(productos) {
    const categorias = obtenerCategoriasUnicas(productos);
    
    // --- MODIFICACIÓN ---
    // Solo ejecutar si el elemento existe en la página
    if (dropdownCategorias) {
        mostrarDropdownCategorias(categorias);
    }
    
    // --- MODIFICACIÓN ---
    // Solo ejecutar si el elemento existe en la página
    if (cardsCategorias) {
        mostrarCardsCategorias(categorias);
    }
    
    // Mostrar todos los productos inicialmente
    mostrarTodosLosProductos();
    
    // Configurar eventos
    configurarEventos();

    // Escuchar cambios en tiempo real
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
    // Esta función ahora está segura porque ya comprobamos if(dropdownCategorias)
    dropdownCategorias.innerHTML = categorias.map(categoria => `
      <a href="#" class="dropdown-item" data-categoria="${categoria}">
        ${categoria}
      </a>
    `).join("");

    // Evento para items del dropdown
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
    // Esta función ahora está segura porque ya comprobamos if(cardsCategorias)
    cardsCategorias.innerHTML = categorias.map(categoria => `
      <div class="categoria-card" data-categoria="${categoria}">
        <div class="categoria-img">
          ${obtenerIconoCategoria(categoria)}
        </div>
        <div class="categoria-nombre">${categoria}</div>
      </div>
    `).join("");

    // Evento para cards de categorías
    cardsCategorias.addEventListener('click', (e) => { 
      const card = e.target.closest('.categoria-card'); 
      if (card) {
        const categoria = card.dataset.categoria; 
        filtrarPorCategoria(categoria); 
      }
    });
  }

  // Obtener un icono representativo
  function obtenerIconoCategoria(categoria) {
    const iconos = {
      'Ropa': '👕', 'Tecnología': '💻', 'Electrónica': '📱', 'Hogar': '🏠',
      'Deportes': '⚽', 'Zapatos': '👟', 'Accesorios': '🕶️', 'Libros': '📚',
      'Juguetes': '🧸', 'Belleza': '💄'
    };
    return iconos[categoria] || '📦';
  }

  // Filtrar productos por categoría
  function filtrarPorCategoria(categoria) {
    const productosFiltrados = productosGlobal.filter(p => p.categoria === categoria); 
    if (tituloProductos) {
        tituloProductos.textContent = `${categoria} (${productosFiltrados.length} productos)`; 
    }
    categoriaActiva = categoria; 
    mostrarProductos(productosFiltrados); 
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
  }

  // Renderizar productos en el grid
  function mostrarProductos(productos) {
    // --- MODIFICACIÓN ---
    if (!productosGrid) return; // Salir si la grilla no existe en esta página

    if (productos.length === 0) {
      productosGrid.innerHTML = `
        <div class="no-productos" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="font-size: 18px; color: #666; margin-bottom: 15px;">No se encontraron productos</p>
          <button id="btnVerTodosNoProductos" class="btn-signup">Ver todos los productos</button>
        </div>
      `;
      // --- MODIFICACIÓN ---
      document.getElementById('btnVerTodosNoProductos').addEventListener('click', mostrarTodosLosProductos);
      return;
    }

    productosGrid.innerHTML = productos.map(producto => `
      <div class="producto-card">
                <img src="${producto.imagen || 'https://placehold.co/400x200/333/FFF?text=Sin+Imagen'}" 
             alt="${producto.nombre}" 
             class="producto-imagen"
             onerror="this.src='https://placehold.co/400x200/cccccc/969696?text=Error+Cargando'">
        <div class="producto-info">
          <h3 class="producto-nombre">${producto.nombre || 'Sin nombre'}</h3>
          <p class="producto-precio">$${(producto.precio || 0).toLocaleString('es-CL')}</p>
          <p class="producto-stock">Stock: ${producto.stock}</p>
          <button class="btn-agregar" data-id="${producto.id}">
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    `).join("");

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
      
      // ACTUALIZAR STOCK EN FIREBASE
      actualizarStockFirebase(productId, 1);

      mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
      console.log('Producto agregado al carrito:', producto); 
    }
  }

 // Actualizar el total del carrito en el DOM
  function actualizarCarritoTotal() {
    const total = carrito.reduce((sum, producto) => sum + ((producto.precio || 0) * (producto.cantidad || 1)), 0); 
    
    // --- MODIFICACIÓN ---
    // Comprobar si el elemento existe
    if (carritoTotal) {
        carritoTotal.textContent = total.toLocaleString('es-CL'); 
    }

    // --- ¡ESTA ES LA LÍNEA QUE AÑADISTE! ---
    // (Y está perfecta)
    localStorage.setItem('cartTotal', total);

    // --- MODIFICACIÓN (Opcional pero recomendada) ---
    // Llama a la función global para actualizar CUALQUIER otro
    // botón del carrito (como el de la Figura 1)
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal();
    }
  }

  // Mostrar una notificación flotante
  function mostrarNotificacion(mensaje,  tipo = 'success') { 
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
    // --- MODIFICACIÓN ---
    if (btnVerTodos) {
        btnVerTodos.addEventListener('click', mostrarTodosLosProductos);
    }

    // --- MODIFICACIÓN ---
    if (btnBuscar) {
        btnBuscar.addEventListener('click', buscarProductos);
    }
    // --- MODIFICACIÓN ---
    if (buscador) {
        buscador.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarProductos();
        });
    }

    // --- MODIFICACIÓN ---
    if (btnCarrito) {
        btnCarrito.addEventListener('click', () => {
          window.location.href = 'carrito.html';
        });
    }
  }

  // Buscar productos
  function buscarProductos() {
    // --- MODIFICACIÓN ---
    if (!buscador) return; // Salir si no hay buscador

    const termino = buscador.value.toLowerCase().trim();
    if (!termino) {
      if (categoriaActiva === 'todos') {
        mostrarTodosLosProductos();
      } else {
        filtrarPorCategoria(categoriaActiva);
      }
      return;
    }
    
    const productosFiltrados = productosGlobal.filter(p => 
      p.nombre?.toLowerCase().includes(termino) ||
      p.categoria?.toLowerCase().includes(termino) ||
      p.descripcion?.toLowerCase().includes(termino)
    );
    
    // --- MODIFICACIÓN ---
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
    // --- MODIFICACIÓN ---
    if (confirm('¿Estás seguro de que quieres limpiar todo el carrito?')) {
        // Llama a la función que también restaura el stock
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
                  
                  // Actualizar en productosGlobal
                  const index = productosGlobal.findIndex(p => p.id === productoActualizado.id);
                  if (index !== -1) {
                      productosGlobal[index] = productoActualizado;
                      
                      // Si estamos viendo productos de esta categoría, actualizar la vista
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
          // Restaurar stock de todos los productos en el carrito
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