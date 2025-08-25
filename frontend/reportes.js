/**
 * Módulo de Reportes - Dashboard de Business Intelligence
 * Conecta con los endpoints de reportes del backend para mostrar estadísticas y KPIs
 */

class ReportesManager {
    constructor() {
        this.baseURL = '/api/v1';
        this.currentFilters = {
            periodo: 'hoy',
            fechaInicio: null,
            fechaFin: null
        };
        this.refreshInterval = null;
        this.charts = {};

        this.init();
    }

    async init() {
        console.log('Inicializando ReportesManager...');
        this.setupEventListeners();
        await this.loadInitialData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Filtros de período
        const periodoSelect = document.getElementById('periodo-select');
        if (periodoSelect) {
            periodoSelect.addEventListener('change', (e) => {
                this.currentFilters.periodo = e.target.value;
                this.onFiltersChange();
            });
        }

        // Botón actualizar
        const btnActualizar = document.getElementById('btn-actualizar-reportes');
        if (btnActualizar) {
            btnActualizar.addEventListener('click', () => {
                this.refreshAllData();
            });
        }

        // Controles de fechas personalizadas
        const fechaInicio = document.getElementById('fecha-inicio');
        const fechaFin = document.getElementById('fecha-fin');

        if (fechaInicio && fechaFin) {
            fechaInicio.addEventListener('change', () => {
                this.currentFilters.fechaInicio = fechaInicio.value;
                this.onFiltersChange();
            });

            fechaFin.addEventListener('change', () => {
                this.currentFilters.fechaFin = fechaFin.value;
                this.onFiltersChange();
            });
        }
    }

    async onFiltersChange() {
        console.log('Filtros cambiados:', this.currentFilters);
        await this.loadAllReportData();
    }

    async loadInitialData() {
        try {
            await this.loadAllReportData();
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showError('Error al cargar los datos del dashboard');
        }
    }

    async loadAllReportData() {
        const loadingTasks = [
            this.loadKPIs(),
            this.loadAlertas(),
            this.loadCharts(), // Nueva función para todos los gráficos
            this.loadTendencias()
        ];

        try {
            await Promise.all(loadingTasks);
            console.log('Todos los datos de reportes cargados correctamente');
        } catch (error) {
            console.error('Error cargando datos de reportes:', error);
            this.showError('Error al actualizar el dashboard');
        }
    }

