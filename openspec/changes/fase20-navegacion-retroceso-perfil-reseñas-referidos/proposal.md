# Proposal: Fase 20 — Botón Retroceder Universal, Pestañas Responsivas, Modal DTE y Secciones Completas de Reseñas, Referidos y Perfil

## Contexto y Motivación

Para responder a las observaciones clave del usuario sobre navegación y usabilidad:
1. **Botón Volver/Retroceder Universal (⬅️)**: `AppHeader.jsx` debe incluir el botón "⬅️ Volver" en TODAS las vistas operacionales cuando no se esté en el Hub Principal (`/`).
2. **Pestañas de Perfil Responsivas y 100% Dinámicas**: En `ClientProfilePage.jsx`, la barra de navegación de pestañas debe ser suave, con scroll táctil sin romperse en móviles y activar dinámicamente cada sección al hacer clic.
3. **Modal Emergente DTE Centrado (`DteTicketModal.jsx`)**: Sustituir la alerta básica del navegador por un modal emergente centrado con estética del proyecto que simule la boleta térmica del SII.
4. **Vistas Completas de Reseñas, Referidos y Editar Perfil**:
   - **Mis Reseñas de Platos**: Formulario interactivo con estrellas, tarjetas de comentarios y votos.
   - **Invitar Amigos**: Código de referido, botón copiar con notificación, accesos a WhatsApp/Redes e historial de puntos acreditados.
   - **Mi Perfil / Datos Personales**: Formulario para modificar datos del comensal y preferencias dietéticas.

## Alcance del Cambio

- **`src/shared/ui/AppHeader.jsx`**: [ACTUALIZADO] Botón de retroceso "⬅️ Volver" disponible universalmente en todas las vistas excepto `/`.
- **`src/features/ClientView/components/DteTicketModal.jsx`**: [NUEVO] Modal emergente centrado de ticket térmico DTE del SII.
- **`src/features/ClientView/components/DteTicketModal.test.jsx`**: [NUEVO] Test unitario para el modal DTE.
- **`src/features/ClientView/pages/ClientProfilePage.jsx`**: [ACTUALIZADO] Pestañas responsivas móviles, integración del modal DTE y nuevas subvistas completas para Reseñas, Referidos y Perfil.
