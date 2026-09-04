# Spec: Escaneo QR de Mesa y Perfil Completo de Usuario (fase15-flujo-qr-perfil-cliente)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Simulador de Escaneo QR (`/cliente/scan`)
- **MUST** mostrar una interfaz de visor de cámara con láser rojo animado de escaneo.
- **MUST** permitir simular el escaneo automático haciendo clic en "Simular Escaneo Mesa 12" o ingresando un código manual (ej. `M12-A9F`).
- **MUST** habilitar el botón "Siguiente → Ingresar a Mesa Virtual" que establece la mesa y redirige a `/cliente`.

### REQUIREMENT 2: Perfil Completo de Usuario (`/cliente/perfil`)
- **MUST** mostrar la tarjeta de usuario (avatar, nombre, email y nivel de lealtad).
- **MUST** incluir las 8 secciones interactivas:
  1. 📷 Escanear Otra Mesa
  2. 🏆 Puntos & Premios Canjeables
  3. 📍 Locales Visitados & Frecuentados
  4. 📜 Historial de Pagos & Boletas
  5. ⭐ Reseñas de Platos
  6. 👥 Programa de Referidos ("Invitar Amigos")
  7. 💬 Soporte al Cliente en Vivo
  8. 📅 Reservas de Mesas