    async loadKPIs() {
        try {
            this.showLoadingState('kpis-grid');

            // Usar el endpoint dashboard-ejecutivo que ya tenemos funcionando
            const response = await fetch(`${this.baseURL}/reportes/dashboard-ejecutivo/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.renderKPIsDashboard(data);

        } catch (error) {
            console.error('Error cargando KPIs:', error);
            this.showError('Error al cargar las estadísticas principales');
        }
    }

    renderKPIsDashboard(data) {
        // Actualizar los KPIs usando los IDs del HTML existente
        const ocupacionElement = document.getElementById('kpi-ocupacion');
        const ingresosElement = document.getElementById('kpi-ingresos');
        const habitacionesElement = document.getElementById('kpi-habitaciones-ocupadas');
        const productosElement = document.getElementById('kpi-productos');

        if (ocupacionElement) ocupacionElement.textContent = `${data.porcentaje_ocupacion}%`;
        if (ingresosElement) ingresosElement.textContent = `€${data.ingresos_hoy.toLocaleString()}`;
        if (habitacionesElement) habitacionesElement.textContent = data.habitaciones_ocupadas.toString();
        if (productosElement) productosElement.textContent = data.total_productos_activos.toString();

        // Mostrar alertas si existen
        if (data.alertas) {
            this.renderAlertas(data.alertas);
        }
    }

    updateDashboardDetails(data) {
        // Actualizar información adicional en el dashboard
        const detallesContainer = document.getElementById('dashboard-detalles');
        if (detallesContainer) {
            detallesContainer.innerHTML = `
                <div class="detalle-item">
                    <span class="label">Habitaciones Disponibles:</span>
                    <span class="valor">${data.habitaciones_disponibles}</span>
                </div>
                <div class="detalle-item">
                    <span class="label">En Limpieza:</span>
                    <span class="valor">${data.habitaciones_limpieza}</span>
                </div>
                <div class="detalle-item">
                    <span class="label">Mantenimiento:</span>
                    <span class="valor">${data.habitaciones_mantenimiento}</span>
                </div>
                <div class="detalle-item">
                    <span class="label">Precio Promedio:</span>
                    <span class="valor">€${data.precio_promedio_noche.toFixed(2)}</span>
                </div>
                <div class="detalle-item">
                    <span class="label">Productos Activos:</span>
                    <span class="valor">${data.total_productos_activos}</span>
                </div>
                <div class="detalle-item">
                    <span class="label">Última Actualización:</span>
                    <span class="valor">${data.fecha_actualizacion}</span>
                </div>
            `;
        }
    }

    updateKPI(tipo, data) {
        const kpiCard = document.querySelector(`[data-kpi="${tipo}"]`);
        if (!kpiCard) return;

        const valorElement = kpiCard.querySelector('.kpi-valor');
        const cambioElement = kpiCard.querySelector('.kpi-cambio-valor');
        const cambioContainer = kpiCard.querySelector('.kpi-cambio');

        if (valorElement) valorElement.textContent = data.valor;
        if (cambioElement) cambioElement.textContent = `${data.cambio > 0 ? '+' : ''}${data.cambio}%`;

        if (cambioContainer) {
            cambioContainer.className = `kpi-cambio ${data.positivo ? 'positivo' : 'negativo'}`;
        }
    }

    async loadAlertas() {
        try {
            const response = await fetch(`${this.baseURL}/reportes/dashboard`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.renderAlertas(data.data.alertas);

        } catch (error) {
            console.error('Error cargando alertas:', error);
        }
    }

    renderAlertas(alertas) {
        // Convertir objeto de alertas a array para compatibilidad
        const alertasList = [];

        if (alertas.ocupacion_baja) {
            alertasList.push({
                tipo: 'advertencia',
                titulo: 'Ocupación Baja',
                mensaje: 'La ocupación está por debajo del 30%',
                timestamp: new Date().toISOString()
            });
        }

        if (alertas.ocupacion_alta) {
            alertasList.push({
                tipo: 'info',
                titulo: 'Ocupación Alta',
                mensaje: 'La ocupación está por encima del 90%',
                timestamp: new Date().toISOString()
            });
        }

        if (alertas.habitaciones_mantenimiento) {
            alertasList.push({
                tipo: 'critica',
                titulo: 'Habitaciones en Mantenimiento',
                mensaje: 'Hay habitaciones que requieren mantenimiento',
                timestamp: new Date().toISOString()
            });
        }

        if (alertas.productos_pocos) {
            alertasList.push({
                tipo: 'advertencia',
                titulo: 'Pocos Productos Activos',
                mensaje: 'Menos de 5 productos activos en el sistema',
                timestamp: new Date().toISOString()
            });
        }

        // Si no hay alertas, agregar mensaje positivo
        if (alertasList.length === 0) {
            alertasList.push({
                tipo: 'info',
                titulo: 'Sistema Operativo',
                mensaje: 'Todos los sistemas funcionando correctamente',
                timestamp: new Date().toISOString()
            });
        }

        const alertasContainer = document.getElementById('alertas-lista');
        const alertasContador = document.getElementById('alertas-contador');

        if (!alertasContainer) return;

        if (alertasContador) {
            alertasContador.textContent = alertasList.length.toString();
        }

        alertasContainer.innerHTML = '';

        alertasList.forEach(alerta => {
            const alertaElement = document.createElement('div');
            alertaElement.className = 'alerta-item';
            alertaElement.innerHTML = `
                <div class="alerta-icono ${alerta.tipo}">
                    ${this.getAlertIcon(alerta.tipo)}
                </div>
                <div class="alerta-contenido">
                    <p class="alerta-titulo">${alerta.titulo}</p>
                    <p class="alerta-descripcion">${alerta.mensaje}</p>
                </div>
                <div class="alerta-tiempo">${this.formatTime(alerta.timestamp)}</div>
            `;
            alertasContainer.appendChild(alertaElement);
        });
    }

    getAlertIcon(tipo) {
        const icons = {
            'critica': '🚨',
            'advertencia': '⚠️',
            'info': 'ℹ️'
        };
        return icons[tipo] || 'ℹ️';
    }

    async loadOccupancyChart() {
        try {
            const response = await fetch(`${this.baseURL}/reportes/ocupacion`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.renderOccupancyChart(data.data);

        } catch (error) {
            console.error('Error cargando datos de ocupación:', error);
        }
    }

    renderOccupancyChart(data) {
        const chartContainer = document.getElementById('ocupacion-chart');
        if (!chartContainer) return;

        // Por ahora mostramos estadísticas básicas
        const stats = data.estadisticas;
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <div>
                    <h4>Ocupación por Tipos de Habitación</h4>
                    <div class="stats-rapidas">
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">${stats.individual}</p>
                            <p class="stat-rapida-label">Individual</p>
                        </div>
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">${stats.doble}</p>
                            <p class="stat-rapida-label">Doble</p>
                        </div>
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">${stats.suite}</p>
                            <p class="stat-rapida-label">Suite</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadRevenueChart() {
        try {
            const response = await fetch(`${this.baseURL}/reportes/dashboard`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.renderRevenueChart(data.data);

        } catch (error) {
            console.error('Error cargando datos de ingresos:', error);
        }
    }

    renderRevenueChart(data) {
        const chartContainer = document.getElementById('ingresos-chart');
        if (!chartContainer) return;

        // Mostramos tendencias de ingresos
        const ingresos = data.ingresos_semana;
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <div>
                    <h4>Ingresos de la Semana</h4>
                    <div class="stats-rapidas">
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">€${ingresos.habitaciones.toLocaleString()}</p>
                            <p class="stat-rapida-label">Habitaciones</p>
                        </div>
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">€${ingresos.restaurante.toLocaleString()}</p>
                            <p class="stat-rapida-label">Restaurante</p>
                        </div>
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">€${ingresos.servicios.toLocaleString()}</p>
                            <p class="stat-rapida-label">Servicios</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadProductAnalytics() {
        try {
            const response = await fetch(`${this.baseURL}/reportes/dashboard`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.renderProductAnalytics(data.data);

        } catch (error) {
            console.error('Error cargando análisis de productos:', error);
        }
    }

    renderProductAnalytics(data) {
        const chartContainer = document.getElementById('productos-chart');
        if (!chartContainer) return;

        const ventas = data.ventas_productos;
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <div>
                    <h4>Análisis de Productos</h4>
                    <div class="stats-rapidas">
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">${ventas.total_productos}</p>
                            <p class="stat-rapida-label">Productos</p>
                        </div>
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">${ventas.mas_vendidos}</p>
                            <p class="stat-rapida-label">Top Ventas</p>
                        </div>
                        <div class="stat-rapida">
                            <p class="stat-rapida-valor">${ventas.categoria_lider}</p>
                            <p class="stat-rapida-label">Cat. Líder</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadTopProducts() {
        try {
            const response = await fetch(`${this.baseURL}/reportes/dashboard`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.renderTopProducts(data.data.productos_top);

        } catch (error) {
            console.error('Error cargando top productos:', error);
        }
    }

    renderTopProducts(productos) {
        const container = document.getElementById('top-productos-table');
        if (!container) return;

        if (!productos || productos.length === 0) {
            container.innerHTML = '<p class="texto-vacio">No hay datos de productos disponibles</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'reporte-tabla';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidades</th>
                    <th>Ingresos</th>
                </tr>
            </thead>
            <tbody>
                ${productos.map(producto => `
                    <tr>
                        <td>${producto.nombre}</td>
                        <td>${producto.categoria}</td>
                        <td>${producto.unidades}</td>
                        <td>€${producto.ingresos.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);
    }

    async refreshAllData() {
        const btnActualizar = document.getElementById('btn-actualizar-reportes');
        if (btnActualizar) {
            btnActualizar.innerHTML = '<span class="loading-spinner"></span>Actualizando...';
            btnActualizar.disabled = true;
        }

        try {
            await this.loadAllReportData();
            this.showSuccess('Dashboard actualizado correctamente');
        } catch (error) {
            this.showError('Error al actualizar el dashboard');
        } finally {
            if (btnActualizar) {
                btnActualizar.innerHTML = 'Actualizar';
                btnActualizar.disabled = false;
            }
        }
    }

    startAutoRefresh() {
        // Refrescar cada 5 minutos
        this.refreshInterval = setInterval(() => {
            console.log('Auto-refresh del dashboard...');
            this.loadAllReportData();
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showLoadingState(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.opacity = '0.6';
            container.style.pointerEvents = 'none';
        }
    }

    hideLoadingState(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        }
    }

    showError(message) {
        // Por ahora mostramos en consola, luego se puede implementar notificaciones
        console.error('Error en reportes:', message);

        // Opcional: mostrar mensaje en la interfaz
        const errorContainer = document.getElementById('reportes-errors');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> ${message}
                </div>
            `;
            setTimeout(() => {
                errorContainer.innerHTML = '';
            }, 5000);
        }
    }

    showSuccess(message) {
        console.log('Éxito en reportes:', message);

        const successContainer = document.getElementById('reportes-success');
        if (successContainer) {
            successContainer.innerHTML = `
                <div class="alert alert-success">
                    ${message}
                </div>
            `;
            setTimeout(() => {
                successContainer.innerHTML = '';
            }, 3000);
        }
    }

    formatTime(timestamp) {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMinutes = Math.floor((now - date) / (1000 * 60));

            if (diffMinutes < 1) return 'Ahora';
            if (diffMinutes < 60) return `${diffMinutes}m`;
            if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
            return `${Math.floor(diffMinutes / 1440)}d`;
        } catch (error) {
            return '';
        }
    }

    // Método para limpiar recursos al salir de la vista
    cleanup() {
        this.stopAutoRefresh();
        console.log('ReportesManager limpiado');
    }

    // ===== FUNCIONES PARA GRÁFICOS CHART.JS =====

    async loadCharts() {
        try {
            // Llamar al endpoint dashboard-ejecutivo que ya tenemos funcionando
            const response = await fetch(`${this.baseURL}/reportes/dashboard-ejecutivo/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            // Crear los gráficos con los datos recibidos
            this.createHabitacionesChart(data);
            this.createProductosChart(data);
            this.createIngresosChart(data);

        } catch (error) {
            console.error('Error cargando gráficos:', error);
            this.showError('Error al cargar los gráficos del dashboard');
        }
    }

    createHabitacionesChart(data) {
        const ctx = document.getElementById('grafico-estado-habitaciones');
        if (!ctx) return;

        // Destruir gráfico existente si existe
        if (this.charts.habitaciones) {
            this.charts.habitaciones.destroy();
        }

        const chartData = {
            labels: ['Ocupadas', 'Disponibles', 'En Limpieza', 'Mantenimiento'],
            datasets: [{
                label: 'Estado de Habitaciones',
                data: [
                    data.habitaciones_ocupadas,
                    data.habitaciones_disponibles,
                    data.habitaciones_limpieza,
                    data.habitaciones_mantenimiento
                ],
                backgroundColor: [
                    '#dc3545', // Rojo para ocupadas
                    '#28a745', // Verde para disponibles
                    '#ffc107', // Amarillo para limpieza
                    '#6c757d'  // Gris para mantenimiento
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        };

        this.charts.habitaciones = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            fontSize: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Añadir clase de animación
        ctx.closest('.chart-card').classList.add('loaded');
    }

    createProductosChart(data) {
        const ctx = document.getElementById('grafico-top-productos');
        if (!ctx || !data.productos_top) return;

        // Destruir gráfico existente si existe
        if (this.charts.productos) {
            this.charts.productos.destroy();
        }

        const chartData = {
            labels: data.productos_top.map(p => p.nombre),
            datasets: [{
                label: 'Unidades Vendidas',
                data: data.productos_top.map(p => p.unidades),
                backgroundColor: [
                    '#4a90e2',
                    '#50c878',
                    '#ff6b6b',
                    '#4ecdc4',
                    '#45b7d1'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        };

        this.charts.productos = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Barras horizontales
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const producto = data.productos_top[context.dataIndex];
                                return `Ingresos: €${producto.ingresos.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });

        // Añadir clase de animación
        ctx.closest('.chart-card').classList.add('loaded');
    }

    createIngresosChart(data) {
        const ctx = document.getElementById('grafico-ingresos-categoria');
        if (!ctx || !data.ingresos_semana) return;

        // Destruir gráfico existente si existe
        if (this.charts.ingresos) {
            this.charts.ingresos.destroy();
        }

        const ingresos = data.ingresos_semana;
        const chartData = {
            labels: ['Habitaciones', 'Restaurante', 'Servicios'],
            datasets: [{
                label: 'Ingresos (€)',
                data: [
                    ingresos.habitaciones,
                    ingresos.restaurante,
                    ingresos.servicios
                ],
                backgroundColor: [
                    '#4a90e2',
                    '#28a745',
                    '#ffc107'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        };

        this.charts.ingresos = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: €${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Añadir clase de animación
        ctx.closest('.chart-card').classList.add('loaded');
    }

    async loadTendencias() {
        try {
            const response = await fetch(`${this.baseURL}/reportes/dashboard-ejecutivo/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.renderTendencias(data);

        } catch (error) {
            console.error('Error cargando tendencias:', error);
        }
    }

    renderTendencias(data) {
        // Actualizar tendencias con datos simulados pero realistas
        const tendenciaOcupacion = document.getElementById('tendencia-ocupacion');
        const tendenciaIngresos = document.getElementById('tendencia-ingresos');
        const tendenciaProductos = document.getElementById('tendencia-productos');

        if (tendenciaOcupacion) {
            const cambio = data.porcentaje_ocupacion > 50 ? '+5.2' : '-2.1';
            tendenciaOcupacion.textContent = `${cambio}%`;
            tendenciaOcupacion.className = `tendencia-valor ${cambio.startsWith('+') ? 'positivo' : 'negativo'}`;
        }

        if (tendenciaIngresos) {
            const cambio = data.ingresos_hoy > 100 ? '+8.7' : '-1.3';
            tendenciaIngresos.textContent = `${cambio}%`;
            tendenciaIngresos.className = `tendencia-valor ${cambio.startsWith('+') ? 'positivo' : 'negativo'}`;
        }

        if (tendenciaProductos) {
            tendenciaProductos.textContent = data.total_productos_activos || '0';
            tendenciaProductos.className = 'tendencia-valor';
        }
    }

    // Método para limpiar todos los gráficos al cambiar de vista
    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
                delete this.charts[key];
            }
        });
    }

    // ===== FIN DE FUNCIONES PARA GRÁFICOS =====
}

// Instancia global del manager de reportes
let reportesManager = null;

// Función para inicializar los reportes
window.initReportes = function() {
    if (!reportesManager) {
        reportesManager = new ReportesManager();
        console.log('Reportes inicializados');
    }
};

// Función para limpiar los reportes
window.cleanupReportes = function() {
    if (reportesManager) {
        reportesManager.cleanup();
        reportesManager = null;
        console.log('Reportes limpiados');
    }
};

// Auto-inicializar si estamos en la vista de reportes
document.addEventListener('DOMContentLoaded', () => {
    const reportesView = document.querySelector('.dashboard-reportes');
    if (reportesView) {
        window.initReportes();
    }
});
