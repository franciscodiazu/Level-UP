// js/validacion.js

// --- FUNCIONES DE VALIDACIÓN (Declaradas una sola vez) ---

/**
 * Valida el formato y el dígito verificador de un RUT chileno.
 */
function validarRunCompleto(run) {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(run)) {
        return false; // Formato inválido (debe tener guion)
    }
    const [rut, digitoVerificador] = run.split('-');
    const dv = digitoVerificador.toLowerCase();
    
    let suma = 0;
    let multiplo = 2;

    for (let i = rut.length - 1; i >= 0; i--) {
        suma += parseInt(rut.charAt(i), 10) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const dvCalculado = 11 - (suma % 11);

    if (dvCalculado === 11 && dv === '0') return true;
    if (dvCalculado === 10 && dv === 'k') return true;
    return dvCalculado == dv;
}

/**
 * Valida que el nombre no esté vacío y tenga una longitud máxima de 50 caracteres.
 */
function validarNombre(nombre) {
    return nombre.trim() !== "" && nombre.length <= 50;
}

/**
 * Valida que los apellidos no estén vacíos y tengan una longitud máxima de 100 caracteres.
 */
function validarApellidos(apellidos) {
    return apellidos.trim() !== "" && apellidos.length <= 100;
}

/**
 * Valida que el correo pertenezca a los dominios permitidos.
 */
function validarCorreo(correo) {
    const regex = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    return regex.test(correo);
}

/**
 * Valida que el usuario sea mayor de 18 años a partir de su fecha de nacimiento.
 */
function esMayorDeEdad(fecha) {
    if (!fecha) return false;

    const hoy = new Date();
    const fechaNacimiento = new Date(fecha);
    
    // Corrige el desfase de zona horaria al interpretar la fecha del input
    fechaNacimiento.setMinutes(fechaNacimiento.getMinutes() + fechaNacimiento.getTimezoneOffset());

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad >= 18;
}

/**
 * Valida que la contraseña tenga la longitud correcta y que ambas contraseñas coincidan.
 */
function validarContrasenas(password, passwordConfirm) {
    const longitudValida = password.length >= 4 && password.length <= 10;
    const coinciden = password === passwordConfirm;
    return longitudValida && coinciden;
}

/**
 * Valida que se haya seleccionado una opción en un select (para región y comuna).
 */
function validarSeleccion(valor) {
    return valor !== "";
}

/**
 * Valida que la dirección no esté vacía y no exceda los 300 caracteres.
 */
function validarDireccion(direccion) {
    return direccion.trim() !== "" && direccion.length <= 300;
}


// --- LÓGICA DEL DOM Y EVENTOS ---

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
    formulario.addEventListener('submit', (event) => {
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
            comunaSelect.innerText = "";// Limpiar comunas
        }
    });
});
