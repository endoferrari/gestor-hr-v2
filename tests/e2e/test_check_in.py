# /tests/e2e/test_check_in.py
import re
from playwright.sync_api import Page, expect
import uuid


def test_clicking_available_room_opens_check_in_modal(page: Page):
    """
    Verifica que al hacer clic en una habitación disponible, se abre el modal de check-in.
    """
    # --- 1. SETUP: Registrar un usuario único para este test ---
    unique_id = str(uuid.uuid4())[:8]
    test_username = f"testuser_{unique_id}"
    test_password = "testpass123"

    page.goto("http://localhost:3000")

    # Ir a la pestaña de registro
    page.click("#show-register-btn")

    # Registrar nuevo usuario
    page.fill("#registration-form input[name='full_name']", f"Test User {unique_id}")
    page.fill("#registration-form input[name='username']", test_username)
    page.fill("#registration-form input[name='password']", test_password)
    page.click("#registration-form button[type='submit']")

    # Esperar mensaje de éxito y cambiar a login
    page.wait_for_selector(".message.success")

    # --- 2. LOGIN: Iniciar sesión para ver el mapa ---
    page.fill("#login-username", test_username)
    page.fill("#login-password", test_password)

    # Iniciar sesión y esperar a que aparezca el mapa
    page.click("#login-form button[type='submit']")

    # Esperar a que aparezca la vista de la aplicación
    page.wait_for_selector("#app-view:not(.hidden)")
    page.wait_for_selector(".room-grid")

    # --- 3. ACCIÓN: Hacer clic en la primera habitación disponible ---
    # Esperar a que aparezcan las habitaciones y buscar una disponible
    page.wait_for_selector(".room-card.estado-disponible")

    # Obtener la primera habitación disponible
    available_room = page.locator(".room-card.estado-disponible").first
    expect(available_room).to_be_visible()

    # Obtener el número de la habitación para verificar después
    room_number = available_room.locator(".room-number").text_content()

    available_room.click()

    # --- 4. VERIFICACIÓN: Comprobar que el modal aparece y tiene los datos correctos ---
    modal = page.locator("#check-in-modal")
    expect(modal).to_be_visible()
    expect(modal).not_to_have_class("hidden")

    # Verificar que el título del modal contiene el número de la habitación correcta
    expect(modal.locator("#modal-room-number")).to_contain_text(
        f"Habitación #{room_number}"
    )

    # Verificar que los campos del formulario están presentes
    expect(modal.locator("#modal-huesped-nombre")).to_be_visible()
    expect(modal.locator("#modal-huesped-telefono")).to_be_visible()
    expect(modal.locator("#modal-huesped-email")).to_be_visible()

    # Verificar que el ID oculto de la habitación se ha establecido (debe ser un número)
    habitacion_id_value = modal.locator("#modal-habitacion-id").input_value()
    assert (
        habitacion_id_value.isdigit()
    ), f"Expected habitacion_id to be a number, got: {habitacion_id_value}"


def test_check_in_modal_can_be_closed(page: Page):
    """
    Verifica que el modal de check-in se puede cerrar correctamente.
    """
    # --- 1. SETUP: Registrar un usuario y hacer login ---
    unique_id = str(uuid.uuid4())[:8]
    test_username = f"testuser_{unique_id}"
    test_password = "testpass123"

    page.goto("http://localhost:3000")

    # Registrar usuario
    page.click("#show-register-btn")
    page.fill("#registration-form input[name='full_name']", f"Test User {unique_id}")
    page.fill("#registration-form input[name='username']", test_username)
    page.fill("#registration-form input[name='password']", test_password)
    page.click("#registration-form button[type='submit']")
    page.wait_for_selector(".message.success")

    # Login
    page.fill("#login-username", test_username)
    page.fill("#login-password", test_password)
    page.click("#login-form button[type='submit']")
    page.wait_for_selector("#app-view:not(.hidden)")
    page.wait_for_selector(".room-grid")
    page.wait_for_selector(".room-card.estado-disponible")

    # --- 2. ACCIÓN: Abrir modal y cerrarlo ---
    available_room = page.locator(".room-card.estado-disponible").first
    available_room.click()

    # Verificar que el modal se abre
    modal = page.locator("#check-in-modal")
    expect(modal).to_be_visible()

    # Cerrar modal con el botón cancelar
    page.click("#modal-cancel-btn")

    # --- 3. VERIFICACIÓN: Modal se cierra ---
    expect(modal).not_to_be_visible()
    # También verificar que tenga la clase hidden
    expect(modal).to_have_class(re.compile(r".*hidden.*"))


