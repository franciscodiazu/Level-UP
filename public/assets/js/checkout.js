/* ==========================================
 * ARCHIVO: js/checkout.js (VERSIÓN CORREGIDA)
 * Guarda productos en localStorage antes de limpiar carrito
 * ==========================================
*/

import { regionesYComunas } from './regiones.js';

const firebaseConfig = {
    apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
    authDomain: "tienda-level-up.firebaseapp.com",
    projectId: "tienda-level-up"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.addEventListener('DOMContentLoaded', function() {
    inicializarCheckout();
    configurarEventosCheckout();
    cargarRegiones(); 
    autoFillUserData();
});

function autoFillUserData() {
    console.log("🚀 Iniciando autocompletado...");
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return; 

    let usuario;
    try {
        usuario = JSON.parse(usuarioStr);
    } catch (e) {
        console.error("Error leyendo datos del usuario:", e);
        return;
    }

    const camposPersonales = {
        'nombre': usuario.nombre || '',
        'apellidos': usuario.apellidos || usuario.apellido || '',
        'correo': usuario.correo || ''
    };

    for (const [id, valor] of Object.entries(camposPersonales)) {
        const input = document.getElementById(id);
        if (input) {
            input.value = valor;
            input.readOnly = true; 
            input.style.backgroundColor = "#333"; 
            input.style.color = "white"; 
            input.style.cursor = "not-allowed";      
        }
    }

    const dir = usuario;

    if (dir.calle) {
        const inputCalle = document.getElementById('calle');
        if (inputCalle) {
            const numeroStr = dir.numero ? ` #${dir.numero}` : '';
            inputCalle.value = dir.calle + numeroStr;
        }
    }

    if (dir.departamento) document.getElementById('departamento').value = dir.departamento;
    if (dir.indicaciones) document.getElementById('indicaciones').value = dir.indicaciones || "";

    const regionUsuario = (dir.region || dir.Region || "").trim();
    const comunaUsuario = (dir.comuna || dir.Comuna || "").trim();

    if (regionUsuario) {
        const regionSelect = document.getElementById('region');
        
        const regionEncontrada = regionesYComunas.regiones.find(r => {
            const nombreBD = regionUsuario.toLowerCase();
            const nombreLista = r.nombre.toLowerCase();
            return nombreBD === nombreLista || nombreLista.includes(nombreBD) || nombreBD.includes(nombreLista);
        });

        if (regionEncontrada && regionSelect) {
            regionSelect.value = regionEncontrada.nombre;
            cargarComunas(regionEncontrada.nombre);

            if (comunaUsuario) {
                setTimeout(() => {
                    const comunaSelect = document.getElementById('comuna');
                    const comunaEncontrada = regionEncontrada.comunas.find(c => 
                        c.toLowerCase().trim() === comunaUsuario.toLowerCase()
                    );

                    if (comunaEncontrada) {
                        comunaSelect.value = comunaEncontrada;
                        comunaSelect.disabled = false;
                    }
                }, 200);
            }
        }
    }
}

function cargarRegiones() {
    const selectRegion = document.getElementById('region');
    if (!selectRegion) return;
    
    selectRegion.innerHTML = '<option value="">-- Seleccione Región --</option>';

    regionesYComunas.regiones.forEach(region => {
        const option = document.createElement('option');
        option.value = region.nombre; 
        option.textContent = region.nombre;
        selectRegion.appendChild(option);
    });
}

function cargarComunas(nombreRegion) {
    const selectComuna = document.getElementById('comuna');
    if (!selectComuna) return;
    
    selectComuna.innerHTML = '<option value="">Selecciona una comuna</option>';
    
    const regionObj = regionesYComunas.regiones.find(r => r.nombre === nombreRegion);
    
    if (regionObj) {
        const comunas = regionObj.comunas || [];
        comunas.sort().forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            selectComuna.appendChild(option);
        });
        selectComuna.disabled = false;
    } else {
        selectComuna.disabled = true;
    }
}

function inicializarCheckout() {
    renderizarProductosCheckout();
    actualizarTotales(); 
}

function renderizarProductosCheckout() {
    const tbody = document.getElementById('tablaCheckoutBody');
    if (!tbody) return;
    if (carrito.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="carrito-vacio"><div class="icono">🛒</div><h3>No hay productos en el carrito</h3><a href="catalogo.html" class="btn-ir-catalogo">Volver al Catálogo</a></td></tr>`;
        const btnPagar = document.getElementById('btnPagarAhora');
        if (btnPagar) btnPagar.style.display = 'none';
        return;
    }
    tbody.innerHTML = carrito.map(producto => `
        <tr>
            <td><img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-tabla" onerror="this.src='https://via.placeholder.com/100x100'"></td>
            <td>${producto.nombre}</td>
            <td>$${producto.precio?.toLocaleString('es-CL')}</td>
            <td>${producto.cantidad || 1}</td>
            <td>$${((producto.precio || 0) * (producto.cantidad || 1)).toLocaleString('es-CL')}</td>
        </tr>
    `).join('');
}

function actualizarTotales() {
    const total = carrito.reduce((sum, product) => sum + ((product.precio || 0) * (product.cantidad || 1)), 0);
    const totalPagar = document.getElementById('totalPagar');
    const montoPagar = document.getElementById('montoPagar');
    if (totalPagar) totalPagar.textContent = '$' + total.toLocaleString('es-CL');
    if (montoPagar) montoPagar.textContent = '$' + total.toLocaleString('es-CL');
    localStorage.setItem('cartTotal', total);
    
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal();
    }
}

window.procesarPago = async function() {
    if (carrito.length === 0) return alert('No hay productos en el carrito');
    if (!validarFormularios()) return alert('Por favor completa todos los campos obligatorios');
    const btnPagar = document.getElementById('btnPagarAhora');
    btnPagar.disabled = true;
    btnPagar.textContent = 'Procesando...';
    
    try {
        const datosCliente = obtenerDatosCliente();
        const datosDireccion = obtenerDatosDireccion();
        const total = carrito.reduce((sum, p) => sum + ((p.precio || 0) * (p.cantidad || 1)), 0);
        
        // Crear objeto de compra para Firebase
        const compra = {
            fecha: new Date(),
            cliente: datosCliente,
            direccion: datosDireccion,
            productos: [...carrito],
            total: total,
            estado: 'pendiente',
            numeroOrden: generarNumeroOrden()
        };

        // IMPORTANTE: Guardar datos COMPLETOS en localStorage ANTES de limpiar carrito
        const datosParaBoleta = {
            cliente: datosCliente,
            direccion: datosDireccion,
            productos: [...carrito], // Copia completa del carrito
            total: total,
            fecha: new Date().toISOString(),
            numeroOrden: compra.numeroOrden
        };
        localStorage.setItem('datosCheckout', JSON.stringify(datosParaBoleta));
        console.log("Datos guardados para boleta:", datosParaBoleta);

        // Guardar en Firebase
        const docRef = await db.collection('compras').add(compra);
        
        // Simulación de pago
        if (Math.random() > 0.5) {
            // PAGO EXITOSO
            await db.collection('compras').doc(docRef.id).update({ estado: 'completada' });
            
            // NO limpiar carrito aquí - se hace en boleta.html después de mostrar
            console.log("Pago exitoso, redirigiendo a boleta...");
            
            // Redirigir a la NUEVA BOLETA
            window.location.href = `boleta.html?orden=${compra.numeroOrden}`;
            
        } else {
            // PAGO FALLIDO
            await db.collection('compras').doc(docRef.id).update({ estado: 'error_pago' });
            
            // Guardar datos para página de error
            localStorage.setItem('datosCheckoutError', JSON.stringify(datosParaBoleta));
            
            console.log("Pago fallido, redirigiendo a error...");
            window.location.href = `errorPago.html?orden=${compra.numeroOrden}`;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra.');
        btnPagar.disabled = false;
        btnPagar.textContent = 'Pagar ahora';
    }
};

function validarFormularios() {
    return document.getElementById('formCliente').checkValidity() && document.getElementById('formDireccion').checkValidity();
}

function obtenerDatosCliente() {
    return {
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        correo: document.getElementById('correo').value
    };
}

function obtenerDatosDireccion() {
    return {
        calle: document.getElementById('calle').value,
        departamento: document.getElementById('departamento').value || '',
        region: document.getElementById('region').value,
        comuna: document.getElementById('comuna').value,
        indicaciones: document.getElementById('indicaciones').value || ''
    };
}

function generarNumeroOrden() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORDEN-${year}${month}${day}-${random}`;
}

function configurarEventosCheckout() {
    const btnPagar = document.getElementById('btnPagarAhora');
    if (btnPagar) btnPagar.addEventListener('click', window.procesarPago);
    
    const selectRegion = document.getElementById('region');
    if(selectRegion) {
        selectRegion.addEventListener('change', function() {
            if (this.value) cargarComunas(this.value);
            else {
                const selectComuna = document.getElementById('comuna');
                selectComuna.innerHTML = '<option value="">Primero selecciona una región</option>';
                selectComuna.disabled = true;
            }
        });
    }
    
    const inputs = document.querySelectorAll('#formCliente input[required], #formDireccion input[required], #formDireccion select[required]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (!this.checkValidity()) this.style.borderColor = '#dc3545';
            else this.style.borderColor = '#28a745';
        });
    });
}