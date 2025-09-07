// js/validacion.js
document.addEventListener('DOMContentLoaded', function () {
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    const formulario = document.getElementById('registroForm');

    // Cargar regiones al cargar la página
    regionesYComunas.regiones.forEach(region => {
        const option = document.createElement('option');
        option.value = region.nombre;
        option.textContent = region.nombre;
        regionSelect.appendChild(option);
    });

    // Cargar comunas cuando se cambia la región
    regionSelect.addEventListener('change', function () {
        const regionSeleccionada = this.value;
        comunaSelect.innerHTML = '<option value="">-- Seleccione una comuna --</option>'; // Limpiar comunas

        if (regionSeleccionada) {
            const region = regionesYComunas.regiones.find(r => r.nombre === regionSeleccionada);
            region.comunas.forEach(comuna => {
                const option = document.createElement('option');
                option.value = comuna;
                option.textContent = comuna;
                comunaSelect.appendChild(option);
            });
        }
    });

    // Función para validar el RUT chileno
    function validarRun(run) {
        if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(run)) return false;
        var tmp = run.split('-');
        var digv = tmp[1];
        var rut = tmp[0];
        if (digv == 'K') digv = 'k';
        var M = 0, S = 1;
        for (; rut; rut = Math.floor(rut / 10))
            S = (S + rut % 10 * (9 - M++ % 6)) % 11;
        return S ? S - 1 == digv : 'k' == digv;
    }

    // Evento de envío del formulario
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault(); // Prevenir el envío automático
        
        let errores = [];
        
        // Seleccionar todos los campos
        const run = document.getElementById('run').value;
        const nombre = document.getElementById('nombre').value;
        const apellidos = document.getElementById('apellidos').value;
        const email = document.getElementById('email').value;
        const fechaNacimiento = document.getElementById('fecha-nacimiento').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        const region = regionSelect.value;
        const comuna = comunaSelect.value;
        const direccion = document.getElementById('direccion').value;

        // 1. Validar RUN
        if (run.length < 7 || run.length > 9) errores.push("El RUN debe tener entre 7 y 9 caracteres.");
        // if (!validarRun(run)) errores.push("El RUN no es válido.");

        // 2. Validar Nombre
        if (nombre === "") errores.push("El nombre es requerido.");
        if (nombre.length > 50) errores.push("El nombre no debe exceder los 50 caracteres.");
        
        // 3. Validar Apellidos
        if (apellidos === "") errores.push("Los apellidos son requeridos.");
        if (apellidos.length > 100) errores.push("Los apellidos no deben exceder los 100 caracteres.");
        
        // 4. Validar Correo
        const correosPermitidos = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
        if (email === "") errores.push("El correo es requerido.");
        if (email.length > 100) errores.push("El correo no debe exceder los 100 caracteres.");
        if (!correosPermitidos.some(dominio => email.endsWith(dominio))) {
            errores.push("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.");
        }
        
        // 5. Validar Fecha de Nacimiento
        if (fechaNacimiento === "") errores.push("La fecha de nacimiento es requerida.");

        // 6. Validar Contraseñas
        if (password.length < 4 || password.length > 10) errores.push("La contraseña debe tener entre 4 y 10 caracteres.");
        if (password !== passwordConfirm) errores.push("Las contraseñas no coinciden.");

        // 7. Validar Región y Comuna
        if (region === "") errores.push("Debe seleccionar una región.");
        if (comuna === "") errores.push("Debe seleccionar una comuna.");

        // 8. Validar Dirección
        if (direccion === "") errores.push("La dirección es requerida.");
        if (direccion.length > 300) errores.push("La dirección no debe exceder los 300 caracteres.");

        // Mostrar errores o mensaje de éxito
        if (errores.length > 0) {
            alert("Por favor, corrija los siguientes errores:\n\n" + errores.join("\n"));
        } else {
            alert("¡Registro exitoso!");
            formulario.reset(); // Limpiar el formulario
            comunaSelect.innerHTML = '<option value="">-- Seleccione una comuna --</option>'; // Limpiar comunas
        }
    });
});