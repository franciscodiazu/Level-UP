document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const correoInput = document.getElementById("email");
    const claveInput = document.getElementById("password");

    if (!form) {
        return console.error("No se encontró el formulario #loginForm");
    }

    // --- Tu Lógica de Firebase Integrada ---

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
                
                // Guardar datos del admin en localStorage para el saludo
                const usuario = { nombre: "Administrador", correo, rol: "admin" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                // Cerrar modal de carga y mostrar éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido Administrador!',
                    text: 'Serás redirigido al panel.',
                    timer: 2000, // 2 segundos
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    // Redirigir a la página del admin
                    window.location.href = `admin-dashboard.html`;
                });

            } catch (error) {
                console.error("Error login admin:", error);
                // Cerrar modal de carga y mostrar error específico
                Swal.close(); // Cierra el modal de carga antes de mostrar el error
                mostrarError("Credenciales incorrectas para administrador.");
            }
            return; // Detiene la ejecución si es admin
        }

        // 4. Lógica para el Cliente (usando Firestore)
        try {
            // Busca al usuario por correo Y clave (¡Inseguro! Ver nota en registro)
            const query = await db.collection("usuario")
                .where("correo", "==", correo)
                .where("clave", "==", clave) // <-- NO SEGURO
                .limit(1) // Optimización: solo necesitamos 1 resultado
                .get();

            if (!query.empty) {
                const userData = query.docs[0].data();
                const nombre = userData.nombre || "Cliente"; // Usa el nombre si existe

                // Guardar datos del cliente en localStorage para el saludo
                const usuario = { nombre, correo, rol: "cliente" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                // Cerrar modal de carga y mostrar éxito
                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido ${nombre}!`,
                    text: 'Serás redirigido a tu perfil.',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    // Redirigir a la página del cliente
                    window.location.href = `perfil-cliente.html`;
                });

            } else {
                // Si la consulta no devolvió resultados
                Swal.close(); // Cierra el modal de carga
                mostrarError("Correo o contraseña incorrectos.");
            }
        } catch (error) {
            console.error("Error login cliente:", error);
            Swal.close(); // Cierra el modal de carga
            mostrarError("Ocurrió un error al verificar el usuario. Intenta de nuevo.");
        }
    });
});