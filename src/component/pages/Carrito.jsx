import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; // Asegúrate de que esta ruta sea correcta
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Carrito.css'; // Necesitarás un archivo CSS para este componente

/**
 * Componente del Carrito de Compras
 * Muestra productos en oferta y el resumen del carrito
 */
const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [productosOferta, setProductosOferta] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(carritoGuardado);
    cargarProductosOferta();
  }, []);

  /**
   * Carga productos en oferta desde Firestore
   */
  const cargarProductosOferta = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'producto'));
      const productos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrar productos con precio anterior (en oferta)
      const productosConOferta = productos.filter(producto => producto.precioAnterior);
      setProductosOferta(productosConOferta);
    } catch (error) {
      console.error('Error cargando productos en oferta:', error);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Agrega un producto al carrito
   */
  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find(item => item.id === producto.id);
    let nuevoCarrito;

    if (productoExistente) {
      nuevoCarrito = carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: (item.cantidad || 1) + 1 }
          : item
      );
    } else {
      nuevoCarrito = [...carrito, { ...producto, cantidad: 1 }];
    }

    setCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
    mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
  };

  // ... (resto de las funciones como actualizarCantidad, eliminarDelCarrito, etc.)

  const calcularTotal = () => {
    return carrito.reduce((total, producto) => {
      return total + (producto.precio || 0) * (producto.cantidad || 1);
    }, 0);
  };

  if (cargando) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="carrito-container">
      {/* Sección de Ofertas */}
      <section className="ofertas-section">
        <h2 className="section-title">Productos en Oferta</h2>
        <div className="productos-grid">
          {productosOferta.map(producto => (
            <div key={producto.id} className="producto-card">
              {/* ... estructura de la tarjeta del producto ... */}
              <button 
                className="btn-agregar-oferta"
                onClick={() => agregarAlCarrito(producto)}
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Resumen del Carrito */}
      <section className="resumen-carrito">
        <h2 className="section-title">Resumen del Carrito</h2>
        <div className="tabla-carrito-container">
          <table className="tabla-carrito">
            {/* ... encabezado y cuerpo de la tabla ... */}
            <tbody>
              {carrito.map((producto, index) => (
                <tr key={`${producto.id}-${index}`}>
                  {/* ... celdas de la tabla para cada producto ... */}
                  <td>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarDelCarrito(index)}
                    >
                     Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer del carrito con total y botones */}
        {carrito.length > 0 && (
          <div className="carrito-footer">
            {/* ... total y botones de limpiar/comprar ... */}
          </div>
        )}
      </section>
    </div>
  );
};

export default Carrito;