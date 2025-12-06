// --- BASE DE DATOS SIMULADA ---
// Aquí guardamos toda la información de la tienda.

const data = {
  categorias: [
    { id: 'juegos-mesa', nombre: 'Juegos de Mesa' },
    { id: 'perifericos', nombre: 'Periféricos' },
    { id: 'consolas', nombre: 'Consolas y Hardware' },
    { id: 'ropa', nombre: 'Ropa y Merch' },
  ],
  productos: [
    {
      id: 'prod_001',
      nombre: 'Catan (Juego de Mesa)',
      precio: 39990,
      categoria: 'juegos-mesa',
      enOferta: false,
      stock: 15,
      imagen: '/assets/img/catan.jpg', // Usamos las rutas de tu carpeta /public
      descripcion: 'El clásico juego de estrategia y gestión de recursos. Coloniza la isla de Catan.'
    },
    {
      id: 'prod_002',
      nombre: 'Mouse Razer Deathadder Essential',
      precio: 24990,
      categoria: 'perifericos',
      enOferta: true,
      stock: 30,
      imagen: '/assets/img/Mouse Razer Deathadder Essential.jpg',
      descripcion: 'Sensor óptico de 6.400 DPI reales para un control rápido y preciso.'
    },
    {
      id: 'prod_003',
      nombre: 'Teclado Mecánico Corsair K70 RGB',
      precio: 129990,
      categoria: 'perifericos',
      enOferta: false,
      stock: 10,
      imagen: '/assets/img/Teclado Mecánico Corsair K70 RGB.jpg',
      descripcion: 'Switches Cherry MX y retroiluminación RGB personalizable.'
    },
    {
      id: 'prod_004',
      nombre: 'HyperX Cloud II Headset',
      precio: 79990,
      categoria: 'perifericos',
      enOferta: true,
      stock: 20,
      imagen: '/assets/img/hyperx-headset.jpg',
      descripcion: 'Sonido envolvente 7.1 virtual y micrófono con cancelación de ruido.'
    },
    {
      id: 'prod_005',
      nombre: 'Nintendo Switch OLED',
      precio: 349990,
      categoria: 'consolas',
      enOferta: false,
      stock: 8,
      imagen: '/assets/img/Nintendo Switch OLED.jpg',
      descripcion: 'La nueva versión con pantalla OLED de 7 pulgadas para colores más intensos.'
    },
    {
      id: 'prod_006',
      nombre: 'Control Inalámbrico Xbox',
      precio: 54990,
      categoria: 'consolas',
      enOferta: false,
      stock: 25,
      imagen: '/assets/img/controlInalambrico.jpg',
      descripcion: 'Compatible con Xbox Series X/S, Xbox One, PC y móvil. Agarre texturizado.'
    },
    {
      id: 'prod_007',
      nombre: 'Polerón Glitch',
      precio: 29990,
      categoria: 'ropa',
      enOferta: true,
      stock: 40,
      imagen: '/assets/img/PoleronGeekGamer.jpg',
      descripcion: 'Polerón de algodón con diseño glitch, perfecto para gamers.'
    }
  ],
  usuarios: [
    {
      id: 'user_001',
      email: 'cliente@example.com',
      password: '123', // En un proyecto real, esto estaría encriptado
      rol: 'cliente',
      nombre: 'Pedro',
      apellido: 'Hacker', // (Dato de la Figura 7)
      direccion: 'Los Crisantemos, Edificio Norte, Depto 603', // (Dato de la Figura 8)
      region: 'Región Metropolitana de Santiago',
      comuna: 'Cerrillos'
    },
    {
      id: 'user_002',
      email: 'admin@example.com',
      password: 'admin',
      rol: 'admin',
      nombre: 'Admin',
      apellido: 'Level-UP',
      direccion: '',
      region: '',
      comuna: ''
    },
    // ----------------------------------------------------
    // --- NUEVO USUARIO VENDEDOR ---
    // ----------------------------------------------------
    {
      id: 'user_003',
      email: 'vendedor@example.com',
      password: 'vendedor',
      rol: 'vendedor', // ROL REQUERIDO PARA ACCEDER A /vendedor
      nombre: 'Vendedor',
      apellido: 'Tienda',
      direccion: '',
      region: '',
      comuna: ''
    }
  ],
  blogPosts: [
      { id: 'guia-pc', titulo: 'Guía definitiva para armar tu PC Gamer', resumen: 'Te guiamos paso a paso...', contenido: 'Contenido largo...' },
      { id: 'review-razer', titulo: 'Review: Razer Firefly V2', resumen: 'Analizamos el nuevo mousepad...', contenido: 'Contenido largo...' },
  ],
  ordenes: [
    {
      id: 'orden_001',
      fecha: '2025-11-15T10:30:00Z',
      clienteId: 'user_001',
      clienteNombre: 'Pedro Hacker',
      total: 374980,
      estado: 'Entregado',
      items: [
        { id: 'prod_002', nombre: 'Mouse Razer Deathadder', precio: 24990, cantidad: 1 },
        { id: 'prod_005', nombre: 'Nintendo Switch OLED', precio: 349990, cantidad: 1 }
      ],
      direccion: {
        calle: 'Los Crisantemos, Edificio Norte, Depto 603',
        comuna: 'Cerrillos',
        region: 'Región Metropolitana de Santiago'
      }
    },
    {
      id: 'orden_002',
      fecha: '2025-11-16T14:45:00Z',
      clienteId: 'user_001', // (Mismo cliente, otra orden)
      clienteNombre: 'Pedro Hacker',
      total: 29990,
      estado: 'En preparación',
      items: [
        { id: 'prod_007', nombre: 'Polerón Glitch', precio: 29990, cantidad: 1 }
      ],
      direccion: {
        calle: 'Los Crisantemos, Edificio Norte, Depto 603',
        comuna: 'Cerrillos',
        region: 'Región Metropolitana de Santiago'
      }
    }
  ],
};

