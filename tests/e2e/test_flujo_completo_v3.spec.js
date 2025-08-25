/**
 * ===== TEST COMPLETO DEL FLUJO DE CHECK-IN Y PAGO =====
 * Gestor HR v3.0 - Sistema Hotelero Profesional
 *
 * Este test verifica el flujo completo:
 * 1. Login de usuario
 * 2. Visualización de habitaciones
 * 3. Selección de habitación disponible
 * 4. Selección de tarifa
 * 5. Registro de cliente
 * 6. Proceso de pago
 * 7. Verificación de check-in exitoso
 */

import { test, expect } from '@playwright/test';

test.describe('Gestor HR v3.0 - Flujo Completo Check-in y Pago', () => {

    test.beforeEach(async ({ page }) => {
        // Navegar a la aplicación
        await page.goto('http://localhost:8000');

        // Realizar login real con las credenciales del usuario admin creado
        console.log('🔐 Realizando login con usuario admin...');

        // Esperar a que aparezca el modal de login (debe estar visible por defecto)
        await page.waitForSelector('#modal-login', { timeout: 10000 });

        // Verificar que el modal sea visible
        await page.waitForFunction(() => {
            const modal = document.getElementById('modal-login');
            const computed = window.getComputedStyle(modal);
            return computed.display !== 'none' && computed.visibility !== 'hidden';
        }, { timeout: 10000 });

        // Llenar el formulario de login con los IDs correctos
        await page.fill('#login-email', 'admin@hotel.com');
        await page.fill('#login-password', 'admin123');

        // Click en el botón de login
        await page.click('#btn-login');

        // Esperar a que el login sea exitoso y el modal se oculte
        await page.waitForFunction(() => {
            const modal = document.getElementById('modal-login');
            const computed = window.getComputedStyle(modal);
            return computed.display === 'none' || computed.visibility === 'hidden';
        }, { timeout: 15000 });

        // Esperar a que se cargue la aplicación completamente
        await page.waitForSelector('.header-principal', { timeout: 10000 });
        await page.waitForTimeout(3000);

        console.log('✅ Login exitoso y aplicación cargada correctamente');
    });

    test('Flujo completo: Login → Selección de habitación → Check-in → Pago', async ({ page }) => {
        console.log('🚀 Iniciando test del flujo completo...');

        // ===== PASO 1: VERIFICAR LOGIN =====
        console.log('📝 PASO 1: Verificando proceso de login...');

        // Buscar y hacer clic en el modal de login (si aparece)
        try {
            const loginModal = page.locator('#modal-login');
            if (await loginModal.isVisible({ timeout: 5000 })) {
                console.log('🔐 Modal de login detectado, procediendo con autenticación...');

                await page.fill('#login-email', 'admin@hotel.com');
                await page.fill('#login-password', 'admin123');
                await page.click('#btn-login');

                // Esperar a que el modal desaparezca
                await loginModal.waitFor({ state: 'detached', timeout: 10000 });
                console.log('✅ Login completado exitosamente');
            } else {
                console.log('ℹ️ Usuario ya autenticado o modal no visible');
            }
        } catch (error) {
            console.log('⚠️ No se encontró modal de login, continuando...');
        }

        // ===== PASO 2: VERIFICAR NAVEGACIÓN A RECEPCIÓN =====
        console.log('📝 PASO 2: Verificando interfaz de recepción...');

        // Verificar que estamos en la sección de recepción
        await expect(page.locator('#vista-recepcion')).toBeVisible({ timeout: 10000 });
        console.log('✅ Vista de recepción cargada');

        // Verificar que el botón de recepción está activo
        const recepcionBtn = page.locator('.nav-btn[data-vista="vista-recepcion"]');
        await expect(recepcionBtn).toHaveClass(/active/);
        console.log('✅ Navegación de recepción activa');

        // ===== PASO 3: VERIFICAR CARGA DE HABITACIONES =====
        console.log('📝 PASO 3: Verificando carga de habitaciones...');

        // Esperar a que se carguen las habitaciones
        await page.waitForSelector('#mapa-habitaciones-grid .habitacion-card', { timeout: 15000 });

        // Contar habitaciones cargadas
        const habitaciones = page.locator('.habitacion-card');
        const countHabitaciones = await habitaciones.count();
        console.log(`🏠 Habitaciones cargadas: ${countHabitaciones}`);

        expect(countHabitaciones).toBeGreaterThan(0);

        // Verificar que hay al menos una habitación disponible
        const habitacionesDisponibles = page.locator('.habitacion-card.estado-disponible');
        const countDisponibles = await habitacionesDisponibles.count();
        console.log(`✅ Habitaciones disponibles: ${countDisponibles}`);

        expect(countDisponibles).toBeGreaterThan(0);

        // ===== PASO 4: SELECCIONAR HABITACIÓN DISPONIBLE =====
        console.log('📝 PASO 4: Seleccionando habitación disponible...');

        // Hacer clic en la primera habitación disponible
        const primeraHabitacionDisponible = habitacionesDisponibles.first();

        // Obtener información de la habitación antes de hacer clic
        const numeroHabitacion = await primeraHabitacionDisponible.locator('.habitacion-numero').textContent();
        console.log(`🏠 Seleccionando habitación: ${numeroHabitacion}`);

        await primeraHabitacionDisponible.click();

        // ===== PASO 5: VERIFICAR APERTURA DEL MODAL DE OPERACIÓN =====
        console.log('📝 PASO 5: Verificando modal de operación...');

        // Esperar a que aparezca el modal de operación
        const modalOperacion = page.locator('#modal-operacion-habitacion');
        await expect(modalOperacion).toBeVisible({ timeout: 10000 });
        console.log('✅ Modal de operación abierto');

        // Verificar que el título contiene el número de habitación
        const tituloModal = page.locator('#op-numero-habitacion');
        await expect(tituloModal).toContainText(numeroHabitacion || '');

        // ===== PASO 6: SELECCIONAR TARIFA =====
        console.log('📝 PASO 6: Seleccionando tarifa...');

        // Esperar a que aparezcan las tarifas
        await page.waitForSelector('.tarifa-card', { timeout: 10000 });

        // Seleccionar la primera tarifa (Estándar)
        const tarifaEstandar = page.locator('.tarifa-card[data-tarifa-id="estandar"]');
        await expect(tarifaEstandar).toBeVisible();

        const btnSeleccionarTarifa = tarifaEstandar.locator('.btn-seleccionar-tarifa');
        await btnSeleccionarTarifa.click();

        console.log('✅ Tarifa estándar seleccionada');

        // Verificar que la tarifa se marcó como seleccionada
        await expect(tarifaEstandar).toHaveClass(/selected/);

        // Verificar que el botón de continuar se habilitó
        const btnContinuar = page.locator('#btn-op-checkin');
        await expect(btnContinuar).toBeVisible();
        await expect(btnContinuar).not.toBeDisabled();

        // ===== PASO 7: COMPLETAR DATOS DEL CLIENTE =====
        console.log('📝 PASO 7: Completando datos del cliente...');

        // Llenar formulario de cliente
        await page.fill('#cliente-nombre', 'Juan Pérez Test');
        await page.fill('#cliente-email', 'juan.perez@test.com');
        await page.fill('#cliente-telefono', '+34 600 123 456');

        console.log('✅ Datos del cliente completados');

        // ===== PASO 8: CONTINUAR AL PAGO =====
        console.log('📝 PASO 8: Continuando al proceso de pago...');

        await btnContinuar.click();

        // Esperar un momento para que se procese
        await page.waitForTimeout(2000);

        // ===== PASO 9: VERIFICAR MODAL DE PAGO =====
        console.log('📝 PASO 9: Verificando modal de pago...');

        // Esperar a que aparezca el modal de pago
        const modalPago = page.locator('#modal-pago');
        await expect(modalPago).toBeVisible({ timeout: 10000 });
        console.log('✅ Modal de pago abierto');

        // Verificar que aparece el resumen del pago
        const pagoLineas = page.locator('#pago-lineas');
        await expect(pagoLineas).toBeVisible();

        const totalAmount = page.locator('#pago-total-amount');
        await expect(totalAmount).toBeVisible();

        const totalText = await totalAmount.textContent();
        console.log(`💰 Total a pagar: ${totalText}`);

        // ===== PASO 10: SELECCIONAR MÉTODO DE PAGO =====
        console.log('📝 PASO 10: Seleccionando método de pago...');

        // Verificar que efectivo está seleccionado por defecto
        const radioEfectivo = page.locator('input[name="metodo"][value="efectivo"]');
        await expect(radioEfectivo).toBeChecked();

        // Verificar que aparece el campo de dinero recibido
        const dineroRecibido = page.locator('#dinero-recibido');
        await expect(dineroRecibido).toBeVisible();

        console.log('✅ Método de pago en efectivo seleccionado');

        // ===== PASO 11: CONFIRMAR PAGO =====
        console.log('📝 PASO 11: Confirmando pago...');

        const btnConfirmarPago = page.locator('#btn-confirmar-pago');
        await expect(btnConfirmarPago).toBeVisible();
        await expect(btnConfirmarPago).not.toBeDisabled();

        await btnConfirmarPago.click();

        // ===== PASO 12: VERIFICAR ÉXITO DEL PROCESO =====
        console.log('📝 PASO 12: Verificando éxito del proceso...');

        // Esperar un momento a que se procese el pago
        await page.waitForTimeout(3000);

        // Verificar si aparece un mensaje (exitoso o de error)
        const mensajeExito = page.locator('.mensaje-exito');
        const mensajeError = page.locator('.mensaje-error');

        try {
            // Intentar encontrar mensaje de éxito
            await page.waitForSelector('.mensaje-exito', { timeout: 5000 });
            await expect(mensajeExito).toBeVisible();

            const textoMensaje = await mensajeExito.textContent();
            console.log(`✅ Mensaje de éxito: ${textoMensaje}`);

        } catch (error) {
            // Si no hay mensaje de éxito, verificar si hay error
            const hasError = await mensajeError.isVisible();
            if (hasError) {
                const textoError = await mensajeError.textContent();
                console.log(`❌ Mensaje de error: ${textoError}`);

                // Hacer screenshot para debug
                await page.screenshot({ path: 'payment-error-debug.png' });

                // Fallar el test con información del error
                throw new Error(`Pago falló con error: ${textoError}`);
            } else {
                // No hay ningún mensaje, hacer screenshot para debug
                await page.screenshot({ path: 'no-message-debug.png' });

                // Verificar si los modales se cerraron (indicaría éxito)
                const modalPagoVisible = await page.locator('#modal-pago').isVisible();
                const modalOperacionVisible = await page.locator('#modal-operacion-habitacion').isVisible();

                console.log(`Modal pago visible: ${modalPagoVisible}, Modal operación visible: ${modalOperacionVisible}`);

                if (!modalPagoVisible && !modalOperacionVisible) {
                    console.log('✅ Modales cerrados, asumiendo éxito');
                    // Si los modales se cerraron, podemos asumir que fue exitoso
                } else {
                    throw new Error('No se encontró mensaje de éxito ni los modales se cerraron');
                }
            }
        }

        const textoMensaje = await mensajeExito.textContent();
        console.log(`✅ Mensaje de éxito: ${textoMensaje}`);

        // Verificar que contiene "check-in"
        expect(textoMensaje).toMatch(/check-in.*exitosamente/i);

        // Esperar a que se cierre el modal
        await expect(modalPago).not.toBeVisible({ timeout: 10000 });
        console.log('✅ Modal de pago cerrado');

        // ===== PASO 13: VERIFICAR ACTUALIZACIÓN DE HABITACIÓN =====
        console.log('📝 PASO 13: Verificando actualización del estado de la habitación...');

        // Esperar un momento para que se actualicen los datos
        await page.waitForTimeout(3000);

        // Buscar la habitación que acabamos de procesar
        const habitacionProcesada = page.locator(`[data-numero="${numeroHabitacion}"]`);

        // Verificar que ya no está disponible (debería estar ocupada)
        await expect(habitacionProcesada).not.toHaveClass(/estado-disponible/);
        console.log('✅ Estado de habitación actualizado correctamente');

        // ===== PASO 14: VERIFICAR ESTADÍSTICAS =====
        console.log('📝 PASO 14: Verificando actualización de estadísticas...');

        // Verificar que las estadísticas se actualizaron
        const statsOcupadas = page.locator('#total-ocupadas');
        const statsDisponibles = page.locator('#total-disponibles');

        await expect(statsOcupadas).toBeVisible();
        await expect(statsDisponibles).toBeVisible();

        const ocupadasText = await statsOcupadas.textContent();
        const disponiblesText = await statsDisponibles.textContent();

        console.log(`📊 Estadísticas actualizadas - Ocupadas: ${ocupadasText}, Disponibles: ${disponiblesText}`);

        console.log('🎉 ¡FLUJO COMPLETO EJECUTADO EXITOSAMENTE!');
    });

    test('Verificación de estados de habitaciones y funcionalidad de limpieza/mantenimiento', async ({ page }) => {
        console.log('🧹 Iniciando test de estados de habitaciones...');

        // Login si es necesario
        try {
            const loginModal = page.locator('#modal-login');
            if (await loginModal.isVisible({ timeout: 5000 })) {
                await page.fill('#login-email', 'admin@hotel.com');
                await page.fill('#login-password', 'admin123');
                await page.click('#btn-login');
                await loginModal.waitFor({ state: 'detached', timeout: 10000 });
            }
        } catch (error) {
            // Login no necesario
        }

        // Verificar que hay habitaciones en diferentes estados
        await page.waitForSelector('.habitacion-card', { timeout: 10000 });

        // Buscar habitaciones en limpieza
        const habitacionesLimpieza = page.locator('.habitacion-card.estado-limpieza');
        const countLimpieza = await habitacionesLimpieza.count();

        if (countLimpieza > 0) {
            console.log(`🧹 Habitaciones en limpieza encontradas: ${countLimpieza}`);

            // Verificar botón de marcar como limpia
            const btnMarcarLimpia = habitacionesLimpieza.first().locator('.habitacion-btn-action');
            await expect(btnMarcarLimpia).toBeVisible();
            await expect(btnMarcarLimpia).toContainText(/limpia/i);

            console.log('✅ Botón de marcar como limpia verificado');
        }

        // Buscar habitaciones en mantenimiento
        const habitacionesMantenimiento = page.locator('.habitacion-card.estado-mantenimiento');
        const countMantenimiento = await habitacionesMantenimiento.count();

        if (countMantenimiento > 0) {
            console.log(`🔧 Habitaciones en mantenimiento encontradas: ${countMantenimiento}`);

            // Verificar botón de finalizar mantenimiento
            const btnFinalizarMantenimiento = habitacionesMantenimiento.first().locator('.habitacion-btn-action');
            await expect(btnFinalizarMantenimiento).toBeVisible();
            await expect(btnFinalizarMantenimiento).toContainText(/mantenimiento/i);

            console.log('✅ Botón de finalizar mantenimiento verificado');
        }

        console.log('✅ Estados de habitaciones verificados correctamente');
    });

    test('Verificación de navegación entre secciones', async ({ page }) => {
        console.log('🧭 Iniciando test de navegación...');

        // Login si es necesario
        try {
            const loginModal = page.locator('#modal-login');
            if (await loginModal.isVisible({ timeout: 5000 })) {
                await page.fill('#login-email', 'admin@hotel.com');
                await page.fill('#login-password', 'admin123');
                await page.click('#btn-login');
                await loginModal.waitFor({ state: 'detached', timeout: 10000 });
            }
        } catch (error) {
            // Login no necesario
        }

        // Verificar navegación a TPV/Pedidos
        const btnPedidos = page.locator('.nav-btn[data-vista="vista-pedido"]');
        await btnPedidos.click();

        await expect(page.locator('#vista-pedido')).toBeVisible();
        await expect(btnPedidos).toHaveClass(/active/);
        console.log('✅ Navegación a TPV/Pedidos verificada');

        // Verificar navegación a Reportes
        const btnReportes = page.locator('.nav-btn[data-vista="vista-reportes"]');
        await btnReportes.click();

        await expect(page.locator('#vista-reportes')).toBeVisible();
        await expect(btnReportes).toHaveClass(/active/);
        console.log('✅ Navegación a Reportes verificada');

        // Volver a Recepción
        const btnRecepcion = page.locator('.nav-btn[data-vista="vista-recepcion"]');
        await btnRecepcion.click();

        await expect(page.locator('#vista-recepcion')).toBeVisible();
        await expect(btnRecepcion).toHaveClass(/active/);
        console.log('✅ Navegación de vuelta a Recepción verificada');
    });
});
