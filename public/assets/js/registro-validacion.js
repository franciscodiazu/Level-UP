import { validarCorreo, validarRun, esMayorEdad } from './validacion.js';
// --- NUEVO: Importar los datos de regiones y comunas ---
import { regionesYComunas } from './regiones.js';

// --- INICIO DE CÓDIGO FIREBASE ---

// 1. Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
    authDomain: "tienda-level-up.firebaseapp.com",
    projectId: "tienda-level-up",
    storageBucket: "tienda-level-up.appspot.com",
    messagingSenderId: "210482166049",
    appId: "1:210482166049:web:15dadb935d28d9f7d02660",
    measurementId: "G-85R23XKYYM"
};

// 2. Inicializar Firebase
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}

// 3. Obtener la instancia de la base de datos
const db = firebase.firestore();

/**
 * 4. Función para guardar el usuario en la colección "usuario"
 */
async function guardarUsuarioEnFirebase(usuario) {
    try {
        const docRef = await db.collection("usuario").add({
            ...usuario,
            createdAt: new Date()
        });
        console.log("Usuario Registrado con ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al registrar usuario: ", error);
        return { success: false, error: error };
    }
}

// --- FIN DE CÓDIGO FIREBASE ---


document.addEventListener("DOMContentLoaded", () => {
    const registroForm = document.getElementById("registroForm");
    
    // --- NUEVO: Seleccionar los <select> de region y comuna ---
    const selectRegion = document.getElementById("region");
    const selectComuna = document.getElementById("comuna");
    
    if (!registroForm) return;

    // --- NUEVO: Lógica para cargar Regiones y Comunas ---

    /**
     * Carga todas las regiones en el <select> de regiones
     */
    function cargarRegiones() {
        if (!selectRegion) return;
        
        // Ordenar regiones alfabéticamente
        regionesYComunas.regiones.sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Iterar y añadir cada región como un <option>
        regionesYComunas.regiones.forEach(region => {
            const option = document.createElement('option');
            option.value = region.nombre;
            option.textContent = region.nombre;
            selectRegion.appendChild(option);
        });
    }

    /**
     * Carga las comunas de la región seleccionada en el <select> de comunas
     */
    function cargarComunas(nombreRegion) {
        if (!selectComuna) return;

        // Limpiar comunas anteriores
        selectComuna.innerHTML = '<option value="">-- Seleccione una comuna --</option>';
        
        // Encontrar la región seleccionada en los datos
        const regionEncontrada = regionesYComunas.regiones.find(r => r.nombre === nombreRegion);

        if (regionEncontrada) {
            // Ordenar comunas alfabéticamente
            regionEncontrada.comunas.sort((a, b) => a.localeCompare(b));
            
            // Iterar y añadir cada comuna como un <option>
            regionEncontrada.comunas.forEach(comuna => {
                const option = document.createElement('option');
                option.value = comuna;
                option.textContent = comuna;
                selectComuna.appendChild(option);
            });
            // Habilitar el <select> de comunas
            selectComuna.disabled = false;
        } else {
            // Deshabilitar si no se encontró región
            selectComuna.disabled = true;
        }
    }

    // --- NUEVO: Event listener para cuando el usuario cambia la región ---
    if (selectRegion) {
        selectRegion.addEventListener('change', (e) => {
            const regionSeleccionada = e.target.value;
            if (regionSeleccionada) {
                cargarComunas(regionSeleccionada);
            } else {
                // Si el usuario des-selecciona (vuelve a "Seleccione una región")
                selectComuna.innerHTML = '<option value="">-- Seleccione una comuna --</option>';
                selectComuna.disabled = true;
            }
        });
    }

    // --- NUEVO: Carga inicial de las regiones al cargar la página ---
    cargarRegiones();

    // --- FIN DE LÓGICA DE REGIONES Y COMUNAS ---


    // Listener del formulario (como ya lo tenías)
    registroForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Recolectar datos (como ya lo tenías)
        const run = document.getElementById("run").value.trim().toUpperCase();
        const nombre = document.getElementById("nombre").value.trim();
        const apellidos = document.getElementById("apellidos").value.trim();
        const email = document.getElementById("email").value.trim();
        const fechaNacimiento = document.getElementById("fecha-nacimiento").value;
        const password = document.getElementById("password").value;
        const passwordConfirm = document.getElementById("password-confirm").value;
        const telefono = document.getElementById("telefono").value.trim();
        const region = document.getElementById("region").value; // Ahora tendrá valor
        const comuna = document.getElementById("comuna").value; // Ahora tendrá valor
        const direccion = document.getElementById("direccion").value.trim();

        // Función helper para mostrar errores
        const mostrarError = (mensaje) => {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: mensaje,
                confirmButtonColor: '#1E90FF'
            });
        };

        // Validaciones (como ya las tenías)
        if (!validarRun(run)) {
            mostrarError("RUN incorrecto. Debe tener 8 dígitos + número o K verificador");
            return;
        }
        if (!nombre || !apellidos) {
            mostrarError("Nombre y apellidos son obligatorios");
            return;
        }
        if (!validarCorreo(email)) {
            mostrarError("El correo debe ser '@duoc.cl', '@profesor.duoc.cl' o '@gmail.com'");
            return;
        }
        if (!esMayorEdad(fechaNacimiento)) {
            mostrarError("Debe ser mayor de 18 años para registrarse");
            return;
        }
        if (password.length < 6) {
            mostrarError("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (password !== passwordConfirm) {
            mostrarError("Las contraseñas no coinciden");
            return;
        }
        // Validaciones de dirección (como ya las tenías)
        if (!region) {
            mostrarError("Debe seleccionar una Región");
            return;
        }
        if (!comuna) {
            mostrarError("Debe seleccionar una Comuna");
            return;
        }
        if (!direccion) {
            mostrarError("La Dirección es obligatoria");
            return;
        }

        // Mostrar modal de "Cargando..."
        Swal.fire({
            title: 'Registrando usuario...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Crear el objeto de usuario
        const nuevoUsuario = {
            run,
            nombre,
            apellidos,
            correo: email,
            fechaNacimiento,
            clave: password,
            telefono: telefono || "",
            region,
            comuna,
            direccion,
            rol: email.toLowerCase() === "admin@duoc.cl" ? "admin" : "cliente"
        };
        
        // Intentar guardar en Firebase
        const resultado = await guardarUsuarioEnFirebase(nuevoUsuario);

        if (resultado.success) {
            // Si se guardó con éxito
            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: 'Serás redirigido a tu perfil.',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true
            }).then(() => {
                const usuarioParaStorage = { nombre, correo: email, rol: nuevoUsuario.rol };
                localStorage.setItem("usuario", JSON.stringify(usuarioParaStorage));
                
                const destino = nuevoUsuario.rol === "admin"
                    ? "admin-dashboard.html" 
                    : "perfil-cliente.html";
                window.location.href = destino;
            });
        } else {
            // Si falló el guardado en Firebase
            Swal.fire({
                icon: 'error',
                title: 'Error al Guardar',
                text: `No se pudo crear el usuario en la base de datos. ${resultado.error.message}`,
                confirmButtonColor: '#1E90FF'
            });
        }
    });
});