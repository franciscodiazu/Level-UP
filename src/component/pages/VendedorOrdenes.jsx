// Archivo: src/component/pages/VendedorOrdenes.jsx
import React, { useEffect, useState } from 'react';
import { getCollection } from '../../services/firestoreService'; // ⚠️ Importamos getCollection
import { useNavigate } from 'react-router-dom';

const VendedorOrdenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                // 🚀 Llamada a Firebase: coleccion 'orders'
                const data = await getCollection('compras');
                setOrdenes(data);
            } catch (error) {
                console.error("Error al cargar órdenes desde Firestore:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarOrdenes();
    }, []);

    // Redirige al detalle de la orden
    const handleVerDetalle = (id) => {
        navigate(`/vendedor/ordenes/detalle/${id}`); 
    };

    const getStatusBadge = (estado) => {
        let badgeClass = 'bg-secondary';
        const estadoNormalizado = estado ? estado.toLowerCase() : 'desconocido';
        switch (estadoNormalizado) {
            case 'entregado': badgeClass = 'bg-success'; break;
            case 'pendiente': badgeClass = 'bg-warning text-dark'; break;
            case 'cancelado': badgeClass = 'bg-danger'; break;
            default: badgeClass = 'bg-secondary';
        }
        return <span className={`badge ${badgeClass}`}>{estado || 'Desconocido'}</span>;
    };

    return (
        <>
            <h1 className="mt-4">🧾 Órdenes de Compra</h1>
            <p className="lead">Aquí puedes ver todas las órdenes de compra emitidas.</p>
            
            <div className="row">
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID Orden</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center"><i className="fas fa-spinner fa-spin me-2"></i> Cargando órdenes...</td></tr>
                                ) : ordenes.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center">No hay órdenes de compra registradas.</td></tr>
                                ) : (
                                    ordenes.map(orden => (
                                        <tr key={orden.id}>
                                            <td>{orden.id}</td>
                                            {/* Usamos la estructura de cliente anidada */}
                                            <td>{orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellidos}` : 'N/A'}</td> 
                                            {/* Formateamos la fecha si es un objeto de Firebase Timestamp o Date */}
                                            <td>{orden.fecha ? new Date(orden.fecha.seconds * 1000).toLocaleDateString() : 'N/A'}</td> 
                                            <td>${(orden.total || 0).toLocaleString('es-CL')}</td> 
                                            <td>{getStatusBadge(orden.estado)}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-info" 
                                                    onClick={() => handleVerDetalle(orden.id)}
                                                    title="Ver Detalle"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VendedorOrdenes;