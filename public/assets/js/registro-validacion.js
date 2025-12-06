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
const auth = firebase.auth();
const db = firebase.firestore();

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

        // --- LÓGICA DE REGISTRO CORREGIDA ---
        try {
            // 1. Crear el usuario en Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log("Usuario creado en Firebase Auth con UID:", user.uid);

            // 2. Crear el objeto de perfil para Firestore (SIN la contraseña)
            const perfilUsuario = {
                run,
                nombre,
                apellidos,
                correo: email,
                fechaNacimiento,
                telefono: telefono || "",
                region,
                comuna,
                direccion,
                rol: email.toLowerCase() === "admin@duoc.cl" ? "admin" : "cliente",
                createdAt: new Date()
            };

            // 3. Guardar el perfil en Firestore usando el UID de Auth como ID del documento
            await db.collection("usuario").doc(user.uid).set(perfilUsuario);
            console.log("Perfil de usuario guardado en Firestore con ID:", user.uid);

            // 4. Mostrar éxito y redirigir
            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: 'Serás redirigido al inicio de sesión.',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true
            }).then(() => {
                // Redirigir a la página de login para que inicie sesión
                window.location.href = "login.html";
            });

        } catch (error) {
            console.error("Error en el registro:", error);
            Swal.close();

            let mensajeError = "Ocurrió un error inesperado durante el registro.";
            // Errores comunes de Firebase Auth
            if (error.code === 'auth/email-already-in-use') {
                mensajeError = "Este correo electrónico ya está registrado. Por favor, intenta con otro.";
            } else if (error.code === 'auth/weak-password') {
                mensajeError = "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
            } else if (error.code === 'auth/invalid-email') {
                mensajeError = "El formato del correo electrónico no es válido.";
            }

            Swal.fire({
                icon: 'error',
                title: 'Error de Registro',
                text: mensajeError,
                confirmButtonColor: '#1E90FF'
            });
        }
    });
});