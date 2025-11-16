import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import RouterConfig from './routes/RouterConfig';
import './App.css';

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
