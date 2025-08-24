# /tests/e2e/test_login.py
import uuid

from playwright.sync_api import Page, expect


def test_successful_login_flow(page: Page):
    """
    Prueba el flujo completo de registro seguido de login.
    """
    # Generar credenciales únicas para este test
    unique_username = f"logintest_{str(uuid.uuid4()).replace('-', '')[:8]}"
    full_name = "Usuario Login Test"
    password = "mipassword123"

    # 1. Navegar a la página
    page.goto("http://localhost:3000")

    # 2. Primero registrarse (cambiar a la pestaña de registro)
    page.click("button:has-text('Registrarse')")
    # Esperar a que el formulario de registro esté visible
    page.locator("#register-form-container").wait_for(state="visible")

    # 3. Rellenar el formulario de registro
    page.fill("#register-form-container input[name='full_name']", full_name)
    page.fill("#register-form-container input[name='username']", unique_username)
    page.fill("#register-form-container input[name='password']", password)

    # 4. Hacer clic en registrar
    page.click("#registration-form button[type='submit']")

    # 5. Verificar mensaje de éxito y que cambió automáticamente al login
    success_message = page.locator("#message-container")
    expect(success_message).to_contain_text("creado con éxito")

    # 6. Verificar que estamos en el formulario de login
    expect(page.locator("#login-form-container")).to_be_visible()
    expect(page.locator("#register-form-container")).to_have_class(
        "form-container hidden"
    )

    # 7. Hacer login con las mismas credenciales
    page.fill("#login-username", unique_username)
    page.fill("#login-password", password)

    # 8. Hacer clic en iniciar sesión
    page.click("#login-form button[type='submit']")

    # 9. Verificar que aparece la vista de la aplicación con el mapa de habitaciones
    expect(page.locator("#app-view")).to_be_visible()
    expect(page.locator("#auth-view")).not_to_be_visible()
    expect(page.locator(".room-card").first).to_be_visible()


def test_login_with_invalid_credentials(page: Page):
    """
    Prueba que el sistema maneja correctamente credenciales incorrectas.
    """
    # 1. Navegar a la página (debe mostrar login por defecto)
    page.goto("http://localhost:3000")

    # 2. Verificar que estamos en el formulario de login
    expect(page.locator("#login-form-container")).to_be_visible()

    # 3. Intentar login con credenciales inexistentes
    page.fill("#login-username", "usuarioinexistente")
    page.fill("#login-password", "passwordincorrecto")

    # 4. Hacer clic en iniciar sesión
    page.click("#login-form button[type='submit']")

    # 5. Verificar mensaje de error
    error_message = page.locator("#message-container")
    expect(error_message).to_contain_text("Username o contraseña incorrectos")
    expect(error_message).to_have_class("message error")

    # 6. Verificar que seguimos en el formulario de login
    expect(page.locator("#login-form-container")).to_be_visible()
    expect(page.locator("#auth-view")).to_be_visible()
    expect(page.locator("#app-view")).not_to_be_visible()


def test_logout_functionality(page: Page):
    """
    Prueba la funcionalidad de cerrar sesión.
    """
    # Generar credenciales únicas para este test
    unique_username = f"logouttest_{str(uuid.uuid4()).replace('-', '')[:8]}"
    full_name = "Usuario Logout Test"
    password = "mipassword123"

    # 1. Navegar y registrar usuario
    page.goto("http://localhost:3000")
    page.click("button:has-text('Registrarse')")
    # Esperar a que el formulario de registro esté visible
    page.locator("#register-form-container").wait_for(state="visible")

    page.fill("#register-form-container input[name='full_name']", full_name)
    page.fill("#register-form-container input[name='username']", unique_username)
    page.fill("#register-form-container input[name='password']", password)
    page.click("#registration-form button[type='submit']")

    # 2. Hacer login
    page.fill("#login-username", unique_username)
    page.fill("#login-password", password)
    page.click("#login-form button[type='submit']")

    # 3. Verificar que estamos logueados
    expect(page.locator("#app-view")).to_be_visible()
    expect(page.locator("#auth-view")).not_to_be_visible()

    # 4. Hacer click en cerrar sesión (usar el ID específico del botón)
    page.click("#logout-button")

    # 5. Verificar que regresamos al formulario de login
    expect(page.locator("#login-form-container")).to_be_visible()
    expect(page.locator("#auth-view")).to_be_visible()
    expect(page.locator("#app-view")).not_to_be_visible()

    # 6. Verificar mensaje de confirmación
    success_message = page.locator("#message-container")
    expect(success_message).to_contain_text("Sesión cerrada exitosamente")


