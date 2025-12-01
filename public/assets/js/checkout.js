/* ==========================================
 * ARCHIVO: js/checkout.js
 * (Versión Final: Con Autocompletado y Bloqueo)
 * ==========================================
*/

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

// Datos de regiones y comunas
const regionesComunas = {
    "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
    "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
    "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
    "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
    "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
    "Metropolitana": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
    "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
    "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
    "Ñuble": ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Treguaco", "San Carlos", "Coihueco", "Ñiquén", "San Fabián", "San Nicolás"],
    "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío", "Lebú", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa"],
    "Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
    "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
    "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
    "Aysén": ["Coihaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
    "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

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
// 2. FUNCIÓN DE AUTOCOMPLETADO (LA CLAVE)
// ==============================================================
function autoFillUserData() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return; 

    let usuario;
    try {
        usuario = JSON.parse(usuarioStr);
    } catch (e) {
        return;
    }

    // --- A. DATOS PERSONALES ---
    const camposPersonales = {
        'nombre': usuario.nombre || '',
        // Busca en 'apellidos' (plural) O 'apellido' (singular) por seguridad
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
    // Usamos el objeto usuario directamente
    const dir = usuario;

    // 1. Calle y Número
    if (dir.calle) {
        const inputCalle = document.getElementById('calle');
        if (inputCalle) {
            // Concatena número si existe
            inputCalle.value = dir.calle + (dir.numero ? ` #${dir.numero}` : '');
        }
    }

    // 2. Departamento e Indicaciones (Si existen)
    if (dir.departamento) {
        const inputDepto = document.getElementById('departamento');
        if (inputDepto) inputDepto.value = dir.departamento;
    }
    
    // Si en tu HTML o BD no tienes indicaciones, esto simplemente se ignora
    if (dir.indicaciones) {
        const inputIndic = document.getElementById('indicaciones');
        if (inputIndic) inputIndic.value = dir.indicaciones;
    }

    // 3. Región y Comuna (Con retardo de seguridad)
    if (dir.region) {
        const regionSelect = document.getElementById('region');
        if (regionSelect) {
            regionSelect.value = dir.region;
            
            // Dispara la carga de comunas
            cargarComunas(dir.region);

            // Selecciona comuna
            if (dir.comuna) {
                setTimeout(() => {
                    const comunaSelect = document.getElementById('comuna');
                    if (comunaSelect) {
                        comunaSelect.value = dir.comuna;
                        comunaSelect.disabled = false;
                    }
                }, 500); // 500ms para asegurar que la lista cargó
            }
        }
    }
}

// ==============================================================
// 3. FUNCIONES EXISTENTES (SIN CAMBIOS)
// ==============================================================

function cargarRegiones() {
    const selectRegion = document.getElementById('region');
    if (!selectRegion) return;
    const regionesOrdenadas = Object.keys(regionesComunas).sort();
    regionesOrdenadas.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        selectRegion.appendChild(option);
    });
}

function cargarComunas(region) {
    const selectComuna = document.getElementById('comuna');
    if (!selectComuna) return;
    const comunas = regionesComunas[region] || [];
    selectComuna.innerHTML = '<option value="">Selecciona una comuna</option>';
    comunas.sort().forEach(comuna => {
        const option = document.createElement('option');
        option.value = comuna;
        option.textContent = comuna;
        selectComuna.appendChild(option);
    });
    selectComuna.disabled = false;
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
    actualizarCarritoHeader();
}

function actualizarCarritoHeader() {
    if (typeof window.actualizarHeaderCartGlobal === 'function') {
        window.actualizarHeaderCartGlobal();
    }
}

async function procesarPago() {
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
        // Simulación de pago
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
}

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
    if (btnPagar) btnPagar.addEventListener('click', procesarPago);
    
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
    
    // Validación visual
    const inputs = document.querySelectorAll('#formCliente input[required], #formDireccion input[required], #formDireccion select[required]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (!this.checkValidity()) this.style.borderColor = '#dc3545';
            else this.style.borderColor = '#28a745';
        });
    });
}