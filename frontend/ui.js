/**
 * Módulo UI para Gestor HR v3.0
 * Maneja utilidades de interfaz de usuario
 */

const UI = {
    /**
     * Mostrar mensaje temporal
     * @param {string} mensaje - Texto del mensaje
     * @param {string} tipo - Tipo: 'exito', 'error', 'advertencia', 'info'
     * @param {number} duracion - Duración en ms (default: 3000)
     */
    mostrarMensaje(mensaje, tipo = 'info', duracion = 3000) {
        const contenedor = document.getElementById('mensajes-container');
        if (!contenedor) {
            console.warn('Contenedor de mensajes no encontrado, usando alert');
            alert(mensaje);
            return;
        }

        const mensajeElement = document.createElement('div');
        mensajeElement.className = `mensaje mensaje-${tipo}`;
        mensajeElement.textContent = mensaje;

        // Agregar icono según tipo
        const icono = this.obtenerIconoMensaje(tipo);
        mensajeElement.innerHTML = `${icono} ${mensaje}`;

        contenedor.appendChild(mensajeElement);

        // Auto-eliminar después de la duración especificada
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.classList.add('fade-out');
                setTimeout(() => {
                    mensajeElement.remove();
                }, 300);
            }
        }, duracion);

        // Eliminar al hacer clic
        mensajeElement.addEventListener('click', () => {
            mensajeElement.remove();
        });
    },

    /**
     * Obtener icono para mensaje según tipo
     */
    obtenerIconoMensaje(tipo) {
        const iconos = {
            exito: '✅',
            error: '❌',
            advertencia: '⚠️',
            info: 'ℹ️'
        };
        return iconos[tipo] || iconos.info;
    },

    /**
     * Mostrar modal de confirmación
     * @param {string} mensaje - Mensaje de confirmación
     * @param {string} titulo - Título del modal
     * @returns {Promise<boolean>} True si confirma, false si cancela
     */
    async confirmar(mensaje, titulo = 'Confirmar') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-confirmacion">
                    <div class="modal-header">
                        <h3>${titulo}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${mensaje}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-cancelar">Cancelar</button>
                        <button type="button" class="btn btn-confirmar">Confirmar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Manejar respuestas
            modal.querySelector('.btn-confirmar').onclick = () => {
                modal.remove();
                resolve(true);
            };

            modal.querySelector('.btn-cancelar').onclick = () => {
                modal.remove();
                resolve(false);
            };

            // Cerrar con ESC o clic fuera
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            };

            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escHandler);
                    modal.remove();
                    resolve(false);
                }
            });
        });
    },

    /**
     * Mostrar spinner de carga
     * @param {string} mensaje - Mensaje opcional
     * @returns {Function} Función para ocultar el spinner
     */
    mostrarCarga(mensaje = 'Cargando...') {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = `
            <div class="spinner-content">
                <div class="spinner"></div>
                <p>${mensaje}</p>
            </div>
        `;

        document.body.appendChild(spinner);

        return () => {
            if (spinner.parentNode) {
                spinner.remove();
            }
        };
    },

    /**
     * Formatear moneda
     * @param {number} cantidad - Cantidad a formatear
     * @param {string} moneda - Código de moneda (default: 'EUR')
     * @returns {string} Cantidad formateada
     */
    formatearMoneda(cantidad, moneda = 'EUR') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: moneda
        }).format(cantidad);
    },

    /**
     * Formatear fecha
     * @param {Date|string} fecha - Fecha a formatear
     * @param {Object} opciones - Opciones de formato
     * @returns {string} Fecha formateada
     */
    formatearFecha(fecha, opciones = {}) {
        const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);

        const opcionesDefault = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            ...opciones
        };

        return fechaObj.toLocaleDateString('es-ES', opcionesDefault);
    },

    /**
     * Formatear fecha y hora
     * @param {Date|string} fecha - Fecha a formatear
     * @returns {string} Fecha y hora formateada
     */
    formatearFechaHora(fecha) {
        const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);

        return fechaObj.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Capitalizar primera letra
     * @param {string} texto - Texto a capitalizar
     * @returns {string} Texto capitalizado
     */
    capitalize(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    },

    /**
     * Truncar texto
     * @param {string} texto - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @returns {string} Texto truncado
     */
    truncarTexto(texto, maxLength) {
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength - 3) + '...';
    },

    /**
     * Validar email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Validar teléfono
     * @param {string} telefono - Teléfono a validar
     * @returns {boolean} True si es válido
     */
    validarTelefono(telefono) {
        const regex = /^(\+34|0034|34)?[6-9][0-9]{8}$/;
        return regex.test(telefono.replace(/\s/g, ''));
    },

    /**
     * Generar color aleatorio para avatares
     * @param {string} texto - Texto base para generar color consistente
     * @returns {string} Color hex
     */
    generarColorAvatar(texto) {
        let hash = 0;
        for (let i = 0; i < texto.length; i++) {
            hash = texto.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colores = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
            '#00D2D3', '#FF9F43', '#10AC84', '#EE5A24'
        ];

        return colores[Math.abs(hash) % colores.length];
    },

    /**
     * Crear avatar con iniciales
     * @param {string} nombre - Nombre completo
     * @param {number} size - Tamaño en pixels
     * @returns {string} HTML del avatar
     */
    crearAvatar(nombre, size = 40) {
        const iniciales = nombre
            .split(' ')
            .map(palabra => palabra.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);

        const color = this.generarColorAvatar(nombre);

        return `
            <div class="avatar" style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                color: white;
                font-weight: bold;
                font-size: ${size * 0.4}px;
            ">
                ${iniciales}
            </div>
        `;
    },

    /**
     * Animar elemento con clase CSS
     * @param {HTMLElement} elemento - Elemento a animar
     * @param {string} animacion - Nombre de la clase de animación
     * @param {number} duracion - Duración en ms
     */
    animar(elemento, animacion, duracion = 500) {
        return new Promise((resolve) => {
            elemento.classList.add(animacion);

            setTimeout(() => {
                elemento.classList.remove(animacion);
                resolve();
            }, duracion);
        });
    },

    /**
     * Copiar texto al portapapeles
     * @param {string} texto - Texto a copiar
     * @returns {Promise<boolean>} True si se copió exitosamente
     */
    async copiarAlPortapapeles(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            this.mostrarMensaje('Texto copiado al portapapeles', 'exito');
            return true;
        } catch (error) {
            console.error('Error copiando al portapapeles:', error);
            this.mostrarMensaje('Error copiando al portapapeles', 'error');
            return false;
        }
    },

    /**
     * Debounce para funciones
     * @param {Function} func - Función a debounce
     * @param {number} delay - Delay en ms
     * @returns {Function} Función debounceda
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle para funciones
     * @param {Function} func - Función a throttle
     * @param {number} delay - Delay en ms
     * @returns {Function} Función throttleada
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },

    /**
     * Generar ID único
     * @returns {string} ID único
     */
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Scrollear a elemento suavemente
     * @param {HTMLElement|string} elemento - Elemento o selector
     * @param {Object} opciones - Opciones de scroll
     */
    scrollTo(elemento, opciones = {}) {
        const target = typeof elemento === 'string'
            ? document.querySelector(elemento)
            : elemento;

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                ...opciones
            });
        }
    },

    /**
     * Actualizar título de página
     * @param {string} titulo - Nuevo título
     */
    actualizarTitulo(titulo) {
        document.title = `${titulo} - ${Config.APP_NAME}`;
    },

    /**
     * Crear elemento con atributos
     * @param {string} tag - Tag del elemento
     * @param {Object} atributos - Atributos y propiedades
     * @param {string} contenido - Contenido HTML interno
     * @returns {HTMLElement} Elemento creado
     */
    createElement(tag, atributos = {}, contenido = '') {
        const elemento = document.createElement(tag);

        Object.keys(atributos).forEach(key => {
            if (key === 'className') {
                elemento.className = atributos[key];
            } else if (key === 'innerHTML') {
                elemento.innerHTML = atributos[key];
            } else if (key === 'textContent') {
                elemento.textContent = atributos[key];
            } else if (key.startsWith('data-')) {
                elemento.setAttribute(key, atributos[key]);
            } else {
                elemento[key] = atributos[key];
            }
        });

        if (contenido) {
            elemento.innerHTML = contenido;
        }

        return elemento;
    }
};

