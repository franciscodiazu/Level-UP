// Archivo: src/component/pages/VendedorProductos.jsx
import React, { useEffect, useState } from 'react';
import { getCollection } from '../../services/firestoreService'; // ⚠️ Importamos getCollection

const VendedorProductos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                // 🚀 Llamada a Firebase: coleccion 'productos'
                const data = await getCollection('producto');
                setProductos(data);
            } catch (error) {
                console.error("Error al cargar productos desde Firestore:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarProductos();
    }, []);

    const getStockBadge = (stock) => {
        let badgeClass = 'bg-success';
        const stockValue = parseInt(stock) || 0; // Aseguramos que sea un número
        if (stockValue <= 10 && stockValue > 0) badgeClass = 'bg-warning text-dark';
        if (stockValue === 0) badgeClass = 'bg-danger';
        return <span className={`badge ${badgeClass}`}>{stockValue}</span>;
    };

    return (
        <>
            <h1 className="mt-4">📦 Lista de Productos</h1>
            <p className="lead">Solo tiene permisos para **ver** los productos y su stock.</p>

            <div className="row">
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center"><i className="fas fa-spinner fa-spin me-2"></i> Cargando productos...</td></tr>
                                ) : productos.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center">No hay productos registrados.</td></tr>
                                ) : (
                                    productos.map(producto => (
                                        <tr key={producto.id}>
                                            <td>{producto.id}</td>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.categoria || 'N/A'}</td>
                                            <td>${(producto.precio || 0).toLocaleString('es-CL')}</td> 
                                            <td>{getStockBadge(producto.stock)}</td>
                                            <td>{producto.descripcion || 'Sin descripción.'}</td>
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

export default VendedorProductos;