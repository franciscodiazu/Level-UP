import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useUser } from '../../../context/UserContext'; // Ajusta la ruta si es necesario

// (Puedes importar iconos de 'react-bootstrap-icons' si lo tienes instalado)
// import { HouseDoorFill, BoxFill, PeopleFill } from 'react-bootstrap-icons';

const AdminLayout = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    // No necesitamos navigate, el router (que veremos después)
    // nos redirigirá si el usuario ya no es admin.
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <div 
        className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" 
        style={{ width: '280px' }}
      >
        <Link to="/admin-dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4">Admin: Level-UP</span>
        </Link>
        <hr />
        {/* Navegación del Sidebar */}
        <ul className="nav nav-pills flex-column mb-auto">
          {/* Usamos NavLink para que el link "activo" se resalte */}
          <li className="nav-item">
            <NavLink to="/admin-dashboard" className="nav-link text-white" end>
              {/* <HouseDoorFill className="me-2" /> */}
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/ordenes" className="nav-link text-white">
              {/* <Receipt className="me-2" /> */}
              Órdenes/Boletas
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/productos" className="nav-link text-white">
              {/* <BoxFill className="me-2" /> */}
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/categorias" className="nav-link text-white">
              {/* <TagFill className="me-2" /> */}
              Categorías
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/usuarios" className="nav-link text-white">
              {/* <PeopleFill className="me-2" /> */}
              Usuarios
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/reportes" className="nav-link text-white">
              {/* <ClipboardDataFill className="me-2" /> */}
              Reportes
            </NavLink>
          </li>
        </ul>
        
        {/* --- Pie del Sidebar (Usuario y Logout) --- */}
        <hr />
        <div className="dropdown">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
            {/* <img src="... " alt="" width="32" height="32" className="rounded-circle me-2" /> */}
            <strong>{user ? user.nombre : 'Admin'}</strong>
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
            <li><Link className="dropdown-item" to="/admin/perfil">Perfil</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
      <div className="flex-grow-1 p-4 bg-light">
        {/* Outlet es el componente de react-router-dom que renderiza
            la página "hija" (ej: AdminDashboard, AdminProductos, etc.) */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;