// /frontend/api.js
import { API_BASE_URL } from './config.js';

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
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        // Si el servidor responde con un error, lo capturamos
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciales incorrectas.');
    }

    return response.json();
}
