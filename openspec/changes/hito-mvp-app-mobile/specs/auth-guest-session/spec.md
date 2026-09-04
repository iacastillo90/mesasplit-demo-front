# Delta for auth-guest-session (NEW)

## ADDED Requirements

### Requirement: QR Scan para unirse a mesa `[qr-join]`

La app MUST escanear un QR code que contenga un `qrToken` válido y llamar a `POST /auth/guest-session`. Si el token es inválido o la sesión no está OPEN, la app MUST mostrar error y permitir reintentar.

#### Scenario: Escaneo exitoso

- GIVEN la cámara activa en modo escaneo
- WHEN el usuario escanea un QR válido con `qrToken`
- THEN la app llama `POST /auth/guest-session` con `{qrToken}`
- AND recibe `{accessToken, expiresIn, guest: {id, displayName, dineSessionId, tableId, tableName}}`
- AND guarda el `accessToken` en SecureStorage
- AND navega a OnboardingScreen

#### Scenario: QR inválido o sesión cerrada

- GIVEN la cámara activa
- WHEN el usuario escanea un QR con token inválido
- THEN la app muestra "Mesa no disponible" y permite reintentar
- AND NO navega a onboarding

### Requirement: Onboarding del guest `[guest-onboarding]`

El guest MUST poder ingresar su nombre (opcional) y alergias (opcional) antes de acceder al menú.

#### Scenario: Nombre proporcionado

- GIVEN el usuario en OnboardingScreen
- WHEN ingresa "Juan" como nombre
- THEN se envía `displayName: "Juan"` en el request
- AND el backend retorna `displayName: "Juan"`

#### Scenario: Sin nombre

- GIVEN el usuario en OnboardingScreen
- WHEN presiona "Entrar" sin ingresar nombre
- THEN se envía `displayName: null`
- AND el backend asigna "Anónimo"

### Requirement: Persistencia de sesión `[session-persist]`

La app MUST guardar tokens en SecureStorage. Al reiniciar, MUST recuperar la sesión si los tokens son válidos.

#### Scenario: Recuperación after restart

- GIVEN sesión previamente guardada
- WHEN la app se inicia
- THEN SplashScreen verifica `hasTokens()`
- AND si es true, navega a HomeScreen
- AND si es false, navega a QrScanScreen

### Requirement: Login staff `[staff-login]`

La app MUST soportar login de staff vía `POST /auth/login`.

#### Scenario: Login exitoso

- GIVEN credenciales válidas
- WHEN el usuario presiona "Ingresar"
- THEN recibe tokens y navega a HomeScreen

#### Scenario: Credenciales inválidas

- GIVEN credenciales incorrectas
- WHEN el usuario presiona "Ingresar"
- THEN muestra "Credenciales incorrectas"
