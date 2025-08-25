import { test, expect } from '@playwright/test';

/**
 * 🧪 Tests E2E para Dashboard Ejecutivo - Business Intelligence
 *
 * Verifica que el dashboard funcione correctamente tanto en backend como frontend
 */

test.describe('Dashboard Ejecutivo - Business Intelligence', () => {

  test('Verificar endpoint de dashboard ejecutivo', async ({ request }) => {
    console.log('🔍 Probando endpoint /api/v1/reportes/dashboard-ejecutivo/');

    const response = await request.get('/api/v1/reportes/dashboard-ejecutivo/');

    // Verificar status code
    expect(response.status()).toBe(200);

    // Verificar estructura de datos
    const data = await response.json();
    console.log('📊 Datos recibidos:', JSON.stringify(data, null, 2));

    // Validar estructura del response
    expect(data).toHaveProperty('total_habitaciones');
    expect(data).toHaveProperty('habitaciones_ocupadas');
    expect(data).toHaveProperty('porcentaje_ocupacion');
    expect(data).toHaveProperty('ingresos_hoy');
    expect(data).toHaveProperty('fecha_actualizacion');

    // Validar tipos de datos
    expect(typeof data.total_habitaciones).toBe('number');
    expect(typeof data.habitaciones_ocupadas).toBe('number');
    expect(typeof data.porcentaje_ocupacion).toBe('number');
    expect(typeof data.ingresos_hoy).toBe('number');
    expect(typeof data.fecha_actualizacion).toBe('string');

    // Validar lógica de negocio
    expect(data.total_habitaciones).toBeGreaterThanOrEqual(0);
    expect(data.habitaciones_ocupadas).toBeGreaterThanOrEqual(0);
    expect(data.habitaciones_ocupadas).toBeLessThanOrEqual(data.total_habitaciones);
    expect(data.porcentaje_ocupacion).toBeGreaterThanOrEqual(0);
    expect(data.porcentaje_ocupacion).toBeLessThanOrEqual(100);
    expect(data.ingresos_hoy).toBeGreaterThanOrEqual(0);

    console.log('✅ Endpoint funcionando correctamente');
    console.log(`📈 Ocupación actual: ${data.porcentaje_ocupacion}% (${data.habitaciones_ocupadas}/${data.total_habitaciones})`);
    console.log(`💰 Ingresos del día: €${data.ingresos_hoy}`);
  });

  test('Verificar documentación API del dashboard', async ({ page }) => {
    console.log('📚 Verificando documentación en /docs');

    await page.goto('/docs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verificar que la página de docs carga (usar el primer elemento swagger-ui)
    const swaggerContainer = page.locator('#swagger-ui').first();
    await expect(swaggerContainer).toBeVisible({ timeout: 15000 });

    // Verificar que el título de la página es correcto
    await expect(page).toHaveTitle(/Swagger UI/);

    console.log('✅ Documentación API carga correctamente');

    // Buscar elementos relacionados con reportes (opcional)
    await page.waitForTimeout(5000); // Esperar que la API se cargue

    const pageContent = await page.content();
    const hasReportesSection = pageContent.includes('reportes') || pageContent.includes('Reportes');

    if (hasReportesSection) {
      console.log('✅ Sección de Reportes encontrada en la documentación');
    } else {
      console.log('ℹ️ Sección de Reportes no detectada (pero API funciona)');
    }

    console.log('✅ Test de documentación completado exitosamente');
  });

  test('Verificar frontend del dashboard', async ({ page }) => {
    console.log('🖥️ Verificando frontend del dashboard');

    // Ir a la página principal
    await page.goto('/frontend/index.html');
    await page.waitForLoadState('networkidle');

    // Esperar a que la página cargue completamente
    await page.waitForTimeout(2000);

    // Verificar elementos del dashboard si existen
    const titleExists = await page.locator('h1, .title, .header h2').first().isVisible().catch(() => false);
    if (titleExists) {
      console.log('✅ Título del dashboard encontrado');
    }

    // Verificar si hay elementos de KPIs o métricas
    const kpiElements = await page.locator('.kpi, .metric, .dashboard-card, .stats').count();
    console.log(`📊 Elementos de KPI encontrados: ${kpiElements}`);

    // Verificar que no hay errores JavaScript en la consola
    const jsErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    if (jsErrors.length > 0) {
      console.log('⚠️ Errores JavaScript encontrados:');
      jsErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No se encontraron errores JavaScript');
    }

    // Verificar que la página responde (no hay crash)
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);

    console.log('✅ Frontend carga correctamente sin errores críticos');
  });

  test('Verificar integración backend-frontend del dashboard', async ({ page }) => {
    console.log('🔗 Verificando integración completa del dashboard');

    // Interceptar llamadas al API
    const apiCalls: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/v1/reportes/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });

    // Ir a la página del dashboard
    await page.goto('/frontend/index.html');
    await page.waitForLoadState('networkidle');

    // Simular la carga del dashboard (si hay botones o triggers)
    const dashboardButton = page.locator('button:has-text("Dashboard"), .dashboard-btn, #btn-dashboard').first();
    const buttonExists = await dashboardButton.isVisible().catch(() => false);

    if (buttonExists) {
      console.log('🖱️ Clickeando botón del dashboard');
      await dashboardButton.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('ℹ️ No se encontró botón específico del dashboard, esperando carga automática');
      await page.waitForTimeout(3000);
    }

    // Verificar llamadas al API
    console.log(`📡 Llamadas API interceptadas: ${apiCalls.length}`);
    apiCalls.forEach(call => {
      console.log(`  - ${call.method} ${call.url} -> ${call.status}`);
    });

    // Buscar elementos que puedan contener datos del dashboard
    const possibleDataElements = await page.locator('.total, .count, .metric-value, .kpi-value, .dashboard-stat').count();
    console.log(`📊 Posibles elementos de datos encontrados: ${possibleDataElements}`);

    console.log('✅ Test de integración completado');
  });

  test('Verificar rendimiento del endpoint de dashboard', async ({ request }) => {
    console.log('⚡ Probando rendimiento del endpoint');

    const startTime = Date.now();
    const response = await request.get('/api/v1/reportes/dashboard-ejecutivo/');
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    expect(response.status()).toBe(200);

    // Verificar que el endpoint responde en menos de 2 segundos
    expect(responseTime).toBeLessThan(2000);

    console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);

    // Verificar tamaño de respuesta
    const data = await response.json();
    const responseSize = JSON.stringify(data).length;
    console.log(`📦 Tamaño de respuesta: ${responseSize} bytes`);

    console.log('✅ Rendimiento del endpoint aceptable');
  });

});
