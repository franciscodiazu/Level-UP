// IMPORTACIONES AL TOPE
import { regionesYComunas } from '../utils/regiones'; // debe exportar: export const regionesYComunas = { regiones: [...] };

// --- FUNCIONES DE VALIDACIÓN ---
export function validarRunCompleto(run) {
  if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(run)) return false;
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
  return dvCalculado === Number(dv);
}

export function validarNombre(nombre) {
  return nombre.trim() !== "" && nombre.length <= 50;
}

export function validarApellidos(apellidos) {
  return apellidos.trim() !== "" && apellidos.length <= 100;
}

export function validarCorreo(correo) {
  const regex = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
  return regex.test(correo);
}

export function esMayorDeEdad(fecha) {
  if (!fecha) return false;
  const hoy = new Date();
  const fechaNacimiento = new Date(fecha);
  fechaNacimiento.setMinutes(fechaNacimiento.getMinutes() + fechaNacimiento.getTimezoneOffset());
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();
  if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;
  return edad >= 18;
}

export function validarContrasenas(password, passwordConfirm) {
  const longitudValida = password.length >= 4 && password.length <= 10;
  const coinciden = password === passwordConfirm;
  return longitudValida && coinciden;
}

export function validarSeleccion(valor) {
  return valor !== "";
}

export function validarDireccion(direccion) {
  return direccion.trim() !== "" && direccion.length <= 300;
}

// --- UTILIDADES PARA UI DE ERRORES ---
function setError(input, msg) {
  const group = input.closest('.form-group') || input.parentElement;
  let small = group.querySelector('.error-msg');
  if (!small) {
    small = document.createElement('small');
    small.className = 'error-msg';
    group.appendChild(small);
  }
  small.textContent = msg;
  input.classList.add('is-invalid');
}

function clearError(input) {
  const group = input.closest('.form-group') || input.parentElement;
  const small = group.querySelector('.error-msg');
  if (small) small.remove();
  input.classList.remove('is-invalid');
}

document.addEventListener('DOMContentLoaded', () => {
  const regionSelect = document.getElementById('region');
  const comunaSelect = document.getElementById('comuna');
  const formulario = document.getElementById('registroForm');

  // Cargar regiones
  regionSelect.innerHTML = '<option value="">-- Seleccione una región --</option>';
  regionesYComunas.regiones.forEach(region => {
    const option = document.createElement('option');
    option.value = region.nombre;
    option.textContent = region.nombre;
    regionSelect.appendChild(option);
  });

  // Cargar comunas al cambiar región
  regionSelect.addEventListener('change', function () {
    const regionSeleccionada = this.value;
    comunaSelect.innerHTML = '<option value="">-- Seleccione una comuna --</option>';
    if (regionSeleccionada) {
      const region = regionesYComunas.regiones.find(r => r.nombre === regionSeleccionada);
      if (region) {
        region.comunas.forEach(comuna => {
          const option = document.createElement('option');
          option.value = comuna;
          option.textContent = comuna;
          comunaSelect.appendChild(option);
        });
      }
    }
  });

  // Validación al enviar
  formulario.addEventListener('submit', (event) => {
  // Bloqueo nativo primero
  if (!formulario.checkValidity()) {
    event.preventDefault();
    formulario.reportValidity();
    return; // no continúa si hay campos vacíos/incorrectos por HTML
  }
    event.preventDefault();

    // Inputs
    const runInput = document.getElementById('run');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const emailInput = document.getElementById('email');
    const fechaInput = document.getElementById('fecha-nacimiento');
    const passInput = document.getElementById('password');
    const pass2Input = document.getElementById('password-confirm');
    const direccionInput = document.getElementById('direccion');

    // Limpiar errores previos
    [runInput, nombreInput, apellidosInput, emailInput, fechaInput, passInput, pass2Input, regionSelect, comunaSelect, direccionInput]
      .forEach(clearError);

    let valido = true;

    if (!validarRunCompleto(runInput.value)) {
      setError(runInput, "RUN inválido (formato: 12345678-9).");
      valido = false;
    }
    if (!validarNombre(nombreInput.value)) {
      setError(nombreInput, "Nombre requerido (máx. 50).");
      valido = false;
    }
    if (!validarApellidos(apellidosInput.value)) {
      setError(apellidosInput, "Apellidos requeridos (máx. 100).");
      valido = false;
    }
    if (!validarCorreo(emailInput.value)) {
      setError(emailInput, "Correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.");
      valido = false;
    }
    if (!esMayorDeEdad(fechaInput.value)) {
      setError(fechaInput, "Debe ser mayor de 18 años.");
      valido = false;
    }
    if (!validarContrasenas(passInput.value, pass2Input.value)) {
      setError(pass2Input, "Contraseñas entre 4 y 10 y deben coincidir.");
      valido = false;
    }
    if (!validarSeleccion(regionSelect.value)) {
      setError(regionSelect, "Seleccione una región.");
      valido = false;
    }
    if (!validarSeleccion(comunaSelect.value)) {
      setError(comunaSelect, "Seleccione una comuna.");
      valido = false;
    }
    if (!validarDireccion(direccionInput.value)) {
      setError(direccionInput, "Dirección requerida (máx. 300).");
      valido = false;
    }

    if (valido) {
      // Aquí podría enviarse al backend con fetch/AJAX
      formulario.reset();
      comunaSelect.innerHTML = '<option value="">-- Seleccione una comuna --</option>';
      alert("¡Registro exitoso!");
    }
  });
});
