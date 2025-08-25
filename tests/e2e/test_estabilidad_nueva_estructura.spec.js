import { test, expect } from '@playwright/test';

/**
 * ===== TEST DE ESTABILIDAD - NUEVA ESTRUCTURA =====
 *
 * Este test verifica que la nueva estructura estable de main.js
 * funciona correctamente para el flujo básico de:
 * 1. Login
 * 2. Visualización de habitaciones
 * 3. Check-in básico
 *
 * Si este test pasa, significa que la refactorización fue exitosa.
 */

test.describe('Test de Estabilidad - Nueva Estructura', () => {
    test.beforeEach(async ({ page }) => {
        // Interceptar requests para debug
        page.on('console', msg => console.log('🔍 Console:', msg.text()));
        page.on('pageerror', exception => console.log('❌ Page Error:', exception));

        // Ir a la página principal
        await page.goto('http://localhost:8000/frontend/');
    });

    test('1. Debe inicializar la aplicación correctamente', async ({ page }) => {
        console.log('🧪 Verificando inicialización de la aplicación...');

        // Esperar a que aparezca el modal de login
        await expect(page.locator('#modal-login')).toBeVisible({ timeout: 5000 });

        // Verificar que los elementos del login existen
        await expect(page.locator('#login-email')).toBeVisible();
        await expect(page.locator('#login-password')).toBeVisible();
        await expect(page.locator('#btn-login')).toBeVisible();

        console.log('✅ Modal de login apareció correctamente');
    });

    test('2. Debe realizar login y mostrar aplicación principal', async ({ page }) => {
        console.log('🧪 Probando flujo de login...');

        // Esperar modal de login
        await expect(page.locator('#modal-login')).toBeVisible({ timeout: 5000 });

        // Llenar credenciales
        await page.fill('#login-email', 'admin@test.com');
        await page.fill('#login-password', 'admin123');

        // Hacer login
        await page.click('#btn-login');

        // Esperar a que desaparezca el modal de login
        await expect(page.locator('#modal-login')).not.toBeVisible({ timeout: 10000 });

        // Verificar que apareció la interfaz principal
        await expect(page.locator('.header-principal')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.nav-principal')).toBeVisible();

        // Verificar que se muestra el mapa de habitaciones
        await expect(page.locator('#mapa-habitaciones-grid')).toBeVisible();

        console.log('✅ Login exitoso y aplicación principal cargada');
    });

    test('3. Debe mostrar habitaciones sin parpadeo', async ({ page }) => {
        console.log('🧪 Verificando carga estable de habitaciones...');

        // Login
        await expect(page.locator('#modal-login')).toBeVisible({ timeout: 5000 });
        await page.fill('#login-email', 'admin@test.com');
        await page.fill('#login-password', 'admin123');
        await page.click('#btn-login');

        // Esperar interfaz principal
        await expect(page.locator('#mapa-habitaciones-grid')).toBeVisible({ timeout: 10000 });

        // Esperar a que aparezcan las habitaciones
        await expect(page.locator('.habitacion-card')).toHaveCount(6, { timeout: 10000 });

        // Verificar que hay habitaciones de diferentes tipos
        const disponibles = await page.locator('.habitacion-card.estado-disponible').count();
        const ocupadas = await page.locator('.habitacion-card.estado-ocupada').count();

        console.log(`📊 Encontradas ${disponibles} disponibles, ${ocupadas} ocupadas`);

        // Debe haber al menos una habitación disponible para testing
        expect(disponibles).toBeGreaterThan(0);

        console.log('✅ Habitaciones cargadas sin parpadeo');
    });

    test('4. Debe abrir modal de check-in al hacer click en habitación disponible', async ({ page }) => {
        console.log('🧪 Probando apertura de modal de operaciones...');

        // Login
        await expect(page.locator('#modal-login')).toBeVisible({ timeout: 5000 });
        await page.fill('#login-email', 'admin@test.com');
        await page.fill('#login-password', 'admin123');
        await page.click('#btn-login');

        // Esperar habitaciones
        await expect(page.locator('.habitacion-card')).toHaveCount(6, { timeout: 10000 });

        // Encontrar primera habitación disponible
        const habitacionDisponible = page.locator('.habitacion-card.estado-disponible').first();
        await expect(habitacionDisponible).toBeVisible();

        // Click en la habitación
        await habitacionDisponible.click();

        // Verificar que aparece el modal de operaciones
        await expect(page.locator('#modal-operacion-habitacion')).not.toHaveClass(/oculto/, { timeout: 5000 });

        // Verificar elementos del modal de check-in
        await expect(page.locator('#op-seccion-tarifas')).toBeVisible();
        await expect(page.locator('#op-seccion-cliente')).toBeVisible();
        await expect(page.locator('.tarifa-card')).toHaveCount(3); // 3 tarifas

        console.log('✅ Modal de operaciones se abre correctamente');
    });

    test('5. Debe mantener estado al seleccionar tarifa', async ({ page }) => {
        console.log('🧪 Verificando conservación de estado en selección de tarifa...');

        // Login y abrir modal
        await expect(page.locator('#modal-login')).toBeVisible({ timeout: 5000 });
        await page.fill('#login-email', 'admin@test.com');
        await page.fill('#login-password', 'admin123');
        await page.click('#btn-login');

        await expect(page.locator('.habitacion-card')).toHaveCount(6, { timeout: 10000 });

        const habitacionDisponible = page.locator('.habitacion-card.estado-disponible').first();
        await habitacionDisponible.click();

        await expect(page.locator('#modal-operacion-habitacion')).not.toHaveClass(/oculto/);

        // Llenar datos del cliente
        await page.fill('#cliente-nombre', 'Cliente Test');
        await page.fill('#cliente-email', 'test@test.com');
        await page.fill('#cliente-telefono', '123456789');

        // Seleccionar primera tarifa
        await page.click('.tarifa-card:first-child .btn-seleccionar-tarifa');

        // Verificar que la tarifa se marca como seleccionada
        await expect(page.locator('.tarifa-card:first-child')).toHaveClass(/selected/);

        // Verificar que aparece el botón de continuar
        await expect(page.locator('#btn-op-checkin')).not.toHaveClass(/oculto/);
        await expect(page.locator('#btn-op-checkin')).not.toBeDisabled();

        console.log('✅ Estado de tarifa seleccionada se conserva correctamente');
    });

    test('6. CRÍTICO - Debe conservar estado entre modales (check-in → pago)', async ({ page }) => {
        console.log('🧪 *** TEST CRÍTICO: Verificando conservación de estado entre modales ***');

        // Login y setup inicial
        await expect(page.locator('#modal-login')).toBeVisible({ timeout: 5000 });
        await page.fill('#login-email', 'admin@test.com');
        await page.fill('#login-password', 'admin123');
        await page.click('#btn-login');

        await expect(page.locator('.habitacion-card')).toHaveCount(6, { timeout: 10000 });

        // Click en habitación disponible
        const habitacionDisponible = page.locator('.habitacion-card.estado-disponible').first();
        const numeroHabitacion = await habitacionDisponible.locator('.habitacion-numero').textContent();
        console.log(`🏠 Seleccionando habitación: ${numeroHabitacion}`);

        await habitacionDisponible.click();
        await expect(page.locator('#modal-operacion-habitacion')).not.toHaveClass(/oculto/);

        // Llenar datos del cliente
        await page.fill('#cliente-nombre', 'Cliente Estado Test');
        await page.fill('#cliente-email', 'estado@test.com');

        // Seleccionar tarifa estándar
        await page.click('.tarifa-card[data-tarifa-id=\"estandar\"] .btn-seleccionar-tarifa');
        await expect(page.locator('.tarifa-card[data-tarifa-id=\"estandar\"]')).toHaveClass(/selected/);

        // Hacer click en "Continuar al Pago"
        await page.click('#btn-op-checkin');

        // Esperar a que aparezca el resumen y luego el modal de pago
        await page.waitForTimeout(1500); // Esperar animación

        // Verificar que aparece el modal de pago
        await expect(page.locator('#modal-pago')).not.toHaveClass(/oculto/, { timeout: 10000 });

        // *** VERIFICACIÓN CRÍTICA: El estado debe conservarse ***

        // 1. Verificar que las líneas de pago contienen la información correcta
        const pagoLineas = page.locator('#pago-lineas');
        await expect(pagoLineas).toContainText(`Habitación ${numeroHabitacion}`);
        await expect(pagoLineas).toContainText('Tarifa: Tarifa Estándar');

        // 2. Verificar que el total es correcto (no null ni undefined)
        const totalElement = page.locator('#pago-total-amount');
        const totalText = await totalElement.textContent();
        console.log(`💰 Total mostrado: ${totalText}`);

        expect(totalText).not.toBe('');
        expect(totalText).not.toBe('null');
        expect(totalText).not.toBe('undefined');
        expect(totalText).toContain('€');

        console.log('✅ *** ESTADO CONSERVADO CORRECTAMENTE ENTRE MODALES ***');
    });
});
