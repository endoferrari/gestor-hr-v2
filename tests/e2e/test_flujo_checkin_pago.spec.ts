import { test, expect } from '@playwright/test';

// --- Helper para no repetir el login en cada test ---
async function realizarLogin(page: any, email: string, password: string) {
    console.log(`🔐 Iniciando login con ${email}...`);
    await page.goto('http://localhost:8000/frontend/index.html');

    // Esperar a que aparezca el modal de login
    await page.waitForSelector('#modal-login', { timeout: 15000 });
    console.log('✅ Modal de login aparecido');

    // Llenar credenciales con los IDs correctos
    await page.fill('#login-email', email);
    await page.fill('#login-password', password);
    console.log('📝 Credenciales completadas');

    // Hacer clic en el botón de login con ID específico
    await page.click('#btn-login');
    console.log('🖱️ Botón de login presionado');

    // Esperar a que el modal de login desaparezca
    await page.waitForSelector('#modal-login', { state: 'hidden', timeout: 15000 });
    console.log('✅ Login completado - Modal de login cerrado');

    // Esperar un poco para que se carguen los datos
    await page.waitForTimeout(2000);
}

test.describe('Diagnóstico: Problema de Habitaciones No Visibles', () => {
    test('debería cargar y mostrar habitaciones después del login', async ({ page }) => {
        // --- 1. LOGIN CON ADMIN ---
        await realizarLogin(page, 'admin@test.com', 'admin123');

        // --- 2. VERIFICAR QUE LA VISTA DE RECEPCIÓN ES VISIBLE ---
        console.log('🏠 Verificando vista de recepción...');
        const vistaRecepcion = page.locator('#vista-recepcion');
        await expect(vistaRecepcion).toBeVisible({ timeout: 10000 });
        console.log('✅ Vista de recepción visible');

        // --- 3. VERIFICAR QUE EL CONTENEDOR DEL MAPA EXISTE ---
        const mapaContainer = page.locator('#mapa-habitaciones-grid');
        await expect(mapaContainer).toBeVisible({ timeout: 10000 });
        console.log('✅ Contenedor del mapa visible');

        // --- 4. VERIFICAR QUE HAY HABITACIONES CARGADAS ---
        // Buscar elementos con clase habitacion-card
        const habitaciones = page.locator('.habitacion-card');
        const countHabitaciones = await habitaciones.count();

        console.log(`📊 Número de habitaciones encontradas: ${countHabitaciones}`);

        if (countHabitaciones === 0) {
            // Problema diagnosticado: No se están cargando las habitaciones
            console.log('❌ PROBLEMA DIAGNOSTICADO: No se están cargando las habitaciones');

            // Verificar si hay mensaje de error o de carga
            const contenidoMapa = await mapaContainer.textContent();
            console.log('📝 Contenido actual del mapa:', contenidoMapa);

            // Verificar en la consola del navegador si hay errores JS
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log('🐛 Error en consola del navegador:', msg.text());
                }
            });

            // Recargar y esperar más tiempo
            await page.reload();
            await page.waitForTimeout(5000);

            const habitacionesSegundoIntento = page.locator('.habitacion-card');
            const countSegundoIntento = await habitacionesSegundoIntento.count();
            console.log(`📊 Segundo intento - Habitaciones: ${countSegundoIntento}`);

        } else {
            console.log('✅ Habitaciones cargadas correctamente');

            // Verificar que hay habitaciones disponibles para seleccionar
            const habitacionesDisponibles = page.locator('.habitacion-card.estado-disponible');
            const countDisponibles = await habitacionesDisponibles.count();
            console.log(`🟢 Habitaciones disponibles: ${countDisponibles}`);

            expect(countDisponibles).toBeGreaterThan(0);
        }

        // Tomar screenshot para diagnóstico
        await page.screenshot({ path: 'test-results/diagnostico-habitaciones.png', fullPage: true });
    });

    test('debería verificar que la API de habitaciones funciona', async ({ request }) => {
        // Probar directamente la API sin interfaz
        const response = await request.get('http://localhost:8000/api/v1/habitaciones/');

        expect(response.ok()).toBeTruthy();
        const habitaciones = await response.json();

        console.log(`📊 API devuelve ${habitaciones.length} habitaciones`);
        expect(habitaciones.length).toBeGreaterThan(0);

        // Verificar estructura de datos
        const primeraHabitacion = habitaciones[0];
        expect(primeraHabitacion).toHaveProperty('numero');
        expect(primeraHabitacion).toHaveProperty('tipo');
        expect(primeraHabitacion).toHaveProperty('estado');
        expect(primeraHabitacion).toHaveProperty('precio_noche');

        console.log('✅ API de habitaciones funciona correctamente');
        console.log('📋 Ejemplo de habitación:', JSON.stringify(primeraHabitacion, null, 2));
    });
});

test.describe('Flujo Completo: Check-in y Pago', () => {
    test('debe permitir a un cajero realizar un check-in y procesar el pago', async ({ page }) => {
        // --- 1. LOGIN ---
        await realizarLogin(page, 'cajero1@test.com', 'password123');

        // --- 2. SELECCIÓN DE HABITACIÓN ---
        console.log('🏠 Buscando habitación disponible...');
        const mapaHabitaciones = page.locator('#mapa-habitaciones-grid');
        await expect(mapaHabitaciones).toBeVisible();

        // Buscar habitación disponible
        const habitacionDisponible = page.locator('.habitacion-card.estado-disponible').first();

        // Si no hay habitaciones disponibles, fallar con mensaje claro
        const countDisponibles = await page.locator('.habitacion-card.estado-disponible').count();
        if (countDisponibles === 0) {
            console.log('❌ No se encontraron habitaciones disponibles para el test');
            await page.screenshot({ path: 'test-results/sin-habitaciones-disponibles.png', fullPage: true });

            // Mostrar el contenido actual del mapa para diagnóstico
            const contenidoMapa = await mapaHabitaciones.textContent();
            console.log('📝 Contenido del mapa:', contenidoMapa);

            throw new Error('No hay habitaciones disponibles para realizar el test de check-in');
        }

        await expect(habitacionDisponible).toBeVisible();
        const numeroHabitacion = await habitacionDisponible.locator('.habitacion-numero').textContent();
        console.log(`✅ Seleccionando habitación ${numeroHabitacion}...`);

        await habitacionDisponible.click();

        // --- 3. VERIFICAR QUE SE ABRE EL MODAL DE CHECK-IN ---
        const modalOperacion = page.locator('#modal-operacion-habitacion');
        await expect(modalOperacion).toBeVisible({ timeout: 10000 });
        console.log('✅ Modal de operación abierto');

        // Verificar que tiene el título correcto
        const tituloModal = modalOperacion.locator('.modal-header h2');
        await expect(tituloModal).toContainText('Check-in');
        console.log('✅ Modal configurado para check-in');

        // --- 4. LLENAR DATOS DEL CLIENTE ---
        await modalOperacion.locator('#checkin-nombre-cliente').fill('Cliente de Prueba Playwright');
        await modalOperacion.locator('#checkin-email').fill('cliente@test.com');
        await modalOperacion.locator('#checkin-telefono').fill('123456789');
        console.log('📝 Datos del cliente completados');

        // --- 5. SELECCIONAR TARIFA ---
        const primeraTarifa = modalOperacion.locator('.btn-tarifa').first();
        await primeraTarifa.click();
        await expect(primeraTarifa).toHaveClass(/seleccionada/);
        console.log('💲 Tarifa seleccionada');

        // --- 6. CONTINUAR AL PAGO ---
        await modalOperacion.locator('#btn-confirmar-checkin').click();

        // --- 7. VERIFICAR NAVEGACIÓN A TPV ---
        const vistaPedido = page.locator('#vista-pedido');
        await expect(vistaPedido).toBeVisible({ timeout: 10000 });
        console.log('➡️ Navegación a TPV exitosa');

        // --- 8. VERIFICAR MENSAJE DE ÉXITO ---
        // Buscar mensaje de éxito o confirmación
        const mensajeExito = page.locator('.mensaje-exito, .alert-success');
        if (await mensajeExito.count() > 0) {
            const textoMensaje = await mensajeExito.textContent();
            console.log('✅ Mensaje de éxito:', textoMensaje);
        }

        console.log('🎉 ¡Flujo de check-in completado exitosamente!');

        // Tomar screenshot final
        await page.screenshot({ path: 'test-results/checkin-completado.png', fullPage: true });
    });
});

test.describe('Verificación de Credenciales', () => {
    test('debería validar credenciales de administrador', async ({ page }) => {
        await realizarLogin(page, 'admin@test.com', 'admin123');

        // Verificar que se cargó la aplicación principal
        const vistaRecepcion = page.locator('#vista-recepcion');
        await expect(vistaRecepcion).toBeVisible();

        console.log('✅ Credenciales de admin funcionan');
    });

    test('debería validar credenciales de cajero', async ({ page }) => {
        await realizarLogin(page, 'cajero1@test.com', 'password123');

        // Verificar que se cargó la aplicación principal
        const vistaRecepcion = page.locator('#vista-recepcion');
        await expect(vistaRecepcion).toBeVisible();

        console.log('✅ Credenciales de cajero funcionan');
    });
});
