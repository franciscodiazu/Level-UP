import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../services/mockDataService';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Para mostrar errores (ej. al eliminar)

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategorias(data);
    } catch (err) {
      setError("Error al cargar categorías.");
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleDelete = async (categoryId, categoryName) => {
    setError(null);
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
      try {
        await deleteCategory(categoryId);
        // Si tiene éxito, actualiza la UI
        setCategorias(categorias.filter(c => c.id !== categoryId));
        alert("Categoría eliminada con éxito.");
      } catch (error) {
        // Capturamos el error que pusimos en el servicio (si la categoría está en uso)
        console.error("Error al eliminar categoría:", error);
        setError(error.message); // Mostramos el mensaje de error
      }
    }
  };

  if (isLoading) {
    return <p>Cargando categorías...</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h2">Gestión de Categorías</h1>
        <Link to="/admin/categorias/nueva" className="btn btn-success">
          Crear Nueva Categoría
        </Link>
      </div>
      
      {/* Mostramos el error si existe */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID de Categoría</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(cat => (
                <tr key={cat.id}>
                  <td><code>{cat.id}</code></td>
                  <td>{cat.nombre}</td>
                  <td>
                    <Link to={`/admin/categorias/editar/${cat.id}`} className="btn btn-sm btn-primary me-2">
                      Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(cat.id, cat.nombre)} 
                      className="btn btn-sm btn-danger"
                    >
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

export default AdminCategorias;