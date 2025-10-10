export function validarRunCompleto(run) {
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
export function validarNombre(nombre) {
    return nombre.trim() !== "" && nombre.length <= 50;
}

/**
 * Valida que los apellidos no estén vacíos y tengan una longitud máxima de 100 caracteres.
 */
export function validarApellidos(apellidos) {
    return apellidos.trim() !== "" && apellidos.length <= 100;
}

/**
 * Valida que el correo pertenezca a los dominios permitidos.
 */
export function validarCorreo(correo) {
    const regex = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    return regex.test(correo);
}

/**
 * Valida que el usuario sea mayor de 18 años a partir de su fecha de nacimiento.
 */
export function esMayorDeEdad(fecha) {
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
export function validarContrasenas(password, passwordConfirm) {
    const longitudValida = password.length >= 4 && password.length <= 10;
    const coinciden = password === passwordConfirm;
    return longitudValida && coinciden;
}

/**
 * Valida que se haya seleccionado una opción en un select (para región y comuna).
 */
export function validarSeleccion(valor) {
    return valor !== "";
}

/**
 * Valida que la dirección no esté vacía y no exceda los 300 caracteres.
 */
export function validarDireccion(direccion) {
    return direccion.trim() !== "" && direccion.length <= 300;
}

