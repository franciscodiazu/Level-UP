import React from 'react';
import { useParams } from 'react-router-dom';
// import Header from '../layout/Header';
// import Footer from '../layout/Footer';

const DetalleBlog = () => {
  const { articuloId } = useParams();

  return (
    <div>
      {/* <Header /> */}
      <main className="container mt-4">
        <h2>Título del Artículo</h2>
        <p className="text-muted">ID del Artículo: {articuloId}</p>
        <hr />
        <article>
          <p>Aquí irá el contenido completo del artículo...</p>
          {/* Puedes usar el HTML de /public/assets/html/articulo-guia-pc.html como base */}
        </article>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default DetalleBlog;