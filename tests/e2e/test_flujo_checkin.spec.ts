import { test, expect } from '@playwright/test';

/**
 * Test End-to-End del flujo completo de Check-in
 *
 * Este test verifica la cohesión completa entre:
 * - Frontend: Navegación entre vistas y modales
 * - Backend: Respuesta correcta de endpoints API
 * - Base de Datos: Creación y actualización de registros
 *
 * Flujo del test:
 * 1. Login con usuario 'cajero1'
 * 2. Verificar mapa de habitaciones
 * 3. Seleccionar habitación disponible
 * 4. Realizar check-in completo
 * 5. Procesar pago
 * 6. Verificar estado final
 */

test.describe('Flujo Principal: Check-in Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar interceptores para APIs críticas
    await page.route('**/api/v1/**', route => {
      console.log(`API Call: ${route.request().method()} ${route.request().url()}`);
      route.continue();
    });
  });

  test('Check-in completo de cliente nuevo', async ({ page }) => {
    // === PASO 1: NAVEGACIÓN INICIAL ===
    console.log('🏁 Iniciando test de flujo completo de check-in...');

    await page.goto('http://localhost:8000');

    // Verificar que la página principal carga
    await expect(page).toHaveTitle(/Gestor HR v3.0/);
    console.log('✅ Página principal cargada');

    // === PASO 2: PROCESO DE LOGIN ===
    console.log('🔐 Iniciando proceso de login...');

    // Buscar modal de login o botón de login
    const loginModal = page.locator('#modal-login');
    const loginButton = page.locator('#btn-login, .btn-login, [data-action="login"]');

    // Si no hay modal visible, hacer clic en botón de login
    if (!(await loginModal.isVisible())) {
      await loginButton.first().click();
      await expect(loginModal).toBeVisible({ timeout: 5000 });
    }

    // Completar formulario de login
    await page.fill('#login-usuario, [name="username"], [id*="usuario"]', 'cajero1');
    await page.fill('#login-password, [name="password"], [id*="password"]', 'password123');

    // Enviar formulario
    await page.click('#btn-login-submit, [type="submit"], .btn-primary');
    console.log('✅ Credenciales enviadas');

    // === PASO 3: VERIFICACIÓN POST-LOGIN ===
    console.log('🗺️ Verificando mapa de habitaciones...');

    // Esperar a que el mapa de habitaciones sea visible
    const mapaHabitaciones = page.locator('#mapa-habitaciones-grid, .mapa-habitaciones, [class*="mapa"]');
    await expect(mapaHabitaciones).toBeVisible({ timeout: 10000 });
    console.log('✅ Mapa de habitaciones visible');

    // === PASO 4: SELECCIÓN DE HABITACIÓN ===
    console.log('🏠 Seleccionando habitación disponible...');

    // Buscar primera habitación disponible
    const habitacionDisponible = page.locator('.estado-disponible, [data-estado="disponible"], .habitacion-disponible').first();
    await expect(habitacionDisponible).toBeVisible({ timeout: 5000 });

    // Hacer clic en la habitación
    await habitacionDisponible.click();
    console.log('✅ Habitación seleccionada');

    // === PASO 5: MODAL DE CHECK-IN ===
    console.log('📝 Verificando modal de check-in...');

    // Verificar que el modal de check-in se muestra
    const modalCheckin = page.locator('#modal-checkin, .modal-checkin, [class*="checkin"]');
    await expect(modalCheckin).toBeVisible({ timeout: 5000 });
    console.log('✅ Modal de check-in abierto');

    // === PASO 6: SELECCIONAR TARIFA ===
    console.log('💰 Seleccionando tarifa...');

    // Buscar y seleccionar primera tarifa disponible
    const btnTarifa = page.locator('.btn-tarifa, [data-action="select-tarifa"], .tarifa-item').first();
    await expect(btnTarifa).toBeVisible({ timeout: 3000 });
    await btnTarifa.click();
    console.log('✅ Tarifa seleccionada');

    // === PASO 7: DATOS DEL CLIENTE ===
    console.log('👤 Ingresando datos del cliente...');

    // Completar datos del nuevo cliente
    const nombreCliente = '#checkin-nombre-cliente, [name="nombre_huesped"], [id*="nombre"]';
    await page.fill(nombreCliente, 'Cliente de Prueba E2E');

    // Campos opcionales si existen
    const emailCliente = '#checkin-email, [name="email_huesped"], [id*="email"]';
    const telefonoCliente = '#checkin-telefono, [name="telefono_huesped"], [id*="telefono"]';

    if (await page.locator(emailCliente).isVisible()) {
      await page.fill(emailCliente, 'cliente.prueba@test.com');
    }

    if (await page.locator(telefonoCliente).isVisible()) {
      await page.fill(telefonoCliente, '123456789');
    }

    console.log('✅ Datos del cliente ingresados');

    // === PASO 8: CONFIRMAR CHECK-IN ===
    console.log('✔️ Confirmando check-in...');

    // Buscar botón de confirmación
    const btnConfirmarCheckin = page.locator(
      '#btn-confirmar-checkin, .btn-confirmar, [data-action="confirm-checkin"], [type="submit"]'
    );

    await expect(btnConfirmarCheckin).toBeVisible({ timeout: 3000 });
    await btnConfirmarCheckin.click();
    console.log('✅ Check-in confirmado');

    // === PASO 9: PROCESO DE PAGO ===
    console.log('💳 Verificando proceso de pago...');

    // Esperar modal de pago o navegación a vista de pago
    const modalPago = page.locator('#modal-pago, .modal-pago, [class*="pago"]');
    const vistaPago = page.locator('[data-section="pago"], .seccion-pago');

    // Verificar que aparece interfaz de pago
    await expect(modalPago.or(vistaPago)).toBeVisible({ timeout: 8000 });
    console.log('✅ Interfaz de pago visible');

    // Procesar pago (simulado)
    const btnProcesarPago = page.locator(
      '#btn-procesar-pago, .btn-pagar, [data-action="process-payment"]'
    ).first();

    if (await btnProcesarPago.isVisible({ timeout: 3000 })) {
      await btnProcesarPago.click();
      console.log('✅ Pago procesado');
    }

    // === PASO 10: VERIFICACIÓN FINAL ===
    console.log('🔍 Verificando estado final...');

    // Esperar regreso a la vista principal
    await page.waitForTimeout(2000); // Tiempo para procesamiento

    // Verificar que regresamos al mapa
    await expect(mapaHabitaciones).toBeVisible({ timeout: 10000 });

    // Verificar que la habitación ahora está ocupada
    const habitacionOcupada = page.locator('.estado-ocupada, [data-estado="ocupada"], .habitacion-ocupada');
    await expect(habitacionOcupada).toBeVisible({ timeout: 5000 });

    console.log('✅ Habitación ahora marcada como ocupada');
    console.log('🎉 ¡Flujo completo de check-in exitoso!');
  });

  test('Verificación de navegación básica', async ({ page }) => {
    // Test más simple para verificar navegación básica
    console.log('🧪 Test de navegación básica...');

    await page.goto('http://localhost:8000');

    // Verificar elementos básicos de la interfaz
    await expect(page).toHaveTitle(/Gestor HR|Hotel|Sistema/);

    // Verificar que hay algún contenido visible
    const contenidoPrincipal = page.locator('body, main, .container, #app');
    await expect(contenidoPrincipal).toBeVisible();

    // Verificar que no hay errores JS críticos
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.waitForTimeout(1000);

    // No debería haber errores críticos
    const criticalErrors = errors.filter(error =>
      error.includes('ReferenceError') ||
      error.includes('TypeError') ||
      error.includes('SyntaxError')
    );

    expect(criticalErrors).toHaveLength(0);
    console.log('✅ Navegación básica exitosa');
  });

  test('Verificación de carga de recursos críticos', async ({ page }) => {
    // Test para verificar que los recursos críticos cargan
    console.log('📦 Verificando carga de recursos...');

    await page.goto('http://localhost:8000');

    // Verificar que los archivos JS principales cargan
    const jsFiles = [
      '/frontend/config.js',
      '/frontend/api.js',
      '/frontend/ui.js',
      '/frontend/main.js'
    ];

    for (const jsFile of jsFiles) {
      const response = await page.request.get(`http://localhost:8000${jsFile}`);
      expect(response.status()).toBe(200);
    }

    // Verificar CSS
    const cssResponse = await page.request.get('http://localhost:8000/frontend/styles.css');
    expect(cssResponse.status()).toBe(200);

    console.log('✅ Recursos críticos cargados correctamente');
  });
});
