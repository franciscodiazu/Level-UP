import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Necesario porque LoginWrapper usa 'navigate'

// Importamos el componente que vamos a probar
import LoginWrapper from './LoginWrapper'; 
// Importamos el UserProvider, porque LoginWrapper lo necesita
import { UserProvider } from '../../context/UserContext'; 

// --- Configuración de la Prueba ---
// Creamos un "renderizador" personalizado que envuelve el componente
// con los "Providers" que necesita (Router y UserContext)
const renderWithProviders = (component) => {
  return render(
    <UserProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </UserProvider>
  );
};

// --- Inicio de las Pruebas ---
describe('Componente LoginWrapper', () => {

  // Tarea del PDF: Prueba de Estado (State)
  it('debe actualizar el estado interno cuando el usuario escribe', () => {
    // 1. Renderizar el componente
    renderWithProviders(<LoginWrapper />);
    
    // 2. Buscar los campos de texto
    // Usamos 'getByLabelText' para encontrar el <input> por su <label>
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    
    // 3. Simular la escritura del usuario (el evento 'change')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // 4. Comprobar (Assert)
    // Verificamos que el *valor* del <input> ahora es el que escribimos.
    // Esto comprueba indirectamente que el 'useState' funcionó.
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // --- PRUEBA 2 (¡AÑADE ESTA!) ---
  // Tarea del PDF: Renderizado Condicional
  it('debe mostrar un mensaje de error solo si el login falla', async () => {
    // 1. Renderizar
    renderWithProviders(<LoginWrapper />);
    
    // 2. Buscar elementos
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByText(/Entrar/i);

    // 3. Simular un login INCORRECTO
    fireEvent.change(emailInput, { target: { value: 'usuario@incorrecto.com' } });
    fireEvent.change(passwordInput, { target: { value: 'mala-clave' } });
    fireEvent.click(submitButton);

    // 4. Comprobar (Assert)
    // Usamos 'findByText' (con 'await') para esperar a que aparezca el error
    const errorMessage = await screen.findByText(/Email o contraseña incorrectos/i);
    
    // Verificamos que el mensaje de error ahora existe en el documento
    expect(errorMessage).toBeTruthy(); 
  });

});