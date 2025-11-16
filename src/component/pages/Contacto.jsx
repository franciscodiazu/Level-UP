import React from 'react';
// import Header from '../layout/Header';
// import Footer from '../layout/Footer';

const Contacto = () => {
  return (
    <div>
      {/* <Header /> */}
      <main className="container mt-4">
        <h2>Contacto</h2>
        <p>¿Tienes dudas? ¡Escríbenos!</p>
        <hr />
        {/* Aquí puedes migrar el formulario que tienes en:
          public/assets/html/contacto.html
        */}
        <form>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input type="text" className="form-control" id="nombre" />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" className="form-control" id="email" />
          </div>
          <div className="mb-3">
            <label htmlFor="mensaje" className="form-label">Mensaje</label>
            <textarea className="form-control" id="mensaje" rows="3"></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Enviar</button>
        </form>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Contacto;