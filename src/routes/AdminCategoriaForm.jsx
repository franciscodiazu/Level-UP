import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryById, createCategory, updateCategory } from '../../services/mockDataService';

const AdminCategoriaForm = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      if (categoriaId) {
        setIsEditing(true);
        try {
          const category = await getCategoryById(categoriaId);
          if (category) {
            setNombre(category.nombre);
          } else {
            alert("Categoría no encontrada");
            navigate('/admin-dashboard/categorias');
          }
        } catch (error) {
          console.error("Error al cargar la categoría:", error);
          navigate('/admin-dashboard/categorias');
        }
      } else {
        setIsEditing(false);
      }
      setIsLoading(false);
    };

    loadCategory();
  }, [categoriaId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("El nombre de la categoría no puede estar vacío.");
      return;
    }
    setIsLoading(true);

    try {
      if (isEditing) {
        await updateCategory(categoriaId, { nombre });
        alert("Categoría actualizada con éxito.");
      } else {
        await createCategory({ nombre });
        alert("Categoría creada con éxito.");
      }
      navigate('/admin-dashboard/categorias');
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      alert(`Hubo un error al guardar la categoría: ${error.message}`);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="h2 mb-3">{isEditing ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h1>
      
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre de la Categoría</label>
          <input type="text" className="form-control" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/admin-dashboard/categorias')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCategoriaForm;