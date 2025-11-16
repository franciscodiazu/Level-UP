import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ¡PASO IMPORTANTE! Importamos el hook del contexto de usuario
import { useUser } from '../../context/UserContext';

// (Importa tu Header y Footer cuando los tengas como componentes)
// import Header from '../layout/Header';
// import Footer from '../layout/Footer';

// (TODO: También necesitarás un contexto o estado para el carrito)
// Por ahora, usaremos datos simulados del carrito
const mockCartItems = [
  { id: 'prod_002', nombre: 'Mouse Razer Deathadder', precio: 24990, cantidad: 1, subtotal: 24990 },
  { id: 'prod_005', nombre: 'Nintendo Switch OLED', precio: 349990, cantidad: 1, subtotal: 349990 },
];
const mockTotal = 374980;


const Checkout = () => {
  // ¡PASO 1! Obtenemos el usuario del contexto
  const { user } = useUser();
  const navigate = useNavigate();

  // ¡PASO 2! Estados locales para CADA campo del formulario
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [calle, setCalle] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [region, setRegion] = useState('Región Metropolitana de Santiago');
  const [comuna, setComuna] = useState('Cerrillos');
  const [indicaciones, setIndicaciones] = useState('');

  // ¡PASO 3! useEffect para rellenar el formulario si el usuario existe
  useEffect(() => {
    if (user) {
      // Llenamos el estado del formulario con los datos del usuario del contexto
      // Usamos (user.campo || '') para evitar errores si un campo es null
      setNombre(user.nombre || '');
      setApellidos(user.apellido || '');
      setCorreo(user.email || '');
      
      // Lógica para separar la dirección de nuestro mockDataService
      // user.direccion = "Los Crisantemos, Edificio Norte, Depto 603"
      // Esto es solo un ejemplo, puedes ajustar cómo guardas la dirección
      if (user.direccion) {
        const partesDir = user.direccion.split(', Depto ');
        setCalle(partesDir[0] || '');
        setDepartamento(partesDir[1] ? `Depto ${partesDir[1]}` : '');
      }
      
      setRegion(user.region || 'Región Metropolitana de Santiago');
      setComuna(user.comuna || 'Cerrillos');
    }
  }, [user]); // Este efecto se ejecuta cada vez que el 'user' (del contexto) cambie

  
  const handlePagar = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de procesar el pago...
    
    // Al finalizar, redirigimos a la página de éxito
    console.log("Procesando pago para:", { nombre, correo, calle });
    // (Simulamos un pago exitoso)
    navigate('/compra-exitosa'); 
    
    // (Para simular un error, harías: navigate('/error-pago');)
  };


  return (
    <div>
      {/* <Header /> */}
      <main className="container mt-4">
        <h2>Carrito de compra</h2>
        <p>Completa la siguiente información para finalizar tu compra.</p>
        <hr />

        <form onSubmit={handlePagar} className="row g-5">
          {/* Columna de Información del Cliente (Formulario) */}
          <div className="col-md-7">
            <h4>Información del cliente</h4>
            
            <div className="row g-3">
              <div className="col-sm-6">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input type="text" className="form-control" id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>

              <div className="col-sm-6">
                <label htmlFor="apellidos" className="form-label">Apellidos</label>
                <input type="text" className="form-control" id="apellidos" value={apellidos} onChange={e => setApellidos(e.target.value)} required />
              </div>

              <div className="col-12">
                <label htmlFor="correo" className="form-label">Correo</label>
                <input type="email" className="form-control" id="correo" placeholder="tu@email.com" value={correo} onChange={e => setCorreo(e.target.value)} required />
              </div>
            </div>

            <hr className="my-4" />

            <h4>Dirección de entrega de los productos</h4>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="calle" className="form-label">Calle</label>
                <input type="text" className="form-control" id="calle" placeholder="Av. Principal 123, Edificio, etc." value={calle} onChange={e => setCalle(e.target.value)} required />
              </div>

              <div className="col-md-5">
                <label htmlFor="departamento" className="form-label">Departamento <span className="text-muted">(Opcional)</span></label>
                <input type="text" className="form-control" id="departamento" placeholder="Depto 603" value={departamento} onChange={e => setDepartamento(e.target.value)} />
              </div>
              
              <div className="col-md-4">
                <label htmlFor="region" className="form-label">Región</label>
                <select className="form-select" id="region" value={region} onChange={e => setRegion(e.target.value)} required>
                  <option value="Región Metropolitana de Santiago">Metropolitana</option>
                  {/* (Aquí cargarías más regiones) */}
                </select>
              </div>

              <div className="col-md-3">
                <label htmlFor="comuna" className="form-label">Comuna</label>
                <select className="form-select" id="comuna" value={comuna} onChange={e => setComuna(e.target.value)} required>
                  <option value="Cerrillos">Cerrillos</option>
                  {/* (Aquí cargarías más comunas) */}
                </select>
              </div>
              
              <div className="col-12">
                <label htmlFor="indicaciones" className="form-label">Indicaciones para la entrega <span className="text-muted">(Opcional)</span></label>
                <textarea className="form-control" id="indicaciones" rows="2" placeholder="Entre calles, color del edificio, dejar en conserjería..." value={indicaciones} onChange={e => setIndicaciones(e.target.value)}></textarea>
              </div>
            </div>

            <hr className="my-4" />

            <button className="w-100 btn btn-success btn-lg" type="submit">
              Pagar ahora
            </button>
          </div>

          {/* Columna del Resumen del Carrito */}
          <div className="col-md-5">
            <h4>
              Resumen del Carrito
              <span className="badge bg-primary rounded-pill ms-2">{mockCartItems.length}</span>
            </h4>
            
            <ul className="list-group mb-3">
              {mockCartItems.map(item => (
                <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">{item.nombre}</h6>
                    <small className="text-muted">Cantidad: {item.cantidad}</small>
                  </div>
                  <span className="text-muted">${new Intl.NumberFormat('es-CL').format(item.subtotal)}</span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between">
                <strong>Total (CLP)</strong>
                <strong>${new Intl.NumberFormat('es-CL').format(mockTotal)}</strong>
              </li>
            </ul>
          </div>
        </form>
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default Checkout;