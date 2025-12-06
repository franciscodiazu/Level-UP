import React from 'react';
import { useUser } from '../../context/UserContext';

const VendedorNavbar = () => {
    const { user } = useUser();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom">
            <div className="container-fluid">
                {/* Puedes añadir un botón para ocultar/mostrar el sidebar si lo necesitas */}
                {/* <button className="btn btn-primary" id="menu-toggle">Toggle Menu</button> */}
                
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
                        <li className="nav-item text-white">¡Hola, {user ? user.nombre : 'Vendedor'}!</li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default VendedorNavbar;