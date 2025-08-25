/**
 * Módulo API para Gestor HR v3.0
 * Cliente API unificado con manejo centralizado de errores y autenticación
 */

/**
 * Cliente API centralizado - Maneja todas las peticiones HTTP
 * @param {string} endpoint - Endpoint de la API
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {Object} body - Datos a enviar en el body
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<any>} Respuesta procesada
 */
async function apiClient(endpoint, method = 'GET', body = null, options = {}) {
    // Construir URL completa
    const url = ConfigUtils.getApiUrl(endpoint);

    // Configurar headers por defecto
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Agregar token de autenticación si existe
    if (AppState.currentToken) {
        headers['Authorization'] = `Bearer ${AppState.currentToken}`;
    }

    // Configurar opciones de fetch
    const fetchOptions = {
        method,
        headers,
        ...options
    };

    // Agregar body si es necesario
    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, fetchOptions);

        // Manejo centralizado de errores HTTP
        await handleHttpErrors(response);

        // Manejo de respuestas sin contenido
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        // Verificar si la respuesta tiene contenido JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        // Para otros tipos de contenido, devolver como texto
        return await response.text();

    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Manejo centralizado de errores HTTP
 * @param {Response} response - Respuesta HTTP
 */
async function handleHttpErrors(response) {
    if (response.ok) return;

    let errorMessage = `Error HTTP: ${response.status}`;
    let errorData = {};

    try {
        // Intentar extraer detalles del error del response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        }
    } catch (parseError) {
        console.warn('No se pudo parsear el error del servidor:', parseError);
    }

    // Manejo específico por código de estado
    switch (response.status) {
        case 401:
            // Token expirado o inválido
            console.warn('Token expirado. Cerrando sesión...');
            if (window.Auth && typeof window.Auth.logout === 'function') {
                window.Auth.logout();
            }
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            break;

        case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;

        case 404:
            errorMessage = 'Recurso no encontrado.';
            break;

        case 422:
            // Error de validación - extraer detalles
            if (errorData.detail && Array.isArray(errorData.detail)) {
                const validationErrors = errorData.detail.map(err => err.msg).join(', ');
                errorMessage = `Error de validación: ${validationErrors}`;
            }
            break;

        case 500:
            errorMessage = 'Error interno del servidor. Por favor, inténtalo más tarde.';
            break;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
}

/**
 * API principal - Organizada por recursos con métodos HTTP específicos
 */
const API = {
    // === AUTENTICACIÓN ===
    auth: {
        async login(credentials) {
            return await apiClient(ConfigUtils.getEndpoint('auth', 'login'), 'POST', credentials);
        },

        async logout() {
            return await apiClient(ConfigUtils.getEndpoint('auth', 'logout'), 'POST');
        },

        async refresh() {
            return await apiClient(ConfigUtils.getEndpoint('auth', 'refresh'), 'POST');
        },

        async verify() {
            return await apiClient(ConfigUtils.getEndpoint('auth', 'verify'), 'GET');
        }
    },

    // === HABITACIONES ===
    habitaciones: {
        async getAll() {
            try {
                console.log('📡 [API] Solicitando todas las habitaciones...');
                const data = await apiClient(Config.getApiUrl('habitaciones/'));
                console.log('✅ [API] Habitaciones recibidas:', data.length > 0 ? `${data.length} habitaciones` : 'Respuesta vacía');
                return data;
            } catch (error) {
                console.error('❌ [API] Fallo crítico al obtener habitaciones:', error);
                UI.mostrarMensaje('No se pudieron cargar las habitaciones. Verifique la conexión con el servidor.', 'error');
                return []; // Devolver array vacío para que la UI no se rompa
            }
        },

        async getById(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('habitaciones')}/${id}`);
        },

        async create(data) {
            return await apiClient(ConfigUtils.getEndpoint('habitaciones'), 'POST', data);
        },

        async update(id, data) {
            return await apiClient(`${ConfigUtils.getEndpoint('habitaciones')}/${id}`, 'PUT', data);
        },

        async delete(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('habitaciones')}/${id}`, 'DELETE');
        },

        async cambiarEstado(id, estado) {
            return await apiClient(`${ConfigUtils.getEndpoint('habitaciones')}/${id}/estado`, 'PUT', { estado });
        }
    },

    // === USUARIOS ===
    usuarios: {
        async getAll() {
            return await apiClient(ConfigUtils.getEndpoint('usuarios'));
        },

        async getById(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('usuarios')}/${id}`);
        },

        async create(data) {
            return await apiClient(ConfigUtils.getEndpoint('usuarios'), 'POST', data);
        },

        async update(id, data) {
            return await apiClient(`${ConfigUtils.getEndpoint('usuarios')}/${id}`, 'PUT', data);
        },

        async delete(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('usuarios')}/${id}`, 'DELETE');
        }
    },

    // === HOSPEDAJES ===
    hospedajes: {
        async getAll() {
            return await apiClient(ConfigUtils.getEndpoint('hospedajes'));
        },

        async getById(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('hospedajes')}/${id}`);
        },

        async create(data) {
            return await apiClient(ConfigUtils.getEndpoint('hospedajes'), 'POST', data);
        },

        async update(id, data) {
            return await apiClient(`${ConfigUtils.getEndpoint('hospedajes')}/${id}`, 'PUT', data);
        },

        async checkout(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('hospedajes')}/${id}/checkout`, 'POST');
        },

        async getActivos() {
            return await apiClient(`${ConfigUtils.getEndpoint('hospedajes')}?estado=activo`);
        }
    },

    // === PEDIDOS ===
    pedidos: {
        async getAll() {
            return await apiClient(ConfigUtils.getEndpoint('pedidos'));
        },

        async getById(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('pedidos')}/${id}`);
        },

        async create(data) {
            return await apiClient(ConfigUtils.getEndpoint('pedidos'), 'POST', data);
        },

        async update(id, data) {
            return await apiClient(`${ConfigUtils.getEndpoint('pedidos')}/${id}`, 'PUT', data);
        },

        async agregarLinea(pedidoId, lineaData) {
            return await apiClient(`${ConfigUtils.getEndpoint('pedidos')}/${pedidoId}/lineas`, 'POST', lineaData);
        },

        async actualizarLinea(pedidoId, lineaId, lineaData) {
            return await apiClient(`${ConfigUtils.getEndpoint('pedidos')}/${pedidoId}/lineas/${lineaId}`, 'PUT', lineaData);
        },

        async eliminarLinea(pedidoId, lineaId) {
            return await apiClient(`${ConfigUtils.getEndpoint('pedidos')}/${pedidoId}/lineas/${lineaId}`, 'DELETE');
        },

        async procesarPago(pedidoId, pagoData) {
            return await apiClient(`${ConfigUtils.getEndpoint('pedidos')}/${pedidoId}/pago`, 'POST', pagoData);
        },

        async cerrar(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('pedidos')}/${id}/cerrar`, 'POST');
        }
    },

    // === PRODUCTOS ===
    productos: {
        async getAll() {
            return await apiClient(ConfigUtils.getEndpoint('productos'));
        },

        async getById(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('productos')}/${id}`);
        },

        async getByCategoria(categoria) {
            return await apiClient(`${ConfigUtils.getEndpoint('productos')}?categoria=${categoria}`);
        },

        async create(data) {
            return await apiClient(ConfigUtils.getEndpoint('productos'), 'POST', data);
        },

        async update(id, data) {
            return await apiClient(`${ConfigUtils.getEndpoint('productos')}/${id}`, 'PUT', data);
        },

        async delete(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('productos')}/${id}`, 'DELETE');
        }
    },

    // === TARIFAS ===
    tarifas: {
        async getAll() {
            return await apiClient(ConfigUtils.getEndpoint('tarifas'));
        },

        async getById(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('tarifas')}/${id}`);
        },

        async getByTipo(tipo) {
            return await apiClient(`${ConfigUtils.getEndpoint('tarifas')}?tipo_habitacion=${tipo}`);
        },

        async create(data) {
            return await apiClient(ConfigUtils.getEndpoint('tarifas'), 'POST', data);
        },

        async update(id, data) {
            return await apiClient(`${ConfigUtils.getEndpoint('tarifas')}/${id}`, 'PUT', data);
        },

        async delete(id) {
            return await apiClient(`${ConfigUtils.getEndpoint('tarifas')}/${id}`, 'DELETE');
        }
    },

    // === REPORTES ===
    reportes: {
        // Estadísticas generales del día
        async getEstadisticasDia(fecha = null) {
            const today = fecha || new Date().toISOString().split('T')[0];
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/estadisticas?fecha=${today}`);
        },

        // Estadísticas con filtros de período
        async getEstadisticas(params = {}) {
            const searchParams = new URLSearchParams();

            if (params.periodo) {
                searchParams.append('periodo', params.periodo);
            }
            if (params.fecha_inicio) {
                searchParams.append('fecha_inicio', params.fecha_inicio);
            }
            if (params.fecha_fin) {
                searchParams.append('fecha_fin', params.fecha_fin);
            }

            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/estadisticas?${searchParams}`);
        },

        // Dashboard ejecutivo completo
        async getDashboard() {
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/dashboard`);
        },

        // Ocupación actual y detallada
        async getOcupacionActual() {
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/ocupacion`);
        },

        // Ocupación detallada por tipos
        async getOcupacionDetallada() {
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/ocupacion`);
        },

        // Ingresos por período
        async getIngresosPeriodo(fechaInicio, fechaFin) {
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/ingresos?inicio=${fechaInicio}&fin=${fechaFin}`);
        },

        // Resumen de hospedajes
        async getResumenHospedajes(fechaInicio, fechaFin) {
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/hospedajes?inicio=${fechaInicio}&fin=${fechaFin}`);
        },

        // Análisis de productos
        async getAnalisisProductos() {
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/productos`);
        },

        // Top productos más vendidos
        async getTopProductos(limite = 10) {
            return await apiClient(`${ConfigUtils.getEndpoint('reportes')}/productos/top?limit=${limite}`);
        }
    }
};

/**
 * Utilidades para datos de prueba y desarrollo
 */
const MockData = {
    /**
     * Crear habitaciones de ejemplo
     */
    async crearHabitacionesEjemplo() {
        const habitaciones = [
            { numero: '101', tipo: 'individual', precio_noche: 50.00 },
            { numero: '102', tipo: 'doble', precio_noche: 75.00 },
            { numero: '103', tipo: 'suite', precio_noche: 120.00 },
            { numero: '201', tipo: 'individual', precio_noche: 50.00 },
            { numero: '202', tipo: 'doble', precio_noche: 75.00 },
            { numero: '203', tipo: 'familiar', precio_noche: 100.00 }
        ];

        for (const hab of habitaciones) {
            try {
                await API.habitaciones.create(hab);
                console.log(`Habitación ${hab.numero} creada`);
            } catch (error) {
                console.log(`Habitación ${hab.numero} ya existe o error:`, error.message);
            }
        }
    },

    /**
     * Crear productos de ejemplo
     */
    async crearProductosEjemplo() {
        const productos = [
            { nombre: 'Coca Cola', categoria: 'bebidas', precio: 2.50, stock: 100 },
            { nombre: 'Cerveza', categoria: 'bebidas', precio: 3.00, stock: 50 },
            { nombre: 'Agua', categoria: 'bebidas', precio: 1.50, stock: 200 },
            { nombre: 'Sandwich', categoria: 'comida', precio: 5.00, stock: 30 },
            { nombre: 'Pizza', categoria: 'comida', precio: 12.00, stock: 20 },
            { nombre: 'Desayuno', categoria: 'servicios', precio: 8.00, stock: null },
            { nombre: 'Servicio de limpieza', categoria: 'servicios', precio: 15.00, stock: null }
        ];

        for (const prod of productos) {
            try {
                await API.productos.create(prod);
                console.log(`Producto ${prod.nombre} creado`);
            } catch (error) {
                console.log(`Producto ${prod.nombre} ya existe o error:`, error.message);
            }
        }
    },

    /**
     * Crear tarifas de ejemplo
     */
    async crearTarifasEjemplo() {
        const tarifas = [
            { nombre: 'Tarifa Estándar Individual', tipo_habitacion: 'individual', precio: 50.00 },
            { nombre: 'Tarifa Estándar Doble', tipo_habitacion: 'doble', precio: 75.00 },
            { nombre: 'Tarifa Estándar Suite', tipo_habitacion: 'suite', precio: 120.00 },
            { nombre: 'Tarifa Estándar Familiar', tipo_habitacion: 'familiar', precio: 100.00 },
            { nombre: 'Tarifa Fin de Semana Individual', tipo_habitacion: 'individual', precio: 65.00 },
            { nombre: 'Tarifa Fin de Semana Doble', tipo_habitacion: 'doble', precio: 90.00 }
        ];

        for (const tarifa of tarifas) {
            try {
                await API.tarifas.create(tarifa);
                console.log(`Tarifa ${tarifa.nombre} creada`);
            } catch (error) {
                console.log(`Tarifa ${tarifa.nombre} ya existe o error:`, error.message);
            }
        }
    },

    /**
     * Inicializar todos los datos de ejemplo
     */
    async inicializarDatosEjemplo() {
        console.log('Inicializando datos de ejemplo...');

        try {
            await this.crearHabitacionesEjemplo();
            await this.crearProductosEjemplo();
            await this.crearTarifasEjemplo();

            console.log('Datos de ejemplo creados exitosamente');
            if (window.UI && typeof window.UI.mostrarMensaje === 'function') {
                window.UI.mostrarMensaje('Datos de ejemplo inicializados', 'exito');
            }
        } catch (error) {
            console.error('Error inicializando datos:', error);
            if (window.UI && typeof window.UI.mostrarMensaje === 'function') {
                window.UI.mostrarMensaje('Error inicializando datos de ejemplo', 'error');
            }
        }
    }
};

// Exportar para compatibilidad con código existente
window.API = API;
window.MockData = MockData;
window.apiClient = apiClient;