// Utilidades específicas del hotel
const HotelUI = {
    /**
     * Obtener clase CSS para estado de habitación
     */
    getClaseEstadoHabitacion(estado) {
        const clases = {
            'disponible': 'habitacion-disponible',
            'ocupada': 'habitacion-ocupada',
            'mantenimiento': 'habitacion-mantenimiento',
            'limpieza': 'habitacion-limpieza',
            'reservada': 'habitacion-reservada'
        };
        return clases[estado] || 'habitacion-disponible';
    },

    /**
     * Obtener emoji para estado de habitación
     */
    getEmojiEstadoHabitacion(estado) {
        const emojis = {
            'disponible': '🟢',
            'ocupada': '🔴',
            'mantenimiento': '🔧',
            'limpieza': '🧽',
            'reservada': '🟡'
        };
        return emojis[estado] || '🟢';
    },

    /**
     * Obtener color para tipo de habitación
     */
    getColorTipoHabitacion(tipo) {
        const colores = {
            'individual': '#4ECDC4',
            'doble': '#45B7D1',
            'suite': '#FF6B6B',
            'familiar': '#96CEB4'
        };
        return colores[tipo] || '#45B7D1';
    },

    /**
     * Crear badge de estado
     */
    crearBadgeEstado(estado) {
        const emoji = this.getEmojiEstadoHabitacion(estado);
        const clase = this.getClaseEstadoHabitacion(estado);

        return `<span class="badge ${clase}">${emoji} ${UI.capitalize(estado)}</span>`;
    }
};
