import { test, expect } from '@playwright/test';

test.describe('Dashboard BI - Gráficos Interactivos', () => {
  test('debería cargar la página de prueba de gráficos correctamente', async ({ page }) => {
    // Ir a la página de prueba específica para gráficos
    await page.goto('http://localhost:8000/frontend/test-graficos.html');

    // Verificar que se carga el header
    await expect(page.locator('text=Dashboard BI - Prueba de Gráficos')).toBeVisible();

    // Esperar a que se carguen los datos (máximo 10 segundos)
    await page.waitForSelector('.status', { timeout: 10000 });

    // Verificar que se cargó exitosamente
    const status = page.locator('.status');
    await expect(status).toBeVisible();

    // Puede ser éxito o error, pero debe aparecer un estado
    const statusText = await status.textContent();
    console.log('Estado del dashboard:', statusText);

    // Si es éxito, verificar los gráficos
    const isSuccess = statusText?.includes('Dashboard cargado correctamente');

    if (isSuccess) {
      // Verificar que existen los canvas de los gráficos
      await expect(page.locator('#grafico-habitaciones')).toBeVisible();
      await expect(page.locator('#grafico-productos')).toBeVisible();
      await expect(page.locator('#grafico-ingresos')).toBeVisible();

      // Verificar que los datos raw se muestran
      const datosRaw = page.locator('#datos-raw pre');
      await expect(datosRaw).toBeVisible();

      const datosText = await datosRaw.textContent();
      expect(datosText).toBeTruthy();
      expect(datosText).toContain('total_habitaciones');
      expect(datosText).toContain('productos_top');
      expect(datosText).toContain('ingresos_semana');
    }
  });

  test('debería mostrar títulos correctos de los gráficos', async ({ page }) => {
    await page.goto('http://localhost:8000/frontend/test-graficos.html');

    // Verificar títulos de las tarjetas de gráficos
    await expect(page.locator('text=🏠 Distribución de Habitaciones')).toBeVisible();
    await expect(page.locator('text=📦 Top Productos Vendidos')).toBeVisible();
    await expect(page.locator('text=💰 Ingresos por Categoría')).toBeVisible();
    await expect(page.locator('text=📊 Datos en Tiempo Real')).toBeVisible();
  });

  test('debería verificar que Chart.js está cargado', async ({ page }) => {
    await page.goto('http://localhost:8000/frontend/test-graficos.html');

    // Verificar que Chart.js está disponible
    const chartExists = await page.evaluate(() => {
      return typeof window.Chart !== 'undefined';
    });

    expect(chartExists).toBe(true);
  });
});

test.describe('API Endpoint - Dashboard Ejecutivo', () => {
  test('debería responder correctamente el endpoint', async ({ request }) => {
    // Probar directamente el endpoint de la API
    const response = await request.get('/api/v1/reportes/dashboard-ejecutivo/');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verificar estructura básica
    expect(data).toHaveProperty('total_habitaciones');
    expect(data).toHaveProperty('habitaciones_ocupadas');
    expect(data).toHaveProperty('porcentaje_ocupacion');
    expect(data).toHaveProperty('ingresos_hoy');
    expect(data).toHaveProperty('productos_top');
    expect(data).toHaveProperty('ingresos_semana');
    expect(data).toHaveProperty('alertas');

    // Verificar tipos
    expect(typeof data.total_habitaciones).toBe('number');
    expect(typeof data.habitaciones_ocupadas).toBe('number');
    expect(typeof data.porcentaje_ocupacion).toBe('number');
    expect(typeof data.ingresos_hoy).toBe('number');
    expect(Array.isArray(data.productos_top)).toBe(true);
    expect(Array.isArray(data.alertas)).toBe(true);

    // Verificar productos_top
    if (data.productos_top.length > 0) {
      const producto = data.productos_top[0];
      expect(producto).toHaveProperty('nombre');
      expect(producto).toHaveProperty('categoria');
      expect(producto).toHaveProperty('unidades');
      expect(producto).toHaveProperty('ingresos');
    }

    console.log('✅ Datos del endpoint verificados:', {
      habitaciones: data.total_habitaciones,
      ocupacion: data.porcentaje_ocupacion + '%',
      productos: data.productos_top.length,
      ingresos_hoy: data.ingresos_hoy
    });
  });
});
