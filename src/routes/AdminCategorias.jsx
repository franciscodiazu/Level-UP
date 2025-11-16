import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../services/mockDataService';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
      try {
        await deleteCategory(categoryId);
        setCategorias(categorias.filter(c => c.id !== categoryId));
        alert("Categoría eliminada con éxito.");
      } catch (error) {
        console.error("Error al eliminar categoría:", error);
        alert(`Error: ${error.message}`);
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
        <Link to="/admin-dashboard/categorias/nuevo" className="btn btn-success">
          Crear Nueva Categoría
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre de la Categoría</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.nombre}</td>
                  <td className="text-end">
                    <Link to={`/admin-dashboard/categorias/editar/${cat.id}`} className="btn btn-sm btn-primary me-2">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(cat.id, cat.nombre)} className="btn btn-sm btn-danger">
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