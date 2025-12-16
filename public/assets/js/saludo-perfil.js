// Archivo: public/assets/js/saludo-perfil.js

// 1. EJECUCIÓN INMEDIATA
inicializarPanelUsuario();

function inicializarPanelUsuario() {
    setTimeout(() => {
        mostrarSaludoPersonalizado();
        configurarBotonCerrarSesion();
    }, 50);

    // Check periódico de sesión
    setInterval(() => {
        if (firebase.auth().currentUser) {
            firebase.auth().currentUser.getIdToken(true).catch(() => console.log('Sesión expirada'));
        }
    }, 5 * 60 * 1000);
}

function mostrarSaludoPersonalizado() {
    const saludoElement = document.getElementById('saludo-nombre');
    const authButtons = document.getElementById('auth-buttons-container');
    const userProfile = document.getElementById('user-profile-container');
    
    const toggleVista = (estaLogueado) => {
        if (authButtons && userProfile) {
            if (estaLogueado) {
                authButtons.style.display = 'none';
                userProfile.style.display = 'flex';
            } else {
                authButtons.style.display = 'flex';
                userProfile.style.display = 'none';
            }
        }
    };

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            toggleVista(true); 
            if(saludoElement) mostrarNombreUsuario(user, saludoElement);
        } else {
            const usuarioJson = localStorage.getItem('usuario');
            if (usuarioJson) {
                try {
                    const usuario = JSON.parse(usuarioJson);
                    toggleVista(true);
                    if(saludoElement) mostrarNombreDesdeLocalStorage(usuario, saludoElement);
                } catch (error) {
                    toggleVista(false); 
                }
            } else {
                toggleVista(false);
            }
        }
    });
}

function mostrarNombreUsuario(user, saludoElement) {
    let nombre = '';
    
    if (user.displayName) {
        nombre = user.displayName;
    } else if (user.email) {
        nombre = user.email.split('@')[0];
        nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
    } else {
        const usuarioJson = localStorage.getItem('usuario');
        if (usuarioJson) {
            try {
                const usuario = JSON.parse(usuarioJson);
                nombre = usuario.nombre || 'Usuario';
            } catch (error) { nombre = 'Usuario'; }
        } else { nombre = 'Usuario'; }
    }
    
    // Solo el nombre
    saludoElement.textContent = nombre;
    guardarUsuarioEnLocalStorage(user);
}

function mostrarNombreDesdeLocalStorage(usuario, saludoElement) {
    let nombre = usuario.nombre || usuario.correo?.split('@')[0] || 'Usuario';
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
    saludoElement.textContent = nombre;
}

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

function configurarBotonCerrarSesion() {
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    
    if (btnCerrarSesion) {
        // --- ESTILO RESTAURADO (El original con degradado) ---
        if (!btnCerrarSesion.style.backgroundColor) {
            btnCerrarSesion.style.cssText = `
                background: linear-gradient(135deg, #ff416c, #ff4b2b);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 0.9rem;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            
            // Icono + Texto
            btnCerrarSesion.innerHTML = `
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            `;
        }
        
        btnCerrarSesion.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 12px rgba(255, 75, 43, 0.4)';
        });
        
        btnCerrarSesion.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
        
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
}

function cerrarSesion() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: "Tendrás que ingresar nuevamente para comprar.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                ejecutarLogout();
            }
        });
    } else {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            ejecutarLogout();
        }
    }
}

function ejecutarLogout() {
    const btn = document.getElementById('btnCerrarSesion');
    if(btn) {
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cerrando...';
        btn.disabled = true;
    }

    firebase.auth().signOut()
        .then(() => {
            localStorage.removeItem('usuario');
            localStorage.removeItem('carrito');
            localStorage.removeItem('cartTotal'); 
            window.location.reload(); 
        })
        .catch((error) => {
            console.error('Error:', error);
            if(btn) {
                // Restauramos el botón si falla
                btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
                btn.disabled = false;
            }
        });
}

// Funciones globales
window.mostrarSaludoPersonalizado = mostrarSaludoPersonalizado;
window.cerrarSesion = cerrarSesion;