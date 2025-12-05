import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext'; // Importar el hook de contexto
import { getOrdersByUserId } from '../services/firestoreService'; // Importar la función de servicio

// Componente para mostrar el historial de compras del cliente
export default function HistorialCompras() {
    // 1. Obtener el usuario del contexto
    // user.id debería ser el UID de Firebase.
    const { user, loading: userLoading } = useUser(); 
    
    // 2. Estados para manejar las órdenes, la carga y errores
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. Efecto para cargar las órdenes cuando el usuario esté disponible
    useEffect(() => {
        // Si el contexto aún está cargando o no ha resuelto el estado de auth, esperamos
        if (userLoading) return;

        if (user) {
            const fetchOrders = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    
                    // Llama al servicio de Firestore con el ID del usuario
                    const userOrders = await getOrdersByUserId(user.id); 
                    
                    setOrders(userOrders);
                } catch (err) {
                    setError("Error al cargar tu historial de pedidos. Por favor, revisa las reglas de seguridad o la conexión.");
                    console.error("Error al obtener órdenes:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        } else {
            // No hay usuario logueado, limpiamos el estado
            setLoading(false);
            setOrders([]);
        }

    }, [user, userLoading]);

    // --- Renderizado de Estados ---

    if (userLoading || loading) {
        // Muestra un indicador de carga
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando historial de compras...</p>
            </div>
        );
    }

    if (!user) {
        // Mensaje si no hay usuario logueado
        return <div className="container mt-5"><p className="alert alert-info text-center">Debes iniciar sesión para ver tu historial.</p></div>;
    }
    
    if (error) {
        // Mensaje de error
        return <div className="container mt-5"><p className="alert alert-danger text-center">Error: {error}</p></div>;
    }

    if (orders.length === 0) {
        // Mensaje si no hay órdenes
        return <div className="container mt-5"><p className="alert alert-warning text-center">¡Aún no has realizado ninguna compra!</p></div>;
    }

    // --- Renderizado del Historial (Éxito) ---

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-center text-primary">Mis Pedidos</h2>
            {orders.map((order) => (
                <div key={order.id} className="card mb-4 shadow-lg border-primary">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {/* Mostrar el ID de la orden (truncado para mejor visualización) */}
                            <h5 className="card-title mb-0">Pedido N°: <span className="text-muted">{order.id.substring(0, 8)}...</span></h5>
                            {/* Etiqueta de estado */}
                            <span className={`badge bg-${order.status === 'Entregado' ? 'success' : 'warning'} text-uppercase`}>
                                {order.status || 'Pendiente'}
                            </span>
                        </div>

                        <p className="card-text">
                            <strong>Fecha:</strong> {order.date ? order.date.toLocaleDateString() : 'N/A'}
                            <br/>
                            <strong>Total:</strong> <span className="text-success fs-5">${order.total ? order.total.toFixed(2) : '0.00'}</span>
                        </p>
                        
                        <h6 className="mt-3 border-top pt-2">Detalles de Productos:</h6>
                        <ul className="list-group list-group-flush">
                            {/* Iteramos sobre los items de la orden, asumiendo una estructura { name, qty, price } */}
                            {order.items && order.items.map((item, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-1">
                                    <small>{item.qty}x {item.name}</small>
                                    <small className="text-muted">${(item.price * item.qty).toFixed(2)}</small>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}