// --- FUNCIONES DE ACCESO A DATOS (CRUD) ---
// Estas son las funciones que tus componentes importarán.

// --- FUNCIONES DE LECTURA (READ) ---

/**
 * Simula una llamada a la API que demora 100ms
 * @returns {Promise<any>}
 */
const fakeApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 100); // Simula un pequeño retraso de red
  });
};

/**
 * Obtiene todos los productos.
 */
export const getProducts = () => {
  return fakeApiCall(data.productos);
};

/**
 * Obtiene un producto por su ID.
 * @param {string} id 
 */
export const getProductById = (id) => {
  const producto = data.productos.find(p => p.id === id);
  return fakeApiCall(producto);
};

/**
 * Obtiene todos los productos en oferta.
 */
export const getProductsInOffer = () => {
  const ofertas = data.productos.filter(p => p.enOferta === true);
  return fakeApiCall(ofertas);
};

/**
 * Obtiene todas las categorías.
 */
export const getCategories = () => {
  return fakeApiCall(data.categorias);
};

/**
 * Obtiene todos los productos de una categoría específica.
 * @param {string} categoriaId 
 */
export const getProductsByCategory = (categoriaId) => {
  const productos = data.productos.filter(p => p.categoria === categoriaId);
  return fakeApiCall(productos);
};

/**
 * Simula un inicio de sesión.
 * @param {string} email 
 * @param {string} password 
 */
export const authenticateUser = (email, password) => {
  const usuario = data.usuarios.find(u => u.email === email && u.password === password);
  if (usuario) {
    // Devolvemos el usuario sin la contraseña por seguridad
    const { password, ...userSinPassword } = usuario;
    return fakeApiCall(userSinPassword);
  } else {
    return fakeApiCall(null); // Retorna null si la autenticación falla
  }
};

/**
 * Obtiene un usuario por su ID.
 * @param {string} id 
 */
export const getUserById = (id) => {
    const usuario = data.usuarios.find(u => u.id === id);
    if (usuario) {
        const { password, ...userSinPassword } = usuario;
        return fakeApiCall(userSinPassword);
    }
    return fakeApiCall(null);
}

// --- FUNCIONES CRUD PARA ÓRDENES (ADMIN) ---

/**
 * Obtiene todas las órdenes.
 */
export const getOrders = () => {
  return fakeApiCall(data.ordenes);
};

/**
 * Obtiene una orden por su ID.
 * @param {string} orderId 
 */
export const getOrderById = (orderId) => {
  const orden = data.ordenes.find(o => o.id === orderId);
  return fakeApiCall(orden);
};

// ----------------------------------------------------
// --- NUEVA FUNCIÓN PARA EL VENDEDOR ---
// ----------------------------------------------------

/**
 * Obtiene colecciones de datos específicos para el Vendedor (Órdenes y Productos).
 * Esta función es utilizada por los componentes VendedorDashboard, VendedorOrdenes y VendedorProductos.
 * @param {string} collectionName - 'productos' o 'ordenes'.
 */
export const getVendedorData = (collectionName) => {
    switch (collectionName) {
        case 'productos':
            // Reutiliza la función getProducts para la vista de solo lectura.
            return getProducts();
        case 'ordenes':
            // Reutiliza la función getOrders para la vista de órdenes de compra.
            return getOrders();
        default:
            return fakeApiCall([]);
    }
};

// --- FUNCIONES DE ESCRITURA (CREATE, UPDATE, DELETE) ---

/**
 * (Simulación) Cuando un cliente paga, se crea una orden.
 * Esta función la llamaría tu 'Checkout.jsx' en un futuro.
 */
export const createOrder = (orderData) => {
  const newOrder = {
    ...orderData,
    id: `orden_${Date.now()}`,
    fecha: new Date().toISOString(),
    estado: 'En preparación'
  };
  data.ordenes.push(newOrder);
  return fakeApiCall(newOrder);
};