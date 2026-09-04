# Spec: Sincronización de Rutas y Pestañas de Perfil (fase22-sincronizacion-rutas-resenas-reservas)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Sincronización de Pestaña Activa por Parámetro URL y State (`ClientProfilePage.jsx`)
- **MUST** leer `location.search` (`?tab=...`) y `location.state?.tab`.
- **MUST** cambiar `activeTab` dinámicamente si la URL solicita 'reviews', 'payments', 'rewards', 'referrals' o 'branches'.

### REQUIREMENT 2: Navegación Directa desde Cards del Dashboard (`ClientDashboardPage.jsx`)
- **MUST** redirigir la card 'Mis Reseñas de Platos' a `/cliente/perfil?tab=reviews`.
- **MUST** abrir el Asistente de Reservas al interactuar con la card 'Asistente de Reservas'.

### REQUIREMENT 3: Menú Deslizante Drawer (`ClientDrawerMenu.jsx`)
- **MUST** dirigir cada ítem a su pestaña correspondiente en la URL.
