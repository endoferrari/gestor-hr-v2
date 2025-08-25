// /frontend/ui.js

// --- Funciones de Mensajes ---
export function showMessage(message, type = 'success') {
    const container = document.getElementById('message-container');
    if (container) {
        container.textContent = message;
        container.className = `message ${type}`;
        // Opcional: hacer que el mensaje desaparezca después de unos segundos
        setTimeout(() => {
            if (container.textContent === message) {
                container.textContent = '';
                container.className = '';
            }
        }, 4000);
    }
}

// --- Funciones del Modal de Check-In ---
const modal = document.getElementById('check-in-modal');
const modalRoomNumber = document.getElementById('modal-room-number');
const modalHabitacionId = document.getElementById('modal-habitacion-id');
const checkInForm = document.getElementById('check-in-form');

/**
 * Muestra el modal de check-in para una habitación específica.
 * @param {object} room - El objeto de la habitación seleccionada.
 */
export function openCheckInModal(room) {
    if (!modal) return;
    modalRoomNumber.textContent = `Habitación #${room.numero}`;
    modalHabitacionId.value = room.id;
    modal.classList.remove('hidden');
}

/**
 * Cierra el modal de check-in y resetea el formulario.
 */
export function closeCheckInModal() {
    if (!modal) return;
    checkInForm.reset();
    modal.classList.add('hidden');
}

// --- Funciones del Modal de Check-Out ---
const checkoutModal = document.getElementById('check-out-modal');
const checkoutRoomNumber = document.getElementById('checkout-room-number');
const checkoutGuestName = document.getElementById('checkout-guest-name');
const checkoutCheckinDate = document.getElementById('checkout-checkin-date');

/**
 * Muestra el modal de check-out para una habitación ocupada.
 * @param {object} room - El objeto de la habitación seleccionada.
 * @param {object} hospedaje - Los datos del hospedaje actual.
 */
export function openCheckOutModal(room, hospedaje) {
    if (!checkoutModal) return;
    checkoutRoomNumber.textContent = room.numero;
    checkoutGuestName.textContent = hospedaje.huesped.nombre;

    // Formatear fecha de entrada
    const fechaEntrada = new Date(hospedaje.fecha_entrada);
    checkoutCheckinDate.textContent = fechaEntrada.toLocaleDateString('es-ES');

    // Almacenar el ID de la habitación para usarlo después
    checkoutModal.dataset.roomId = room.id;

    checkoutModal.classList.remove('hidden');
}

/**
 * Cierra el modal de check-out.
 */
export function closeCheckOutModal() {
    if (!checkoutModal) return;
    checkoutModal.classList.add('hidden');
}
