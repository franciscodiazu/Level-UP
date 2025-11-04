// Espera a que todo el contenido del HTML se cargue.
document.addEventListener('DOMContentLoaded', function() {

    // 1. Seleccionar el textarea por su ID.
    const comentarioTextarea = document.getElementById('comentario');

    // Salir si el textarea no se encuentra en la página actual.
    if (!comentarioTextarea) {
        return;
    }

    /**
     * Función que ajusta la altura de un elemento textarea a su contenido.
     * @param {HTMLElement} element - El elemento textarea que se ajustará.
     */
    function autoGrow(element) {
        // Primero, reseteamos la altura a 'auto'. Esto es crucial para que el 
        // cuadro de texto pueda encogerse si el usuario borra texto.
        element.style.height = 'auto';
        
        // Luego, establecemos la altura del elemento a su 'scrollHeight'.
        // scrollHeight es la altura total del contenido de un elemento, 
        // incluyendo el texto que no es visible y que requeriría un scrollbar.
        element.style.height = element.scrollHeight + 'px';
    }

    // 2. Añadir un "escuchador" para el evento 'input'.
    // Este evento se dispara cada vez que el usuario escribe, pega o borra texto.
    comentarioTextarea.addEventListener('input', function() {
        // 'this' se refiere al elemento que disparó el evento (el textarea).
        autoGrow(this);
    });

    // Opcional: Llamar a la función una vez al cargar por si el navegador
    // autocompleta el campo con texto.
    autoGrow(comentarioTextarea);
});