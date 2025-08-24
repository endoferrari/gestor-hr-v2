// /frontend/main.js
import { registerUser, loginUser } from './api.js';
import { showMessage } from './ui.js';
import { saveToken, getToken, removeToken, isLoggedIn } from './session.js';

// Estado de la aplicación
let currentUser = null;
let authToken = null;

// Función para alternar entre formularios
window.showForm = function(formType) {
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const userPanel = document.getElementById('user-panel');
    const loginBtn = document.getElementById('show-login-btn');
    const registerBtn = document.getElementById('show-register-btn');

    // Ocultar todos los contenedores
    loginContainer.classList.add('hidden');
    registerContainer.classList.add('hidden');
    userPanel.classList.add('hidden');

    // Remover clase active de todas las pestañas
    loginBtn.classList.remove('active');
    registerBtn.classList.remove('active');

    // Mostrar solo el formulario correspondiente
    if (formType === 'login') {
        loginContainer.classList.remove('hidden');
        loginBtn.classList.add('active');
    } else if (formType === 'register') {
        registerContainer.classList.remove('hidden');
        registerBtn.classList.add('active');
    }
};

// Función para manejar logout
window.logout = function() {
    currentUser = null;
    authToken = null;
    removeToken();
    localStorage.removeItem('currentUser');
    showForm('login');
    showMessage('Sesión cerrada exitosamente.', 'success');
};

// Función para mostrar el panel de usuario
function showUserPanel(user, token) {
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const userPanel = document.getElementById('user-panel');
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('show-login-btn');
    const registerBtn = document.getElementById('show-register-btn');

    // Ocultar formularios y pestañas
    loginContainer.classList.add('hidden');
    registerContainer.classList.add('hidden');
    loginBtn.classList.remove('active');
    registerBtn.classList.remove('active');

    // Mostrar información del usuario
    userInfo.innerHTML = `
        <p><strong>Nombre:</strong> ${user.full_name}</p>
        <p><strong>Usuario:</strong> ${user.username}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Token:</strong> ${token.substring(0, 20)}...</p>
    `;

    userPanel.classList.remove('hidden');
}

// Función para verificar si hay un usuario ya logueado
function checkAuthState() {
    const savedToken = getToken();
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showUserPanel(currentUser, authToken);
    }
}

// Nos aseguramos de que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    // Configurar event listeners para los botones de navegación
    const loginBtn = document.getElementById('show-login-btn');
    const registerBtn = document.getElementById('show-register-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => showForm('login'));
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', () => showForm('register'));
    }

    // Verificar estado de autenticación al cargar
    checkAuthState();

    // Manejar formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = event.target.username.value;
            const password = event.target.password.value;

            try {
                const response = await loginUser(username, password);

                // Guardar información de usuario y token
                currentUser = response.user;
                authToken = response.access_token;
                saveToken(authToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                showMessage(`¡Bienvenido ${currentUser.full_name}!`, 'success');
                showUserPanel(currentUser, authToken);
                loginForm.reset();
            } catch (error) {
                showMessage('Credenciales incorrectas', 'error');
            }
        });
    }

    // Manejar formulario de registro
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const full_name = event.target.full_name.value;
            const username = event.target.username.value;
            const password = event.target.password.value;

            try {
                const newUser = await registerUser(full_name, username, password);
                showMessage('creado con éxito', 'success');
                registrationForm.reset();
                // Cambiar automáticamente al formulario de login
                showForm('login');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
});
