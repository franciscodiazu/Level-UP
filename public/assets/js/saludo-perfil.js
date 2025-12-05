// Archivo: public/assets/js/saludo-perfil.js
// Script para mostrar saludo personalizado y manejar cierre de sesión

// Función principal que se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarPanelUsuario();
});

function inicializarPanelUsuario() {
    mostrarSaludoPersonalizado();
    configurarBotonCerrarSesion();
    actualizarEstadoSesion();
}

/**
 * Muestra el saludo personalizado con el nombre del usuario
 */
function mostrarSaludoPersonalizado() {
    const saludoElement = document.getElementById('saludo-nombre');
    
    if (!saludoElement) {
        console.warn('Elemento #saludo-nombre no encontrado');
        return;
    }
    
    // Verificar Firebase Auth primero
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Usuario autenticado en Firebase
            mostrarNombreUsuario(user, saludoElement);
        } else {
            // Intentar con localStorage
            const usuarioJson = localStorage.getItem('usuario');
            if (usuarioJson) {
                try {
                    const usuario = JSON.parse(usuarioJson);
                    mostrarNombreDesdeLocalStorage(usuario, saludoElement);
                } catch (error) {
                    mostrarSaludoGenerico(saludoElement);
                }
            } else {
                mostrarSaludoGenerico(saludoElement);
            }
        }
    });
}

/**
 * Muestra el nombre del usuario desde Firebase Auth
 */
function mostrarNombreUsuario(user, saludoElement) {
    let nombre = '';
    
    // Prioridad: displayName de Firebase > email > nombre en localStorage
    if (user.displayName) {
        nombre = user.displayName;
    } else if (user.email) {
        // Extraer solo el nombre del email (antes del @)
        nombre = user.email.split('@')[0];
        nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
    } else {
        // Intentar con localStorage
        const usuarioJson = localStorage.getItem('usuario');
        if (usuarioJson) {
            try {
                const usuario = JSON.parse(usuarioJson);
                nombre = usuario.nombre || 'Usuario';
            } catch (error) {
                nombre = 'Usuario';
            }
        } else {
            nombre = 'Usuario';
        }
    }
    
    saludoElement.innerHTML = `
        <i class="fas fa-user-circle" style="margin-right: 8px;"></i>
        ¡Hola, <span style="color: var(--color-primary); font-weight: bold;">${nombre}</span>!
    `;
    saludoElement.style.fontSize = '1.2em';
    
    // También actualizar localStorage si es necesario
    guardarUsuarioEnLocalStorage(user);
}

/**
 * Muestra el nombre del usuario desde localStorage
 */
function mostrarNombreDesdeLocalStorage(usuario, saludoElement) {
    const nombre = usuario.nombre || usuario.correo?.split('@')[0] || 'Usuario';
    
    saludoElement.innerHTML = `
        <i class="fas fa-user-circle" style="margin-right: 8px;"></i>
        ¡Hola, <span style="color: var(--color-primary); font-weight: bold;">${nombre}</span>!
    `;
    saludoElement.style.fontSize = '1.2em';
}

/**
 * Muestra un saludo genérico para invitados
 */
function mostrarSaludoGenerico(saludoElement) {
    saludoElement.innerHTML = `
        <i class="fas fa-user" style="margin-right: 8px;"></i>
        ¡Hola, Invitado!
    `;
    saludoElement.style.color = '#888';
}

/**
 * Guarda información del usuario en localStorage
 */
function guardarUsuarioEnLocalStorage(user) {
    try {
        const usuarioData = {
            uid: user.uid,
            correo: user.email,
            nombre: user.displayName || user.email?.split('@')[0] || 'Usuario',
            idUsuario: user.uid
        };
        
        localStorage.setItem('usuario', JSON.stringify(usuarioData));
    } catch (error) {
        console.error('Error al guardar usuario en localStorage:', error);
    }
}

/**
 * Configura el botón de cerrar sesión
 */
function configurarBotonCerrarSesion() {
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    
    if (btnCerrarSesion) {
        // Añadir estilos al botón si no los tiene
        if (!btnCerrarSesion.style.backgroundColor) {
            btnCerrarSesion.style.cssText = `
                background: linear-gradient(135deg, #ff416c, #ff4b2b);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                margin-left: 10px;
            `;
            
            btnCerrarSesion.innerHTML = `
                <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>
                Cerrar Sesión
            `;
        }
        
        btnCerrarSesion.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(255, 75, 43, 0.3)';
        });
        
        btnCerrarSesion.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
}

/**
 * Función para cerrar sesión
 */
function cerrarSesion() {
    // Mostrar diálogo de confirmación
    const confirmar = confirm('¿Estás seguro de que deseas cerrar sesión?');
    
    if (confirmar) {
        // Mostrar mensaje de carga
        const originalText = document.getElementById('btnCerrarSesion').innerHTML;
        document.getElementById('btnCerrarSesion').innerHTML = `
            <i class="fas fa-spinner fa-spin" style="margin-right: 5px;"></i>
            Cerrando...
        `;
        document.getElementById('btnCerrarSesion').disabled = true;
        
        // Cerrar sesión de Firebase
        firebase.auth().signOut()
            .then(() => {
                console.log('Sesión cerrada exitosamente');
                
                // Limpiar datos locales
                localStorage.removeItem('usuario');
                localStorage.removeItem('carrito');
                
                // Mostrar mensaje de éxito
                alert('Sesión cerrada exitosamente');
                
                // Redirigir al inicio
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 500);
                
            })
            .catch((error) => {
                console.error('Error al cerrar sesión:', error);
                
                // Restaurar botón
                document.getElementById('btnCerrarSesion').innerHTML = originalText;
                document.getElementById('btnCerrarSesion').disabled = false;
                
                // Mostrar error
                alert(`Error al cerrar sesión: ${error.message}`);
            });
    }
}

/**
 * Actualiza el estado de la sesión periódicamente
 */
function actualizarEstadoSesion() {
    // Verificar cada 5 minutos si la sesión sigue activa
    setInterval(() => {
        firebase.auth().currentUser?.getIdToken(/* forceRefresh */ true)
            .catch(() => {
                // Si falla, la sesión podría haber expirado
                console.log('La sesión podría haber expirado');
                // Opcional: redirigir a login
                // window.location.href = 'login.html';
            });
    }, 5 * 60 * 1000); // 5 minutos
}

// Función para actualizar el saludo manualmente (útil después de editar perfil)
function actualizarSaludo(nuevoNombre) {
    const saludoElement = document.getElementById('saludo-nombre');
    if (saludoElement && nuevoNombre) {
        saludoElement.innerHTML = `
            <i class="fas fa-user-circle" style="margin-right: 8px;"></i>
            ¡Hola, <span style="color: var(--color-primary); font-weight: bold;">${nuevoNombre}</span>!
        `;
    }
}

// Hacer funciones disponibles globalmente
window.mostrarSaludoPersonalizado = mostrarSaludoPersonalizado;
window.actualizarSaludo = actualizarSaludo;
window.cerrarSesion = cerrarSesion;