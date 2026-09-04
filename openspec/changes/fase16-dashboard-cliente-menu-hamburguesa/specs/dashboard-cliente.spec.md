# Spec: Dashboard de Cliente y Menú de Hamburguesa Colapsable (fase16-dashboard-cliente-menu-hamburguesa)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Menú Lateral Colapsable con Hamburguesa 🍔 (`ClientDrawerMenu.jsx`)
- **MUST** abrirse al hacer clic en el botón de hamburguesa 🍔 de la cabecera.
- **MUST** incluir accesos a todas las herramientas del comensal: Escanear Mesa, Mesa Virtual, Mi Comanda, Perfil VIP, Puntos & Premios, Locales Visitados, Historial Pagos DTE, Reseñas, Invitar Amigos, Soporte en Vivo, Reservas y Cerrar Sesión.
- **MUST** cerrarse al seleccionar una opción o presionar el botón de cerrar ✕ / backdrop.

### REQUIREMENT 2: Dashboard de Cliente (`/cliente/dashboard`)
- **MUST** mostrar el saludo de bienvenida personalizado con avatar del usuario y nivel VIP Gold.
- **MUST** incluir tarjetas de acceso directo para Escanear Mesa (`/cliente/scan`) o Ir a Mesa Virtual (`/cliente`).
- **MUST** presentar widgets interactivos de Puntos Rewards, Recompensas activas, Boletas recientes y Asistente de Reservas.
