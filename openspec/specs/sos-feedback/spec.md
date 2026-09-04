# Spec: sos-feedback — S.O.S. y Feedback (Mocked)

## Purpose

Pantallas de S.O.S. (llamar al mesero) y Feedback post-pago. Ambas están mocked en MVP porque el backend no implementa los endpoints.

> ⚠️ **Backend pendiente**: `POST /service-requests` y `POST /feedback` NO están implementados en el backend.
> La app muestra confirmaciones simuladas. Cuando el backend esté listo, reemplazar los mocks por llamadas reales.

## Requirements

### Requirement: S.O.S. mock `[sos-mock]`

La app MUST mostrar una pantalla de S.O.S. con opciones de emergencia (WAITER, BILL, WATER, OTHER). El envío está deshabilitado con flag `kSosEnabled = false`.

#### Scenario: S.O.S. con flag deshabilitado

- GIVEN `kSosEnabled = false`
- WHEN el usuario presiona "Enviar S.O.S."
- THEN muestra "Función no disponible aún"
- AND NO llama al backend

#### Scenario: S.O.S. con flag habilitado (futuro)

- GIVEN `kSosEnabled = true` y endpoint implementado
- WHEN el usuario selecciona "Mozo" y confirma
- THEN la app llama `POST /service-requests` con `{type: "WAITER"}`
- AND muestra "Solicitud enviada, el mesero vendrá pronto"

### Requirement: Feedback mock `[feedback-mock]`

La app MUST mostrar pantalla de feedback con rating 1-5 estrellas y comentario opcional. El envío está deshabilitado con flag `kFeedbackEnabled = false`.

#### Scenario: Feedback con flag deshabilitado

- GIVEN `kFeedbackEnabled = false`
- WHEN el usuario presiona "Enviar"
- THEN muestra "Gracias por tu feedback"
- AND NO llama al backend

### Requirement: Accesibilidad desde HomeScreen `[sos-access]`

El botón de S.O.S. MUST estar accesible como FAB (Floating Action Button) desde HomeScreen, visible en todas las pestañas.

#### Scenario: FAB visible

- GIVEN el usuario en HomeScreen (cualquier pestaña)
- WHEN observa la pantalla
- THEN ve un botón flotante con icono de emergencia
- AND al presionarlo, navega a `/sos`
