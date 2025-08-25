/**
 * Configuración global de la aplicación Gestor HR v3.0
 * Centralización absoluta de todas las constantes y configuraciones
 */

// Configuración principal unificada
const CONFIG = {
    // Información de la aplicación
    APP_NAME: 'Gestor HR v3.0',
    APP_VERSION: '3.0.0',

    // URLs de API
    API_BASE_URL: 'http://localhost:8000',
    API_VERSION: 'v1',
    get API_URL() {
        return `${this.API_BASE_URL}/api/${this.API_VERSION}`;
    },
    WEBSOCKET_URL: 'ws://localhost:8000/ws',

    // Claves de LocalStorage
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'gestor_hr_token',
        REFRESH_TOKEN: 'gestor_hr_refresh_token',
        USER_DATA: 'gestor_hr_user',
        PREFERENCES: 'gestor_hr_preferences'
    },

    // IDs de elementos UI principales
    UI_ELEMENTS: {
        VISTA_LOGIN: 'vista-login',
        VISTA_PRINCIPAL: 'vista-principal',
        MAPA_HABITACIONES: 'mapa-habitaciones',
        MODAL_OVERLAY: 'modal-overlay',
        CONTENEDOR_MENSAJES: 'contenedor-mensajes',
        NAV_MAPA: 'nav-mapa',
        NAV_TPV: 'nav-tpv',
        NAV_REPORTES: 'nav-reportes'
    },

    // Configuración de intervalos y tiempos
    INTERVALS: {
        AUTO_REFRESH: 30000, // 30 segundos
        TOKEN_REFRESH: 840000, // 14 minutos (el token expira en 15)
        MESSAGE_DURATION: 3000, // 3 segundos
        ANIMATION_DURATION: 300 // 300ms
    },

    // Configuración de habitaciones
    HABITACIONES: {
        TIPOS: {
            'individual': 'Individual',
            'doble': 'Doble',
            'suite': 'Suite',
            'familiar': 'Familiar'
        },
        ESTADOS: {
            'disponible': 'Disponible',
            'ocupada': 'Ocupada',
            'limpieza': 'En Limpieza',
            'mantenimiento': 'Mantenimiento',
            'fuera_servicio': 'Fuera de Servicio',
            'reservada': 'Reservada'
        },
        POR_FILA: 6,
        GRID_MIN_WIDTH: '250px'
    },

    // Productos y servicios
    PRODUCTOS: {
        CATEGORIAS: {
            'alojamiento': '🛏️ Alojamiento',
            'bebidas': '🍺 Bebidas',
            'comida': '🍕 Comida',
            'servicios': '🛎️ Servicios'
        }
    },

    // Sistema de pagos
    PAGOS: {
        METODOS: {
            'efectivo': '💵 Efectivo',
            'tarjeta': '💳 Tarjeta',
            'transferencia': '🏦 Transferencia'
        },
        IVA_DEFAULT: 0.21, // 21% IVA
        MONEDA: 'EUR',
        DECIMALES: 2
    },

    // Estados de pedido
    PEDIDOS: {
        ESTADOS: {
            'activo': 'Activo',
            'cerrado': 'Cerrado',
            'cancelado': 'Cancelado'
        }
    },

    // Configuración de impresión
    IMPRESION: {
        AUTO_PRINT: true,
        TIPOS_RECIBO: {
            'servicio': 'Recibo de Servicio',
            'productos': 'Recibo de Productos',
            'hospedaje': 'Recibo de Hospedaje'
        }
    },

    // Configuración de validaciones
    VALIDACIONES: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        TELEFONO_REGEX: /^(\+34|0034|34)?[6-9]\d{8}$/,
        PASSWORD_MIN_LENGTH: 6,
        NOMBRE_MIN_LENGTH: 2
    },

    // Configuración de API endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            LOGOUT: '/api/v1/auth/logout',
            REFRESH: '/api/v1/auth/refresh',
            VERIFY: '/api/v1/auth/verify',
            TEST_TOKEN: '/api/v1/auth/test-token'
        },
        HABITACIONES: '/api/v1/habitaciones',
        USUARIOS: '/api/v1/usuarios',
        HOSPEDAJES: '/api/v1/hospedajes',
        PEDIDOS: '/api/v1/pedidos',
        PRODUCTOS: '/api/v1/productos',
        TARIFAS: '/api/v1/tarifas',
        REPORTES: '/api/v1/reportes'
    }
};

// Utilidades de configuración mejoradas
const ConfigUtils = {
    /**
     * Obtiene una configuración anidada usando notación de puntos
     * @param {string} path - Ruta de la configuración (ej: 'HABITACIONES.TIPOS.individual')
     * @param {*} defaultValue - Valor por defecto si no se encuentra
     * @returns {*} Valor de configuración
     */
    get(path, defaultValue = null) {
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : defaultValue;
        }, CONFIG);
    },

    /**
     * Obtiene la URL completa de un endpoint de la API
     * @param {string} endpoint - Endpoint de la API (puede incluir parámetros)
     * @returns {string} URL completa
     */
    getApiUrl(endpoint) {
        // Si el endpoint ya es completo, devolverlo tal como está
        if (endpoint.startsWith('http')) {
            return endpoint;
        }

        // Si comienza con /, es relativo al base URL
        if (endpoint.startsWith('/')) {
            return `${CONFIG.API_BASE_URL}${endpoint}`;
        }

        // En caso contrario, es relativo a la API URL
        return `${CONFIG.API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    },

    /**
     * Obtiene un endpoint específico de la configuración
     * @param {string} category - Categoría del endpoint
     * @param {string} action - Acción específica (opcional)
     * @returns {string} Endpoint configurado
     */
    getEndpoint(category, action = '') {
        const baseEndpoint = this.get(`ENDPOINTS.${category.toUpperCase()}`, '');
        return action ? `${baseEndpoint}/${action}` : baseEndpoint;
    },

    /**
     * Valida un email usando la regex configurada
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    validateEmail(email) {
        return CONFIG.VALIDACIONES.EMAIL_REGEX.test(email);
    },

    /**
     * Valida un teléfono usando la regex configurada
     * @param {string} telefono - Teléfono a validar
     * @returns {boolean} True si es válido
     */
    validateTelefono(telefono) {
        return CONFIG.VALIDACIONES.TELEFONO_REGEX.test(telefono.replace(/\s/g, ''));
    },

    /**
     * Formatea un precio según la configuración
     * @param {number} precio - Precio a formatear
     * @param {boolean} includeSymbol - Si incluir el símbolo de moneda
     * @returns {string} Precio formateado
     */
    formatPrice(precio, includeSymbol = true) {
        const formatted = precio.toFixed(CONFIG.PAGOS.DECIMALES);
        return includeSymbol ? `${formatted} €` : formatted;
    },

    /**
     * Obtiene el elemento del DOM por su ID configurado
     * @param {string} elementKey - Clave del elemento en UI_ELEMENTS
     * @returns {HTMLElement|null} Elemento del DOM
     */
    getElement(elementKey) {
        const id = this.get(`UI_ELEMENTS.${elementKey}`);
        return id ? document.getElementById(id) : null;
    },

    /**
     * Obtiene la configuración para un intervalo específico
     * @param {string} intervalKey - Clave del intervalo
     * @returns {number} Tiempo en milisegundos
     */
    getInterval(intervalKey) {
        return this.get(`INTERVALS.${intervalKey}`, 1000);
    }
};

// Gestión de localStorage centralizada
const Storage = {
    /**
     * Obtiene un valor del localStorage usando las claves configuradas
     * @param {string} key - Clave de configuración (ej: 'ACCESS_TOKEN')
     * @param {*} defaultValue - Valor por defecto
     * @returns {*} Valor almacenado o valor por defecto
     */
    get(key, defaultValue = null) {
        const storageKey = CONFIG.STORAGE_KEYS[key];
        if (!storageKey) {
            console.warn(`Storage key not found: ${key}`);
            return defaultValue;
        }

        try {
            const value = localStorage.getItem(storageKey);
            if (!value) return defaultValue;

            // Para tokens, devolver como string simple
            if (key === 'ACCESS_TOKEN' || key === 'REFRESH_TOKEN') {
                return value;
            }

            // Para otros valores, intentar parsear como JSON
            return JSON.parse(value);
        } catch (error) {
            console.error(`Error parsing storage value for ${key}:`, error);
            return defaultValue;
        }
    },

    /**
     * Almacena un valor en localStorage
     * @param {string} key - Clave de configuración
     * @param {*} value - Valor a almacenar
     */
    set(key, value) {
        const storageKey = CONFIG.STORAGE_KEYS[key];
        if (!storageKey) {
            console.warn(`Storage key not found: ${key}`);
            return;
        }

        try {
            // Para tokens, almacenar como string simple
            if (key === 'ACCESS_TOKEN' || key === 'REFRESH_TOKEN') {
                localStorage.setItem(storageKey, value);
            } else {
                // Para otros valores, convertir a JSON
                localStorage.setItem(storageKey, JSON.stringify(value));
            }
        } catch (error) {
            console.error(`Error storing value for ${key}:`, error);
        }
    },

    /**
     * Elimina un valor del localStorage
     * @param {string} key - Clave de configuración
     */
    remove(key) {
        const storageKey = CONFIG.STORAGE_KEYS[key];
        if (!storageKey) {
            console.warn(`Storage key not found: ${key}`);
            return;
        }

        localStorage.removeItem(storageKey);
    },

    /**
     * Limpia todos los datos de la aplicación del localStorage
     */
    clear() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// Función de inicialización mejorada
function initializeApp() {
    console.log(`Inicializando ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}...`);

    // Cargar estado desde localStorage
    const currentToken = Storage.get('ACCESS_TOKEN');
    const currentUser = Storage.get('USER_DATA');

    // Verificar integridad de datos
    if (currentToken && !currentUser) {
        console.warn('Token found but no user data. Clearing token.');
        Storage.remove('ACCESS_TOKEN');
    }

    console.log('Estado de inicialización:', {
        hasToken: !!currentToken,
        hasUser: !!currentUser,
        apiUrl: CONFIG.API_URL,
        environment: location.hostname === 'localhost' ? 'development' : 'production'
    });

    return {
        isAuthenticated: !!(currentToken && currentUser),
        config: CONFIG,
        currentToken,
        currentUser
    };
}

// Auto-inicializar cuando se carga el script
document.addEventListener('DOMContentLoaded', initializeApp);

// Exportar para compatibilidad con código existente
window.Config = ConfigUtils;
window.CONFIG = CONFIG;
window.Storage = Storage;
