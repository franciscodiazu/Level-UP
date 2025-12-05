import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Vistas de la Tienda (Públicas y de Cliente) ---
import Home from '../component/pages/Home';
import Catalogo from '../component/pages/Catalogo';
import DetalleProducto from '../component/pages/DetalleProducto';
import Categorias from '../component/pages/Categorias';    
import Ofertas from '../component/pages/Ofertas';         
import Blog from '../component/pages/Blog';               
import Contacto from '../component/pages/Contacto';         
import Nosotros from '../component/pages/Nosotros';       
import LoginWrapper from '../component/pages/LoginWrapper';
import Carrito from '../component/pages/Carrito';
import Checkout from '../component/pages/checkout';
import CompraExitosa from '../component/pages/CompraExitosa';
import ErrorPago from '../component/pages/ErrorPago';
import PerfilCliente from '../component/pages/PerfilCliente';

// ** NUEVA IMPORTACIÓN **
import HistorialCompras from '../component/pages/HistorialCompras'; 

// --- Vistas de Administración (Protegidas) ---
import AdminLayout from '../layout/admin/AdminLayout';
import AdminRoute from './AdminRoute';
import AdminDashboard from '../component/pages/Admin-Dashboard';
import PerfilAdmin from '../component/pages/PerfilAdmin';
// CRUD de Productos
import AdminProductos from '../component/pages/AdminProductos';
import AdminProductoForm from '../component/pages/AdminProductoForm';
// CRUD de Usuarios
import AdminUsuarios from '../component/pages/AdminUsuarios';
import AdminUsuarioForm from '../component/pages/AdminUsuarioForm';
// CRUD de Categorías 
import AdminCategorias from '../component/pages/AdminCategorias';
import AdminCategoriaForm from '../component/pages/AdminCategoriaForm';

// CRUD de Órdenes 
import AdminOrdenes from '../component/pages/AdminOrdenes';
import AdminOrdenDetalle from '../component/pages/AdminOrdenDetalle';

const AdminReportes = () => <div><h2>Reportes (Próximamente)</h2></div>;

const RouterConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas y de Cliente --- */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:productoId" element={<DetalleProducto />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/:categoriaId" element={<Categorias />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />

        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra-exitosa" element={<CompraExitosa />} />
        <Route path="/error-pago" element={<ErrorPago />} />
        <Route path="/perfil" element={<PerfilCliente />} /> 
        
        {/* ** NUEVA RUTA DE HISTORIAL ** */}
        {/* Proteger esta ruta con tu lógica de autenticación si es necesario (ej: <PrivateRoute element={<HistorialCompras />} />) */}
        <Route path="/historial-compras" element={<HistorialCompras />} /> 


        {/* --- Rutas Protegidas de Administrador --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} /> 
            
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Rutas de Productos */}
            <Route path="productos" element={<AdminProductos />} />
            <Route path="productos/nuevo" element={<AdminProductoForm />} />
            <Route path="productos/editar/:productoId" element={<AdminProductoForm />} />
            
            {/* --- Rutas de Usuarios --- */}
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="usuarios/nuevo" element={<AdminUsuarioForm />} />
            <Route path="usuarios/editar/:usuarioId" element={<AdminUsuarioForm />} />

            {/* --- Rutas de Categorías --- */}
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="categorias/nueva" element={<AdminCategoriaForm />} />
            <Route path="categorias/editar/:categoryId" element={<AdminCategoriaForm />} />

            {/* Rutas de Órdenes (Admin) */}
            <Route path="ordenes" element={<AdminOrdenes />} />
            <Route path="ordenes/detalle/:orderId" element={<AdminOrdenDetalle />} />

            <Route path="reportes" element={<AdminReportes />} />
            <Route path="perfil" element={<PerfilAdmin />} />
          </Route>
        </Route>

        {/* --- Ruta 404 (Catch-all) --- */}
        <Route path="*" element={<div className="container mt-4"><h2>404 - Página no encontrada</h2></div>} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default RouterConfig;