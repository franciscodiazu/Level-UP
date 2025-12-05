import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function PerfilCliente() {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    // Redirigir al login si no hay usuario (aunque la ruta debería estar protegida)
    if (!user) {
        return <div className="container mt-5"><p className="alert alert-warning">Cargando o no autenticado. Redirigiendo al login...</p></div>;
    }

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirigir al login después de cerrar sesión
    };
    
    // Función para navegar al historial de compras
    const goToHistorial = () => {
        navigate('/historial-compras');
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h1 className="text-center text-primary mb-4">Bienvenido, {user.firstName || user.name || 'Cliente'}</h1>
                <p className="lead text-center mb-5">Este es tu panel de control de cliente. Aquí puedes gestionar tu información y pedidos.</p>

                <div className="row g-4">
                    
                    {/* Tarjeta de Información Personal */}
                    <div className="col-md-6">
                        <div className="card h-100 border-info">
                            <div className="card-body">
                                <h5 className="card-title text-info">Información Personal</h5>
                                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                                <p><strong>ID de Usuario:</strong> {user.id || 'N/A'}</p>
                                <button 
                                    className="btn btn-outline-info w-100 mt-3"
                                    onClick={() => navigate('/editar-perfil')}
                                >
                                    Editar Perfil
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tarjeta de Historial de Compras (Nuevo) */}
                    <div className="col-md-6">
                        <div className="card h-100 border-primary">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <h5 className="card-title text-primary">Mis Pedidos</h5>
                                    <p className="card-text">Consulta el estado de tus órdenes, revisa los detalles de tus compras pasadas y descarga tus facturas.</p>
                                </div>
                                <button 
                                    className="btn btn-primary w-100 mt-3"
                                    onClick={goToHistorial} // Llama a la función de navegación
                                >
                                    Ver Historial de Compras
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tarjeta de Cerrar Sesión */}
                    <div className="col-12">
                        <button 
                            className="btn btn-danger w-100 mt-4"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}