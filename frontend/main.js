// /frontend/main.js
import { registerUser, loginUser, getHabitaciones, realizarCheckIn } from './api.js';
import { showMessage, openCheckInModal, closeCheckInModal } from './ui.js';
import { saveToken, isLoggedIn, removeToken } from './session.js';

// --- Lógica de Renderizado y Eventos del Mapa ---
function renderAndAttachListeners(rooms) {
    const container = document.getElementById('room-map-container');
    if (!container) return;

    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'room-grid';

    if (rooms.length === 0) {
        grid.innerHTML = '<p>No hay habitaciones para mostrar.</p>';
    } else {
        rooms.forEach(room => {
            const card = document.createElement('div');
            card.className = `room-card estado-${room.estado}`;
            card.innerHTML = `
                <div class="room-number">${room.numero}</div>
                <div class="room-type">${room.tipo}</div>
                <div class="room-price">$${room.precio_por_noche.toFixed(2)}</div>
                <div class="room-status">${room.estado}</div>
            `;

            // AÑADIMOS EL EVENT LISTENER PARA EL CHECK-IN
            if (room.estado === 'disponible') {
                card.addEventListener('click', () => {
                    openCheckInModal(room);
                });
            } else {
                card.classList.add('disabled'); // Opcional: estilo para no disponibles
            }
            grid.appendChild(card);
        });
    }
    container.appendChild(grid);
}


// --- Funciones para manejar la visibilidad de las vistas ---
function showAuthView() {
    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('hidden');
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

async function showAppView() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');

    const roomMapContainer = document.getElementById('room-map-container');
    roomMapContainer.innerHTML = '<p>Cargando habitaciones...</p>';
    try {
        const rooms = await getHabitaciones();
        renderAndAttachListeners(rooms);
    } catch (error) {
        showMessage(error.message, 'error');
        removeToken();
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
            showAppView(); // Esto ahora ocultará el login y mostrará el mapa
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Listener para el botón de logout
    document.getElementById('logout-button').addEventListener('click', () => {
        removeToken();
        showMessage('Sesión cerrada exitosamente', 'success');
        if (isLoggedIn()) {
            showAppView();
        } else {
            showAuthView();
        }
    });

    // Listener para el FORMULARIO DE CHECK-IN
    document.getElementById('check-in-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const habitacionId = parseInt(event.target['modal-habitacion-id'].value);
        const huespedData = {
            nombre_completo: document.getElementById('modal-huesped-nombre').value,
            telefono: document.getElementById('modal-huesped-telefono').value,
            email: document.getElementById('modal-huesped-email').value,
        };

        try {
            await realizarCheckIn(habitacionId, huespedData);
            showMessage('Check-in realizado con éxito.', 'success');
            closeCheckInModal();
            // Actualizamos el mapa para ver el cambio de estado en tiempo real
            await showAppView();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Estado inicial al cargar la página
    if (isLoggedIn()) {
        showAppView();
    } else {
        showAuthView();
    }
});
