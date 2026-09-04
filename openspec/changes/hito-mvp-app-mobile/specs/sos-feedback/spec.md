# Delta for sos-feedback (NEW)

## ADDED Requirements

### Requirement: S.O.S. mock `[sos-mock]`

La app MUST mostrar S.O.S. con opciones (WAITER, BILL, WATER, OTHER). Envío deshabilitado con `kSosEnabled = false`.

#### Scenario: Flag deshabilitado

- GIVEN `kSosEnabled = false`
- WHEN presiona "Enviar S.O.S."
- THEN muestra "Función no disponible aún"

### Requirement: Feedback mock `[feedback-mock]`

La app MUST mostrar feedback con rating 1-5 estrellas. Envío deshabilitado con `kFeedbackEnabled = false`.

#### Scenario: Flag deshabilitado

- GIVEN `kFeedbackEnabled = false`
- WHEN presiona "Enviar"
- THEN muestra "Gracias por tu feedback"

### Requirement: Accesibilidad S.O.S. `[sos-access]`

Botón S.O.S. MUST estar como FAB en HomeScreen.

#### Scenario: FAB visible

- GIVEN en HomeScreen
- WHEN observa la pantalla
- THEN ve FAB con icono de emergencia
- AND al presionar, navega a `/sos`
