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
            // Agregar ID de habitación como data attribute
            card.dataset.roomId = room.id;
            card.dataset.roomNumber = room.numero;

            // Hacer las habitaciones disponibles clicables
            if (room.estado === 'disponible') {
                card.style.cursor = 'pointer';
                card.title = 'Clic para realizar check-in';
            }

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

/**
 * Maneja el modal de check-in.
 */
export class CheckInModal {
    constructor() {
        this.modal = document.getElementById('checkInModal');
        this.cancelBtn = document.getElementById('cancelCheckIn');
        this.confirmBtn = document.getElementById('confirmCheckIn');
        this.roomNumberSpan = document.getElementById('modalRoomNumber');
        this.currentRoomId = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Cerrar modal al hacer clic en cancelar o fuera del modal
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Confirmar check-in
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => this.confirmCheckIn());
        }

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.close();
            }
        });
    }

    /**
     * Abre el modal para una habitación específica.
     * @param {number} roomId - ID de la habitación.
     * @param {string} roomNumber - Número de la habitación.
     */
    open(roomId, roomNumber) {
        this.currentRoomId = roomId;

        if (this.roomNumberSpan) {
            this.roomNumberSpan.textContent = roomNumber;
        }

        if (this.modal) {
            this.modal.classList.remove('hidden');
            // Focus en el botón de confirmar para accesibilidad
            setTimeout(() => {
                if (this.confirmBtn) {
                    this.confirmBtn.focus();
                }
            }, 100);
        }
    }

    /**
     * Cierra el modal.
     */
    close() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this.currentRoomId = null;
        }
    }

    /**
     * Confirma el check-in y llama a la API.
     */
    async confirmCheckIn() {
        if (!this.currentRoomId) {
            showToast('Error: No se ha seleccionado una habitación', 'error');
            return;
        }

        try {
            // Deshabilitar el botón mientras se procesa
            if (this.confirmBtn) {
                showLoading(this.confirmBtn);
            }

            // Importar la función de API dinámicamente
            const { checkInRoom } = await import('./api.js');

            // Realizar el check-in
            const result = await checkInRoom(this.currentRoomId);

            if (result.success) {
                showToast(`Check-in exitoso en habitación ${this.roomNumberSpan?.textContent || this.currentRoomId}`, 'success');
                this.close();

                // Refrescar el mapa de habitaciones
                const { loadRooms } = await import('./main.js');
                if (loadRooms) {
                    await loadRooms();
                }
            } else {
                showToast(result.message || 'Error en el check-in', 'error');
            }

        } catch (error) {
            console.error('Error en check-in:', error);
            showToast('Error de conexión durante el check-in', 'error');
        } finally {
            // Restaurar el botón
            if (this.confirmBtn) {
                hideLoading(this.confirmBtn);
            }
        }
    }
}

/**
 * Agrega funcionalidad de click en las tarjetas de habitación para abrir el modal de check-in.
 * @param {CheckInModal} checkInModal - Instancia del modal de check-in.
 */
export function addRoomClickHandlers(checkInModal) {
    // Usar delegación de eventos para manejar clicks en tarjetas de habitaciones
    document.addEventListener('click', (e) => {
        const roomCard = e.target.closest('.room-card');
        if (roomCard && roomCard.classList.contains('estado-disponible')) {
            const roomId = roomCard.dataset.roomId;
            const roomNumber = roomCard.dataset.roomNumber;
            if (roomId && roomNumber) {
                checkInModal.open(parseInt(roomId), roomNumber);
            }
        }
    });
}
