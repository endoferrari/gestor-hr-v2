// /frontend/session.js

/**
 * Guarda el token de autenticación en el localStorage
 * @param {string} token - El token JWT a guardar
 */
export function saveToken(token) {
    localStorage.setItem('authToken', token);
}

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null} El token JWT o null si no existe
 */
export function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Elimina el token de autenticación del localStorage
 */
export function removeToken() {
    localStorage.removeItem('authToken');
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si hay un token válido
 */
export function isLoggedIn() {
    const token = getToken();
    if (!token) return false;

    try {
        // Verificar si el token no ha expirado
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
    } catch (error) {
        // Si hay error parseando el token, considerarlo inválido
        removeToken();
        return false;
    }
}

/**
 * Obtiene la información del usuario desde el token
 * @returns {object|null} Los datos del usuario o null si no hay token válido
 */
export function getUserFromToken() {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.sub,
            username: payload.username,
            full_name: payload.full_name
        };
    } catch (error) {
        return null;
    }
}
