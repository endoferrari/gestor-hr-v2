// /frontend/main.js
import { registerUser } from './api.js';
import { showMessage } from './ui.js';

// Nos aseguramos de que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (event) => {
            // Prevenimos que el formulario se envíe de la forma tradicional
            event.preventDefault();

            const name = event.target.name.value;
            const email = event.target.email.value;
            const password = event.target.password.value;

            try {
                const newUser = await registerUser(name, email, password);
                showMessage(`Usuario '${newUser.email}' creado con éxito.`, 'success');
                registrationForm.reset(); // Limpiamos el formulario
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
});
