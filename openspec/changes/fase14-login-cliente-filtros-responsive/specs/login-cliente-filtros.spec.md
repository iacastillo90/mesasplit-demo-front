# Spec: Login de Cliente, Registro Ley 21.716 y Filtros Responsivos del Menú (fase14-login-cliente-filtros-responsive)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Login Demostrativo de Cliente (`/cliente/login`)
- **MUST** permitir ingresar con cualquier combinación de correo electrónico y clave.
- **MUST** guardar la sesión en `useClientStore` y redireccionar a la Mesa Virtual (`/cliente`).
- **MUST** permitir cerrar sesión (`logoutUser`) o volver como invitado.

### REQUIREMENT 2: Registro de Usuario con Ley N° 21.716 (`/cliente/registro`)
- **MUST** ofrecer opciones de Social Login rápido: "Continuar con Apple 🍏" y "Continuar con Google 🔴".
- **MUST** incluir campos de Nombre Completo, Email y Contraseña.
- **MUST** incluir un Checkbox obligatorio de aceptación de la **Ley N° 21.716 sobre Protección de Datos Personales en Chile**.
- **MUST** registrar al usuario en el store y redirigir a `/cliente`.

### REQUIREMENT 3: Barra de Filtros Responsiva Móvil en `ClientPage.jsx`
- **MUST** implementar un contenedor horizontal con scroll táctil suave (`overflow-x-auto whitespace-nowrap scrollbar-none`).
- **MUST NOT** desbordar horizontalmente la pantalla ni romper la disposición en smartphones (viewport < 640px).

### REQUIREMENT 4: Filtrado Dinámico del Menú (Mínimo 5 Platos por Filtro)
- **MUST** responder inmediatamente al hacer clic en cualquier filtro (`Todos`, `🌱 Vegano`, `🌾 Sin Gluten`, `🌶️ Picante`, `⭐ Popular`, `🍰 Postres`, `🍹 Bebidas`).
- **MUST** garantizar que cada filtro muestre un mínimo de 5 platos bien estructurados con imágenes, precios CLP, alérgenos y botones interactivos.
