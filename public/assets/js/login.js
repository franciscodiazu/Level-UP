document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const correoInput = document.getElementById("email");
    const claveInput = document.getElementById("password");

    if (!form) {
        return console.error("No se encontró el formulario #loginForm");
    }

    // 1. Inicializar Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
        authDomain: "tienda-level-up.firebaseapp.com",
        projectId: "tienda-level-up",
        storageBucket: "tienda-level-up.appspot.com",
        messagingSenderId: "210482166049",
        appId: "1:210482166049:web:15dadb935d28d9f7d02660",
        measurementId: "G-85R23XKYYM"
    };

    if (!firebase.apps?.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    // Función helper para mostrar errores con SweetAlert
    const mostrarError = (mensaje, titulo = 'Error de Inicio de Sesión') => {
        Swal.fire({
            icon: 'error',
            title: titulo,
            text: mensaje,
            confirmButtonColor: '#1E90FF' // Color azul
        });
    };

    // 2. Evento de envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const correo = correoInput.value.trim().toLowerCase();
        const clave = claveInput.value;

        if (!correo || !clave) {
            mostrarError("Debes completar correo y contraseña");
            return;
        }

        // Mostrar modal de "Cargando..."
        Swal.fire({
            title: 'Iniciando sesión...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 3. Lógica para el Administrador
        if (correo === "admin@duoc.cl") {
            try {
                await auth.signInWithEmailAndPassword(correo, clave);
                
                // Guardar datos del admin en localStorage
                const usuario = { nombre: "Administrador", correo, rol: "admin" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                // Cerrar modal de carga y mostrar éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido Administrador!',
                    text: 'Serás redirigido al panel.',
                    timer: 2000, 
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    // Redirigir a la página del admin
                    window.location.href = `admin-dashboard.html`;
                });

            } catch (error) {
                console.error("Error login admin:", error);
                Swal.close(); 
                mostrarError("Credenciales incorrectas para administrador.");
            }
            return; // Detiene la ejecución si es admin
        }

        // 4. Lógica para el Cliente (usando Firestore)
        try {
            // Busca al usuario por correo Y clave
            const query = await db.collection("usuario")
                .where("correo", "==", correo)
                .where("clave", "==", clave)
                .limit(1) 
                .get();

            if (!query.empty) {
                const doc = query.docs[0];
                const userData = doc.data();

                // --- CONSTRUCCIÓN DEL USUARIO CORREGIDA ---
                const usuario = {
                    ...userData, // Copia todo lo que venga de Firebase
                    rol: "cliente",
                    nombre: userData.nombre || "Cliente",
                    correo: userData.correo || correo,
                    
                    // Aseguramos apellidos (plural o singular)
                    apellidos: userData.apellidos || userData.apellido || "",

                    // --- CORRECCIÓN CRÍTICA DE DIRECCIÓN ---
                    // Si en tu BD se llama 'direccion', lo guardamos como 'calle' 
                    // para que el checkout.js lo encuentre.
                    calle: userData.direccion || userData.calle || "", 

                    // Resto de campos de dirección
                    numero: userData.numero || "",
                    region: userData.region || "",
                    comuna: userData.comuna || "",
                    departamento: userData.departamento || "",
                    indicaciones: userData.indicaciones || ""
                };

                // Guardar datos del cliente en localStorage
                localStorage.setItem("usuario", JSON.stringify(usuario));

                // Cerrar modal de carga y mostrar éxito
                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido ${usuario.nombre}!`,
                    text: 'Serás redirigido a tu perfil.',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    // Redirigir a la página del cliente
                    window.location.href = `perfil-cliente.html`;
                });

            } else {
                Swal.close(); 
                mostrarError("Correo o contraseña incorrectos.");
            }
        } catch (error) {
            console.error("Error login cliente:", error);
            Swal.close(); 
            mostrarError("Ocurrió un error al verificar el usuario. Intenta de nuevo.");
        }
    });
});