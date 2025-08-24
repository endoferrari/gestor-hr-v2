#!/usr/bin/env python3
"""
Test    # Generar credenciales únicas
    unique_username = f"debugtest_{str(uuid.uuid4()).replace('-', '')[:8]}"
    full_name = "Debug Test User"
    password = "debugpassword123"

    print(f"Testing with username: {unique_username}")

    # 1. Navegar a la página
    page.goto("http://localhost:3000")

    # 2. Cambiar a registro
    page.click("button:has-text('Registrarse')")
    page.locator("#register-form-container").wait_for(state="visible")

    # 3. Llenar formulario con los nuevos IDs
    page.fill("#register-full-name", full_name)
    page.fill("#register-username", unique_username)
    page.fill("#register-password", password) qué está pasando con el registro de usuarios.
"""

import uuid
from playwright.sync_api import Page


def test_debug_registration(page: Page):
    """
    Test de debug para registration
    """
    # Configurar listener para los console logs
    console_messages = []

    def handle_console(msg):
        console_messages.append(f"[{msg.type}] {msg.text}")
        print(f"Console: [{msg.type}] {msg.text}")

    page.on("console", handle_console)

    # Configurar listener para los errores de red
    def handle_request_failed(request):
        print(f"Request failed: {request.url} - {request.failure}")

    def handle_response(response):
        if response.status >= 400:
            print(f"HTTP Error: {response.status} - {response.url}")

    page.on("requestfailed", handle_request_failed)
    page.on("response", handle_response)

    # Generar credenciales únicas
    unique_username = f"debugtest_{str(uuid.uuid4()).replace('-', '')[:8]}"
    full_name = "Debug Test User"
    password = "debugpassword123"

    print(f"Testing with username: {unique_username}")

    # 1. Navegar a la página
    page.goto("http://localhost:3000")

    # 2. Cambiar a registro
    page.click("button:has-text('Registrarse')")
    page.locator("#register-form-container").wait_for(state="visible")

    # 3. Llenar formulario
    page.fill("#register-form-container input[name='full_name']", full_name)
    page.fill("#register-form-container input[name='username']", unique_username)
    page.fill("#register-form-container input[name='password']", password)

    print("Form filled, submitting...")

    # 4. Submit
    page.click("#registration-form button[type='submit']")

    # 5. Esperar un poco para que se procese
    page.wait_for_timeout(3000)  # 3 segundos

    # 6. Verificar el contenido del message container
    message_container = page.locator("#message-container")
    message_text = message_container.text_content()
    message_classes = page.locator("#message-container").get_attribute("class")

    print(f"Message container text: '{message_text}'")
    print(f"Message container classes: '{message_classes}'")

    # 7. Imprimir todos los console logs
    print("\nAll console messages:")
    for msg in console_messages:
        print(f"  {msg}")

    # 8. Hacer screenshot para debug visual
    page.screenshot(path="debug_registration.png")
    print("Screenshot saved as debug_registration.png")

    # Para que el test no falle, simplemente verificamos que llegamos aquí
    assert True
