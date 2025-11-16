import React from 'react';
import { Link } from 'react-router-dom';
// import Header from '../layout/Header';
// import Footer from '../layout/Footer';

const Blog = () => {
  // Más adelante, esta lista vendrá de tu archivo de datos
  const articulos = [
    { id: 'articulo-1', titulo: 'Guía para armar tu PC Gamer', resumen: '...' },
    { id: 'articulo-2', titulo: 'Review: Razer Firefly', resumen: '...' },
  ];

  return (
    <div>
      {/* <Header /> */}
      <main className="container mt-4">
        <h2>Nuestro Blog</h2>
        <hr />
        <div className="list-group">
          {articulos.map(articulo => (
            <Link key={articulo.id} to={`/blog/${articulo.id}`} className="list-group-item list-group-item-action">
              <h5 className="mb-1">{articulo.titulo}</h5>
              <p className="mb-1">{articulo.resumen}</p>
            </Link>
          ))}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Blog;