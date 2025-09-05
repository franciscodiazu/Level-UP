// Espera a que todo el contenido del HTML se cargue antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', function() {

    // Seleccionar el formulario de registro por su ID.
    const formulario = document.getElementById('registroForm');
    if (!formulario) {
        console.error("El formulario con id 'registroForm' no fue encontrado.");
        return;
    }

    // Añadir un "escuchador" para el evento 'submit' (cuando el usuario intenta enviar el formulario).
    formulario.addEventListener('submit', function(evento) {
        
        // Prevenir que el formulario se envíe automáticamente. Esto nos permite hacer nuestras validaciones primero.
        evento.preventDefault();

        // --- VALIDACIÓN DE EDAD ---
        
        // Obtener el input y el valor del campo de fecha de nacimiento.
        const fechaNacimientoInput = document.getElementById('fecha-nacimiento');
        if (!fechaNacimientoInput.value) {
            alert('Por favor, ingresa tu fecha de nacimiento.');
            return;
        }
        const fechaNacimiento = new Date(fechaNacimientoInput.value);
        
        // Calcular la edad del usuario de forma precisa.
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();

        // Ajustar la edad si el cumpleaños de este año aún no ha pasado.
        if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }

        // Comprobar si la edad es menor a 18.
        if (edad < 18) {
            // Si es menor de 18, muestra una alerta y detiene el proceso.
            alert('Lo sentimos, debes ser mayor de 18 años para registrarte.');
            return; // Detiene la ejecución de la función.
        }

        // --- VALIDACIÓN DE CORREO DUOC ---
        const emailInput = document.getElementById('email');
        const email = emailInput.value.toLowerCase(); // Convertimos a minúsculas para una comparación robusta.

        if (email.endsWith('@duoc.cl') || email.endsWith('@profesor.duoc.cl')) {
            alert('¡Genial! Hemos detectado un correo Duoc. Recibirás un 20% de descuento de por vida en tu cuenta.');
        }


        // Si todas las validaciones pasan, se puede proceder.
        // En una aplicación real, aquí es donde se enviarían los datos a un servidor.
        alert('¡Registro exitoso! Gracias por unirte a Level-Up Gamer.');
        
        // Limpiamos el formulario después de un envío exitoso.
        formulario.reset();
    });

});