# Proposal: Fase 15 — Flujo de Escaneo QR de Mesa y Perfil Completo de Usuario

## Contexto y Motivación

Para perfeccionar la experiencia del cliente y la demostración comercial de MesaSplit, se requiere:
1. **Flujo de Escaneo QR / Código de Mesa (`/cliente/scan`)**: Después de loguearse o registrarse, el usuario entra a una pantalla de escaneo QR interactiva antes de acceder a la mesa.
2. **Perfil Interactivo de Usuario (`/cliente/perfil`)**: Vista central con secciones totalmente dinámicas:
   - 📷 Botón para escanear nueva mesa.
   - 🏆 Puntos de Afiliado & Premios (MesaSplit Rewards).
   - 📍 Locales Registrados e Historial de Visitas.
   - 📜 Historial de Pagos & Boletas DTE.
   - ⭐ Reseñas de Platos y Locales con estrellas.
   - 👥 Referidos ("Invitar Amigos y Ganar Recompensas").
   - 💬 Soporte al Cliente en Vivo.
   - 📅 Asistente de Reservas Inteligente.

## Alcance del Cambio

- **`src/features/ClientView/pages/ClientQrScanPage.jsx`**: [NUEVO] Simulador interactivo de escaneo QR o código manual.
- **`src/features/ClientView/pages/ClientProfilePage.jsx`**: [NUEVO] Panel completo de perfil de comensal.
- **`src/features/ClientView/pages/ClientLoginPage.jsx` & `ClientRegisterPage.jsx`**: Redirección a `/cliente/scan`.
- **`src/routes/views.jsx` & `src/routes/index.jsx`**: Registro de `/cliente/scan` y `/cliente/perfil`.
