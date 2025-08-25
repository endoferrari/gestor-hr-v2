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
 * Realiza el check-in en una habitación específica.
 * @param {number} habitacionId - ID de la habitación para check-in.
 * @returns {Promise<{success: boolean, message?: string, data?: any}>}
 */
export async function checkInRoom(habitacionId) {
    const token = getToken();
    if (!token) {
        return {
            success: false,
            message: 'No hay token de autenticación. Por favor, inicie sesión.'
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/check-in/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                habitacion_id: habitacionId
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return {
                    success: false,
                    message: 'Sesión expirada. Por favor, inicie sesión de nuevo.'
                };
            }
            return {
                success: false,
                message: data.detail || 'Error al realizar el check-in'
            };
        }

        return {
            success: true,
            message: 'Check-in realizado exitosamente',
            data: data
        };

    } catch (error) {
        console.error('Error en checkInRoom:', error);
        return {
            success: false,
            message: 'Error de conexión al realizar el check-in'
        };
    }
}
