/**
 * Sistema de Autenticación para Gestor HR v3.0
 * Refactorizado completamente para usar AppState centralizado
 */

const Auth = {
    /**
     * Realizar login con email y password
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Datos del usuario y token
     */
    async login(email, password) {
        try {
            console.log('🔐 Iniciando proceso de login...', email);

            const response = await fetch(Config.getApiUrl('auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: email, // FastAPI OAuth2 usa 'username'
                    password: password
                })
            });

            console.log('🌐 Respuesta del servidor:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error de autenticación');
            }

            const data = await response.json();
            console.log('✅ Token recibido del servidor');

            // Obtener datos del usuario actual
            const userData = await this.getCurrentUser(data.access_token);
            console.log('✅ Datos del usuario obtenidos:', userData.nombre || userData.email);

            return { token: data.access_token, user: userData };

        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    },

    /**
     * Obtener datos del usuario actual usando el token
     * @param {string} token - Token de autenticación
     * @returns {Promise<Object>} Datos del usuario
     */
    async getCurrentUser(token) {
        try {
            const response = await fetch(Config.getApiUrl('auth/test-token'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error obteniendo datos del usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            throw error;
        }
    },

    /**
     * Mostrar modal de login - VERSIÓN SIMPLIFICADA PARA LA NUEVA ESTRUCTURA
     */
    showLoginModal() {
        // Remover modal existente si existe
        const existingModal = document.getElementById('modal-login');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="modal-login" class="modal-overlay" style="display: flex;">
                <div class="modal-content modal-mediano">
                    <div class="modal-header">
                        <h3>🔐 Iniciar Sesión</h3>
                    </div>
                    <div class="modal-body">
                        <form id="form-login">
                            <div class="form-group">
                                <label for="login-email">Email:</label>
                                <input type="email" id="login-email" name="email" class="form-input" autocomplete="username" required>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Contraseña:</label>
                                <input type="password" id="login-password" name="password" class="form-input" autocomplete="current-password" required>
                            </div>
                            <div id="login-error" class="mensaje error oculto"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" id="btn-login" class="btn btn-primary">Iniciar Sesión</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar eventos del formulario
        this.setupLoginForm();

        // Focus al primer input
        setTimeout(() => {
            document.getElementById('login-email')?.focus();
        }, 100);
    },

    /**
     * Configurar eventos del formulario de login
     */
    setupLoginForm() {
        const form = document.getElementById('form-login');
        const submitBtn = document.getElementById('btn-login');
        const errorDiv = document.getElementById('login-error');

        if (!form || !submitBtn || !errorDiv) {
            console.error('❌ Elementos del modal de login no encontrados');
            return;
        }

        // Event handler para el submit del formulario
        const handleSubmit = async (e) => {
            e.preventDefault();
            console.log('🖱️ Formulario de login enviado');

            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');

            if (!email || !password) {
                this.showLoginError('Por favor complete todos los campos');
                return;
            }

            try {
                // Mostrar loading
                this.setLoginLoading(true);
                this.hideLoginError();

                // Realizar login usando el nuevo flujo del App
                const result = await Auth.login(email, password);

                console.log('✅ Login exitoso, cerrando modal...');

                // Cerrar modal INMEDIATAMENTE
                this.closeLoginModal();

                // Ahora el App maneja todo el resto desde App.handleLogin

            } catch (error) {
                console.error('❌ Error en login:', error);
                this.showLoginError(error.message);
                this.setLoginLoading(false);
            }
        };

        // Event handler para Enter en los inputs
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleSubmit(e);
            }
        };

        // Asignar eventos
        form.addEventListener('submit', handleSubmit);
        submitBtn.addEventListener('click', handleSubmit);

        document.getElementById('login-email').addEventListener('keypress', handleKeyPress);
        document.getElementById('login-password').addEventListener('keypress', handleKeyPress);

        console.log('✅ Event handlers del login configurados');
    },

    /**
     * Cerrar modal de login
     */
    closeLoginModal() {
        const modal = document.getElementById('modal-login');
        if (modal) {
            modal.remove();
            console.log('✅ Modal de login cerrado');
        }
    },

    /**
     * Mostrar error en el login
     */
    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('oculto');
        }
    },

    /**
     * Ocultar error del login
     */
    hideLoginError() {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.classList.add('oculto');
        }
    },

    /**
     * Mostrar/ocultar estado de carga en el login
     */
    setLoginLoading(loading) {
        const submitBtn = document.getElementById('btn-login');
        if (submitBtn) {
            if (loading) {
                submitBtn.textContent = 'Iniciando sesión...';
                submitBtn.disabled = true;
            } else {
                submitBtn.textContent = 'Iniciar Sesión';
                submitBtn.disabled = false;
            }
        }
    },

    /**
     * Crear usuario admin de prueba (solo para desarrollo)
     */
    async crearAdmin(email = 'admin@test.com', password = 'admin123', nombre = 'Administrador') {
        try {
            const response = await fetch(Config.getApiUrl('usuarios/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    nombre: nombre,
                    rol: 'admin'
                })
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Admin creado:', userData);
                return userData;
            } else {
                console.log('Admin ya existe o error creando');
                return null;
            }
        } catch (error) {
            console.error('Error creando admin:', error);
            return null;
        }
    },

    /**
     * Verificar autenticación al cargar la página
     * Muestra modal de login si no está autenticado
     */
    checkAuthOnLoad() {
        console.log('🔍 Verificando autenticación al cargar...');

        const token = localStorage.getItem('authToken');

        if (!token) {
            console.log('❌ No hay token, mostrando modal de login');
            this.showLoginModal();
            return false;
        }

        console.log('✅ Token encontrado, usuario autenticado');
        return true;
    },

    /**
     * Mostrar modal de login
     */
    showLoginModal() {
        const modal = document.getElementById('modal-login');
        if (modal) {
            modal.style.display = 'flex';
            console.log('👁️ Modal de login mostrado');
        } else {
            console.error('❌ Modal de login no encontrado en DOM');
        }
    },

    /**
     * Ocultar modal de login
     */
    hideLoginModal() {
        const modal = document.getElementById('modal-login');
        if (modal) {
            modal.style.display = 'none';
            console.log('🙈 Modal de login ocultado');
        }
    }
};

// Exportar Auth globalmente
window.Auth = Auth;
