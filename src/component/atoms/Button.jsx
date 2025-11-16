import React from 'react';

// LA CORRECCIÓN ESTÁ AQUÍ: Es "=> (" (una función flecha)
const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

export default Button;