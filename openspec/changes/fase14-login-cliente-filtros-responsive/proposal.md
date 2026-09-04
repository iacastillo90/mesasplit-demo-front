# Proposal: Fase 14 — Login de Cliente, Registro con Ley de Protección de Datos y Filtros Responsivos del Menú

## Contexto y Motivación

Para mejorar la experiencia del comensal en la demo de MesaSplit y brindar un flujo completo de onboarding y personalización gastronómica, se requiere incorporar:
1. **Página de Login de Cliente (`/cliente/login`)**: Inicio de sesión demostrativo donde cualquier correo y contraseña ingresa a la aplicación.
2. **Página de Registro de Usuario (`/cliente/registro`)**: Registro con opciones de Social Login (Apple 🍏 y Google 🔴) o formulario directo con declaración explicita de la **Ley N° 21.716 de Protección de Datos Personales (Chile)**.
3. **Barra de Filtros Dietarios Responsiva Móvil**: Scroll táctil suave (`overflow-x-auto`) que no se rompa ni desborde en teléfonos celulares.
4. **Filtrado Dinámico del Menú (Mínimo 5 Platos por Categoría)**: Al seleccionar Vegano, Sin Gluten, Picante, Popular, Postres o Bebidas, el catálogo filtra instantáneamente garantizando al menos 5 platos bien estructurados por cada filtro.

## Alcance del Cambio

- **`src/mocks/menu.json`**: Ampliación del catálogo con platos veganos, sin gluten y picantes para asegurar 5+ ítems por filtro.
- **`src/features/ClientView/pages/ClientLoginPage.jsx`**: [NUEVO] Formulario de inicio de sesión demo de cliente.
- **`src/features/ClientView/pages/ClientRegisterPage.jsx`**: [NUEVO] Formulario de registro con Social Login y cláusula Ley 21.716.
- **`src/features/ClientView/pages/ClientPage.jsx`**: Barra de filtros responsiva con scroll táctil suave y filtrado dinámico en tiempo real.
- **`src/features/ClientView/store/useClientStore.js`**: Estado de sesión de usuario (`user`, `loginUser`, `registerUser`, `logoutUser`).
- **`src/routes/views.jsx` & `src/routes/index.jsx`**: Registro de las rutas `/cliente/login` y `/cliente/registro`.
