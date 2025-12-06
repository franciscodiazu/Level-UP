// Archivo: src/component/pages/VendedorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
// ⚠️ Importamos getCollection de tu servicio real de Firestore
import { getCollection } from '../../services/firestoreService'; 
import { useUser } from '../../context/UserContext'; 

const VendedorDashboard = () => {
    const { user } = useUser(); 
    const [ordenesCount, setOrdenesCount] = useState('...');
    const [productosCount, setProductosCount] = useState('...');
    // Usamos el nombre del usuario logueado, por defecto 'Vendedor' si no está disponible
    const [vendedorNombre, setVendedorNombre] = useState(user?.nombre || 'Vendedor'); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aseguramos que el nombre se muestre si el contexto lo tiene
        if (user && user.nombre) {
            setVendedorNombre(user.nombre);
        }

        const cargarTotales = async () => {
            setLoading(true);
            try {
                // 🚀 Llamada a Firebase para obtener las órdenes
                const ordenes = await getCollection('compras'); 
                // 🚀 Llamada a Firebase para obtener los productos
                const productos = await getCollection('producto');

                setOrdenesCount(ordenes.length);
                setProductosCount(productos.length);
            } catch (error) {
                console.error("Error al cargar totales desde Firestore:", error);
                setOrdenesCount('Error');
                setProductosCount('Error');
            } finally {
                setLoading(false);
            }
        };

        cargarTotales();
    }, [user]);

    return (
        <>
            <h1 className="mt-4">👋 Bienvenido, <span id="vendedor-name">{vendedorNombre}</span></h1>
            <p className="lead">Panel de control de acceso a tus herramientas de gestión.</p>
            
            {loading ? (
                <div className="text-center p-5"><i className="fas fa-spinner fa-spin me-2"></i> Cargando dashboard...</div>
            ) : (
                <div className="row">
                    {/* Tarjeta para Órdenes de Compra */}
                    <div className="col-lg-6 mb-4">
                        <div className="card bg-dark text-white shadow border-primary">
                            <div className="card-body">
                                <h5 className="card-title text-primary"><i className="fas fa-receipt me-2"></i>Órdenes de Compra</h5>
                                <p className="card-text fs-4">Total: <strong>{ordenesCount}</strong></p>
                                <NavLink to="/vendedor/ordenes" className="btn btn-light">Ver Órdenes</NavLink>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tarjeta para Productos */}
                    <div className="col-lg-6 mb-4">
                        <div className="card bg-dark text-white shadow border-success">
                            <div className="card-body">
                                <h5 className="card-title text-success"><i className="fas fa-box me-2"></i>Productos</h5>
                                <p className="card-text fs-4">Total: <strong>{productosCount}</strong></p>
                                <NavLink to="/vendedor/productos" className="btn btn-light">Ver Productos</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendedorDashboard;