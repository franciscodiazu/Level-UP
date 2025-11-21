/* ==========================================
 * ARCHIVO: js/catalogo.js
 * (Versión Dinámica Corregida: Espera la carga del Header)
 * ==========================================
*/
document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM fijos de la página
  const dropdownCategorias = document.getElementById("dropdownCategorias");
  const cardsCategorias = document.getElementById("cardsCategorias");
  const productosGrid = document.getElementById("productosGrid");
  const tituloProductos = document.getElementById("tituloProductos");
  const buscador = document.getElementById("buscador");
  const btnBuscar = document.getElementById("btnBuscar");
  const carritoTotal = document.querySelector('.carrito-total');
  const btnVerTodos = document.getElementById("show-all-btn"); 
  const btnCarrito = document.querySelector('.btn-carrito');
  
  // Nota: No seleccionamos "header-menu-dinamico" aquí arriba porque aún no existe.
  // Lo buscaremos dentro de la función intentarCargarHeader.

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
  if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  // Función para formatear precio
  function formatearPrecio(precio) {
      const numericPrice = Number(precio) || 0;
      return new Intl.NumberFormat('es-CL', { 
          style: 'currency', 
          currency: 'CLP' 
      }).format(numericPrice);
  }

  // Inicializar la aplicación
  actualizarCarritoTotal();
  cargarProductos();

  // Función para cargar productos desde Firestore
  async function cargarProductos() {
    try {
      if (tituloProductos) tituloProductos.textContent = "Cargando productos...";
      
      const snapshot = await db.collection("producto").get(); 
      productosGlobal = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log("Productos cargados:", productosGlobal); 
      inicializarInterfaz(productosGlobal); 
      
    } catch (error) {
      console.error("Error cargando productos:", error);
      if (tituloProductos) tituloProductos.textContent = "Error al cargar productos";
    }
  }

  // Inicializar la interfaz
  function inicializarInterfaz(productos) {
    const categorias = obtenerCategoriasUnicas(productos);
    
    // Lógica normal para la página de catálogo
    if (dropdownCategorias) mostrarDropdownCategorias(categorias);
    if (cardsCategorias) mostrarCardsCategorias(categorias);
    
    // --- MODIFICACIÓN: Esperar a que el header cargue para llenar el menú ---
    const intentarCargarHeader = () => {
        // Buscamos el elemento AQUÍ, porque al inicio del script probablemente no existía
        const headerMenu = document.getElementById("header-menu-dinamico");
        
        if (headerMenu) {
            // Si el header ya existe, cargamos el menú pasando el elemento encontrado
            cargarMenuHeaderDinamico(categorias, headerMenu);
        } else {
            // Si no existe (loadHeader.js sigue cargando), reintentamos en 100ms
            setTimeout(intentarCargarHeader, 100);
        }
    };
    // Iniciamos el intento
    intentarCargarHeader();
    // -----------------------------------------------------------------------

    // Revisar URL para filtrar al cargar
    const params = new URLSearchParams(window.location.search);
    const categoriaURL = params.get('categoria');

    if (categoriaURL) {
        const categoriaLimpia = decodeURIComponent(categoriaURL);
        // Pequeño delay para asegurar que el DOM esté listo si es necesario
        setTimeout(() => {
            filtrarPorCategoria(categoriaLimpia, categoriaLimpia);
        }, 100);
    } else {
        mostrarTodosLosProductos();
    }
    
    configurarEventos();
    escucharCambiosStock();
  }

  function obtenerCategoriasUnicas(productos) {
    const categoriasSet = new Set(); 
    productos.forEach(producto => { 
      if (producto.categoria) { 
        categoriasSet.add(producto.categoria); 
      }
    });
    // Retornamos array ordenado alfabéticamente
    return Array.from(categoriasSet).sort();
  }

  // --- FUNCIÓN: Generar Header Dinámico ---
  // Ahora recibe el elemento del DOM como argumento
  function cargarMenuHeaderDinamico(categorias, menuContainer) {
      let html = '';
      
      // 1. Generar enlaces para cada categoría existente en Firebase
      categorias.forEach(cat => {
          // Usamos ruta absoluta para que funcione desde cualquier página
          html += `<a href="/assets/html/catalogo.html?categoria=${encodeURIComponent(cat)}" class="header-cat-link">${cat}</a>`;
      });

      // 2. Agregar separador y botón "Ver todos los productos"
      html += `
        <a href="/assets/html/catalogo.html" class="header-cat-link" style="border-top: 1px solid #333; margin-top: 5px; color: #39FF14;">
            Ver todos los productos
        </a>
      `;

      menuContainer.innerHTML = html;

      // 3. Asignar eventos a estos nuevos enlaces
      asignarEventosHeader();
  }

  function asignarEventosHeader() {
      const linksHeader = document.querySelectorAll('.header-cat-link');
      linksHeader.forEach(link => {
          link.addEventListener('click', (e) => {
              // Solo interceptamos si estamos en catalogo.html
              if (window.location.pathname.includes('catalogo.html')) {
                  e.preventDefault();
                  const url = new URL(link.href);
                  const categoriaClick = url.searchParams.get('categoria');

                  if (categoriaClick) {
                      const catDecodificada = decodeURIComponent(categoriaClick);
                      window.history.pushState({}, '', link.href);
                      filtrarPorCategoria(catDecodificada, catDecodificada);
                  } else {
                      // Es el botón de "Ver todos"
                      window.history.pushState({}, '', '/assets/html/catalogo.html');
                      mostrarTodosLosProductos();
                  }
              }
          });
      });
  }
  // -----------------------------------------------------

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

  function mostrarCardsCategorias(categorias) {
    cardsCategorias.innerHTML = categorias.map(categoria => {
      const imgProducto = productosGlobal.find(p => p.categoria === categoria)?.imagen;
      const icono = imgProducto || 'https://placehold.co/100x100/333/FFF?text=Icono';

      return `
        <a href="#" class="category-selector-card" data-category="${categoria}">
          <img src="${icono}" alt="${categoria}">
          <span>${categoria}</span>
        </a>
      `;
    }).join("");

    cardsCategorias.addEventListener('click', (e) => { 
      e.preventDefault(); 
      const card = e.target.closest('.category-selector-card'); 
      if (card) {
        const categoria = card.dataset.category; 
        const nombre = card.querySelector('span').textContent;
        filtrarPorCategoria(categoria, nombre); 
      }
    });
  }

  // Filtrar productos por categoría (Mejorado para insensibilidad de mayúsculas)
  function filtrarPorCategoria(categoria, nombreCategoria) {
    if (!nombreCategoria) nombreCategoria = categoria;

    // Filtro robusto: compara en minúsculas y sin espacios extra
    const productosFiltrados = productosGlobal.filter(p => 
        p.categoria && p.categoria.toLowerCase().trim() === categoria.toLowerCase().trim()
    ); 

    if (tituloProductos) {
        tituloProductos.textContent = `${nombreCategoria} (${productosFiltrados.length} productos)`; 
    }
    categoriaActiva = categoria; 
    mostrarProductos(productosFiltrados);
    
    // Actualizar clase 'active' en las cards
    const selectores = document.querySelectorAll('.category-selector-card');
    selectores.forEach(selector => {
        if (selector.dataset.category.toLowerCase().trim() === categoria.toLowerCase().trim()) {
            selector.classList.add('active');
        } else {
            selector.classList.remove('active');
        }
    });
  }

  function mostrarTodosLosProductos() {
    if (tituloProductos) {
        tituloProductos.textContent = `Todos los productos (${productosGlobal.length})`; 
    }
    categoriaActiva = 'todos'; 
    mostrarProductos(productosGlobal); 
    if (buscador) buscador.value = ''; 

    const selectores = document.querySelectorAll('.category-selector-card');
    selectores.forEach(selector => selector.classList.remove('active'));
  }

  function mostrarProductos(productos) {
    if (!productosGrid) return; 

    if (productos.length === 0) {
      productosGrid.innerHTML = `
        <div class="no-productos" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="font-size: 18px; color: #666; margin-bottom: 15px;">No se encontraron productos</p>
          <button id="btnVerTodosNoProductos" class="btn btn-primary">Ver todos los productos</button>
        </div>
      `;
      const btn = document.getElementById('btnVerTodosNoProductos');
      if(btn) btn.addEventListener('click', mostrarTodosLosProductos);
      return;
    }

    productosGrid.innerHTML = ''; 
    
    productos.forEach(producto => {
        let precioHTML = '';
        if (producto.precioAnterior && producto.precioAnterior > 0) {
            precioHTML = `
                <div>
                    <span class="product-price-old">${formatearPrecio(producto.precioAnterior)}</span>
                    <span class="product-price-offer">${formatearPrecio(producto.precio)} CLP</span>
                </div>
            `;
        } else {
            precioHTML = `<p class="product-price">${formatearPrecio(producto.precio)} CLP</p>`;
        }

        const article = document.createElement('article');
        article.className = 'product-card';
        article.dataset.category = producto.categoria;

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
            <button class="btn btn-primary btn-agregar" data-id="${producto.id}">Añadir al carrito</button>
        `;
        productosGrid.appendChild(article);
    });

    document.querySelectorAll('.btn-agregar').forEach(btn => { 
      btn.addEventListener('click', function() { 
        const productId = this.dataset.id; 
        agregarAlCarrito(productId); 
      });
    });
  }

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
        carrito.push({ ...producto, cantidad: 1 });
      }
      
      localStorage.setItem('carrito', JSON.stringify(carrito)); 
      actualizarCarritoTotal(); 
      actualizarStockFirebase(productId, 1);
      mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
    }
  }

  function actualizarCarritoTotal() {
    const total = carrito.reduce((sum, producto) => sum + ((producto.precio || 0) * (producto.cantidad || 1)), 0); 
    if (carritoTotal) carritoTotal.textContent = total.toLocaleString('es-CL'); 
    localStorage.setItem('cartTotal', total);
    if (typeof window.actualizarHeaderCartGlobal === 'function') window.actualizarHeaderCartGlobal();
    actualizarContadorItemsCarrito(); 
  }

  function mostrarNotificacion(mensaje, tipo = 'success') { 
    const notificacion = document.createElement('div'); 
    const backgroundColor = tipo === 'success' ? '#28a745' : '#dc3545';
    notificacion.style.cssText = `
      position: fixed; top: 100px; right: 20px;
      background: ${backgroundColor}; color: white;
      padding: 15px 20px; border-radius: 5px; z-index: 10000;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2); font-weight: 600; transition: all 0.3s ease;
    `;
    notificacion.textContent = mensaje; 
    document.body.appendChild(notificacion); 
    setTimeout(() => { notificacion.remove(); }, 3000);
  }

  function configurarEventos() {
    if (btnVerTodos) btnVerTodos.addEventListener('click', mostrarTodosLosProductos);
    if (btnBuscar) btnBuscar.addEventListener('click', buscarProductos);
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

  function buscarProductos() {
    if (!buscador) return; 
    const termino = buscador.value.toLowerCase().trim();
    if (!termino) {
      if (categoriaActiva === 'todos') mostrarTodosLosProductos();
      else filtrarPorCategoria(categoriaActiva, categoriaActiva); 
      return;
    }
    
    const productosFiltrados = productosGlobal.filter(p => 
      p.nombre?.toLowerCase().includes(termino) ||
      p.categoria?.toLowerCase().includes(termino) ||
      p.descripcion?.toLowerCase().includes(termino)
    );
    
    if (tituloProductos) tituloProductos.textContent = `Resultados para "${termino}" (${productosFiltrados.length})`;
    mostrarProductos(productosFiltrados);
  }

  // Funciones globales y auxiliares
  window.mostrarTodosLosProductos = mostrarTodosLosProductos;
  window.getProductosGlobal = () => productosGlobal;
  window.getCarrito = () => carrito;

  function obtenerTotalItemsCarrito() {
    return carrito.reduce((total, producto) => total + (producto.cantidad || 1), 0);
  }

  function actualizarContadorItemsCarrito() {
    const contadorItems = document.querySelector('.carrito-count');
    if (contadorItems) contadorItems.textContent = `(${obtenerTotalItemsCarrito()})`;
  }

  actualizarContadorItemsCarrito();

  window.irAlCarrito = () => { window.location.href = 'carrito.html'; };
  window.limpiarCarrito = limpiarCarritoYRestaurarStock;

  // Manejo de stock
  async function actualizarStockFirebase(productId, cantidad) {
      try {
          const productoRef = db.collection("producto").doc(productId);
          const productoDoc = await productoRef.get();
          if (productoDoc.exists) {
              const stockActual = productoDoc.data().stock;
              await productoRef.update({ stock: stockActual - cantidad });
          }
      } catch (error) { console.error("Error actualizando stock:", error); }
  }

  async function restaurarStockFirebase(productId, cantidad) {
      try {
          const productoRef = db.collection("producto").doc(productId);
          const productoDoc = await productoRef.get();
          if (productoDoc.exists) {
              const stockActual = productoDoc.data().stock;
              await productoRef.update({ stock: stockActual + cantidad });
          }
      } catch (error) { console.error("Error restaurando stock:", error); }
  }

  function escucharCambiosStock() {
      db.collection("producto").onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
              if (change.type === "modified") {
                  const productoActualizado = { id: change.doc.id, ...change.doc.data() };
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
      } catch (error) { console.error("Error limpiando carrito:", error); }
  }

  console.log("Catálogo inicializado y header dinámico activo.");
});