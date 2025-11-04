document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    
    // CORRECCIÓN: Usar los IDs correctos del HTML: 'email' y 'password'
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

    // 2. Evento de envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const correo = correoInput.value.trim().toLowerCase();
        const clave = claveInput.value;

        if (!correo || !clave) {
            alert("Debes completar correo y clave");
            return;
        }

        // 3. Lógica para el Administrador
        if (correo === "admin@duoc.cl") {
            try {
                await auth.signInWithEmailAndPassword(correo, clave);
                
                // Guardar datos del admin en localStorage para el saludo
                const usuario = { nombre: "Administrador", correo, rol: "admin" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                alert("Bienvenido Administrador, redirigiendo...");
                
                // Redirigir a la página del admin
                window.location.href = `admin-dashboard.html`;

            } catch (error) {
                console.error("Error login admin:", error);
                alert("Credenciales incorrectas para administrador");
            }
            return;
        }

        // 4. Lógica para el Cliente (usando Firestore)
        try {
            const query = await db.collection("usuario")
                .where("correo", "==", correo)
                .where("clave", "==", clave)
                .get();

            if (!query.empty) {
                const userData = query.docs[0].data();
                const nombre = userData.nombre || correo;

                // Guardar datos del cliente en localStorage para el saludo
                const usuario = { nombre, correo, rol: "cliente" };
                localStorage.setItem("usuario", JSON.stringify(usuario));

                alert("Bienvenido cliente, redirigiendo...");

                // Redirigir a la página del cliente
                window.location.href = `perfil-cliente.html`;

            } else {
                alert("Correo o clave incorrectos");
            }
        } catch (error) {
            console.error("Error login cliente:", error);
            alert("Error al verificar usuario");
        }
    });
});