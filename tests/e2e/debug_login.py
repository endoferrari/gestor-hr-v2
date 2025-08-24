#!/usr/bin/env python3
"""
Test de debug para ver qué está pasando con el login de usuarios.
"""

import uuid
from playwright.sync_api import Page


def test_debug_login(page: Page):
    """
    Test de debug para login
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
        else:
            print(f"HTTP Success: {response.status} - {response.url}")

    page.on("requestfailed", handle_request_failed)
    page.on("response", handle_response)

    # Usar un usuario que sabemos que existe
    page.goto("http://localhost:3000")

    # Primero registrar un usuario
    unique_email = f"logintest_{uuid.uuid4()}@example.com"
    full_name = "Login Test User"
    password = "loginpassword123"

    page.click("button:has-text('Registrarse')")
    page.locator("#register-form-container").wait_for(state="visible")
    page.fill("#register-form-container input[name='full_name']", full_name)
    page.fill("#register-form-container input[name='email']", unique_email)
    page.fill("#register-form-container input[name='password']", password)
    page.click("#registration-form button[type='submit']")

    # Esperar a que se muestre el mensaje de éxito y cambie al formulario de login
    page.wait_for_timeout(2000)

    print(f"Attempting to login with: {unique_email}")

    # Ahora intentar login
    page.fill("#login-email", unique_email)
    page.fill("#login-password", password)
    page.click("#login-form button[type='submit']")

    # Esperar un poco para que se procese
    page.wait_for_timeout(3000)

    # Verificar el estado del user panel
    user_panel = page.locator("#user-panel")
    user_panel_visible = user_panel.is_visible()
    user_panel_classes = user_panel.get_attribute("class")

    print(f"User panel visible: {user_panel_visible}")
    print(f"User panel classes: '{user_panel_classes}'")

    # Verificar el message container
    message_container = page.locator("#message-container")
    message_text = message_container.text_content()
    message_classes = message_container.get_attribute("class")

    print(f"Message container text: '{message_text}'")
    print(f"Message container classes: '{message_classes}'")

    # Imprimir todos los console logs
    print("\nAll console messages:")
    for msg in console_messages:
        print(f"  {msg}")

    # Screenshot para debug
    page.screenshot(path="debug_login.png")
    print("Screenshot saved as debug_login.png")

    assert True  # No fallar el test


def test_debug_invalid_login(page: Page):
    """
    Test de debug para login con credenciales incorrectas
    """
    # Configurar listener para los console logs
    console_messages = []

    def handle_console(msg):
        console_messages.append(f"[{msg.type}] {msg.text}")
        print(f"Console: [{msg.type}] {msg.text}")

    page.on("console", handle_console)

    # Configurar listener para los errores de red
    def handle_response(response):
        if response.status >= 400:
            print(f"HTTP Error: {response.status} - {response.url}")
        else:
            print(f"HTTP Success: {response.status} - {response.url}")

    page.on("response", handle_response)

    page.goto("http://localhost:3000")

    print("Attempting to login with invalid credentials")

    # Intentar login con credenciales incorrectas
    page.fill("#login-email", "noexiste@ejemplo.com")
    page.fill("#login-password", "passwordincorrecto")
    page.click("#login-form button[type='submit']")

    # Esperar un poco para que se procese
    page.wait_for_timeout(3000)

    # Verificar el message container
    message_container = page.locator("#message-container")
    message_text = message_container.text_content()
    message_classes = message_container.get_attribute("class")

    print(f"Message container text: '{message_text}'")
    print(f"Message container classes: '{message_classes}'")

    # Imprimir todos los console logs
    print("\nAll console messages:")
    for msg in console_messages:
        print(f"  {msg}")

    # Screenshot para debug
    page.screenshot(path="debug_invalid_login.png")
    print("Screenshot saved as debug_invalid_login.png")

    assert True  # No fallar el test
