/**
 * ===== GESTOR HR v3.0 - APLICACIÓN PRINCIPAL =====
 * Sistema Hotelero Profesional
 * Versión completamente refactorizada con manejo correcto de estados
 */

const AppState = {
    habitaciones: [],
    habitacionSeleccionada: null,
    tarifaSeleccionada: null,
    clienteActual: null,
    modalActivo: null,
    usuario: null,
    currentSection: 'recepcion'
};

const App = {
    /**
     * Inicialización principal de la aplicación
     */
    async init() {
        console.log('🚀 Inicializando Gestor HR v3.0 Profesional...');

        try {
            // Configurar autenticación
            this.setupAuth();

            // Verificar si ya está autenticado
            const isAuthenticated = Auth.checkAuthOnLoad();

            if (isAuthenticated) {
                await this.loadApplication();
            }

        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            UI.mostrarMensaje('Error inicializando sistema', 'error');
        }
    },

    /**
     * Configurar eventos de autenticación
     */
    setupAuth() {
        // Configurar eventos de login
        this.setupLoginForm();

        window.addEventListener('auth:login-success', async (event) => {
            console.log('✅ Login exitoso, cargando aplicación...');
            AppState.usuario = event.detail.user;
            await this.loadApplication();
        });

        window.addEventListener('auth:logout', () => {
            console.log('👋 Cerrando sesión...');
            this.clearApplication();
        });
    },

    /**
     * Configurar formulario de login
     */
    setupLoginForm() {
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) {
            console.log('✅ Configurando formulario de login...');
            btnLogin.addEventListener('click', async () => {
                console.log('🔐 Click en botón login detectado');

                const email = document.getElementById('login-email')?.value;
                const password = document.getElementById('login-password')?.value;

                console.log('📧 Email:', email, '🔒 Password:', password ? '***' : 'vacío');

                if (!email || !password) {
                    console.log('❌ Faltan credenciales');
                    alert('Por favor ingresa email y contraseña');
                    return;
                }

                try {
                    console.log('🔄 Intentando login...');
                    const result = await Auth.login(email, password);
                    console.log('✅ Login exitoso:', result);

                    // Guardar token
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('userData', JSON.stringify(result.user));

                    // Disparar evento de login exitoso
                    window.dispatchEvent(new CustomEvent('auth:login-success', {
                        detail: { user: result.user }
                    }));

                } catch (error) {
                    console.error('❌ Error de login:', error);
                    alert('Error de autenticación: ' + error.message);
                }
            });
        } else {
            console.error('❌ Botón de login no encontrado');
        }
    },

    /**
     * Cargar aplicación completa después de autenticación
     */
    async loadApplication() {
        try {
            console.log('📱 Cargando aplicación principal...');

            // Ocultar modal de login si existe
            const loginModal = document.getElementById('modal-login');
            if (loginModal) {
                Auth.hideLoginModal();
            }

            // Mostrar interfaz principal
            this.showMainInterface();

            // Configurar navegación
            this.setupNavigation();

            // Configurar eventos globales
            this.setupGlobalEvents();

            // Cargar datos iniciales
            await this.loadInitialData();

            // Mostrar sección inicial (recepción)
            this.showSection('recepcion');

            UI.mostrarMensaje('✅ Sistema cargado correctamente', 'exito');
            console.log('🎯 Aplicación completamente inicializada');

        } catch (error) {
            console.error('❌ Error cargando aplicación:', error);
            UI.mostrarMensaje('Error cargando aplicación: ' + error.message, 'error');
        }
    },

    /**
     * Mostrar interfaz principal
     */
    showMainInterface() {
        // Mostrar elementos principales
        document.querySelector('.header-principal').style.display = 'block';
        document.querySelector('.nav-principal').style.display = 'flex';

        // Actualizar información de usuario
        if (AppState.usuario) {
            const userElement = document.getElementById('usuario-actual');
            if (userElement) {
                userElement.textContent = AppState.usuario.nombre || AppState.usuario.email;
            }
        }
    },

    /**
     * Configurar navegación principal
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vista = e.target.dataset.vista;
                if (vista) {
                    const section = vista.replace('vista-', '');
                    this.showSection(section);
                }
            });
        });
    },

    /**
     * Mostrar sección específica
     */
    showSection(sectionName) {
        console.log(`🔄 Cambiando a sección: ${sectionName}`);

        // Ocultar todas las secciones
        document.querySelectorAll('.vista-contenido').forEach(vista => {
            vista.classList.add('oculto');
        });

        // Mostrar sección solicitada
        const targetSection = document.getElementById(`vista-${sectionName}`);
        if (targetSection) {
            targetSection.classList.remove('oculto');
        }

        // Actualizar navegación activa
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.nav-btn[data-vista="vista-${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Inicializar sección específica
        this.initSection(sectionName);

        AppState.currentSection = sectionName;
    },

    /**
     * Inicializar sección específica
     */
    async initSection(sectionName) {
        switch (sectionName) {
            case 'recepcion':
                await this.initRecepcionSection();
                break;
            case 'pedido':
                this.initPedidoSection();
                break;
            case 'reportes':
                this.initReportesSection();
                break;
            case 'configuracion':
                this.initConfiguracionSection();
                break;
        }
    },

    /**
     * Inicializar sección de recepción
     */
    async initRecepcionSection() {
        console.log('🏠 Inicializando sección de recepción...');

        try {
            // Cargar habitaciones si no están cargadas
            if (!AppState.habitaciones.length) {
                await this.loadInitialData();
            }

            // Renderizar mapa de habitaciones
            this.renderHabitacionesMap();

            // Actualizar estadísticas
            this.updateStats();

        } catch (error) {
            console.error('❌ Error inicializando recepción:', error);
            UI.mostrarMensaje('Error cargando habitaciones', 'error');
        }
    },

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Logout
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
            });
        }

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        });

        // Configurar modales
        this.setupModals();
    },

    /**
     * Configurar eventos de modales
     */
    setupModals() {
        // Modal de operaciones de habitación
        const modalOperacion = document.getElementById('modal-operacion-habitacion');
        const btnCerrarOp = document.getElementById('btn-cerrar-modal-op');
        const btnCancelarOp = document.getElementById('btn-cancelar-op');

        if (btnCerrarOp) {
            btnCerrarOp.addEventListener('click', () => this.closeOperacionModal());
        }
        if (btnCancelarOp) {
            btnCancelarOp.addEventListener('click', () => this.closeOperacionModal());
        }

        // Modal de pago
        const modalPago = document.getElementById('modal-pago');
        const btnCerrarPago = document.getElementById('btn-cerrar-modal-pago');
        const btnCancelarPago = document.getElementById('btn-cancelar-pago');

        if (btnCerrarPago) {
            btnCerrarPago.addEventListener('click', () => this.closePagoModal());
        }
        if (btnCancelarPago) {
            btnCancelarPago.addEventListener('click', () => this.closePagoModal());
        }

        // Cerrar modal haciendo clic en el overlay
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeActiveModal();
            }
        });
    },

    /**
     * Cargar datos iniciales
     */
    async loadInitialData() {
        const loading = UI.mostrarCarga('Cargando habitaciones...');

        try {
            // Cargar habitaciones
            AppState.habitaciones = await API.habitaciones.getAll();
            console.log(`📊 Cargadas ${AppState.habitaciones.length} habitaciones`);

        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            throw error;
        } finally {
            loading();
        }
    },

    /**
     * Renderizar mapa de habitaciones
     */
    renderHabitacionesMap() {
        const container = document.getElementById('mapa-habitaciones-grid');
        if (!container) {
            console.error('❌ Contenedor de habitaciones no encontrado');
            return;
        }

        console.log('🏠 Renderizando mapa de habitaciones...');
        container.innerHTML = '';

        if (!AppState.habitaciones.length) {
            container.innerHTML = '<div class="no-data">No hay habitaciones disponibles</div>';
            return;
        }

        // Agrupar por piso
        const habitacionesPorPiso = this.groupHabitacionesByFloor(AppState.habitaciones);

        // Renderizar cada piso
        Object.keys(habitacionesPorPiso)
            .sort((a, b) => a.localeCompare(b))
            .forEach(piso => {
                const pisoElement = this.createFloorElement(piso, habitacionesPorPiso[piso]);
                container.appendChild(pisoElement);
            });
    },

    /**
     * Agrupar habitaciones por piso
     */
    groupHabitacionesByFloor(habitaciones) {
        const grupos = {};

        habitaciones.forEach(habitacion => {
            const piso = habitacion.numero.charAt(0);
            if (!grupos[piso]) {
                grupos[piso] = [];
            }
            grupos[piso].push(habitacion);
        });

        return grupos;
    },

    /**
     * Crear elemento de piso
     */
    createFloorElement(piso, habitaciones) {
        const pisoDiv = document.createElement('div');
        pisoDiv.className = 'piso-container';

        const titulo = document.createElement('h3');
        titulo.textContent = `Piso ${piso}`;
        titulo.className = 'piso-titulo';

        const habitacionesGrid = document.createElement('div');
        habitacionesGrid.className = 'habitaciones-grid';

        // Ordenar habitaciones por número
        habitaciones.sort((a, b) => a.numero.localeCompare(b.numero))
            .forEach(habitacion => {
                const habitacionElement = this.createHabitacionCard(habitacion);
                habitacionesGrid.appendChild(habitacionElement);
            });

        pisoDiv.appendChild(titulo);
        pisoDiv.appendChild(habitacionesGrid);

        return pisoDiv;
    },

    /**
     * Crear tarjeta de habitación
     */
    createHabitacionCard(habitacion) {
        const card = document.createElement('div');
        card.className = `habitacion-card estado-${habitacion.estado}`;
        card.dataset.habitacionId = habitacion.id;
        card.dataset.numero = habitacion.numero;

        // Solo las habitaciones disponibles y ocupadas son clickeables
        const isClickeable = ['disponible', 'ocupada'].includes(habitacion.estado);

        card.innerHTML = `
            <div class="habitacion-numero">${habitacion.numero}</div>
            <div class="habitacion-tipo">${this.capitalize(habitacion.tipo)}</div>
            <div class="habitacion-estado estado-${habitacion.estado}">${this.capitalize(habitacion.estado)}</div>
            <div class="habitacion-precio">${UI.formatearMoneda(habitacion.precio_noche)}/noche</div>
            ${isClickeable ? '<div class="habitacion-action">👆 Click para gestionar</div>' : ''}
        `;

        // Agregar evento click solo para habitaciones gestionables
        if (isClickeable) {
            card.addEventListener('click', () => {
                this.handleHabitacionClick(habitacion);
            });
            card.style.cursor = 'pointer';
        } else {
            // Para habitaciones en limpieza/mantenimiento, agregar botón específico
            const actionBtn = document.createElement('button');
            actionBtn.className = 'btn btn-small btn-secondary habitacion-btn-action';

            if (habitacion.estado === 'limpieza') {
                actionBtn.textContent = '✅ Marcar como Limpia';
                actionBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.markAsAvailable(habitacion);
                };
            } else if (habitacion.estado === 'mantenimiento') {
                actionBtn.textContent = '🔧 Finalizar Mantenimiento';
                actionBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.markAsAvailable(habitacion);
                };
            }

            card.appendChild(actionBtn);
        }

        return card;
    },

    /**
     * Manejar click en habitación
     */
    handleHabitacionClick(habitacion) {
        console.log(`🏠 Click en habitación ${habitacion.numero} (${habitacion.estado})`);

        AppState.habitacionSeleccionada = habitacion;

        if (habitacion.estado === 'disponible') {
            this.openCheckinModal(habitacion);
        } else if (habitacion.estado === 'ocupada') {
            this.openCheckoutModal(habitacion);
        }
    },

    /**
     * Abrir modal de check-in
     */
    openCheckinModal(habitacion) {
        console.log(`🛎️ Abriendo modal de check-in para habitación ${habitacion.numero}`);

        const modal = document.getElementById('modal-operacion-habitacion');
        const titulo = document.getElementById('op-numero-habitacion');
        const tarifasContainer = document.getElementById('op-tarifas-container');

        // Actualizar título
        titulo.textContent = habitacion.numero;

        // Generar tarifas disponibles
        this.generateTarifas(habitacion, tarifasContainer);

        // Configurar botones del modal
        this.setupCheckinModalButtons(habitacion);

        // Mostrar secciones apropiadas
        document.getElementById('op-seccion-tarifas').style.display = 'block';
        document.getElementById('op-seccion-cliente').style.display = 'block';
        document.getElementById('op-seccion-estancia').style.display = 'none';

        // Mostrar modal
        modal.classList.remove('oculto');
        AppState.modalActivo = 'operacion';
    },

    /**
     * Generar tarifas para habitación
     */
    generateTarifas(habitacion, container) {
        const tarifas = [
            {
                id: 'estandar',
                nombre: 'Tarifa Estándar',
                precio: habitacion.precio_noche,
                descripcion: 'Tarifa base de la habitación'
            },
            {
                id: 'promocional',
                nombre: 'Tarifa Promocional',
                precio: habitacion.precio_noche * 0.8,
                descripcion: 'Descuento del 20%'
            },
            {
                id: 'premium',
                nombre: 'Tarifa Premium',
                precio: habitacion.precio_noche * 1.2,
                descripcion: 'Incluye servicios adicionales'
            }
        ];

        container.innerHTML = tarifas.map(tarifa => `
            <div class="tarifa-card" data-tarifa-id="${tarifa.id}">
                <div class="tarifa-header">
                    <h4>${tarifa.nombre}</h4>
                    <div class="tarifa-precio">${UI.formatearMoneda(tarifa.precio)}/noche</div>
                </div>
                <p class="tarifa-descripcion">${tarifa.descripcion}</p>
                <button class="btn btn-primary btn-seleccionar-tarifa" onclick="App.selectTarifa('${tarifa.id}', ${tarifa.precio}, '${tarifa.nombre}')">
                    Seleccionar
                </button>
            </div>
        `).join('');
    },

    /**
     * Seleccionar tarifa
     */
    selectTarifa(tarifaId, precio, nombre) {
        console.log(`💰 Tarifa seleccionada: ${nombre} - ${precio}€`);

        // Marcar tarifa como seleccionada visualmente
        document.querySelectorAll('.tarifa-card').forEach(card => {
            card.classList.remove('selected');
        });

        document.querySelector(`[data-tarifa-id="${tarifaId}"]`).classList.add('selected');

        // Guardar selección
        AppState.tarifaSeleccionada = {
            id: tarifaId,
            nombre,
            precio
        };

        // Habilitar botón de continuar - VERIFICACIÓN REFORZADA
        const btnContinuar = document.getElementById('btn-op-checkin');
        console.log('🎯 Intentando mostrar botón check-in:', btnContinuar);

        if (btnContinuar) {
            // Asegurar que se muestre
            btnContinuar.disabled = false;
            btnContinuar.classList.remove('oculto');
            btnContinuar.style.display = 'inline-block'; // Forzar visualización
            console.log('✅ Botón check-in habilitado y mostrado');

            // Debug adicional
            console.log('📊 Estado del botón:', {
                disabled: btnContinuar.disabled,
                hasOcultoClass: btnContinuar.classList.contains('oculto'),
                display: btnContinuar.style.display,
                visible: btnContinuar.offsetParent !== null
            });
        } else {
            console.error('❌ Botón btn-op-checkin no encontrado');
            // Buscar el botón en todo el DOM
            const allButtons = document.querySelectorAll('button');
            console.log('🔍 Todos los botones en la página:', Array.from(allButtons).map(b => b.id || b.textContent));
        }

        UI.mostrarMensaje(`Tarifa "${nombre}" seleccionada`, 'exito');
    },

    /**
     * Configurar botones del modal de check-in
     */
    setupCheckinModalButtons(habitacion) {
        // Ocultar todos los botones de acción específicos
        const actionButtons = [
            'btn-op-checkin', 'btn-op-checkout',
            'btn-op-limpieza', 'btn-op-disponible'
        ];

        actionButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.add('oculto');
                btn.disabled = true;
            }
        });

        // Configurar botón de check-in
        const btnCheckin = document.getElementById('btn-op-checkin');
        if (btnCheckin) {
            btnCheckin.textContent = '💳 Continuar al Pago';
            // Remover listeners anteriores
            btnCheckin.replaceWith(btnCheckin.cloneNode(true));
            const newBtnCheckin = document.getElementById('btn-op-checkin');

            newBtnCheckin.addEventListener('click', () => {
                this.processProceedToPago();
            });
        }
    },

    /**
     * Proceder al pago del check-in
     */
    processProceedToPago() {
        if (!AppState.tarifaSeleccionada) {
            UI.mostrarMensaje('Por favor selecciona una tarifa', 'warning');
            return;
        }

        // Recopilar datos del cliente
        const clienteData = this.getClienteFormData();

        // Mostrar resumen antes del pago
        this.showEstanciaResumen(clienteData);

        // Cambiar a vista de pago
        setTimeout(() => {
            this.openPagoModal();
        }, 1000);
    },

    /**
     * Recopilar datos del formulario de cliente
     */
    getClienteFormData() {
        return {
            nombre: document.getElementById('cliente-nombre')?.value || 'Cliente',
            email: document.getElementById('cliente-email')?.value || '',
            telefono: document.getElementById('cliente-telefono')?.value || ''
        };
    },

    /**
     * Mostrar resumen de estancia
     */
    showEstanciaResumen(clienteData) {
        const seccionEstancia = document.getElementById('op-seccion-estancia');

        if (seccionEstancia) {
            document.getElementById('estancia-cliente').textContent = clienteData.nombre;
            document.getElementById('estancia-checkin').textContent = new Date().toLocaleDateString('es-ES');
            document.getElementById('estancia-noches').textContent = '1 noche';
            document.getElementById('estancia-total').textContent = UI.formatearMoneda(AppState.tarifaSeleccionada.precio);

            seccionEstancia.style.display = 'block';
        }

        AppState.clienteActual = clienteData;
    },

    /**
     * Abrir modal de pago
     */
    openPagoModal() {
        console.log('💳 Mostrando modal de pago...');
        const modalPago = document.getElementById('modal-pago');
        if (!modalPago) {
            console.error('❌ Modal de pago no encontrado');
            return;
        }

        // Configurar el resumen del pago
        const total = AppState.tarifaSeleccionada.precio;
        document.getElementById('pago-total-amount').textContent = `€${total.toFixed(2)}`;

        // Rellenar automáticamente el campo de dinero recibido con el total
        const dineroRecibidoInput = document.getElementById('dinero-recibido');
        if (dineroRecibidoInput) {
            dineroRecibidoInput.value = total.toFixed(2);
        }

        const lineasContainer = document.getElementById('pago-lineas');

        // Limpiar líneas anteriores
        lineasContainer.innerHTML = '';

        // Agregar línea de habitación
        const lineaHabitacion = document.createElement('div');
        lineaHabitacion.className = 'pago-linea';
        lineaHabitacion.innerHTML = `
            <span>Habitación ${AppState.habitacionSeleccionada.numero}</span>
            <span>${UI.formatearMoneda(AppState.tarifaSeleccionada.precio)}</span>
        `;
        lineasContainer.appendChild(lineaHabitacion);

        // Agregar línea de tarifa
        const lineaTarifa = document.createElement('div');
        lineaTarifa.className = 'pago-linea';
        lineaTarifa.innerHTML = `
            <span>Tarifa: ${AppState.tarifaSeleccionada.nombre}</span>
            <span>1 noche</span>
        `;
        lineasContainer.appendChild(lineaTarifa);

        // Mostrar modal
        modalPago.classList.remove('oculto');
        AppState.modalActivo = 'modal-pago';

        // Simular cambio a efectivo para que se muestre el campo y se calcule el cambio
        this.handleMetodoPagoChange('efectivo');

        // Volver a calcular el cambio por si acaso
        this.calculateCambio();
    },

    /**
     * Configurar eventos del modal de pago
     */
    setupPagoModalEvents() {
        // Botón confirmar pago
        const btnConfirmarPago = document.getElementById('btn-confirmar-pago');
        if (btnConfirmarPago) {
            btnConfirmarPago.replaceWith(btnConfirmarPago.cloneNode(true));
            const newBtn = document.getElementById('btn-confirmar-pago');

            newBtn.addEventListener('click', () => {
                this.processPago();
            });
        }

        // Método de pago
        document.querySelectorAll('input[name="metodo"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleMetodoPagoChange(e.target.value);
            });
        });

        // Campo de dinero recibido
        const dineroRecibido = document.getElementById('dinero-recibido');
        if (dineroRecibido) {
            dineroRecibido.addEventListener('input', () => {
                this.calculateCambio();
            });
        }
    },

    /**
     * Manejar cambio de método de pago
     */
    handleMetodoPagoChange(metodo) {
        const grupoEfectivo = document.getElementById('grupo-efectivo');

        if (metodo === 'efectivo') {
            grupoEfectivo.style.display = 'block';
            document.getElementById('dinero-recibido').value = AppState.tarifaSeleccionada.precio;
            this.calculateCambio();
        } else {
            grupoEfectivo.style.display = 'none';
        }
    },

    /**
     * Calcular cambio
     */
    calculateCambio() {
        const dineroRecibido = parseFloat(document.getElementById('dinero-recibido').value) || 0;
        const total = AppState.tarifaSeleccionada.precio;
        const cambio = dineroRecibido - total;

        const cambioInfo = document.getElementById('cambio-info');
        if (cambioInfo) {
            if (cambio >= 0) {
                cambioInfo.textContent = `Cambio: ${UI.formatearMoneda(cambio)}`;
                cambioInfo.className = 'cambio-info positivo';
            } else {
                cambioInfo.textContent = `Falta: ${UI.formatearMoneda(Math.abs(cambio))}`;
                cambioInfo.className = 'cambio-info negativo';
            }
        }
    },

    /**
     * Procesar pago
     */
    async processPago() {
        const metodo = document.querySelector('input[name="metodo"]:checked')?.value;
        const dineroRecibido = parseFloat(document.getElementById('dinero-recibido').value) || 0;

        if (!metodo) {
            UI.mostrarMensaje('Selecciona un método de pago', 'warning');
            return;
        }

        if (metodo === 'efectivo' && dineroRecibido < AppState.tarifaSeleccionada.precio) {
            UI.mostrarMensaje('Dinero insuficiente', 'warning');
            return;
        }

        const loading = UI.mostrarCarga('Procesando pago...');

        try {
            // Datos del hospedaje
            const hospedajeData = {
                habitacion_id: AppState.habitacionSeleccionada.id,
                huesped_nombre: AppState.clienteActual.nombre,
                huesped_email: AppState.clienteActual.email,
                huesped_telefono: AppState.clienteActual.telefono,
                fecha_checkout_previsto: this.getCheckoutDate(),
                precio_noche: AppState.tarifaSeleccionada.precio,
                metodo_pago: metodo,
                cantidad_pagada: metodo === 'efectivo' ? dineroRecibido : AppState.tarifaSeleccionada.precio
            };

            // Crear hospedaje
            const hospedaje = await API.hospedajes.create(hospedajeData);

            // Cambiar estado de habitación
            await API.habitaciones.cambiarEstado(AppState.habitacionSeleccionada.id, 'ocupada');

            // Mostrar mensaje de éxito
            UI.mostrarMensaje('✅ Check-in realizado exitosamente', 'exito');

            // Ocultar ambos modales
            this.hideModal('modal-pago');
            this.hideModal('modal-operacion-habitacion');

            // Recargar habitaciones para reflejar el nuevo estado
            await this.loadInitialData();

        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            UI.mostrarMensaje('Error procesando pago: ' + error.message, 'error');
        } finally {
            loading();
        }
    },

    /**
     * Obtener fecha de checkout (mañana)
     */
    getCheckoutDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    },

    /**
     * Abrir modal de check-out
     */
    async openCheckoutModal(habitacion) {
        console.log(`🚪 Abriendo modal de check-out para habitación ${habitacion.numero}`);

        const modal = document.getElementById('modal-operacion-habitacion');
        const titulo = document.getElementById('op-numero-habitacion');

        titulo.textContent = habitacion.numero;

        // Cargar información del hospedaje actual
        try {
            const hospedaje = await API.habitaciones.getHospedajeActivo(habitacion.id);
            this.showCheckoutInfo(hospedaje);
        } catch (error) {
            console.error('Error cargando hospedaje:', error);
        }

        // Configurar para checkout
        this.setupCheckoutModal(habitacion);

        // Mostrar modal
        modal.classList.remove('oculto');
        AppState.modalActivo = 'operacion';
    },

    /**
     * Mostrar información de check-out
     */
    showCheckoutInfo(hospedaje) {
        const seccionEstancia = document.getElementById('op-seccion-estancia');

        document.getElementById('op-seccion-tarifas').style.display = 'none';
        document.getElementById('op-seccion-cliente').style.display = 'none';
        seccionEstancia.style.display = 'block';

        document.getElementById('estancia-cliente').textContent = hospedaje.huesped_nombre;
        document.getElementById('estancia-checkin').textContent = new Date(hospedaje.fecha_checkin).toLocaleDateString('es-ES');
        document.getElementById('estancia-noches').textContent = this.calculateNights(hospedaje.fecha_checkin);
        document.getElementById('estancia-total').textContent = UI.formatearMoneda(hospedaje.precio_noche);
    },

    /**
     * Calcular noches de estancia
     */
    calculateNights(checkinDate) {
        const checkin = new Date(checkinDate);
        const now = new Date();
        const diffTime = Math.abs(now - checkin);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} noche${diffDays > 1 ? 's' : ''}`;
    },

    /**
     * Configurar modal de check-out
     */
    setupCheckoutModal(habitacion) {
        // Mostrar botón de check-out
        const btnCheckout = document.getElementById('btn-op-checkout');
        if (btnCheckout) {
            btnCheckout.classList.remove('oculto');
            btnCheckout.replaceWith(btnCheckout.cloneNode(true));

            const newBtn = document.getElementById('btn-op-checkout');
            newBtn.addEventListener('click', () => {
                this.processCheckout(habitacion);
            });
        }

        // Ocultar otros botones
        ['btn-op-checkin', 'btn-op-limpieza', 'btn-op-disponible'].forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('oculto');
        });
    },

    /**
     * Procesar check-out
     */
    async processCheckout(habitacion) {
        const confirmar = await UI.confirmar(
            `¿Realizar check-out de la habitación ${habitacion.numero}?`,
            'Confirmar Check-out'
        );

        if (!confirmar) return;

        const loading = UI.mostrarCarga('Procesando check-out...');

        try {
            // Realizar check-out
            await API.habitaciones.checkout(habitacion.id);

            // Cambiar a limpieza
            await API.habitaciones.cambiarEstado(habitacion.id, 'limpieza');

            UI.mostrarMensaje('✅ Check-out realizado exitosamente', 'exito');

            // Cerrar modal y actualizar
            this.closeOperacionModal();
            await this.refreshData();

        } catch (error) {
            console.error('❌ Error en check-out:', error);
            UI.mostrarMensaje('Error en check-out: ' + error.message, 'error');
        } finally {
            loading();
        }
    },

    /**
     * Marcar habitación como disponible
     */
    async markAsAvailable(habitacion) {
        const confirmar = await UI.confirmar(
            `¿Marcar habitación ${habitacion.numero} como disponible?`,
            'Confirmar Cambio'
        );

        if (!confirmar) return;

        const loading = UI.mostrarCarga('Actualizando estado...');

        try {
            await API.habitaciones.cambiarEstado(habitacion.id, 'disponible');
            UI.mostrarMensaje('✅ Habitación marcada como disponible', 'exito');
            await this.refreshData();
        } catch (error) {
            console.error('❌ Error cambiando estado:', error);
            UI.mostrarMensaje('Error cambiando estado: ' + error.message, 'error');
        } finally {
            loading();
        }
    },

    /**
     * Actualizar datos y re-renderizar
     */
    async refreshData() {
        try {
            await this.loadInitialData();
            this.renderHabitacionesMap();
            this.updateStats();
        } catch (error) {
            console.error('Error actualizando datos:', error);
        }
    },

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        if (!AppState.habitaciones.length) return;

        const disponibles = AppState.habitaciones.filter(h => h.estado === 'disponible').length;
        const ocupadas = AppState.habitaciones.filter(h => h.estado === 'ocupada').length;
        const limpieza = AppState.habitaciones.filter(h => h.estado === 'limpieza').length;
        const ingresos = AppState.habitaciones
            .filter(h => h.estado === 'ocupada')
            .reduce((sum, h) => sum + h.precio_noche, 0);

        this.updateStatElement('total-disponibles', disponibles);
        this.updateStatElement('total-ocupadas', ocupadas);
        this.updateStatElement('total-limpieza', limpieza);
        this.updateStatElement('ingresos-dia', UI.formatearMoneda(ingresos));
    },

    /**
     * Actualizar elemento estadístico
     */
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },

    /**
     * Cerrar modal activo
     */
    closeActiveModal() {
        if (AppState.modalActivo === 'operacion') {
            this.closeOperacionModal();
        } else if (AppState.modalActivo === 'pago') {
            this.closePagoModal();
        }
    },

    /**
     * Cerrar modal de operación
     */
    closeOperacionModal() {
        const modal = document.getElementById('modal-operacion-habitacion');
        if (modal) {
            modal.classList.add('oculto');
        }

        // Limpiar estado
        AppState.modalActivo = null;
        AppState.habitacionSeleccionada = null;
        AppState.tarifaSeleccionada = null;
        AppState.clienteActual = null;

        // Limpiar formulario
        this.clearClienteForm();
    },

    /**
     * Cerrar modal de pago
     */
    closePagoModal() {
        const modal = document.getElementById('modal-pago');
        if (modal) {
            modal.classList.add('oculto');
        }

        AppState.modalActivo = null;
    },

    /**
     * Limpiar formulario de cliente
     */
    clearClienteForm() {
        ['cliente-nombre', 'cliente-email', 'cliente-telefono'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    },

    /**
     * Limpiar aplicación al hacer logout
     */
    clearApplication() {
        // Ocultar interfaz
        document.querySelector('.header-principal').style.display = 'none';
        document.querySelector('.nav-principal').style.display = 'none';
        document.querySelectorAll('.vista-contenido').forEach(vista => {
            vista.classList.add('oculto');
        });

        // Limpiar estado
        AppState.habitaciones = [];
        AppState.habitacionSeleccionada = null;
        AppState.tarifaSeleccionada = null;
        AppState.clienteActual = null;
        AppState.modalActivo = null;
        AppState.usuario = null;

        // Cerrar modales
        this.closeActiveModal();
    },

    /**
     * Inicializar otras secciones (placeholder)
     */
    initPedidoSection() {
        console.log('💳 Inicializando sección TPV/Pedidos...');
        // TODO: Implementar lógica de TPV
    },

    initReportesSection() {
        console.log('📊 Inicializando sección de reportes...');
        // TODO: Implementar reportes
    },

    initConfiguracionSection() {
        console.log('⚙️ Inicializando sección de configuración...');
        // TODO: Implementar configuración
    },

    /**
     * Utilidad para capitalizar texto
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Ocultar un modal por su ID
     * @param {string} modalId - ID del modal a ocultar
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('oculto');
            console.log(`🙈 Modal ${modalId} ocultado`);
        }
        if (AppState.modalActivo === modalId) {
            AppState.modalActivo = null;
        }
    },

    /**
     * Mostrar un modal por su ID
     * @param {string} modalId - ID del modal a mostrar
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('oculto');
            console.log(`👁️ Modal ${modalId} mostrado`);
        }
        AppState.modalActivo = modalId;
    },

    /**
     * Configurar botones de acción de la habitación (check-out, limpieza, etc.)
     */
    setupHabitacionActionButtons() {
        // TODO: Implementar configuración de botones de acción
    }
};

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exponer App globalmente para depuración
window.App = App;
window.AppState = AppState;