def test_tab_switching(page: Page):
    """
    Prueba que la navegación entre pestañas funciona correctamente.
    """
    # 1. Navegar a la página
    page.goto("http://localhost:3000")

    # 2. Verificar que login está activo por defecto
    expect(page.locator("#login-form-container")).to_be_visible()
    expect(page.locator(".tab-button.active")).to_have_text("Iniciar Sesión")

    # 3. Cambiar a registro
    page.click("button:has-text('Registrarse')")
    # Esperar a que el formulario de registro esté visible
    page.locator("#register-form-container").wait_for(state="visible")
    expect(page.locator("#register-form-container")).to_be_visible()
    expect(page.locator("#login-form-container")).to_have_class("form-container hidden")
    expect(page.locator(".tab-button.active")).to_contain_text("Registrarse")

    # 4. Cambiar de vuelta a login
    page.click("button:has-text('Iniciar Sesión')")
    # Esperar a que el formulario de login esté visible
    page.locator("#login-form-container").wait_for(state="visible")
    expect(page.locator("#login-form-container")).to_be_visible()
    expect(page.locator("#register-form-container")).to_have_class(
        "form-container hidden"
    )
    expect(page.locator(".tab-button.active")).to_contain_text("Iniciar Sesión")


def test_login_shows_room_map_and_hides_auth_view(page: Page):
    """
    Verifica el flujo completo: el usuario inicia sesión y la vista
    cambia correctamente al mapa de habitaciones.
    """
    # --- 1. SETUP: Crear un usuario único para esta prueba ---
    unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = "password123"

    # Navegar a la página y registrar el usuario
    page.goto("http://localhost:3000")  # Asegúrate de que el puerto sea el correcto
    page.click("button:has-text('Registrarse')")
    expect(page.locator("#register-form-container")).to_be_visible()

    # Rellenar formulario de registro
    page.fill("#register-form-container input[name='full_name']", "Test User Map")
    page.fill("#register-form-container input[name='username']", unique_username)
    page.fill("#register-form-container input[name='password']", password)

    # Enviar registro y esperar respuesta de la API
    with page.expect_response("**/api/users/") as response_info:
        page.click("#register-form-container button[type='submit']")

    response = response_info.value
    assert response.ok, "Falló el registro del usuario de prueba"

    # --- 2. ACCIÓN: Iniciar sesión con el nuevo usuario ---
    # Esperar a que el formulario de login esté visible después del registro
    expect(page.locator("#login-form-container")).to_be_visible()

    page.fill("#login-username", unique_username)
    page.fill("#login-password", password)

    # Iniciar sesión y esperar respuesta de la API de token
    with page.expect_response("**/api/token") as response_info:
        page.click("#login-form button[type='submit']")

    response = response_info.value
    assert response.ok, "Falló el inicio de sesión"

    # --- 3. VERIFICACIÓN: Comprobar el cambio de vista ---
    # La vista de autenticación DEBE desaparecer
    expect(page.locator("#auth-view")).not_to_be_visible()

    # La vista de la aplicación DEBE aparecer
    expect(page.locator("#app-view")).to_be_visible()

    # Verificar contenido específico del mapa de habitaciones
    # Esperamos a que aparezca al menos una tarjeta de habitación
    expect(page.locator(".room-card").first).to_be_visible()
    # Verificamos el título del mapa (sin emoji para evitar problemas de codificación)
    expect(page.locator("#app-view h1")).to_contain_text(
        "Mapa de Habitaciones - SKYNET 2.0"
    )
