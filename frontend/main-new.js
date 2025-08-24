// /frontend/main.js
import { registerUser, loginUser, getHabitaciones } from './api.js';
import { showMessage, renderRoomMap } from './ui.js';
import { saveToken, isLoggedIn, removeToken } from './session.js';

// --- Funciones para manejar la visibilidad de las vistas ---

function showAuthView() {
    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('hidden');
}

function showAppView() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
}

function showAuthForm(formType) {
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const loginBtn = document.getElementById('show-login-btn');
    const registerBtn = document.getElementById('show-register-btn');

    if (formType === 'login') {
        loginContainer.classList.remove('hidden');
        registerContainer.classList.add('hidden');
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        registerContainer.classList.remove('hidden');
        loginContainer.classList.add('hidden');
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }
}

// --- Función principal que decide qué vista mostrar ---

async function updateUI() {
    if (isLoggedIn()) {
        showAppView();
        const roomMapContainer = document.getElementById('room-map-container');
        roomMapContainer.innerHTML = '<p>Cargando habitaciones...</p>';
        try {
            const rooms = await getHabitaciones();
            renderRoomMap(rooms, roomMapContainer);
        } catch (error) {
            showMessage(error.message, 'error');
            removeToken();
            showAuthView(); // Si hay error, volvemos al login
        }
    } else {
        showAuthView();
    }
}

// --- Inicialización de la aplicación ---

document.addEventListener('DOMContentLoaded', () => {
    // Listeners para los botones de las pestañas
    document.getElementById('show-login-btn').addEventListener('click', () => showAuthForm('login'));
    document.getElementById('show-register-btn').addEventListener('click', () => showAuthForm('register'));

    // Listener para el formulario de registro
    document.getElementById('registration-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fullName = event.target.full_name.value;
        const username = event.target.username.value;
        const password = event.target.password.value;
        try {
            await registerUser(fullName, username, password);
            showMessage('Usuario creado con éxito. Por favor, inicie sesión.', 'success');
            showAuthForm('login'); // Cambia a la pestaña de login
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Listener para el formulario de login
    document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;
        try {
            const data = await loginUser(username, password);
            saveToken(data.access_token);
            updateUI(); // Esto ahora ocultará el login y mostrará el mapa
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Listener para el botón de logout
    document.getElementById('logout-button').addEventListener('click', () => {
        removeToken();
        updateUI(); // Esto ocultará el mapa y mostrará el login
    });

    // Estado inicial al cargar la página
    updateUI();
});
