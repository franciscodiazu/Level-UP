import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Ajusta la ruta si es necesario

const AdminRoute = () => {
  // Obtenemos el usuario y el estado de carga del contexto
  const { user, loading } = useUser();

  // 1. Si estamos cargando la info del usuario, esperamos
  if (loading) {
    // Puedes poner un spinner/componente de carga aquí
    return <p className="container mt-4">Verificando permisos...</p>;
  }

  // 2. Si NO está cargando, revisamos si es admin
  //    (user && user.rol === 'admin')
  if (user && user.rol === 'admin') {
    // Si es admin, renderiza el componente "hijo" que está protegido
    // (en nuestro caso, renderizará el AdminLayout)
    return <Outlet />;
  }
  
  // 3. Si no está cargando Y no es admin (o no hay usuario), redirige
  return <Navigate to="/login" replace />;
};

export default AdminRoute;