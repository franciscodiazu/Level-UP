import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../services/mockDataService';

const AdminOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrdenes(data);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
    setIsLoading(false);
  };

  // Función para dar color al estado de la orden
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Entregado':
        return 'bg-success';
      case 'En preparación':
        return 'bg-warning text-dark';
      case 'Cancelado':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (isLoading) {
    return <p>Cargando órdenes...</p>;
  }

  return (
    <div>
      <h1 className="h2 mb-3">Gestión de Órdenes y Boletas</h1>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID de Orden</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(orden => (
                <tr key={orden.id}>
                  <td>
                    <code>{orden.id}</code>
                  </td>
                  <td>{orden.clienteNombre}</td>
                  <td>
                    {/* Formateamos la fecha para que sea legible */}
                    {new Date(orden.fecha).toLocaleString('es-CL')}
                  </td>
                  <td>
                    <span className={`badge ${getEstadoBadge(orden.estado)}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td>
                    ${new Intl.NumberFormat('es-CL').format(orden.total)}
                  </td>
                  <td>
                    {/* Este enlace nos llevará a "MOSTRAR BOLETA" */}
                    <Link to={`/admin/ordenes/detalle/${orden.id}`} className="btn btn-sm btn-primary">
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdenes;