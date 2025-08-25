// /frontend/api.js
import { API_BASE_URL } from './config.js';
import { getToken } from './session.js';

/**
 * Registra un nuevo usuario en el backend.
 * @param {string} full_name
 * @param {string} username
 * @param {string} password
 * @returns {Promise<any>}
 */
export async function registerUser(full_name, username, password) {
    const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name, username, password }),
    });

    if (!response.ok) {
        // Si el servidor responde con un error, lo capturamos
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ocurrió un error al registrar.');
    }

    return response.json();
}

/**
 * Autentica un usuario en el backend.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<any>}
 */
export async function loginUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            username: username,
            password: password
        }),
    });

    if (!response.ok) {
        // Si el servidor responde con un error, lo capturamos
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciales incorrectas.');
    }

    return response.json();
}

/**
 * Obtiene la lista de todas las habitaciones desde el backend.
 * Requiere un token de autenticación válido.
 * @returns {Promise<Array>}
 */
export async function getHabitaciones() {
    const token = getToken();
    if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicie sesión.');
    }

    const response = await fetch(`${API_BASE_URL}/habitaciones/`, {
        method: 'GET',
        headers: {
            // Así es como probamos que somos un usuario autenticado
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        // Esto podría pasar si el token expiró
        if (response.status === 401) {
            // En un futuro podríamos manejar el refresco del token aquí
            throw new Error('Sesión expirada. Por favor, inicie sesión de nuevo.');
        }
        throw new Error('No se pudieron cargar las habitaciones.');
    }

    return response.json();
}

/**
 * Realiza el check-in de un huésped en una habitación específica.
 * @param {number} habitacionId
 * @param {object} huespedData - { nombre_completo, telefono, email }
 * @returns {Promise<any>}
 */
export async function realizarCheckIn(habitacionId, huespedData) {
    const token = getToken();
    if (!token) {
        throw new Error('Autenticación requerida.');
    }

    const body = {
        habitacion_id: habitacionId,
        huesped: {
            nombre_completo: huespedData.nombre_completo,
            telefono: huespedData.telefono,
            email: huespedData.email,
        }
    };

    const response = await fetch(`${API_BASE_URL}/check-in/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al realizar el check-in.');
    }

    return response.json();
}

/**
 * Realiza check-out de una habitación ocupada.
 * @param {number} habitacionId
 * @returns {Promise<any>}
 */
export async function checkOutHabitacion(habitacionId) {
    const token = getToken();
    if (!token) {
        throw new Error('No se encontró un token de autenticación.');
    }

    const response = await fetch(`${API_BASE_URL}/check-out/${habitacionId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al realizar el check-out.');
    }

    return response.json();
}
