//Validación del correo
export function validarCorreo(correo) {
  const regex = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
  return regex.test(correo);
}

//Validación del run
export function validarRun(run) {
  // Expresión regular para 7-8 dígitos seguidos de un guion y un dígito o 'K'
  // o 7-8 dígitos seguidos de un dígito o 'K' (sin guion)
  const regex = /^[0-9]{7,8}-?[0-9K]$/;
  
  if (!regex.test(run)) {
      return false; // No cumple el formato
  }
  
  // Limpiar el RUN de puntos y guion
  let runLimpio = run.replace(/[\.-]/g, '');
  
  // Separar cuerpo y dígito verificador
  let cuerpo = runLimpio.slice(0, -1);
  let dv = runLimpio.slice(-1).toUpperCase();
  
  // --- Algoritmo de validación (Módulo 11) ---
  let suma = 0;
  let multiplo = 2;
  
  // Iterar de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      
      multiplo = multiplo + 1;
      if (multiplo === 8) {
          multiplo = 2;
      }
  }
  
  // Calcular el resto
  let resto = suma % 11;
  
  // Calcular el dígito verificador esperado
  let dvEsperado = 11 - resto;
  
  // Casos especiales del dígito
  if (dvEsperado === 11) {
      dvEsperado = 0;
  } else if (dvEsperado === 10) {
      dvEsperado = 'K';
  }
  
  // Comparar el DV calculado con el DV ingresado
  return dvEsperado.toString() === dv;
}

//Validación de edad minima 18 años
export function esMayorEdad(fecha) {
  if (!fecha) return false; // Evitar error si la fecha está vacía
  
  const hoy = new Date();
  const fechaNacimiento = new Date(fecha);
  
  // Corregir problema de zona horaria (UTC)
  // Ajusta la fecha de nacimiento para que use la misma zona horaria que 'hoy'
  fechaNacimiento.setMinutes(fechaNacimiento.getMinutes() + fechaNacimiento.getTimezoneOffset());

  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
  }
  return edad >= 18;
}