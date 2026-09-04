# Spec: Layout de Navegación Inferior Móvil (fase17-bottom-nav-mobile-layout-cliente)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Barra de Navegación Inferior Móvil (`ClientBottomNav.jsx`)
- **MUST** permanecer fija en la parte inferior de la pantalla en dispositivos móviles y tablets.
- **MUST** ofrecer 5 pestañas de navegación directa:
  1. 📊 **Dashboard** (`/cliente/dashboard`)
  2. 📷 **Escanear QR** (`/cliente/scan`)
  3. 🍽️ **Mesa 12** (`/cliente`)
  4. 🛒 **Comanda** (`/cliente/carrito`) con contador de ítems en tiempo real.
  5. 👤 **Mi Perfil** (`/cliente/perfil`)
- **MUST** resaltar visualmente la pestaña activa según la ruta actual de la aplicación.

### REQUIREMENT 2: Botón Volver ⬅️ y Retroceso Intuitivo
- **MUST** incluir un affordance claro de retroceso en las sub-páginas del cliente para volver al Dashboard o a la Mesa Virtual sin complicaciones.
