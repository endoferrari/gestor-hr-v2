// /frontend/ui.js

/**
 * Muestra un mensaje en el contenedor de mensajes.
 * @param {string} message - El mensaje a mostrar.
 * @param {'success' | 'error'} type - El tipo de mensaje.
 */
export function showMessage(message, type = 'success') {
    const container = document.getElementById('message-container');
    if (container) {
        container.textContent = message;
        container.className = `message ${type}`;

        // Auto-remover el mensaje después de 10 segundos para dar tiempo a los tests
        setTimeout(() => {
            if (container.textContent === message) {
                container.textContent = '';
                container.className = '';
            }
        }, 10000);
    }
}

/**
 * Muestra estado de carga en un botón.
 * @param {HTMLElement} element - El elemento a modificar.
 */
export function showLoading(element) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.innerHTML = '<span>Cargando...</span>';
}

/**
 * Oculta el estado de carga de un botón.
 * @param {HTMLElement} element - El elemento a restaurar.
 */
export function hideLoading(element) {
    element.disabled = false;
    element.textContent = element.dataset.originalText;
}

/**
 * Valida un email usando regex.
 * @param {string} email - El email a validar.
 * @returns {boolean}
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida una contraseña.
 * @param {string} password - La contraseña a validar.
 * @returns {boolean}
 */
export function validatePassword(password) {
    // Mínimo 6 caracteres
    return password.length >= 6;
}

/**
 * Muestra un toast notification.
 * @param {string} message - El mensaje a mostrar.
 * @param {'success' | 'error' | 'warning' | 'info'} type - El tipo de toast.
 * @param {number} duration - Duración en milisegundos.
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Crear el toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Estilos inline para el toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        minWidth: '200px',
        textAlign: 'center',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-out',
        backgroundColor: type === 'success' ? '#28a745' :
                        type === 'error' ? '#dc3545' :
                        type === 'warning' ? '#ffc107' : '#17a2b8'
    });

    document.body.appendChild(toast);

    // Mostrar el toast
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Ocultar y remover el toast
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Limpia un formulario.
 * @param {string} formId - ID del formulario a limpiar.
 */
export function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

/**
 * Muestra un error en un campo específico.
 * @param {HTMLElement} input - El input donde mostrar el error.
 * @param {string} message - El mensaje de error.
 */
export function showFieldError(input, message) {
    // Remover error anterior si existe
    hideFieldError(input);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px;';

    input.parentNode.appendChild(errorDiv);
}

/**
 * Oculta el error de un campo específico.
 * @param {HTMLElement} input - El input del cual ocultar el error.
 */
export function hideFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Agrega validaciones en tiempo real a los inputs.
 */
export function addInputValidation() {
    // Validación en tiempo real para email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#dc3545';
                showFieldError(this, 'Ingrese un email válido');
            } else {
                this.style.borderColor = '#e1e5e9';
                hideFieldError(this);
            }
        });
    }

    // Validación en tiempo real para password
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            if (this.value && !validatePassword(this.value)) {
                this.style.borderColor = '#dc3545';
                showFieldError(this, 'La contraseña debe tener al menos 6 caracteres');
            } else {
                this.style.borderColor = '#e1e5e9';
                hideFieldError(this);
            }
        });
    }
}

/**
 * Renderiza la cuadrícula de habitaciones en un contenedor específico.
 * @param {Array<Object>} rooms - La lista de habitaciones a mostrar.
 * @param {HTMLElement} containerElement - El elemento del DOM donde se dibujará el mapa.
 */
export function renderRoomMap(rooms, containerElement) {
    if (!containerElement) return;

    // Limpiamos el contenedor por si tenía algo antes
    containerElement.innerHTML = '';

    // Creamos el contenedor de la cuadrícula
    const grid = document.createElement('div');
    grid.className = 'room-grid';

    if (rooms.length === 0) {
        grid.innerHTML = '<p>No hay habitaciones para mostrar.</p>';
    } else {
        rooms.forEach(room => {
            const card = document.createElement('div');
            // Añadimos una clase general y una específica para el estado
            card.className = `room-card estado-${room.estado}`;

            card.innerHTML = `
                <div class="room-number">${room.numero}</div>
                <div class="room-type">${room.tipo}</div>
                <div class="room-price">$${room.precio_por_noche.toFixed(2)}</div>
                <div class="room-status">${room.estado}</div>
            `;
            grid.appendChild(card);
        });
    }

    containerElement.appendChild(grid);
}
