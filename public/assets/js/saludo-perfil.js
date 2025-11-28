/**
 * LÓGICA DE INICIO
 * Detectamos si el DOM ya está listo o si debemos esperar.
 * Esto es crucial porque este script se carga dinámicamente.
 */
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", mainEjecucion);
} else {
    // Si la página ya cargó (caso común al venir desde loadHeader.js), ejecutamos directo.
    mainEjecucion();
}

function mainEjecucion() {
    // 1. Intentar actualizar el header (Icono del usuario)
    actualizarHeaderUsuario();

    // 2. Intentar cargar lógica del perfil (Solo funcionará si estamos en perfil-cliente.html)
    iniciarPaginaPerfil();
}

/**
 * Busca el header y reemplaza los botones de Login/Registro 
 * por el nombre e icono del usuario si hay sesión activa.
 */
function actualizarHeaderUsuario() {
    // Buscamos el contenedor de botones. 
    // Como loadHeader.js acaba de inyectar el HTML, esto debería existir.
    const headerAuth = document.querySelector(".header-auth-buttons");
    
    // Verificación de seguridad: si por alguna razón no existe, no hacemos nada.
    if (!headerAuth) return;

    // Verificamos si hay usuario guardado en localStorage
    const usuarioStr = localStorage.getItem("usuario");
    
    if (usuarioStr) {
        try {
            const usuario = JSON.parse(usuarioStr);
            const nombre = usuario.nombre || usuario.correo || "Mi Cuenta";
            
            // Ruta de la imagen (Ajusta si moviste tu imagen nueva)
            // Nota: Usamos una ruta absoluta '/assets/...' para que funcione en cualquier carpeta
            const imagenPerfil = "/assets/img/dev1.png"; 

            // REEMPLAZO: Cambiamos el HTML de los botones por el del perfil
            // Importante: Usamos rutas absolutas (empezando con /) para los enlaces
            headerAuth.innerHTML = `
                <a href="/assets/html/perfil-cliente.html" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: white;">
                    <img src="${imagenPerfil}" alt="Perfil" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid white;">
                    <span style="font-weight: bold; font-size: 0.95rem;">${nombre}</span>
                </a>
            `;
        } catch (e) {
            console.error("Error leyendo datos del usuario para el header:", e);
        }
    }
}

/**
 * Lógica original de tu panel de perfil. 
 * Solo se ejecuta si existen los elementos del DOM específicos del perfil.
 */
function iniciarPaginaPerfil() {
    const saludoElement = document.getElementById("saludoUsuario");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    const sidebarNav = document.querySelector(".sidebar-nav ul");
    const contentArea = document.getElementById("profileContentArea");

    // Si falta algún elemento esencial, asumimos que NO estamos en la página de perfil
    if (!saludoElement || !btnCerrarSesion || !sidebarNav || !contentArea) {
        return; 
    }

    // --- Mostrar Saludo en el Perfil ---
    let nombreUsuario = "Cliente"; 
    try {
        const usuarioStr = localStorage.getItem("usuario");
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            nombreUsuario = usuario.nombre || usuario.correo || "Cliente";
            saludoElement.innerHTML = `Bienvenido, <strong>${nombreUsuario}</strong>`;
        } else {
            saludoElement.textContent = "Bienvenido.";
        }
    } catch (error) {
        console.error("Error al leer usuario:", error);
    }

    // --- Lógica de Cerrar Sesión ---
    btnCerrarSesion.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuario");
        
        const accionCierre = () => window.location.href = '/index.html'; // Ruta absoluta al inicio

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Cerrando sesión...',
                timer: 1500,
                showConfirmButton: false
            }).then(accionCierre);
        } else {
            accionCierre();
        }
    });

    // --- Carga Dinámica de Contenido ---
    async function loadContent(pageName) {
        if (pageName === 'inicio-perfil') {
            contentArea.innerHTML = `
                <div class="fade-in">
                    <h2>Inicio Perfil</h2>
                    <p>Bienvenido a tu panel de control, <strong>${nombreUsuario}</strong>.</p>
                    <p>Aquí puedes gestionar tu cuenta y ver tus actividades recientes.</p>
                </div>`;
            contentArea.classList.remove('loading');
            return;
        }

        const url = `${pageName}.html`;
        contentArea.innerHTML = '';
        contentArea.classList.add('loading');

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main .container') || doc.querySelector('main');
            
            if (mainContent) {
                contentArea.innerHTML = mainContent.innerHTML;
            } else {
                contentArea.innerHTML = '<p>Contenido no encontrado.</p>';
            }
        } catch (error) {
            console.error("Error carga dinámica:", error);
            contentArea.innerHTML = `<p style="color: red;">No se pudo cargar la sección.</p>`;
        } finally {
            contentArea.classList.remove('loading');
        }
    }

    sidebarNav.addEventListener("click", (e) => {
        const btn = e.target.closest('button');
        if (btn && btn.dataset.page) {
            sidebarNav.querySelectorAll('button.nav-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadContent(btn.dataset.page);
        }
    });

    loadContent('inicio-perfil');
}