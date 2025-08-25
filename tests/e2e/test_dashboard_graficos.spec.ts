import { test, expect } from '@playwright/test';

test.describe('Dashboard BI - Gráficos Interactivos', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página de prueba de gráficos
    await page.goto('http://localhost:8000/frontend/test-graficos.html');

    // Esperar a que se carguen los datos
    await page.waitForSelector('.status', { timeout: 10000 });
  });

  test('debería cargar y mostrar los gráficos correctamente', async ({ page }) => {
    // Verificar que se cargó el estado de éxito
    await expect(page.locator('.status')).toContainText('Dashboard cargado correctamente');

    // Verificar que existen los canvas de los gráficos
    await expect(page.locator('#grafico-habitaciones')).toBeVisible();
    await expect(page.locator('#grafico-productos')).toBeVisible();
    await expect(page.locator('#grafico-ingresos')).toBeVisible();

    // Verificar que los datos raw se muestran
    const datosRaw = page.locator('#datos-raw pre');
    await expect(datosRaw).toBeVisible();
    await expect(datosRaw).toContainText('total_habitaciones');
    await expect(datosRaw).toContainText('productos_top');
    await expect(datosRaw).toContainText('ingresos_semana');
  });

  test('debería mostrar títulos correctos de los gráficos', async ({ page }) => {
    // Verificar títulos de las tarjetas de gráficos
    await expect(page.locator('text=🏠 Distribución de Habitaciones')).toBeVisible();
    await expect(page.locator('text=📦 Top Productos Vendidos')).toBeVisible();
    await expect(page.locator('text=💰 Ingresos por Categoría')).toBeVisible();
    await expect(page.locator('text=📊 Datos en Tiempo Real')).toBeVisible();
  });

  test('debería cargar datos del endpoint correctamente', async ({ page }) => {
    // Verificar que los datos contienen la estructura esperada
    const datosText = await page.locator('#datos-raw pre').textContent();
    const datos = JSON.parse(datosText);

    expect(datos).toHaveProperty('total_habitaciones');
    expect(datos).toHaveProperty('habitaciones_ocupadas');
    expect(datos).toHaveProperty('porcentaje_ocupacion');
    expect(datos).toHaveProperty('ingresos_hoy');
    expect(datos).toHaveProperty('productos_top');
    expect(datos).toHaveProperty('ingresos_semana');
    expect(datos).toHaveProperty('alertas');

    // Verificar estructura de productos_top
    expect(Array.isArray(datos.productos_top)).toBe(true);
    expect(datos.productos_top.length).toBeGreaterThan(0);

    if (datos.productos_top.length > 0) {
      const producto = datos.productos_top[0];
      expect(producto).toHaveProperty('nombre');
      expect(producto).toHaveProperty('categoria');
      expect(producto).toHaveProperty('unidades');
      expect(producto).toHaveProperty('ingresos');
    }

    // Verificar estructura de ingresos_semana
    expect(datos.ingresos_semana).toHaveProperty('habitaciones');
    expect(datos.ingresos_semana).toHaveProperty('restaurante');
    expect(datos.ingresos_semana).toHaveProperty('servicios');
    expect(datos.ingresos_semana).toHaveProperty('total');
  });

  test('debería manejar errores de red correctamente', async ({ page }) => {
    // Interceptar la llamada a la API para simular un error
    await page.route('**/api/v1/reportes/dashboard-ejecutivo/', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Error interno del servidor' })
      });
    });

    // Recargar la página para que se ejecute la llamada interceptada
    await page.reload();

    // Verificar que se muestra el mensaje de error
    await expect(page.locator('.status.error')).toBeVisible();
    await expect(page.locator('.status.error')).toContainText('Error');
  });
});

test.describe('Dashboard Principal - Integración de Gráficos', () => {
  test('debería funcionar la vista de reportes en el dashboard principal', async ({ page }) => {
    // Ir al dashboard principal
    await page.goto('http://localhost:8000/frontend/index.html');

    // Hacer clic en la pestaña de Reportes
    await page.click('[data-vista="vista-reportes"]');

    // Esperar a que se muestre la vista de reportes
    await expect(page.locator('#vista-reportes')).toBeVisible();

    // Verificar que existen los elementos del dashboard
    await expect(page.locator('text=📊 Dashboard Ejecutivo')).toBeVisible();

    // Verificar KPIs
    await expect(page.locator('#kpi-ocupacion')).toBeVisible();
    await expect(page.locator('#kpi-ingresos')).toBeVisible();
    await expect(page.locator('#kpi-habitaciones-ocupadas')).toBeVisible();
    await expect(page.locator('#kpi-productos')).toBeVisible();

    // Verificar que existen los canvas para gráficos
    await expect(page.locator('#grafico-estado-habitaciones')).toBeVisible();
    await expect(page.locator('#grafico-top-productos')).toBeVisible();
    await expect(page.locator('#grafico-ingresos-categoria')).toBeVisible();
  });

  test('debería actualizar el dashboard al hacer clic en actualizar', async ({ page }) => {
    await page.goto('http://localhost:8000/frontend/index.html');
    await page.click('[data-vista="vista-reportes"]');

    // Hacer clic en el botón actualizar
    const btnActualizar = page.locator('#btn-actualizar-reportes');
    await expect(btnActualizar).toBeVisible();
    await btnActualizar.click();

    // Verificar que los KPIs tienen valores (no están en "0" o vacíos)
    // Damos un poco de tiempo para la actualización
    await page.waitForTimeout(2000);

    const ocupacion = await page.locator('#kpi-ocupacion').textContent();
    const ingresos = await page.locator('#kpi-ingresos').textContent();

    expect(ocupacion).toMatch(/\d+(\.\d+)?%/); // Formato de porcentaje
    expect(ingresos).toMatch(/€\d+/); // Formato de euros
  });
});
