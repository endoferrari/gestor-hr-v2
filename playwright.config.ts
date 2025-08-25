import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración optimizada de Playwright para tests E2E con Bun
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Configuración de ejecución optimizada */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2, // Optimizado para desarrollo local

  /* Configuración de reporter */
  reporter: [
    ['html', { open: 'never' }], // No abrir automáticamente
    ['dot'], // Reporter compacto para desarrollo
  ],

  /* Configuración compartida optimizada */
  use: {
    baseURL: 'http://localhost:8000',

    /* Configuración de captura optimizada */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    /* Timeouts optimizados */
    actionTimeout: 10000,
    navigationTimeout: 15000,

    /* Configuración de navegador */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  /* Configurar solo Chromium para velocidad */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  /* Servidor web optimizado */
  webServer: {
    command: 'uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000, // Más tiempo para arrancar el servidor
  },

  /* Configuración de timeouts globales */
  timeout: 60000, // 1 minuto por test
  expect: {
    timeout: 10000, // 10 segundos para assertions
  },
});
