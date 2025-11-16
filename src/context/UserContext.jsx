import React, { createContext, useState, useContext, useEffect } from 'react';
// Importamos la función para obtener datos del usuario si ya está logueado (ej. desde localStorage)
import { getUserById } from '../utils/mockDataService'; 

// 1. Crear el Contexto
const UserContext = createContext(null);

// 2. Crear el Proveedor del Contexto
// Este componente envolverá a toda tu aplicación
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Para saber si estamos verificando la sesión

  // (Opcional pero recomendado)
  // Este efecto revisa si ya hay una sesión guardada en localStorage
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        try {
          // Si hay un ID, buscamos sus datos
          const userData = await getUserById(storedUserId);
          if (userData) {
            setUser(userData); // Sesión iniciada
          }
        } catch (error) {
          console.error("Error al re-autenticar usuario:", error);
          localStorage.removeItem('userId'); // Limpiamos si hay error
        }
      }
      setLoading(false);
    };
    checkLoggedInUser();
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    // Guardamos el ID en localStorage para persistir la sesión
    localStorage.setItem('userId', userData.id); 
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  // 3. Pasamos el 'valor' (el usuario y las funciones) al Provider
  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

// 4. Hook personalizado para usar el contexto fácilmente
// En lugar de importar useContext y UserContext en cada archivo,
// solo importaremos useUser()
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
