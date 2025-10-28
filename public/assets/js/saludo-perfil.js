document.addEventListener("DOMContentLoaded", () => {
    const saludoElement = document.getElementById("saludoUsuario");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    const sidebarNav = document.querySelector(".sidebar-nav ul");
    const contentArea = document.getElementById("profileContentArea");

    // --- Validaciones iniciales ---
    if (!saludoElement) console.error("Elemento 'saludoUsuario' no encontrado.");
    if (!btnCerrarSesion) console.error("Botón 'btnCerrarSesion' no encontrado.");
    if (!sidebarNav) console.error("Navegación lateral '.sidebar-nav ul' no encontrada.");
    if (!contentArea) console.error("Área de contenido '#profileContentArea' no encontrada.");

    if (!saludoElement || !btnCerrarSesion || !sidebarNav || !contentArea) {
        // Detener si falta algún elemento crucial
        if (saludoElement) saludoElement.textContent = "Error al cargar la interfaz del perfil.";
        return; 
    }

    // --- Mostrar Saludo (modificado) ---
    let nombreUsuario = "Cliente"; // Valor por defecto
    try {
        const usuarioStr = localStorage.getItem("usuario");
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            nombreUsuario = usuario.nombre || usuario.correo || "Cliente";
            saludoElement.innerHTML = `Bienvenido, <strong>${nombreUsuario}</strong>`; // Saludo directo
        } else {
            saludoElement.textContent = "Bienvenido.";
            // Considera redirigir si no hay usuario
            // window.location.href = 'login.html';
        }
    } catch (error) {
        console.error("Error al leer usuario desde localStorage:", error);
        saludoElement.textContent = "Error al cargar tu información.";
    }

    // --- Lógica de Cerrar Sesión (sin cambios) ---
    btnCerrarSesion.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuario");
        if (typeof Swal !== 'undefined') {
            Swal.fire({ /* ... modal SweetAlert ... */ }).then(() => {
                window.location.href = '../../index.html';
            });
        } else {
            alert("Sesión cerrada.");
            window.location.href = '../../index.html';
        }
    });

    // --- NUEVO: Lógica de Carga Dinámica de Contenido ---

    /**
     * Carga el contenido de una página HTML en el área designada.
     * @param {string} pageName - El nombre base del archivo HTML (sin .html).
     */
    async function loadContent(pageName) {
        // Evita recargar 'inicio-perfil' si no existe archivo
        if (pageName === 'inicio-perfil') {
            contentArea.innerHTML = `<h2>Inicio Perfil</h2><p>Bienvenido a tu panel de control, ${nombreUsuario}.</p><p>Aquí puedes gestionar tu cuenta y ver tus actividades recientes.</p>`;
             contentArea.classList.remove('loading');
            return;
        }

        const url = `${pageName}.html`; // Construye la URL del archivo
        contentArea.innerHTML = ''; // Limpia el contenido anterior
        contentArea.classList.add('loading'); // Añade clase para mostrar "Cargando..."

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo cargar ${url}`);
            }
            const html = await response.text();
            
            // Extraer solo el contenido dentro de <main> o un contenedor específico
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main .container') || doc.querySelector('main'); // Busca <main class="container"> o solo <main>
            
            if (mainContent) {
                contentArea.innerHTML = mainContent.innerHTML; // Inserta solo el contenido interno
            } else {
                 contentArea.innerHTML = '<p>Error: No se encontró contenido principal en la página cargada.</p>';
            }

        } catch (error) {
            console.error("Error al cargar contenido:", error);
            contentArea.innerHTML = `<p style="color: red;">Error al cargar la sección: ${error.message}</p>`;
        } finally {
             contentArea.classList.remove('loading'); // Quita la clase "Cargando..."
        }
    }

    /**
     * Maneja los clics en los botones de navegación lateral.
     */
    sidebarNav.addEventListener("click", (e) => {
        // Verificar si se hizo clic en un botón con data-page
        if (e.target.tagName === 'BUTTON' && e.target.dataset.page) {
            const pageToLoad = e.target.dataset.page;

             // Quitar 'active' de todos los botones
            sidebarNav.querySelectorAll('button.nav-button').forEach(btn => {
                btn.classList.remove('active');
            });
             // Añadir 'active' al botón clickeado
            e.target.classList.add('active');

            // Cargar el contenido
            loadContent(pageToLoad);
        }
    });

    // --- Carga Inicial del Contenido por Defecto ---
    loadContent('inicio-perfil'); // Carga la vista inicial

});