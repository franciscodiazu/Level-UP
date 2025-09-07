document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (evento) {
        evento.preventDefault(); // Evitamos que la página se recargue

        let errores = [];
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // 1. Validación del Correo
        if (email === "") {
            errores.push("El correo es un campo requerido.");
        } else if (email.length > 100) {
            errores.push("El correo no debe exceder los 100 caracteres.");
        } else {
            const dominiosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
            if (!dominiosPermitidos.some(dominio => email.endsWith(dominio))) {
                errores.push("El correo debe pertenecer a @duoc.cl, @profesor.duoc.cl o @gmail.com.");
            }
        }

        // 2. Validación de la Contraseña
        if (password === "") {
            errores.push("La contraseña es un campo requerido.");
        } else if (password.length < 4 || password.length > 10) {
            errores.push("La contraseña debe tener entre 4 y 10 caracteres.");
        }

        // 3. Mostrar errores o mensaje de éxito
        if (errores.length > 0) {
            alert("Error en el formulario:\n\n" + errores.join("\n"));
        } else {
            alert("¡Inicio de sesión exitoso!");
            loginForm.reset(); // Limpia el formulario
        }
    });
});