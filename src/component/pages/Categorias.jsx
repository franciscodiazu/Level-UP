import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

// (Importa tu Header y Footer cuando los tengas como componentes)
// import Header from '../layout/Header';
// import Footer from '../layout/Footer';

// ¡PASO IMPORTANTE! Importamos las DOS funciones que necesitamos
import { getCategories, getProductsByCategory } from '../../utils/mockDataService';

const Categorias = () => {
  // Usamos 'useParams' para leer el ID de la categoría desde la URL (ej: /categorias/cat1)
  const { categoriaId } = useParams();

  // Estados para manejar los datos de la "API"
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaActual, setCategoriaActual] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Este efecto se ejecuta cada vez que 'categoriaId' (de la URL) cambia
  useEffect(() => {
    
    const loadData = async () => {
      setIsLoading(true); // Empezamos la carga
      
      try {
        // 1. Siempre cargamos la lista completa de categorías
        const todasLasCategorias = await getCategories();
        setCategorias(todasLasCategorias);
        
        // 2. Determinamos qué ID de categoría vamos a usar
        // Si la URL no trae un ID, usamos el de la primera categoría como default
        const idParaFiltrar = categoriaId || (todasLasCategorias.length > 0 ? todasLasCategorias[0].id : null);
        
        if (idParaFiltrar) {
          // 3. Buscamos los productos y el nombre de la categoría actual
          const productosFiltrados = await getProductsByCategory(idParaFiltrar);
          const catActual = todasLasCategorias.find(c => c.id === idParaFiltrar);

          setProductos(productosFiltrados);
          setCategoriaActual(catActual);
        }

      } catch (error) {
        console.error("Error al cargar datos de categorías:", error);
      } finally {
        setIsLoading(false); // Terminamos la carga
      }
    };
    
    loadData();
  }, [categoriaId]); // El array [categoriaId] hace que se vuelva a ejecutar si el ID de la URL cambia

  // --- Renderizado Condicional ---

  // 1. Mostrar mensaje de carga
  if (isLoading && !productos.length) {
    return (
      <div className="container mt-4">
        <h2>Categorías</h2>
        <hr />
        <p>Cargando...</p>
      </div>
    );
  }

  // 2. Mostrar la página completa
  return (
    <div>
      {/* <Header /> */}
      
      <main className="container mt-4">
        {/* Sección de Filtros de Categorías (Figura 4, parte superior) */}
        <section className="text-center mb-4 p-3 bg-light rounded">
          <h2 className="mb-3">Categorías</h2>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            {categorias.map(cat => (
              <Link 
                key={cat.id} 
                to={`/categorias/${cat.id}`} 
                // Comparamos los IDs para saber cuál es el botón "activo"
                className={`btn ${categoriaActual?.id === cat.id ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                {cat.nombre}
              </Link>
            ))}
          </div>
        </section>

        {/* Sección de Productos de la Categoría Seleccionada (Figura 4, parte inferior) */}
        <section>
          <h3>{categoriaActual ? categoriaActual.nombre : 'Selecciona una categoría'}</h3>
          <hr />
          <div className="row">
            {/* Si estamos cargando pero ya teníamos productos, mostramos un overlay o texto simple */}
            {isLoading && <p>Actualizando productos...</p>}
            
            {!isLoading && productos.length > 0 ? (
              productos.map(prod => (
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
                      </p>
                      <button className="btn btn-primary mt-auto">
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              !isLoading && <p>No hay productos en esta categoría.</p>
            )}
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default Categorias;