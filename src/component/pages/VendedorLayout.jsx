import React from 'react';
import { Outlet } from 'react-router-dom';
import VendedorSidebar from './VendedorSidebar';
import VendedorNavbar from './VendedorNavbar';

const VendedorLayout = () => {
  return (
    // La clase "d-flex" y el ID "wrapper" son cruciales para el layout de sidebar
    <div className="d-flex" id="wrapper">
      
      {/* Sidebar */}
      <VendedorSidebar />

      {/* Contenedor principal de la página */}
      <div id="page-content-wrapper">
        
        {/* Navbar superior */}
        <VendedorNavbar />

        {/* Contenido dinámico de la ruta (Dashboard, Productos, etc.) */}
        <div className="container-fluid p-4">
          <Outlet /> {/* Aquí se renderizarán las páginas hijas */}
        </div>
      </div>
    </div>
  );
};

export default VendedorLayout;