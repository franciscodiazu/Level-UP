import React from 'react';
import { Link } from 'react-router-dom';
// (Importar iconos aquí si se desea)

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="h2">Dashboard</h1>
      <p>Resumen de las actividades diarias.</p>

      {/* --- Tarjetas Superiores (Figura 9) --- */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-primary h-100">
            <div className="card-body">
              <h5 className="card-title">Compras</h5>
              <p className="card-text fs-3">1,234</p>
              <small>Probabilidad de ascenso: 20%</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-success h-100">
            <div className="card-body">
              <h5 className="card-title">Productos</h5>
              <p className="card-text fs-3">400</p>
              <small>Inventario actual: 500</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-warning h-100">
            <div className="card-body">
              <h5 className="card-title">Usuarios</h5>
              <p className="card-text fs-3">890</p>
              <small>Usuarios registrados</small>
            </div>
          </div>
        </div>
      </div>

      {/* --- Tarjetas de Navegación (Figura 9) --- */}
      <h2 className="h4 mt-4">Accesos Directos</h2>
      <div className="row">
        
        <div className="col-md-4 col-lg-3 mb-3">
          <Link to="/admin/ordenes" className="text-decoration-none">
            <div className="card text-center h-100">
              <div className="card-body">
                {/* (Icono) */}
                <h5 className="card-title">Órdenes</h5>
                <p className="card-text text-muted">Gestión y seguimiento de boletas.</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-lg-3 mb-3">
          <Link to="/admin/productos" className="text-decoration-none">
            <div className="card text-center h-100">
              <div className="card-body">
                {/* (Icono) */}
                <h5 className="card-title">Productos</h5>
                <p className="card-text text-muted">Administrar inventario y detalles.</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-lg-3 mb-3">
          <Link to="/admin/usuarios" className="text-decoration-none">
            <div className="card text-center h-100">
              <div className="card-body">
                {/* (Icono) */}
                <h5 className="card-title">Usuarios</h5>
                <p className="card-text text-muted">Gestión de cuentas del sistema.</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-lg-3 mb-3">
          <Link to="/" target="_blank" className="text-decoration-none">
            <div className="card text-center h-100">
              <div className="card-body">
                {/* (Icono) */}
                <h5 className="card-title">Tienda</h5>
                <p className="card-text text-muted">Ver la tienda en tiempo real.</p>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;