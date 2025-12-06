import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import RouterConfig from './routes/RouterConfig';

// 1. Importación del CSS de la App y el CSS Global
import './App.css';
import '../public/assets/css/style.css'; // 👈 Ruta corregida para cargar tu CSS principal

function App() {
  return (
    <UserProvider>
      <Router>
        {/* Ahora todos los componentes dentro de RouterConfig 
            pueden usar useUser() para acceder al usuario */}
        <RouterConfig />
      </Router>
    </UserProvider>
  );
}

export default App;
