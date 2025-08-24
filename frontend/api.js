// /frontend/api.js
import { API_BASE_URL } from './config.js';

/**
 * Registra un nuevo usuario en el backend.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>}
 */
export async function registerUser(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        // Si el servidor responde con un error, lo capturamos
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ocurrió un error al registrar.');
    }

    return response.json();
}
