export function autoGrow(element) {
        // Primero, reseteamos la altura a 'auto'. Esto es crucial para que el 
        // cuadro de texto pueda encogerse si el usuario borra texto.
        element.style.height = 'auto';
        
        // Luego, establecemos la altura del elemento a su 'scrollHeight'.
        // scrollHeight es la altura total del contenido de un elemento, 
        // incluyendo el texto que no es visible y que requeriría un scrollbar.
        element.style.height = element.scrollHeight + 'px';
    }