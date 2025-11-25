// Tests para la lógica de negocio de carrito.js
// Adaptados al estilo imperativo (mutación de variables globales)

describe('Lógica de Negocio del Carrito (Simulación carrito.js)', function() {
    
    // --- ESTADO GLOBAL SIMULADO (Como en tu carrito.js) ---
    let carrito = [];
    let productosCargados = [];
    let lastNotification = ""; // Para verificar mensajes de error/éxito

    // --- MOCK DE LOCALSTORAGE ---
    const localStorageMock = (function() {
        let store = {};
        return {
            getItem: function(key) { return store[key] || null; },
            setItem: function(key, value) { store[key] = value.toString(); },
            clear: function() { store = {}; }
        };
    })();

    // --- FUNCIONES SIMULADAS (Replican la lógica exacta de carrito.js) ---
    
    // Helper para simular mostrarNotificacion
    const mostrarNotificacion = (msg, type) => { lastNotification = msg; };

    // Simula: agregarProductoAlCarrito(productId)
    const agregarProductoAlCarrito = (productId) => {
        const producto = productosCargados.find(p => p.id === productId);
        
        if (producto) {
            const stockActualProducto = producto.stock || 0;
            
            if (stockActualProducto <= 0) {
                mostrarNotificacion('Producto sin stock disponible', 'error');
                return;
            }

            const productoExistente = carrito.find(item => item.id === productId);

            if (productoExistente) {
                // Validación de stock máximo que tienes en tu código
                if (productoExistente.cantidad >= stockActualProducto) {
                    mostrarNotificacion(`Stock máximo alcanzado`, 'error');
                    return;
                }
                productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
            } else {
                carrito.push({ ...producto, cantidad: 1 });
            }
            mostrarNotificacion(`Agregado al carrito`, 'success');
        }
    };

    // Simula: aumentarCantidad(index)
    const aumentarCantidad = (index) => {
        const productoCarrito = carrito[index];
        if (!productoCarrito) return;

        const productoGeneral = productosCargados.find(p => p.id === productoCarrito.id);
        const stockDisponible = productoGeneral ? (productoGeneral.stock || 0) : 0;

        // Validación de stock
        if (stockDisponible <= 0) {
            mostrarNotificacion(`No hay más stock disponible`, 'error');
            return;
        }

        // Nota: En tu código real también verificas si ya tienes todo el stock en el carrito
        if (productoCarrito.cantidad >= stockDisponible) {
             mostrarNotificacion(`Stock máximo alcanzado`, 'error');
             return;
        }

        productoCarrito.cantidad = (productoCarrito.cantidad || 1) + 1;
    };

    // Simula: disminuirCantidad(index)
    const disminuirCantidad = (index) => {
        const productoCarrito = carrito[index];
        if (!productoCarrito) return;

        if (productoCarrito.cantidad > 1) {
            productoCarrito.cantidad--;
        } else {
            eliminarDelCarrito(index);
        }
    };

    // Simula: eliminarDelCarrito(index)
    const eliminarDelCarrito = (index) => {
        if (index < 0 || index >= carrito.length) return;
        carrito.splice(index, 1);
    };

    // --- INICIO DE LOS TESTS ---

    beforeEach(function() {
        // Reiniciar estado antes de cada prueba
        carrito = [];
        lastNotification = "";
        
        // Mock de productos disponibles en "Base de Datos"
        productosCargados = [
            { id: '1', nombre: 'Mouse Gamer', precio: 15000, stock: 10 },
            { id: '2', nombre: 'Teclado Mecánico', precio: 40000, stock: 5 },
            { id: '3', nombre: 'Producto Agotado', precio: 100, stock: 0 }
        ];
        
        if (typeof window !== 'undefined') {
            window.localStorage = localStorageMock;
        }
    });

    describe('Agregar Productos', function() {
        it('Debe agregar un producto nuevo al array carrito', function() {
            agregarProductoAlCarrito('1');
            
            expect(carrito.length).toBe(1);
            expect(carrito[0].id).toBe('1');
            expect(carrito[0].cantidad).toBe(1);
            expect(lastNotification).toContain('Agregado');
        });

        it('Debe incrementar la cantidad si el producto ya existe', function() {
            agregarProductoAlCarrito('1'); // Cantidad 1
            agregarProductoAlCarrito('1'); // Cantidad 2
            
            expect(carrito.length).toBe(1);
            expect(carrito[0].cantidad).toBe(2);
        });

        it('No debe permitir agregar productos sin stock (stock=0)', function() {
            agregarProductoAlCarrito('3'); // Producto Agotado
            
            expect(carrito.length).toBe(0);
            expect(lastNotification).toContain('sin stock');
        });

        it('Debe respetar el límite de stock (stock=5)', function() {
            // Agregar 5 veces (Llenar stock)
            for(let i=0; i<5; i++) agregarProductoAlCarrito('2');
            expect(carrito[0].cantidad).toBe(5);
            
            // Intentar el 6to
            agregarProductoAlCarrito('2');
            expect(carrito[0].cantidad).toBe(5); // No sube
            expect(lastNotification).toContain('Stock máximo');
        });
    });

    describe('Modificar Cantidades por Índice', function() {
        beforeEach(function() {
            // Pre-llenar carrito: Índice 0 = Mouse, Índice 1 = Teclado
            carrito = [
                { id: '1', nombre: 'Mouse', precio: 15000, cantidad: 2 },
                { id: '2', nombre: 'Teclado', precio: 40000, cantidad: 1 }
            ];
        });

        it('Aumentar cantidad debe sumar 1 al item del índice dado', function() {
            aumentarCantidad(0); // Aumentar Mouse (index 0)
            expect(carrito[0].cantidad).toBe(3);
        });

        it('Disminuir cantidad debe restar 1 si es mayor a 1', function() {
            disminuirCantidad(0); // Disminuir Mouse (de 2 a 1)
            expect(carrito[0].cantidad).toBe(1);
        });

        it('Disminuir cantidad debe eliminar el producto si llega a 0', function() {
            disminuirCantidad(1); // Disminuir Teclado (de 1 a 0 -> eliminar)
            
            expect(carrito.length).toBe(1); // Solo queda el Mouse
            expect(carrito[0].id).toBe('1'); // El índice 0 sigue siendo Mouse
        });
    });

    describe('Eliminación Directa', function() {
        beforeEach(function() {
            carrito = [
                { id: 'A', nombre: 'Prod A', cantidad: 1 },
                { id: 'B', nombre: 'Prod B', cantidad: 1 },
                { id: 'C', nombre: 'Prod C', cantidad: 1 }
            ];
        });

        it('Debe eliminar un producto usando splice por su índice', function() {
            eliminarDelCarrito(1); // Eliminar el del medio ('B')
            
            expect(carrito.length).toBe(2);
            expect(carrito[0].id).toBe('A');
            expect(carrito[1].id).toBe('C'); // 'C' se desplaza
        });
    });
});