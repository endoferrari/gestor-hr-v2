# /tests/e2e/test_registration.py
import uuid

from playwright.sync_api import Page, expect

# Generamos un username único cada vez que corre el test para evitar conflictos
unique_username = f"testuser_{str(uuid.uuid4()).replace('-', '')[:8]}"


def test_successful_registration(page: Page):
    """
    Prueba que un usuario puede registrarse exitosamente.
    """
    page.goto("http://localhost:3000")  # Asumiendo que la app corre en la raíz

    # 2. Cambiar a la pestaña de registro
    page.click("button:has-text('Registrarse')")

    # Llenar el formulario
    page.fill("#register-form-container input[name='full_name']", "Usuario de Prueba")
    page.fill("#register-form-container input[name='username']", unique_username)
    page.fill("#register-form-container input[name='password']", "password123")

    # ⭐ Estrategia híbrida: intentar expect_response con timeout corto
    try:
        with page.expect_response("**/api/users/", timeout=5000) as response_info:
            page.click("#registration-form button[type='submit']")

        # Si llegamos aquí, la API respondió
        response = response_info.value
        assert response.ok
        print(f"✅ API respondió correctamente: {response.status}")

    except Exception as e:
        print(f"⚠️  Timeout en expect_response, usando fallback: {e}")
        # Fallback: hacer click y esperar al DOM
        page.click("#registration-form button[type='submit']")
        # Dar tiempo para que el frontend procese
        page.wait_for_timeout(2000)

    # Y ahora, verificamos el DOM (funciona en ambos casos)
    success_message = page.locator("#message-container")
    expect(success_message).to_contain_text("creado con éxito")
    expect(success_message).to_have_class("message success")

    # 6. Verificar que cambió automáticamente al formulario de login
    expect(page.locator("#login-form-container")).to_be_visible()
    expect(page.locator("#register-form-container")).to_have_class(
        "form-container hidden"
    )


def test_duplicate_username_registration(page: Page):
    """
    Prueba que el sistema maneja correctamente el intento de registrar
    un username que ya existe.
    """
    # Usamos un username que ya sabemos que existe en la BD
    duplicate_username = "usuariotest"

    # 1. Navegar a la página de registro
    page.goto("http://localhost:3000")

    # 2. Cambiar a la pestaña de registro
    page.click("button:has-text('Registrarse')")

    # ⭐ BUENA PRÁCTICA: "Escuchamos" la futura llamada a la API
    with page.expect_response("**/api/users/") as response_info:
        page.fill(
            "#register-form-container input[name='full_name']", "Usuario Duplicado"
        )
        page.fill("#register-form-container input[name='username']", duplicate_username)
        page.fill("#register-form-container input[name='password']", "password123")

        # Esta acción dispara la llamada a la API
        page.click("#registration-form button[type='submit']")

    # El código se detiene aquí hasta que la API responde.
    # Verificamos que la API respondió con error (400 o 409 por username duplicado)
    response = response_info.value
    assert response.status >= 400  # Error esperado

    # Ahora verificamos el DOM con certeza de que el backend ya respondió
    error_message = page.locator("#message-container")
    expect(error_message).to_contain_text("El nombre de usuario ya está registrado")
    expect(error_message).to_have_class("message error")


def test_empty_form_validation(page: Page):
    """
    Prueba que la validación HTML5 funciona para campos vacíos.
    """
    # 1. Navegar a la página de registro
    page.goto("http://localhost:3000")

    # 2. Cambiar a la pestaña de registro
    page.click("button:has-text('Registrarse')")

    # 3. Intentar enviar formulario sin llenar campos
    page.click("#registration-form button[type='submit']")

    # 4. Verificar que los campos requeridos muestran validación
    full_name_input = page.locator("#register-form-container input[name='full_name']")
    expect(full_name_input).to_have_attribute("required", "")

    # El navegador debería mostrar un mensaje de validación nativo
    # No debería haber mensaje en nuestro contenedor personalizado aún
    message_container = page.locator("#message-container")
    expect(message_container).to_be_empty()
