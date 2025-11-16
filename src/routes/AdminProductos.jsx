import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/mockDataService';
// (Opcional: import { PencilSquare, Trash } from 'react-bootstrap-icons';)

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProductos(data);
    setIsLoading(false);
  };

  const handleDelete = async (productId, productName) => {
    // Pedir confirmación
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      try {
        await deleteProduct(productId);
        // Actualizar la lista de productos en el estado (UI)
        setProductos(productos.filter(p => p.id !== productId));
        alert("Producto eliminado con éxito.");
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Hubo un error al eliminar el producto.");
      }
    }
  };

  if (isLoading) {
    return <p>Cargando productos...</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h2">Gestión de Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-success">
          {/* (Icono) */}
          Crear Nuevo Producto
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <img src={prod.imagen} alt={prod.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  </td>
                  <td>{prod.nombre}</td>
                  <td>{prod.categoria}</td>
                  <td>${new Intl.NumberFormat('es-CL').format(prod.precio)}</td>
                  <td>{prod.stock}</td>
                  <td>
                    <Link to={`/admin/productos/editar/${prod.id}`} className="btn btn-sm btn-primary me-2">
                      {/* <PencilSquare /> */}
                      Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(prod.id, prod.nombre)} 
                      className="btn btn-sm btn-danger"
                    >
                      {/* <Trash /> */}
                      Eliminar
                    </button>
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

export default AdminProductos;