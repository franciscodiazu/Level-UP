/* ==========================================
 * ARCHIVO: js/ofertas.js
 * - Carga y muestra productos en oferta desde Firebase.
 * - Implementa la lógica de precios de oferta.
 * ==========================================
*/

import { getProductosEnOferta } from './api/firebaseApi.js';
import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ofertasGrid = document.getElementById('ofertasGrid');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const formatearPrecio = (valor) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(valor);
    };

    const cargarOfertas = async () => {
        if (!ofertasGrid) return;

        try {
            const productos = await getProductosEnOferta();
            
            if (productos.length === 0) {
                ofertasGrid.innerHTML = `<p style="text-align: center; font-size: 1.2em; grid-column: 1 / -1;">No hay ofertas disponibles en este momento. ¡Vuelve pronto!</p>`;
                return;
            }

            renderizarProductos(productos);

        } catch (error) {
            console.error("Error al cargar ofertas de Firebase:", error);
            ofertasGrid.innerHTML = `<p style="text-align: center; color: red; grid-column: 1 / -1;">Error al cargar las ofertas.</p>`;
        }
    };

    const renderizarProductos = (productos) => {
        ofertasGrid.innerHTML = productos.map(producto => {
            const precioNormal = `<p class="product-price">${formatearPrecio(producto.precio)}</p>`;
            
            const precioOferta = `
                <div class="precio-oferta-container">
                    <p class="product-price-original">${formatearPrecio(producto.precio)}</p>
                    <p class="product-price-oferta">${formatearPrecio(producto.precioOferta)}</p>
                </div>
            `;

            return `
                <article class="product-card">
                    <a href="#" style="text-decoration: none;">
                        <img src="${producto.imagen}" alt="${producto.nombre}" />
                        <h3>${producto.nombre}</h3>
                    </a>
                    
                    ${(producto.enOferta && producto.precioOferta > 0) ? precioOferta : precioNormal}

                    <button class="btn btn-primary btn-add-cart" data-id="${producto.id}">Añadir al carrito</button>
                </article>
            `;
        }).join('');

        // Añadir eventos a los nuevos botones
        document.querySelectorAll('.btn-add-cart').forEach(boton => {
            boton.addEventListener('click', function() {
                const productoId = this.dataset.id;
                const productoSeleccionado = productos.find(p => p.id === productoId);
                agregarAlCarrito(productoSeleccionado);
            });
        });
    };

    const agregarAlCarrito = (producto) => {
        if (!producto) return;

        // El precio a usar es el de oferta si existe, si no, el normal
        const precioFinal = (producto.enOferta && producto.precioOferta > 0) ? producto.precioOferta : producto.precio;

        const productoExistente = carrito.find(item => item.id === producto.id);

        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            carrito.push({
                ...producto,
                precio: precioFinal, // Guardamos el precio final en el carrito
                cantidad: 1
            });
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarTotalLocalStorage();
        
        // Mostrar notificación
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '¡Agregado!',
                text: `"${producto.nombre}" se ha añadido a tu carrito.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }
    };

    const actualizarTotalLocalStorage = () => {
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        localStorage.setItem('cartTotal', total);
        // Llamar a la función global para actualizar el header
        if (window.actualizarHeaderCartGlobal) {
            window.actualizarHeaderCartGlobal();
        }
    };

    cargarOfertas();
});