import { test, expect } from '@playwright/test';

test.describe('Debug - Test específico del proceso de pago', () => {
    test('Debug del proceso de pago', async ({ page }) => {
        // Habilitar logs de consola y errores
        page.on('console', msg => console.log('CONSOLA:', msg.text()));
        page.on('pageerror', err => console.error('ERROR PÁGINA:', err));
        page.on('response', response => {
            if (response.status() >= 400) {
                console.error(`ERROR HTTP ${response.status()}: ${response.url()}`);
            }
        });
        page.on('request', request => {
            if (request.url().includes('hospedajes')) {
                console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
            }
        });

        // Ir a la aplicación
        await page.goto('http://localhost:8000');

        // Simular autenticación
        await page.evaluate(() => {
            const fakeUser = { id: 1, nombre: 'Usuario Test', email: 'test@test.com', rol: 'admin' };
            const fakeToken = 'test-token-123';
            if (window.AppState) {
                window.AppState.setAuthenticated(fakeUser, fakeToken);
            }
        });

        // Esperar a que la aplicación se cargue
        await page.waitForTimeout(3000);

        console.log('🏠 Clickeando en una habitación disponible...');
        await page.click('.habitacion-card.estado-disponible');

        await page.waitForTimeout(1000);

        console.log('💰 Seleccionando tarifa estándar...');
        await page.click('.btn-seleccionar-tarifa');

        await page.waitForTimeout(1000);

        // Verificar que la tarifa se seleccionó correctamente
        const tarifaState = await page.evaluate(() => ({
            tarifaSeleccionada: window.AppState?.tarifaSeleccionada,
            habitacionSeleccionada: window.AppState?.habitacionSeleccionada?.numero
        }));
        console.log('📊 Estado después de seleccionar tarifa:', tarifaState);

        console.log('👤 Completando datos del cliente...');
        await page.fill('#cliente-nombre', 'Cliente Test');
        await page.fill('#cliente-email', 'test@cliente.com');

        console.log('💳 Continuando al pago...');
        await page.click('#btn-op-checkin');

        await page.waitForTimeout(2000);

        console.log('💸 Seleccionando método de pago en efectivo...');
        await page.click('input[value="efectivo"]');

        await page.waitForTimeout(1000);

        console.log('✅ Confirmando pago...');

        // Verificar estado antes del pago
        const stateBefore = await page.evaluate(() => ({
            habitacion: window.AppState?.habitacionSeleccionada?.numero,
            tarifa: window.AppState?.tarifaSeleccionada?.precio,
            cliente: window.AppState?.clienteActual?.nombre
        }));
        console.log('📊 Estado antes del pago:', stateBefore);

        // Hacer clic en confirmar pago y monitorear la respuesta
        const paymentPromise = page.waitForResponse(response =>
            response.url().includes('/hospedajes') && response.request().method() === 'POST'
        );

        await page.click('#btn-confirmar-pago');

        try {
            const paymentResponse = await paymentPromise;
            console.log(`📡 Respuesta del pago: ${paymentResponse.status()}`);

            if (paymentResponse.status() >= 400) {
                const errorText = await paymentResponse.text();
                console.error(`❌ Error en pago: ${errorText}`);
            } else {
                console.log('✅ Pago procesado correctamente');
            }
        } catch (error) {
            console.error('❌ Error esperando respuesta del pago:', error);
        }

        // Esperar un momento para que se procese todo
        await page.waitForTimeout(5000);

        // Hacer screenshot final
        await page.screenshot({ path: 'payment-debug-final.png' });

        // Verificar estado final
        const finalState = await page.evaluate(() => ({
            modalPagoVisible: document.getElementById('modal-pago')?.classList.contains('oculto') === false,
            mensajes: Array.from(document.querySelectorAll('.mensaje')).map(m => ({
                tipo: m.className,
                texto: m.textContent
            }))
        }));

        console.log('📊 Estado final:', finalState);
    });
});
