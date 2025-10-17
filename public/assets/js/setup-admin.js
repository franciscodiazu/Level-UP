// Este script se ejecuta una sola vez para configurar al administrador en la "base de datos local".

(function() {
    // La clave que usaremos para buscar al admin en localStorage.
    const ADMIN_KEY = 'adminUser';

    // Comprobar si el administrador ya existe en localStorage para no sobreescribirlo.
    if (!localStorage.getItem(ADMIN_KEY)) {
        
        // Creamos un objeto con las credenciales del administrador.
        const adminCredentials = {
            email: 'admin@levelup.com',
            pass: 'admin123'
        };

        // localStorage solo puede guardar texto (strings).
        // Por lo tanto, convertimos el objeto a un formato de texto llamado JSON.
        const adminDataString = JSON.stringify(adminCredentials);

        // Guardamos el string con los datos del admin en localStorage.
        localStorage.setItem(ADMIN_KEY, adminDataString);

        console.log('Administrador guardado en la base de datos local.');
    } else {
        console.log('El administrador ya existe en la base de datos local.');
    }
})();