document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
    const firebaseConfig = {
        apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
        authDomain: "tienda-level-up.firebaseapp.com",
        projectId: "tienda-level-up"
    };

    // Inicializar Firebase (solo si no se ha hecho antes)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // --- 2. REFERENCIAS A ELEMENTOS DEL DOM ---
    const tablaOrdenesBody = document.getElementById('tabla-ordenes-dashboard');

    // --- 3. FUNCIÓN PARA CARGAR LAS ÚLTIMAS ÓRDENES ---
    async function cargarUltimasOrdenes() {
        if (!tablaOrdenesBody) {
            console.error("Error: El elemento 'tabla-ordenes-dashboard' no se encontró en el HTML.");
            return;
        }

        // Mostrar estado de carga
        tablaOrdenesBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Cargando órdenes desde Firebase...</td></tr>`;

        try {
            // Consulta a Firestore para obtener las últimas 5 órdenes, ordenadas por fecha descendente
            const querySnapshot = await db.collection('compras')
                                          .orderBy('fecha', 'desc')
                                          .limit(5)
                                          .get();

            if (querySnapshot.empty) {
                tablaOrdenesBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No se han encontrado órdenes recientes.</td></tr>`;
                return;
            }

            let ordenesHtml = '';
            querySnapshot.forEach(doc => {
                const orden = doc.data();
                const ordenId = doc.id; // ID del documento de Firestore

                // Formatear datos para visualización
                const clienteNombre = orden.cliente?.nombre ? `${orden.cliente.nombre} ${orden.cliente.apellidos || ''}`.trim() : 'Cliente no especificado';
                const fecha = orden.fecha.toDate().toLocaleDateString('es-CL');
                const total = orden.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
                const estado = orden.estado || 'desconocido';

                // Crear la clase de CSS para el estado
                const claseEstado = `status-${estado.toLowerCase().replace('_', '-')}`;

                ordenesHtml += `
                    <tr>
                        <td>#${orden.numeroOrden.slice(-6)}</td>
                        <td>${clienteNombre}</td>
                        <td>${fecha}</td>
                        <td>${total}</td>
                        <td><span class="${claseEstado}">${estado.replace('_', ' ')}</span></td>
                        <td><a href="#">Ver Detalle</a></td>
                    </tr>
                `;
            });

            tablaOrdenesBody.innerHTML = ordenesHtml;

        } catch (error) {
            console.error("Error al cargar las órdenes desde Firebase: ", error);
            tablaOrdenesBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error al conectar con la base de datos.</td></tr>`;
        }
    }

    cargarUltimasOrdenes();

});