import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, createUser, updateUser } from '../../services/mockDataService';

const AdminUsuarioForm = () => {
  const { usuarioId } = useParams();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'cliente',
    direccion: '',
    region: '',
    comuna: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (usuarioId) {
        // --- MODO EDICIÓN ---
        setIsEditing(true);
        const user = await getUserById(usuarioId);
        if (user) {
          setFormData({ ...user, password: '' }); // Cargar datos, pero no la contraseña
        } else {
          alert("Usuario no encontrado");
          navigate('/admin/usuarios');
        }
      } else {
        // --- MODO CREACIÓN ---
        setIsEditing(false);
      }
      setIsLoading(false);
    };

    loadUser();
  }, [usuarioId, navigate]);

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

    // En modo Creación, la contraseña es obligatoria
    if (!isEditing && !formData.password) {
      alert("La contraseña es obligatoria para crear un nuevo usuario.");
      setIsLoading(false);
      return;
    }
    
    // Si no se escribe contraseña al editar, 'formData.password' será ""
    // La lógica en `updateUser` (Paso 1) se encargará de mantener la antigua.

    try {
      if (isEditing) {
        await updateUser(usuarioId, formData);
        alert("Usuario actualizado con éxito.");
      } else {
        await createUser(formData);
        alert("Usuario creado con éxito.");
      }
      navigate('/admin/usuarios'); // Volver a la lista
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      alert(`Hubo un error al guardar el usuario: ${error.message}`);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="h2 mb-3">{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h1>
      
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label htmlFor="apellido" className="form-label">Apellido</label>
            <input type="text" className="form-control" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} />
          </div>

          <div className="col-md-8">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="col-md-4">
            <label htmlFor="rol" className="form-label">Rol</label>
            <select className="form-select" id="rol" name="rol" value={formData.rol} onChange={handleChange} required>
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div className="col-12">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} />
            {isEditing && <small className="form-text text-muted">Dejar en blanco para no cambiar la contraseña.</small>}
          </div>

          <hr className="my-4" />
          <h5 className="mb-3">Información de Envío (Opcional)</h5>
          
          <div className="col-12">
            <label htmlFor="direccion" className="form-label">Dirección</label>
            <input type="text" className="form-control" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label htmlFor="region" className="form-label">Región</label>
            <input type="text" className="form-control" id="region" name="region" value={formData.region} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label htmlFor="comuna" className="form-label">Comuna</label>
            <input type="text" className="form-control" id="comuna" name="comuna" value={formData.comuna} onChange={handleChange} />
          </div>

          <div className="col-12 d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/admin/usuarios')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminUsuarioForm;