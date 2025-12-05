/* ==========================================
 * ARCHIVO: js/checkout.js
 * (Versión Profesional: Usando Import)
 * ==========================================
*/

// 1. IMPORTAMOS LAS REGIONES (No las copiamos)
import { regionesYComunas } from './regiones.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA-pmoPDbvcwZBAw7cV04CiS5HmHc2TAAs",
    authDomain: "tienda-level-up.firebaseapp.com",
    projectId: "tienda-level-up"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ==============================================================
// 1. INICIALIZACIÓN
// ==============================================================
document.addEventListener('DOMContentLoaded', function() {
    inicializarCheckout();
    configurarEventosCheckout();
    cargarRegiones(); 
    
    // 🔥 LÓGICA DE AUTOCOMPLETADO
    autoFillUserData();
});

// ==============================================================
// 2. FUNCIÓN DE AUTOCOMPLETADO INTELIGENTE
// ==============================================================
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

    // --- A. DATOS PERSONALES ---
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

    // --- B. DATOS DE DIRECCIÓN ---
    const dir = usuario;

    // 1. Calle y Número
    if (dir.calle) {
        const inputCalle = document.getElementById('calle');
        if (inputCalle) {
            const numeroStr = dir.numero ? ` #${dir.numero}` : '';
            inputCalle.value = dir.calle + numeroStr;
        }
    }

    if (dir.departamento) document.getElementById('departamento').value = dir.departamento;
    if (dir.indicaciones) document.getElementById('indicaciones').value = dir.indicaciones || "";

    // --- C. LÓGICA DE REGIÓN Y COMUNA ---
    const regionUsuario = (dir.region || dir.Region || "").trim();
    const comunaUsuario = (dir.comuna || dir.Comuna || "").trim();

    if (regionUsuario) {
        const regionSelect = document.getElementById('region');
        
        // Buscamos la región en nuestra lista IMPORTADA
        const regionEncontrada = regionesYComunas.regiones.find(r => {
            const nombreBD = regionUsuario.toLowerCase();
            const nombreLista = r.nombre.toLowerCase();
            return nombreBD === nombreLista || nombreLista.includes(nombreBD) || nombreBD.includes(nombreLista);
        });

        if (regionEncontrada && regionSelect) {
            // 1. Seleccionamos la región
            regionSelect.value = regionEncontrada.nombre;
            
            // 2. Cargamos las comunas para esa región
            cargarComunas(regionEncontrada.nombre);

            // 3. Seleccionamos la comuna
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

// ==============================================================
// 3. FUNCIONES DE CARGA (Usando la variable importada)
// ==============================================================

function cargarRegiones() {
    const selectRegion = document.getElementById('region');
    if (!selectRegion) return;
    
    selectRegion.innerHTML = '<option value="">-- Seleccione Región --</option>';

    // Usamos la variable importada 'regionesYComunas'
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

// ==============================================================
// 4. FUNCIONES DEL CARRITO Y PAGO (Sin cambios)
// ==============================================================

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
    
    // Usamos window porque import crea su propio scope
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal();
    }
}

// Exponemos la función al objeto window para que el HTML pueda llamarla si es necesario
// aunque aquí usamos addEventListener así que no es estrictamente necesario, es buena práctica en módulos
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
        const compra = {
            fecha: new Date(),
            cliente: datosCliente,
            direccion: datosDireccion,
            productos: [...carrito],
            total: total,
            estado: 'pendiente',
            numeroOrden: generarNumeroOrden()
        };
        const docRef = await db.collection('compras').add(compra);
        
        if (Math.random() > 0.5) {
            await db.collection('compras').doc(docRef.id).update({ estado: 'completada' });
            localStorage.setItem('carrito', JSON.stringify([]));
            localStorage.setItem('cartTotal', 0);
            window.location.href = `compraexitosa.html?orden=${compra.numeroOrden}`;
        } else {
            await db.collection('compras').doc(docRef.id).update({ estado: 'error_pago' });
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
    return `ORDEN${new Date().getTime()}${Math.floor(Math.random() * 1000)}`;
}

function configurarEventosCheckout() {
    const btnPagar = document.getElementById('btnPagarAhora');
    // Usamos la función global o local
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