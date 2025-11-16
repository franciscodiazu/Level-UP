import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// (Importa tu Header y Footer cuando los tengas como componentes)
// import Header from '../layout/Header';
// import Footer from '../layout/Footer';

// ¡PASO IMPORTANTE! Importamos la función para buscar un producto por su ID
import { getProductById } from '../../utils/mockDataService';

const DetalleProducto = () => {
  // useParams nos da el ID que viene en la URL (ej: /producto/:productoId)
  const { productoId } = useParams();
  
  // Estado para guardar el producto encontrado
  const [producto, setProducto] = useState(null);
  
  // Estado para la carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect se ejecuta cuando el componente carga o cuando productoId cambia
  useEffect(() => {
    const loadProducto = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getProductById(productoId);
        if (data) {
          setProducto(data);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el producto.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducto();
  }, [productoId]); // El array [productoId] asegura que si el ID cambia, se vuelve a cargar

  // --- Renderizado Condicional ---

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  // 2. Estado de Error (ej. producto no encontrado)
  if (error) {
    return (
      <div className="container mt-4 text-center">
        <h2>Algo salió mal</h2>
        <p className="text-danger">{error}</p>
        <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
      </div>
    );
  }

  // 3. Estado de Éxito (producto cargado)
  if (!producto) {
    // Esto es por si algo falla pero no entra en el 'error'
    return <p className="container mt-4">Producto no disponible.</p>;
  }

  return (
    <div>
      {/* <Header /> */}
      <main className="container mt-4">
        
        {/* Enlace para volver */}
        <div className="mb-3">
          <Link to="/catalogo">← Volver al catálogo</Link>
        </div>

        <div className="row">
          {/* Columna de la Imagen */}
          <div className="col-md-6 mb-3">
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded shadow-sm" />
          </div>

          {/* Columna de la Información */}
          <div className="col-md-6">
            <h1 className="display-5">{producto.nombre}</h1>
            
            {/* Mostrar si está en oferta */}
            {producto.enOferta && (
              <span className="badge bg-danger fs-6 mb-2">Oferta</span>
            )}

            <p className="h3 text-success my-3">
              ${new Intl.NumberFormat('es-CL').format(producto.precio)}
            </p>

            <p className="lead">{producto.descripcion}</p>

            <hr />

            {/* Acciones */}
            <div className="d-grid gap-2 d-md-block">
              <button className="btn btn-primary btn-lg me-md-2" type="button">
                Añadir al carrito
              </button>
              {/* Podríamos mostrar el stock si quisiéramos */}
              <span className="text-muted">Stock disponible: {producto.stock}</span>
            </div>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default DetalleProducto;