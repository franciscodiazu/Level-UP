document.addEventListener('DOMContentLoaded', function () {
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    const formulario = document.getElementById('registroForm');

    // Cargar regiones al inicio (tu código original está perfecto aquí)
    regionesYComunas.regiones.forEach(region => {
        const option = document.createElement('option');
        option.value = region.nombre;
        option.textContent = region.nombre;
        regionSelect.appendChild(option);
    });

    // Cargar comunas al cambiar la región (tu código original está perfecto aquí)
    regionSelect.addEventListener('change', function () {
        const regionSeleccionada = this.value;
        comunaSelect.innerHTML = '<option value="">-- Seleccione una comuna --</option>';

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

    // Evento de envío del formulario
    export formulario.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenir el envío automático
        
        const errores = [];
        
        // Seleccionar valores de los campos
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

        // --- Aplicar Validaciones ---
        if (!validarRunCompleto(run)) errores.push("El RUN no es válido (formato: 12345678-9).");
        if (!validarNombre(nombre)) errores.push("El nombre es requerido y no puede exceder 50 caracteres.");
        if (!validarApellidos(apellidos)) errores.push("Los apellidos son requeridos y no pueden exceder 100 caracteres.");
        if (!validarCorreo(email)) errores.push("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.");
        if (!esMayorDeEdad(fechaNacimiento)) errores.push("Debes ser mayor de 18 años.");
        if (!validarContrasenas(password, passwordConfirm)) errores.push("La contraseña debe tener entre 4 y 10 caracteres y ambas deben coincidir.");
        if (!validarSeleccion(region)) errores.push("Debes seleccionar una región.");
        if (!validarSeleccion(comuna)) errores.push("Debes seleccionar una comuna.");
        if (!validarDireccion(direccion)) errores.push("La dirección es requerida y no puede exceder 300 caracteres.");

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