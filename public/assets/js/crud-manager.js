class CrudManager {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        console.log('CrudManager: Inicializando...');
        
        // Esperar a que Firebase cargue desde el CDN
        if (typeof firebase !== 'undefined') {
            this.configurarFirebase();
        } else {
            window.addEventListener('load', () => this.configurarFirebase());
        }
    }

    configurarFirebase() {
        try {
            // Configuración (Asegúrate de que coincida con tu proyecto)
            const firebaseConfig = {
                apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
                authDomain: "tienda-level-up.firebaseapp.com",
                projectId: "tienda-level-up",
                storageBucket: "tienda-level-up.appspot.com",
                messagingSenderId: "210482166049",
                appId: "1:210482166049:web:15dadb935d28d9f7d02660",
                measurementId: "G-85R23XKYYM"
            };

            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            this.db = firebase.firestore();
            console.log('CrudManager: Firebase listo.');

            // Inicializar los submódulos
            this.cargarModuloActual();

        } catch (error) {
            console.error('CrudManager Error:', error);
        }
    }

    cargarModuloActual() {
        // Detectar qué cargar según la URL o elementos en pantalla
        if (document.getElementById('totalCompras')) {
            // Estamos en Dashboard
            if (window.DashboardManager) {
                new window.DashboardManager(this.db);
            }
        }
        
        if (document.getElementById('usuarios-tbody') || document.getElementById('productos-tbody')) {
            // Estamos en una vista de Tablas (CRUD)
            if (window.CRUDFunctions) {
                window.crudFunctionsInstance = new window.CRUDFunctions(this.db);
            }
        }
    }
}

// Inicialización Global
document.addEventListener('DOMContentLoaded', () => {
    window.crudManager = new CrudManager();
});