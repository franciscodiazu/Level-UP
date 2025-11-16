import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, createProduct, updateProduct, getCategories } from '../../services/mockDataService';

const AdminProductoForm = () => {
  // useParams nos dice si estamos editando (ej: /editar/:productoId)
  const { productoId } = useParams();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoria: '',
    enOferta: false,
    imagen: '',
    descripcion: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Cargar la lista de categorías para el <select>
      const cats = await getCategories();
      setCategorias(cats);
      
      if (productoId) {
        // --- MODO EDICIÓN ---
        setIsEditing(true);
        const producto = await getProductById(productoId);
        if (producto) {
          setFormData(producto);
        } else {
          alert("Producto no encontrado");
          navigate('/admin/productos');
        }
      } else {
        // --- MODO CREACIÓN ---
        setIsEditing(false);
      }
      setIsLoading(false);
    };

    loadData();
  }, [productoId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        // Lógica de Actualizar
        await updateProduct(productoId, formData);
        alert("Producto actualizado con éxito.");
      } else {
        // Lógica de Crear
        await createProduct(formData);
        alert("Producto creado con éxito.");
      }
      navigate('/admin/productos'); // Volver a la lista
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Hubo un error al guardar el producto.");
      setIsLoading(false);
    }
  };

  if (isLoading && !categorias.length) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="h2 mb-3">{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h1>
      
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="row g-3">
          <div className="col-md-8">
            <label htmlFor="nombre" className="form-label">Nombre del Producto</label>
            <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label htmlFor="categoria" className="form-label">Categoría</label>
            <select className="form-select" id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} required>
              <option value="">Seleccionar...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="precio" className="form-label">Precio</label>
            <input type="number" className="form-control" id="precio" name="precio" value={formData.precio} onChange={handleChange} required />
          </div>
          
          <div className="col-md-6">
            <label htmlFor="stock" className="form-label">Stock</label>
            <input type="number" className="form-control" id="stock" name="stock" value={formData.stock} onChange={handleChange} required />
          </div>
          
          <div className="col-12">
            <label htmlFor="imagen" className="form-label">URL de la Imagen</label>
            <input type="text" className="form-control" id="imagen" name="imagen" placeholder="/assets/img/nombre-imagen.jpg" value={formData.imagen} onChange={handleChange} required />
          </div>

          <div className="col-12">
            <label htmlFor="descripcion" className="form-label">Descripción</label>
            <textarea className="form-control" id="descripcion" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
          </div>
          
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="enOferta" name="enOferta" checked={formData.enOferta} onChange={handleChange} />
              <label className="form-check-label" htmlFor="enOferta">
                Marcar como Oferta
              </label>
            </div>
          </div>
          
          <div className="col-12 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/admin/productos')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductoForm;