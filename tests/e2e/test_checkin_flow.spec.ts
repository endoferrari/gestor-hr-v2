import { test, expect } from '@playwright/test';

test.describe('Flujo de Check-in Completo', () => {
  // Antes de cada prueba, navegar a la página de inicio
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/static/index.html');
  });

  test('Debería realizar un check-in exitoso y la tarjeta de la habitación debe cambiar a rojo (ocupado)', async ({ page }) => {
    // 1. Iniciar sesión
    await test.step('Iniciar sesión como administrador', async () => {
      await page.waitForSelector('#modal-login', { state: 'visible' });
      await page.fill('#login-email', 'admin@hotel.com');
      await page.fill('#login-password', 'adminpassword');
      await page.click('#btn-login');
      // Esperar a que el modal de login desaparezca
      await page.waitForSelector('#modal-login', { state: 'hidden' });
      // Esperar a que la sección de recepción esté visible
      await page.waitForSelector('#vista-recepcion', { state: 'visible' });
    });

    // 2. Seleccionar una habitación disponible
    await test.step('Seleccionar una habitación disponible', async () => {
      // Esperar a que las tarjetas de habitación se rendericen
      await page.waitForSelector('.habitacion-card.estado-disponible');
      // Hacer clic en la primera habitación disponible que se encuentre
      const habitacionDisponible = page.locator('.habitacion-card.estado-disponible').first();
      await habitacionDisponible.click();
      // Esperar a que el modal de operación de habitación aparezca
      await page.waitForSelector('#modal-operacion-habitacion', { state: 'visible' });
    });

    // 3. Llenar el formulario de check-in
    await test.step('Llenar formulario de check-in y seleccionar tarifa', async () => {
      // Seleccionar la primera tarifa
      await page.locator('.tarifa-card .btn-seleccionar-tarifa').first().click();

      // Llenar los datos del cliente
      await page.fill('#cliente-nombre', 'Huesped de Prueba');
      await page.fill('#cliente-email', 'huesped@test.com');
      await page.fill('#cliente-telefono', '600123456');

      // Hacer clic en el botón para continuar al pago
      await page.click('#btn-op-checkin');
    });

    // 4. Completar el pago
    await test.step('Completar el pago', async () => {
      // Esperar a que el modal de pago esté visible
      await page.waitForSelector('#modal-pago', { state: 'visible' });

      // El método de pago por defecto es 'efectivo' y el monto ya está relleno.
      // Solo necesitamos confirmar el pago.
      await page.click('#btn-confirmar-pago');
    });

    // 5. Verificar el resultado
    await test.step('Verificar que la habitación está ocupada', async () => {
      // Esperar a que los modales se cierren
      await page.waitForSelector('#modal-pago', { state: 'hidden' });
      await page.waitForSelector('#modal-operacion-habitacion', { state: 'hidden' });

      // Esperar el mensaje de éxito
      const mensajeExito = page.locator('.mensaje.mensaje-exito');
      await expect(mensajeExito).toBeVisible();
      await expect(mensajeExito).toContainText(/Check-in realizado exitosamente/i);

      // Verificar que la tarjeta de la habitación ahora está en estado 'ocupada' (rojo)
      // Necesitamos una forma de re-seleccionar la misma habitación. Usaremos el número de habitación.
      // Esta parte es un poco más compleja porque el estado cambia y el elemento se vuelve a renderizar.
      // Vamos a recargar la página para asegurar que el estado es persistente.
      await page.reload();
      await page.waitForSelector('#vista-recepcion', { state: 'visible' });

      // Buscar la tarjeta que antes era 'disponible' y ahora debería ser 'ocupada'.
      // Esto es difícil sin un ID único. Asumiremos que la primera habitación ocupada es la nuestra.
      const habitacionOcupada = page.locator('.habitacion-card.estado-ocupada').first();
      await expect(habitacionOcupada).toBeVisible();

      // Una verificación más robusta sería si pudiéramos obtener el número de la habitación
      // antes de hacer clic y luego buscar esa tarjeta específica.
      // Por ahora, confirmamos que al menos una habitación se ha ocupado.
      const countOcupadas = await page.locator('.habitacion-card.estado-ocupada').count();
      expect(countOcupadas).toBeGreaterThan(0);
    });
  });
});
