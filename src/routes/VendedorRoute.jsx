// Archivo: src/routes/VendedorRoute.jsx (MODIFICACIÓN TEMPORAL)
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext'; 

const VendedorRoute = () => {
    const { user, loading } = useUser();
    
    // Si aún está cargando la información del usuario
    if (loading) {
        // Añadir una pausa visual si es necesario, pero el console.log es la clave.
        console.log("VENDEDOR ROUTE: Cargando...");
        return <div className="text-center p-5">Cargando...</div>; 
    }

    // --- LÍNEAS CRÍTICAS ---
    const userRole = user ? user.rol : 'NO_AUTH';
    const isVendedor = userRole === 'vendedor';

    console.log("VENDEDOR ROUTE: User ID:", user ? user.id : 'NULO');
    console.log("VENDEDOR ROUTE: Rol detectado:", userRole);
    // ------------------------

    if (isVendedor) {
        console.log("VENDEDOR ROUTE: Acceso CONCEDIDO.");
        return <Outlet />;
    } else {
        console.error("VENDEDOR ROUTE: Acceso DENEGADO. Redirigiendo a /login.");
        return <Navigate to="/login" replace />;
    }
};

export default VendedorRoute;