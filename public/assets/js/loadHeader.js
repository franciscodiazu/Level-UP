// public/assets/js/loadHeader.js
document.addEventListener('DOMContentLoaded', function() {
    const headerPlaceholder = document.getElementById('header-placeholder');

    if (headerPlaceholder) {
        // Determina si estamos en la raíz (index.html) o en una subcarpeta (assets/html/)
        const isRoot = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');
        
        // Construye la ruta al header.html basándose en la ubicación actual
        const headerPath = isRoot ? 'assets/html/header.html' : 'header.html';

        fetch(headerPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el header desde: ${headerPath}`);
                }
                return response.text();
            })
            .then(html => {
                headerPlaceholder.innerHTML = html;

                // 1. Integración del Saludo de Perfil (NUEVO)
                // Usamos la misma lógica 'isRoot' para encontrar el archivo JS
                const scriptPath = isRoot ? 'assets/js/saludo-perfil.js' : '../js/saludo-perfil.js';
                
                const scriptSaludo = document.createElement('script');
                scriptSaludo.src = scriptPath;
                document.body.appendChild(scriptSaludo);

                // 2. Actualizar Carrito (Tu lógica original)
                // Una vez que el header está en el DOM, llamamos a la función para actualizar el carrito
                if (typeof window.actualizarHeaderCartGlobal === 'function') {
                    window.actualizarHeaderCartGlobal();
                }
            })
            .catch(error => {
                console.error('Error al cargar el header:', error);
                headerPlaceholder.innerHTML = '<p style="color:red; text-align:center;">Error al cargar el encabezado.</p>';
            });
    } else {
        console.error('No se encontró el elemento #header-placeholder en la página.');
    }
});