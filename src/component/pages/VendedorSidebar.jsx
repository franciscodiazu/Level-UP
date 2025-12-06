import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const VendedorSidebar = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirige al login después de cerrar sesión
    };
    
    return (
        <div className="bg-dark border-right" id="sidebar-wrapper">
            <div className="sidebar-heading text-white">
                Panel Vendedor
            </div>
            <div className="list-group list-group-flush">
                <NavLink to="/vendedor/dashboard" className="list-group-item list-group-item-action bg-dark text-white">
                    <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                </NavLink>
                <NavLink to="/vendedor/ordenes" className="list-group-item list-group-item-action bg-dark text-white">
                    <i className="fas fa-box-open me-2"></i>Órdenes
                </NavLink>
                <NavLink to="/vendedor/productos" className="list-group-item list-group-item-action bg-dark text-white">
                    <i className="fas fa-boxes me-2"></i>Productos
                </NavLink>
                <NavLink to="/vendedor/perfil" className="list-group-item list-group-item-action bg-dark text-white">
                    <i className="fas fa-user me-2"></i>Perfil
                </NavLink>
                <button onClick={handleLogout} className="list-group-item list-group-item-action bg-dark text-danger">
                    <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default VendedorSidebar;