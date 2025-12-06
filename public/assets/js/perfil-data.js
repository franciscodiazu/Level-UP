// Archivo: public/assets/js/perfil-data.js
// Versión con funcionalidad de edición limitada

const db = firebase.firestore();

// Función para obtener órdenes (mantén tu código existente aquí)
async function getOrdersByUserId(userId) {
    // ... tu código existente ...
}

// Lógica para mostrar datos en EDITAR PERFIL (CON EDICIÓN)
function setupEditarPerfil() {
    const datosContainer = document.getElementById("datos-cliente");
    
    console.log("DEBUG-PERFIL: Iniciando setupEditarPerfil (con edición)");
    console.log("DEBUG-PERFIL: Contenedor encontrado:", !!datosContainer);

    const usuarioJson = localStorage.getItem("usuario");
    
    if (!datosContainer) {
        console.error("DEBUG-PERFIL: Error: Contenedor #datos-cliente no encontrado");
        return;
    }

    if (!usuarioJson) {
        console.log("DEBUG-PERFIL: Usuario NO encontrado en localStorage");
        datosContainer.innerHTML = `
            <div class="error-message">
                <p>⚠️ No se encontró información del usuario.</p>
                <p>Por favor, <a href="login.html">inicia sesión</a> nuevamente.</p>
            </div>
        `;
        return;
    }

    try {
        console.log("DEBUG-PERFIL: Parseando usuario JSON...");
        const usuario = JSON.parse(usuarioJson);
        const userId = usuario.idUsuario || usuario.uid;
        
        console.log("DEBUG-PERFIL: Usuario parseado:", usuario.nombre, "ID:", userId);
        
        const fullName = `${usuario.nombre || ''} ${usuario.apellidos || usuario.apellido || ''}`.trim();

        // 5. Generar el HTML con campos editables solo para número, dpto e indicaciones
        datosContainer.innerHTML = `
            <div class="profile-card">
                <div class="profile-header">
                    <h2><i class="fas fa-user-circle"></i> Información Personal</h2>
                    <p class="profile-subtitle">Datos básicos de tu cuenta</p>
                </div>
                
                <form id="form-perfil" class="form-perfil">
                    <div class="form-section">
                        <h3 class="form-section-title">
                            <i class="fas fa-id-card"></i> Datos Personales
                        </h3>
                        <p class="form-section-description">
                            Información de identificación (no editable por seguridad)
                        </p>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nombre">
                                    <i class="fas fa-user"></i> Nombre Completo:
                                </label>
                                <input type="text" id="nombre" value="${fullName || 'No especificado'}" readonly 
                                       class="readonly-field" title="Este campo no es editable">
                            </div>
                            
                            <div class="form-group">
                                <label for="correo">
                                    <i class="fas fa-envelope"></i> Correo Electrónico:
                                </label>
                                <input type="email" id="correo" value="${usuario.correo || 'No especificado'}" readonly 
                                       class="readonly-field" title="Este campo no es editable">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="user-id">
                                <i class="fas fa-fingerprint"></i> ID de Usuario:
                            </label>
                            <input type="text" id="user-id" value="${userId || 'No disponible'}" readonly 
                                   class="readonly-field" title="Este campo no es editable">
                            <small class="form-text">Identificador único en el sistema</small>
                        </div>
                    </div>

                    <div class="form-section" style="margin-top: 40px;">
                        <h3 class="form-section-title">
                            <i class="fas fa-map-marker-alt"></i> Dirección de Envío
                        </h3>
                        <p class="form-section-description">
                            Información de entrega (puedes editar algunos campos)
                        </p>
                        
                        <div class="address-grid">
                            <!-- Campos NO editables -->
                            <div class="form-group">
                                <label for="calle">
                                    <i class="fas fa-road"></i> Calle/Avenida:
                                    <span class="field-status">(no editable)</span>
                                </label>
                                <input type="text" id="calle" value="${usuario.calle || 'No especificada'}" readonly 
                                       class="readonly-field">
                            </div>
                            
                            <div class="form-group">
                                <label for="region">
                                    <i class="fas fa-map"></i> Región:
                                    <span class="field-status">(no editable)</span>
                                </label>
                                <input type="text" id="region" value="${usuario.region || 'No especificada'}" readonly 
                                       class="readonly-field">
                            </div>
                            
                            <div class="form-group">
                                <label for="comuna">
                                    <i class="fas fa-city"></i> Comuna:
                                    <span class="field-status">(no editable)</span>
                                </label>
                                <input type="text" id="comuna" value="${usuario.comuna || 'No especificada'}" readonly 
                                       class="readonly-field">
                            </div>
                            
                            <!-- Campos EDITABLES -->
                            <div class="form-group editable-field">
                                <label for="numero">
                                    <i class="fas fa-hashtag"></i> Número:
                                    <span class="field-status editable">(editable)</span>
                                </label>
                                <input type="text" id="numero" value="${usuario.numero || ''}" 
                                       class="editable-input" 
                                       placeholder="Ej: 1234"
                                       maxlength="10">
                                <small class="form-help">Número de casa o edificio</small>
                            </div>
                            
                            <div class="form-group editable-field">
                                <label for="departamento">
                                    <i class="fas fa-building"></i> Depto/Casa:
                                    <span class="field-status editable">(editable)</span>
                                </label>
                                <input type="text" id="departamento" value="${usuario.departamento || ''}" 
                                       class="editable-input" 
                                       placeholder="Ej: Depto 5B, Casa 2"
                                       maxlength="50">
                                <small class="form-help">Opcional - para edificios o condominios</small>
                            </div>
                        </div>
                        
                        <div class="form-group editable-field" style="margin-top: 20px;">
                            <label for="indicaciones">
                                <i class="fas fa-info-circle"></i> Indicaciones Adicionales:
                                <span class="field-status editable">(editable)</span>
                            </label>
                            <textarea id="indicaciones" rows="4" 
                                      class="editable-textarea"
                                      placeholder="Ej: Timbre blanco, portón azul, dejar con vecino..."
                                      maxlength="500">${usuario.indicaciones || ''}</textarea>
                            <small class="form-help">Instrucciones especiales para la entrega (máx. 500 caracteres)</small>
                            <div class="char-counter">
                                <span id="char-count">0</span>/500 caracteres
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions" style="margin-top: 40px;">
                        <div class="action-buttons">
                            <button type="button" id="btn-editar" class="btn-edit">
                                <i class="fas fa-edit"></i> Habilitar Edición
                            </button>
                            <button type="button" id="btn-guardar" class="btn-save" disabled>
                                <i class="fas fa-save"></i> Guardar Cambios
                            </button>
                            <button type="button" id="btn-cancelar" class="btn-cancel" disabled>
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        </div>
                        
                        <div class="form-notice">
                            <p class="notice-info">
                                <i class="fas fa-info-circle"></i> 
                                <strong>Nota:</strong> Solo puedes modificar el número, departamento/casa e indicaciones adicionales. 
                                Para cambiar otros datos, contacta a soporte.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        console.log("DEBUG-PERFIL: HTML de perfil inyectado con éxito.");
        
        // Inicializar funcionalidad de edición
        inicializarFuncionalidadEdicion(usuario, userId);
        
    } catch (error) {
        console.error("DEBUG-PERFIL: ERROR al procesar datos del usuario:", error);
        datosContainer.innerHTML = `
            <div class="error-message">
                <p>❌ Ocurrió un error al cargar tus datos de perfil.</p>
                <p>Detalles: ${error.message}</p>
                <button onclick="location.reload()" class="btn-refresh">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Función para inicializar la funcionalidad de edición
function inicializarFuncionalidadEdicion(usuario, userId) {
    console.log("DEBUG-PERFIL: Inicializando funcionalidad de edición...");
    
    const btnEditar = document.getElementById('btn-editar');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const indicacionesTextarea = document.getElementById('indicaciones');
    const charCount = document.getElementById('char-count');
    
    // Estado original para restaurar si se cancela
    let estadoOriginal = {
        numero: usuario.numero || '',
        departamento: usuario.departamento || '',
        indicaciones: usuario.indicaciones || ''
    };
    
    // Contador de caracteres para indicaciones
    function actualizarContadorCaracteres() {
        const longitud = indicacionesTextarea.value.length;
        charCount.textContent = longitud;
        
        // Cambiar color según longitud
        if (longitud > 450) {
            charCount.style.color = '#ff4444';
        } else if (longitud > 400) {
            charCount.style.color = '#ff9900';
        } else {
            charCount.style.color = '#4CAF50';
        }
    }
    
    // Inicializar contador
    actualizarContadorCaracteres();
    indicacionesTextarea.addEventListener('input', actualizarContadorCaracteres);
    
    // Habilitar/deshabilitar campos editables
    function habilitarEdicion(habilitar) {
        const camposEditables = document.querySelectorAll('.editable-input, .editable-textarea');
        camposEditables.forEach(campo => {
            campo.disabled = !habilitar;
            if (habilitar) {
                campo.classList.add('editing');
                campo.focus();
            } else {
                campo.classList.remove('editing');
            }
        });
        
        // Actualizar estado de botones
        btnEditar.disabled = habilitar;
        btnGuardar.disabled = !habilitar;
        btnCancelar.disabled = !habilitar;
        
        if (habilitar) {
            btnEditar.innerHTML = '<i class="fas fa-pencil-alt"></i> Editando...';
            btnEditar.classList.add('editing');
        } else {
            btnEditar.innerHTML = '<i class="fas fa-edit"></i> Habilitar Edición';
            btnEditar.classList.remove('editing');
        }
    }
    
    // Restaurar valores originales
    function restaurarValoresOriginales() {
        document.getElementById('numero').value = estadoOriginal.numero;
        document.getElementById('departamento').value = estadoOriginal.departamento;
        document.getElementById('indicaciones').value = estadoOriginal.indicaciones;
        actualizarContadorCaracteres();
    }
    
    // Verificar si hay cambios
    function hayCambios() {
        return (
            document.getElementById('numero').value !== estadoOriginal.numero ||
            document.getElementById('departamento').value !== estadoOriginal.departamento ||
            document.getElementById('indicaciones').value !== estadoOriginal.indicaciones
        );
    }
    
    // Evento: Habilitar edición
    btnEditar.addEventListener('click', () => {
        console.log("DEBUG-PERFIL: Habilitando edición...");
        habilitarEdicion(true);
    });
    
    // Evento: Cancelar edición
    btnCancelar.addEventListener('click', () => {
        if (hayCambios()) {
            const confirmar = confirm("¿Descartar los cambios realizados?");
            if (!confirmar) return;
        }
        
        console.log("DEBUG-PERFIL: Cancelando edición...");
        restaurarValoresOriginales();
        habilitarEdicion(false);
    });
    
    // Evento: Guardar cambios
    btnGuardar.addEventListener('click', async () => {
        console.log("DEBUG-PERFIL: Guardando cambios...");
        
        // Validaciones básicas
        const numero = document.getElementById('numero').value.trim();
        const departamento = document.getElementById('departamento').value.trim();
        const indicaciones = document.getElementById('indicaciones').value.trim();
        
        // Validar número (si se ingresa)
        if (numero && !/^[0-9A-Za-z\s\-]*$/.test(numero)) {
            alert("El número solo puede contener números, letras, espacios y guiones.");
            document.getElementById('numero').focus();
            return;
        }
        
        // Validar departamento (si se ingresa)
        if (departamento && departamento.length > 50) {
            alert("El departamento/casa no puede exceder los 50 caracteres.");
            document.getElementById('departamento').focus();
            return;
        }
        
        // Mostrar estado de carga
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btnGuardar.disabled = true;
        
        try {
            // Actualizar en Firebase Firestore
            const db = firebase.firestore();
            await db.collection('usuario').doc(userId).update({
                numero: numero,
                departamento: departamento,
                indicaciones: indicaciones,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log("DEBUG-PERFIL: Datos actualizados en Firestore");
            
            // Actualizar localStorage
            const usuarioActualizado = {
                ...usuario,
                numero: numero,
                departamento: departamento,
                indicaciones: indicaciones
            };
            
            localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            
            // Actualizar estado original
            estadoOriginal = {
                numero: numero,
                departamento: departamento,
                indicaciones: indicaciones
            };
            
            // Mostrar mensaje de éxito
            mostrarMensajeExito("✓ Cambios guardados exitosamente");
            
            // Deshabilitar edición
            habilitarEdicion(false);
            
            // Actualizar botón
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            btnGuardar.disabled = false;
            
            console.log("DEBUG-PERFIL: Cambios guardados exitosamente");
            
        } catch (error) {
            console.error("DEBUG-PERFIL: ERROR al guardar cambios:", error);
            
            // Restaurar botón
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            btnGuardar.disabled = false;
            
            // Mostrar error
            mostrarMensajeError("✗ Error al guardar: " + error.message);
        }
    });
    
    // Mostrar mensaje de éxito
    function mostrarMensajeExito(mensaje) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'alert-success';
        mensajeDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${mensaje}
        `;
        
        const formActions = document.querySelector('.form-actions');
        formActions.insertBefore(mensajeDiv, formActions.firstChild);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            mensajeDiv.remove();
        }, 5000);
    }
    
    // Mostrar mensaje de error
    function mostrarMensajeError(mensaje) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'alert-error';
        mensajeDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${mensaje}
        `;
        
        const formActions = document.querySelector('.form-actions');
        formActions.insertBefore(mensajeDiv, formActions.firstChild);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            mensajeDiv.remove();
        }, 5000);
    }
    
    // Validar cambios en tiempo real
    document.querySelectorAll('.editable-input, .editable-textarea').forEach(campo => {
        campo.addEventListener('input', () => {
            if (hayCambios()) {
                btnGuardar.classList.add('has-changes');
            } else {
                btnGuardar.classList.remove('has-changes');
            }
        });
    });
    
    console.log("DEBUG-PERFIL: Funcionalidad de edición inicializada correctamente");
}

// Lógica para HISTORIAL DE COMPRAS (mantén tu código existente aquí)
async function setupHistorialCompras() {
    // ... tu código existente ...
}

// Inicialización y demás funciones (mantén tu código existente aquí)
// ...

// AGREGAR ESTOS ESTILOS A TU ARCHIVO style.css:
/*
/* Estilos para el formulario de edición de perfil */
/*
.form-section {
    margin-bottom: 30px;
    padding: 25px;
    background: rgba(40, 40, 40, 0.6);
    border-radius: 12px;
    border: 1px solid #333;
}

.form-section-title {
    color: var(--color-primary);
    margin-bottom: 10px;
    font-size: 1.4em;
    display: flex;
    align-items: center;
    gap: 10px;
}

.form-section-description {
    color: #aaa;
    margin-bottom: 20px;
    font-size: 0.95em;
}

.address-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.readonly-field {
    background: #2a2a2a !important;
    border-color: #444 !important;
    color: #888 !important;
    cursor: not-allowed !important;
}

.editable-field {
    position: relative;
}

.editable-input, .editable-textarea {
    background: #2a2a2a !important;
    border: 2px solid #444 !important;
    color: #fff !important;
    transition: all 0.3s ease !important;
}

.editable-input:focus, .editable-textarea:focus {
    border-color: var(--color-accent-blue) !important;
    box-shadow: 0 0 0 3px rgba(0, 150, 255, 0.1) !important;
    outline: none !important;
}

.editable-input.editing, .editable-textarea.editing {
    border-color: #4CAF50 !important;
    background: rgba(76, 175, 80, 0.05) !important;
}

.field-status {
    font-size: 0.8em;
    font-weight: normal;
    margin-left: 5px;
}

.field-status.editable {
    color: #4CAF50;
}

.form-help {
    display: block;
    margin-top: 5px;
    color: #777;
    font-size: 0.85em;
}

.char-counter {
    text-align: right;
    margin-top: 5px;
    font-size: 0.85em;
    color: #777;
}

.action-buttons {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.btn-edit, .btn-save, .btn-cancel {
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1em;
}

.btn-edit {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    color: white;
}

.btn-edit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
}

.btn-edit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-edit.editing {
    background: linear-gradient(135deg, #FF9800, #F57C00);
}

.btn-save {
    background: linear-gradient(135deg, #4CAF50, #388E3C);
    color: white;
}

.btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-save.has-changes {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    animation: pulse-green 2s infinite;
}

.btn-cancel {
    background: linear-gradient(135deg, #f44336, #d32f2f);
    color: white;
}

.btn-cancel:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
}

.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.form-notice {
    padding: 15px;
    background: rgba(0, 150, 255, 0.05);
    border-radius: 8px;
    border-left: 4px solid var(--color-accent-blue);
}

.notice-info {
    color: #aaa;
    margin: 0;
    font-size: 0.95em;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.notice-info i {
    color: var(--color-accent-blue);
    margin-top: 3px;
}

.alert-success, .alert-error {
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideDown 0.3s ease;
}

.alert-success {
    background: rgba(76, 175, 80, 0.1);
    border-left: 4px solid #4CAF50;
    color: #4CAF50;
}

.alert-error {
    background: rgba(244, 67, 54, 0.1);
    border-left: 4px solid #f44336;
    color: #f44336;
}

@keyframes pulse-green {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .address-grid {
        grid-template-columns: 1fr;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .btn-edit, .btn-save, .btn-cancel {
        width: 100%;
        justify-content: center;
    }
}
*/