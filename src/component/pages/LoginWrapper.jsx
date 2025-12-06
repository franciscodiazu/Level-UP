import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
// ⚠️ Importamos la nueva función de inicio de sesión de Firebase
import { loginUser } from '../../services/firestoreService'; 

const LoginWrapper = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // 1. Llama a la función de servicio que autentica en Firebase y obtiene el perfil con el rol.
            const userProfile = await loginUser(email, password);
            
            // ⚠️ AÑADIR ESTA LÍNEA PARA DEPURAR ⚠️
            console.log("Perfil obtenido desde Firestore:", userProfile); 

            // 2. Inicia la sesión en el contexto de React (guarda el objeto userProfile con el rol)
            login(userProfile); 

            // 3. Redirige según el rol obtenido de Firestore
            if (userProfile.rol === 'admin') {
                navigate('/admin/dashboard');
            } else if (userProfile.rol === 'vendedor') {
                navigate('/vendedor/dashboard'); // 👈 Redirección del Vendedor
            } else {
                navigate('/'); // Redirige a clientes u otros roles
            }

        } catch (err) {
            // Muestra un mensaje de error genérico o intenta parsear el error de Firebase si es posible
            setError("Fallo en el inicio de sesión. Verifique credenciales.");
            console.error("Detalle del error de login:", err.message);
        }
    };

    // ----------------------------------------------------------------------
    // --- Asegúrese de que el formulario llama a handleSubmit ---
    // ----------------------------------------------------------------------
    return (
        <div className="container mt-5">
            <h2 className="mb-3">Iniciar Sesión</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit} className="card p-4">
                <div className="mb-3">
                    <label htmlFor="emailInput" className="form-label">Email</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        id="emailInput" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="passwordInput" className="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        id="passwordInput"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Entrar</button>
            </form>
        </div>
    );
};

export default LoginWrapper;
