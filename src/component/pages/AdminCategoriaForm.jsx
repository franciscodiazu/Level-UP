import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryById, createCategory, updateCategory } from '../../services/mockDataService';

const AdminCategoriaForm = () => {
  // useParams nos da el ID de la URL (ej: /editar/:categoryId)
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ nombre: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si hay un categoryId en la URL, estamos en modo "Editar"
    if (categoryId) {
      setIsEditing(true);
      setIsLoading(true);
      const loadCategory = async () => {
        try {
          const categoria = await getCategoryById(categoryId);
          if (categoria) {
            setFormData(categoria);
          } else {
            alert("Categoría no encontrada");
            navigate('/admin/categorias');
          }
        } catch (err) {
          setError("Error al cargar la categoría.");
        }
        setIsLoading(false);
      };
      loadCategory();
    }
  }, [categoryId, navigate]); // Se ejecuta si el ID o navigate cambian

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // Lógica de Actualizar
        await updateCategory(categoryId, formData);
        alert("Categoría actualizada con éxito.");
      } else {
        // Lógica de Crear
        await createCategory(formData);
        alert("Categoría creada con éxito.");
      }
      navigate('/admin/categorias'); // Volver a la lista
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      setError(error.message); // Mostrar error (ej: "El nombre es requerido")
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.nombre) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="h2 mb-3">{isEditing ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h1>
      
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre de la Categoría</label>
          <input 
            type="text" 
            className="form-control" 
            id="nombre" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="d-flex justify-content-end">
          <button 
            type="button" 
            className="btn btn-secondary me-2" 
            onClick={() => navigate('/admin/categorias')}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? (isEditing ? 'Actualizando...' : 'Creando...') : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCategoriaForm;