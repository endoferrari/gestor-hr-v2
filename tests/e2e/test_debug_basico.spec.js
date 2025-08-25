import { test, expect } from '@playwright/test';

test.describe('Debug - Verificación básica de la aplicación', () => {
    test('Verificar que la aplicación carga y simular autenticación', async ({ page }) => {
        // Habilitar logs de consola
        page.on('console', msg => console.log('CONSOLA:', msg.text()));
        page.on('pageerror', err => console.error('ERROR PÁGINA:', err));

        // Ir a la aplicación
        await page.goto('http://localhost:8000');

        // Verificar que el título es correcto
        await expect(page).toHaveTitle(/Gestor HR v3.0/);

        // Simular autenticación directamente en el navegador
        await page.evaluate(() => {
            // Crear usuario falso para tests
            const fakeUser = {
                id: 1,
                nombre: 'Usuario Test',
                email: 'test@test.com',
                rol: 'admin'
            };

            const fakeToken = 'test-token-123';

            // Establecer autenticación en AppState
            if (window.AppState) {
                window.AppState.setAuthenticated(fakeUser, fakeToken);
            }
        });

        // Esperar 2 segundos para que la aplicación procese el login
        await page.waitForTimeout(2000);

        // Verificar que el header principal está presente
        await expect(page.locator('.header-principal')).toBeVisible();

        // Verificar elementos básicos
        await expect(page.locator('#total-disponibles')).toBeVisible();
        await expect(page.locator('#vista-recepcion')).toBeVisible();

        // Esperar a que la app se inicialice completamente
        await page.waitForTimeout(3000);

        // Verificar si hay contenedor de habitaciones
        const habitacionesContainer = page.locator('#mapa-habitaciones-grid');
        await expect(habitacionesContainer).toBeVisible();

        // Verificar contenido del contenedor
        const contenido = await habitacionesContainer.textContent();
        console.log('📍 Contenido del contenedor de habitaciones:', contenido);

        // Verificar el estado de la aplicación via JavaScript
        const appState = await page.evaluate(() => {
            return {
                habitacionesLength: window.AppState?.habitaciones?.length || 0,
                currentSection: window.AppState?.currentSection || 'desconocido',
                isAuthenticated: window.AppState?.isAuthenticated || false
            };
        });

        console.log('📊 Estado de la aplicación:', appState);

        // Hacer screenshot para debug
        await page.screenshot({ path: 'debug-application-state-authenticated.png' });

        // Verificar que hay al menos algún contenido o mensaje en el contenedor
        const hasContent = contenido && contenido.trim().length > 0;
        expect(hasContent).toBeTruthy();
    });
});
