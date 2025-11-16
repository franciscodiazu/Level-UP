import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../../services/mockDataService';
import { useUser } from '../../context/UserContext'; // Para no eliminarse a sí mismo

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useUser(); // El admin logueado

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getUsers();
    setUsuarios(data);
    setIsLoading(false);
  };

  const handleDelete = async (userId, userName) => {
    // Evitar que el admin se elimine a sí mismo
    if (userId === currentUser.id) {
      alert("No puedes eliminar tu propia cuenta de administrador.");
      return;
    }
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar a "${userName}"?`)) {
      try {
        await deleteUser(userId);
        setUsuarios(usuarios.filter(u => u.id !== userId));
        alert("Usuario eliminado con éxito.");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Hubo un error al eliminar el usuario.");
      }
    }
  };

  if (isLoading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h2">Gestión de Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-success">
          Crear Nuevo Usuario
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.id}>
                  <td>{user.nombre} {user.apellido || ''}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.rol === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/usuarios/editar/${user.id}`} className="btn btn-sm btn-primary me-2">
                      Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(user.id, user.nombre)} 
                      className="btn btn-sm btn-danger"
                      disabled={user.id === currentUser.id} // Deshabilitar si es el mismo admin
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

export default AdminUsuarios;