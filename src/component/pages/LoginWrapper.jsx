import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Importamos nuestro hook de contexto
import { useUser } from '../../context/UserContext'; 

// Importamos la función de autenticación del servicio
import { authenticateUser } from '../../utils/mockDataService';
// (Opcional: aquí también importarías tu función createNewUser del servicio)

const LoginWrapper = () => {
  const [isLoginView, setIsLoginView] = useState(true); // Para cambiar entre Login y Registro
  const navigate = useNavigate();
  
  // Usamos el hook de contexto para obtener la función 'login'
  const { login } = useUser(); 

  // --- Estados del Formulario ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Para registro
  const [error, setError] = useState(null); // Para mostrar mensajes de error

  // --- Manejador del Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpiamos errores previos

    try {
      const userData = await authenticateUser(email, password);
      
      if (userData) {
        // ¡Éxito!
        login(userData); // Guardamos el usuario en el contexto
        
        // Redirigir según el rol
        if (userData.rol === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/perfil-cliente'); // O al home '/'
        }
      } else {
        // Usuario no encontrado o contraseña incorrecta
        setError('Email o contraseña incorrectos.');
      }
    } catch (err) {
      console.error('Error de login:', err);
      setError('Ocurrió un error. Inténtalo de nuevo.');
    }
  };

  // --- Manejador del Registro ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Aquí iría la lógica para el registro
    // 1. Validar que las contraseñas coincidan (si pides confirmación)
    // 2. Llamar a una función `createNewUser({ email, password, nombre })` de tu servicio
    // 3. Si tiene éxito, puedes loguearlo automáticamente: `login(nuevoUsuario)`
    // 4. Redirigir: `navigate('/perfil-cliente')`
    
    // Por ahora, un placeholder:
    setError('La función de registro aún no está implementada.');
  };

  // --- Formularios JSX ---

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <h2 className="mb-3">Iniciar Sesión</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="loginEmail"
          placeholder="nombre@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="loginEmail">Email</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="loginPassword"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="loginPassword">Contraseña</label>
      </div>
      <button type="submit" className="w-100 btn btn-lg btn-primary">
        Entrar
      </button>
      <hr className="my-4" />
      <p className="text-center">
        ¿No tienes cuenta?{' '}
        <a href="#" onClick={() => setIsLoginView(false)}>
          Regístrate aquí
        </a>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister}>
      <h2 className="mb-3">Crear Cuenta</h2>
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control"
          id="registerNombre"
          placeholder="Tu Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <label htmlFor="registerNombre">Nombre</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="registerEmail"
          placeholder="nombre@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="registerEmail">Email</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="registerPassword"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="registerPassword">Contraseña</label>
      </div>
      <button type="submit" className="w-100 btn btn-lg btn-success">
        Crear Cuenta
      </button>
      <hr className="my-4" />
      <p className="text-center">
        ¿Ya tienes cuenta?{' '}
        <a href="#" onClick={() => setIsLoginView(true)}>
          Inicia sesión
        </a>
      </p>
    </form>
  );

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4 shadow-sm">
            {isLoginView ? renderLoginForm() : renderRegisterForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWrapper;
