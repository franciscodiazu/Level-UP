import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// import Header from '../layout/Header';
// import Footer from '../layout/Footer';

// ¡PASO IMPORTANTE! Importamos la función específica para ofertas
import { getProductsInOffer } from '../../utils/mockDataService';

const Ofertas = () => {
  // Estado para guardar los productos en oferta
  const [productosEnOferta, setProductosEnOferta] = useState([]);
  
  // Estado para saber si los datos aún se están cargando
  const [isLoading, setIsLoading] = useState(true);

  // useEffect se ejecuta cuando el componente se "monta"
  useEffect(() => {
    const loadOfertas = async () => {
      try {
        // Llamamos a nuestra función simulada y esperamos la respuesta
        const data = await getProductsInOffer();
        setProductosEnOferta(data); // Guardamos los productos en el estado
      } catch (error) {
        console.error("Error al cargar productos en oferta:", error);
      } finally {
        setIsLoading(false); // Terminamos la carga
      }
    };

    loadOfertas(); // Ejecutamos la función de carga
  }, []); // El array vacío [] significa que esto se ejecuta SÓLO UNA VEZ

  // --- Renderizado Condicional ---
  
  // 1. Mostrar mensaje de carga
  if (isLoading) {
    return (
      <div className="container mt-4">
        <h2>Productos en Oferta</h2>
        <hr />
        <p>Buscando las mejores ofertas...</p>
      </div>
    );
  }

  // 2. Mostrar las ofertas cuando han cargado
  return (
    <div>
      {/* <Header /> */}
      
      <main className="container mt-4">
        <h2>Productos en Oferta</h2>
        <hr />
        
        <div className="row">
          {/* Verificamos si el array tiene al menos 1 producto */}
          {productosEnOferta.length > 0 ? (
            productosEnOferta.map(prod => (
              <div key={prod.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div className="card h-100">
                  <Link to={`/producto/${prod.id}`}>
                    <img src={prod.imagen} className="card-img-top" alt={prod.nombre} />
                  </Link>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                      <Link to={`/producto/${prod.id}`} className="text-decoration-none text-dark">
                        {prod.nombre}
                      </Link>
                    </h5>
                    
                    <p className="card-text h4 text-success">
                      ${new Intl.NumberFormat('es-CL').format(prod.precio)}
                      {/* Podríamos agregar una etiqueta de "Oferta" aquí */}
                      <span className="badge bg-danger ms-2">Oferta</span>
                    </p>
                    
                    <button className="btn btn-primary mt-auto">
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Mensaje si no se encuentran ofertas
            <p>De momento no hay ofertas disponibles. ¡Vuelve pronto!</p>
          )}
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default Ofertas;