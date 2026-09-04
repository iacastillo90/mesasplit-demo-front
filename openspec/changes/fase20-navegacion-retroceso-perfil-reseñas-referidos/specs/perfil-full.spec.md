# Spec: Botón Retroceder Universal, Pestañas Responsivas, Modal DTE y Secciones de Perfil (fase20-navegacion-retroceso-perfil-reseñas-referidos)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Botón Volver Universal (`AppHeader.jsx`)
- **MUST** desplegar un botón de retroceso "⬅️ Volver" en la cabecera cuando `currentRoute !== '/'`.
- **MUST** permitir al usuario volver a la página previa o a la pantalla superior al hacer clic.

### REQUIREMENT 2: Pestañas Dinámicas y Responsivas de Perfil (`ClientProfilePage.jsx`)
- **MUST** permitir scroll horizontal suave en móviles sin desbordar ni romper la maquetación.
- **MUST** cambiar dinámicamente el contenido de la pantalla al seleccionar cualquier pestaña: Resumen, Puntos & Premios, Locales & Visitas, Historial Pagos DTE, Mis Reseñas, Invitar Amigos y Editar Perfil.

### REQUIREMENT 3: Modal Emergente Centrado de Boleta DTE (`DteTicketModal.jsx`)
- **MUST** abrir un modal centrado con estilo de ticket térmico del SII al hacer clic en "Ver Ticket PDF".
- **MUST** incluir desglose de ítems, folio del documento, fecha, validación SII y botón "Descargar PDF / Imprimir".

### REQUIREMENT 4: Vistas Interactivas de Reseñas, Referidos y Editar Perfil
- **MUST** en 'Mis Reseñas': permitir publicar nuevas reseñas con selector de estrellas (1 a 5) y listado de opiniones.
- **MUST** en 'Invitar Amigos': mostrar código de referido personal, botón "Copiar Enlace", accesos a WhatsApp y tabla de bonos acumulados.
- **MUST** en 'Editar Perfil': ofrecer formulario interactivo para guardar nombre, email, teléfono y restricciones alimentarias.
