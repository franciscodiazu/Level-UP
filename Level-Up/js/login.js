document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (evento) {
        evento.preventDefault(); 

        let errores = [];
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validaciones de formato
        if (email === "") errores.push("El correo es un campo requerido.");
        if (password === "") errores.push("La contraseña es un campo requerido.");
        
        if (errores.length > 0) {
            alert("Errores:\n\n" + errores.join("\n"));
            return; 
        }
        
        // Simulación de autenticación
        const adminUser = { email: 'admin@levelup.com', pass: 'admin123' };
        const clientUser = { email: 'cliente@duoc.cl', pass: 'cliente123' };

        // Comprobar si es ADMIN y redirigir
        if (email === adminUser.email && password === adminUser.pass) {
            // REDIRECCIÓN PARA EL ADMIN
            window.location.href = 'admin-dashboard.html';
        
        // Comprobar si es CLIENTE y redirigir
        } else if (email === clientUser.email && password === clientUser.pass) {
            // REDIRECCIÓN PARA EL CLIENTE
            window.location.href = 'perfil-cliente.html';
        
        // Si los datos no coinciden
        } else {
            alert('Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.');
        }
    });
});