def test_check_in_form_submission_with_valid_data(page: Page):
    """
    Verifica que el formulario de check-in funciona con datos válidos.
    """
    # --- 1. SETUP: Registrar un usuario y hacer login ---
    unique_id = str(uuid.uuid4())[:8]
    test_username = f"testuser_{unique_id}"
    test_password = "testpass123"

    page.goto("http://localhost:3000")

    # Registrar usuario
    page.click("#show-register-btn")
    page.fill("#registration-form input[name='full_name']", f"Test User {unique_id}")
    page.fill("#registration-form input[name='username']", test_username)
    page.fill("#registration-form input[name='password']", test_password)
    page.click("#registration-form button[type='submit']")
    page.wait_for_selector(".message.success")

    # Login
    page.fill("#login-username", test_username)
    page.fill("#login-password", test_password)
    page.click("#login-form button[type='submit']")
    page.wait_for_selector("#app-view:not(.hidden)")
    page.wait_for_selector(".room-grid")
    page.wait_for_selector(".room-card.estado-disponible")

    # --- 2. ACCIÓN: Abrir modal y llenar formulario ---
    available_room = page.locator(".room-card.estado-disponible").first
    available_room.click()

    # Verificar que el modal se abre
    modal = page.locator("#check-in-modal")
    expect(modal).to_be_visible()

    # Llenar el formulario de check-in
    page.fill("#modal-huesped-nombre", "Juan Pérez")
    page.fill("#modal-huesped-telefono", "555-1234")
    page.fill("#modal-huesped-email", "juan.perez@example.com")

    # --- 3. ACCIÓN: Enviar formulario ---
    page.click("#check-in-form button[type='submit']")

    # --- 4. VERIFICACIÓN: Check-in exitoso ---
    # Esperar a que el contenedor de mensajes se haga visible con contenido de éxito
    page.wait_for_function(
        """
        () => {
            const container = document.getElementById('message-container');
            return container &&
                   container.textContent.includes('éxito') &&
                   !container.classList.contains('hidden') &&
                   container.classList.contains('success');
        }
    """,
        timeout=5000,
    )

    # Una vez que vemos el mensaje, también verificar que el modal se cerró
    expect(modal).not_to_be_visible()


def test_full_check_in_and_check_out_cycle(page: Page):
    """
    Verifica el ciclo completo: login -> check-in -> check-out.
    """
    # --- 1. SETUP: Iniciar sesión ---
    page.goto("http://localhost:3000")
    page.fill("#login-username", "admin")
    page.fill("#login-password", "admin123")
    page.click("#login-form button[type='submit']")

    # Esperar un poco y verificar si hay errores de login
    page.wait_for_timeout(2000)

    # Verificar si aparece un mensaje de error
    error_message = page.locator(".message.error")
    if error_message.count() > 0:
        error_text = error_message.text_content()
        raise Exception(f"Error de login: {error_text}")

    # Esperar a que cargue el mapa de habitaciones
    page.wait_for_selector(".room-grid", timeout=15000)
    page.wait_for_selector(".room-card.estado-disponible")

    # --- 2. ACCIÓN: Realizar un Check-In en una habitación disponible ---
    room_disponible = page.locator(".room-card.estado-disponible").first
    expect(room_disponible).to_be_visible()
    room_disponible.click()

    modal_check_in = page.locator("#check-in-modal")
    expect(modal_check_in).to_be_visible()
    modal_check_in.locator("#modal-huesped-nombre").fill(
        "Huesped de Prueba Ciclo Completo"
    )
    modal_check_in.locator("#modal-huesped-telefono").fill("555-1234")
    modal_check_in.locator("#modal-huesped-email").fill("test@example.com")

    # Enviar formulario de check-in
    modal_check_in.locator("button[type='submit']").click()

    # Esperar a que se procese el check-in
    page.wait_for_timeout(3000)

    # --- 3. VERIFICACIÓN INTERMEDIA: La habitación está ocupada ---
    # Refrescar la página para obtener los estados actualizados
    page.reload()
    page.wait_for_selector(".room-grid")
    page.wait_for_selector(".room-card.estado-ocupada")

    # --- 4. ACCIÓN: Realizar un Check-Out en la misma habitación ---
    room_ocupada = page.locator(".room-card.estado-ocupada").first
    expect(room_ocupada).to_be_visible()
    room_ocupada.click()

    modal_check_out = page.locator("#check-out-modal")
    expect(modal_check_out).to_be_visible()
    expect(modal_check_out).to_contain_text("Confirmar Check-Out")

    # Confirmar check-out
    modal_check_out.locator("#checkout-confirm-btn").click()

    # Esperar a que se procese el check-out
    page.wait_for_timeout(3000)

    # --- 5. VERIFICACIÓN FINAL: La habitación está en limpieza ---
    # Refrescar la página para obtener los estados actualizados
    page.reload()
    page.wait_for_selector(".room-grid")

    # Verificar que existe al menos una habitación en limpieza
    limpieza_rooms = page.locator(".room-card.estado-limpieza")
    expect(limpieza_rooms.first).to_be_visible()

    # Verificar que el modal de check-out se cerró
    expect(page.locator("#check-out-modal")).not_to_be_visible()
