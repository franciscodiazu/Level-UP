import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// import '@testing-library/jest-dom'; 

import Button from './Button'; 

describe('Componente Button', () => {

  // Tarea del PDF: Prueba de Propiedades (etiqueta)
  it('debe renderizar con la etiqueta (props) correcta', () => {
    render(<Button>Mi Botón de Prueba</Button>);
    
    // Si 'getByText' encuentra el elemento, la prueba ya es un éxito.
    // Si no lo encuentra, lanzará un error y la prueba fallará.
    const buttonElement = screen.getByText(/Mi Botón de Prueba/i);
    
    // Esta es una comprobación "Jasmine-pura" que verifica que el elemento existe.
    expect(buttonElement).toBeTruthy();
  });

  // Tarea del PDF: Prueba de Eventos (clic)
  // (Esta prueba ya era 100% compatible con Jasmine)
  it('debe llamar a la función onClick (props) al ser presionado', () => {
    const mockOnClick = jasmine.createSpy('onClick');
    render(<Button onClick={mockOnClick}>Click Me</Button>);
    
    const buttonElement = screen.getByText(/Click Me/i);
    fireEvent.click(buttonElement);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

});