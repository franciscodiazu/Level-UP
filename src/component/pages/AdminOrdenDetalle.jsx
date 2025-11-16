import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/mockDataService';

const AdminOrdenDetalle = () => {
  // useParams nos da el ID de la URL
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Estados para la orden y la carga
  const [orden, setOrden] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar la orden específica cuando el componente monta
    const loadOrder = async () => {
      setIsLoading(true);
      try {
        const data = await getOrderById(orderId);
        if (data) {
          setOrden(data);
        } else {
          // Si no se encuentra la orden, redirigir
          alert("Orden no encontrada");
          navigate('/admin/ordenes');
        }
      } catch (error) {
        console.error("Error al cargar la orden:", error);
      }
      setIsLoading(false);
    };

    loadOrder();
  }, [orderId, navigate]); // Depende de orderId

  // Función para dar color al estado de la orden
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Entregado': return 'bg-success';
      case 'En preparación': return 'bg-warning text-dark';
      case 'Cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // --- Renderizado Condicional ---
  
  if (isLoading) {
    return <p>Cargando detalle de la orden...</p>;
  }

  if (!orden) {
    return (
      <div>
        <p>Orden no encontrada.</p>
        <Link to="/admin/ordenes" className="btn btn-primary">Volver a Órdenes</Link>
      </div>
    );
  }

  // --- Renderizado Principal ---
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h2">Detalle de la Orden</h1>
        <Link to="/admin/ordenes" className="btn btn-outline-secondary">
          ← Volver a la lista
        </Link>
      </div>

      <div className="row">
        {/* Columna de Información General */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <h5 className="mb-0">Información General</h5>
            </div>
            <div className="card-body">
              <p><strong>ID de Orden:</strong> <code>{orden.id}</code></p>
              <p><strong>Fecha:</strong> {new Date(orden.fecha).toLocaleString('es-CL')}</p>
              <p className="mb-0"><strong>Estado:</strong>
                <span className={`badge ${getEstadoBadge(orden.estado)} ms-2`}>
                  {orden.estado}
                </span>
              </p>
            </div>
          </div>
          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <h5 className="mb-0">Cliente y Envío</h5>
            </div>
            <div className="card-body">
              <p><strong>Cliente:</strong> {orden.clienteNombre}</p>
              <p><strong>Dirección:</strong> {orden.direccion.calle}</p>
              <p><strong>Comuna:</strong> {orden.direccion.comuna}</p>
              <p className="mb-0"><strong>Región:</strong> {orden.direccion.region}</p>
            </div>
          </div>
        </div>

        {/* Columna de Items y Total */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Items de la Orden</h5>
            </div>
            <div className="card-body">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nombre}</td>
                      <td>${new Intl.NumberFormat('es-CL').format(item.precio)}</td>
                      <td>x {item.cantidad}</td>
                      <td>
                        <strong>
                          ${new Intl.NumberFormat('es-CL').format(item.precio * item.cantidad)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <hr />

              <div className="text-end">
                <h3 className="mb-0">
                  Total: ${new Intl.NumberFormat('es-CL').format(orden.total)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdenDetalle;