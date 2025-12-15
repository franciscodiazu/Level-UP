// setup-vendedor.js
// Configura usuarios vendedores en localStorage

(function() {
    const VENDEDORES_KEY = 'vendedoresUsers';
    
    // Datos de vendedores por defecto
    const vendedoresDefault = [
        {
            id: 'vendedor_001',
            email: 'vendedor@levelup.com',
            password: 'Vendedor123',
            nombre: 'Carlos Vendedor',
            rol: 'vendedor',
            telefono: '+56912345678',
            activo: true,
            avatar: 'https://ui-avatars.com/api/?name=Vendedor&background=FF9800&color=fff'
        },
        {
            id: 'vendedor_002', 
            email: 'ventas@levelup.com',
            password: 'Ventas123',
            nombre: 'Ana Ventas',
            rol: 'vendedor',
            telefono: '+56987654321',
            activo: true,
            avatar: 'https://ui-avatars.com/api/?name=Ana+Ventas&background=FF5722&color=fff'
        }
    ];
    
    // Inicializar si no existe
    if (!localStorage.getItem(VENDEDORES_KEY)) {
        localStorage.setItem(VENDEDORES_KEY, JSON.stringify(vendedoresDefault));
        console.log('Vendedores inicializados en localStorage');
    }
})();