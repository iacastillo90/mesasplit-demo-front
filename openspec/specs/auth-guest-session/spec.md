# Spec: auth-guest-session — QR Guest Onboarding

## Purpose

Unirse a una sesión de mesa existente escaneando un QR. El guest puede opcionalmente ingresar su nombre y alergias. El backend crea un JWT guest y retorna la info de la sesión.

## Requirements

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

El guest MUST poder ingresar su nombre (opcional) y alergias (opcional) antes de acceder al menú. Si no ingresa nombre, se asigna "Anónimo".

#### Scenario: Nombre proporcionado

- GIVEN el usuario en OnboardingScreen
- WHEN ingresa "Juan" como nombre
- THEN se envía `displayName: "Juan"` en el request
- AND el backend retorna `displayName: "Juan"`
- AND la pantalla muestra "Hola, Juan"

#### Scenario: Sin nombre

- GIVEN el usuario en OnboardingScreen
- WHEN presiona "Entrar" sin ingresar nombre
- THEN se envía `displayName: null`
- AND el backend asigna "Anónimo"
- AND la pantalla muestra "Hola, Anónimo"

### Requirement: Persistencia de sesión `[session-persist]`

La app MUST guardar `accessToken`, `guestId`, `dineSessionId`, `tableId` y `tableName` en SecureStorage. Al reiniciar la app, MUST recuperar la sesión si los tokens son válidos.

#### Scenario: Recuperación after restart

- GIVEN una sesión previamente guardada en SecureStorage
- WHEN la app se inicia
- THEN SplashScreen verifica `hasTokens()`
- AND si es true, navega directamente a HomeScreen (Menú)
- AND si es false, navega a QrScanScreen

### Requirement: Login staff `[staff-login]`

La app MUST soportar login de staff vía `POST /auth/login` con `{email, password}`. El JWT staff tiene permisos diferentes al guest.

#### Scenario: Login exitoso

- GIVEN el usuario en LoginScreen
- WHEN ingresa credenciales válidas
- THEN recibe `{accessToken, refreshToken, expiresIn, person}`
- AND guarda tokens en SecureStorage
- AND navega a HomeScreen

#### Scenario: Credenciales inválidas

- GIVEN el usuario en LoginScreen
- WHEN ingresa credenciales incorrectas
- THEN muestra "Credenciales incorrectas"
- AND permanece en LoginScreen
