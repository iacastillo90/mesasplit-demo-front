# Proposal: Fase 33 — Optimizaciones en Vista Cliente, Tarjetas de la Carta y Alergias Personalizadas en Perfil

## Contexto y Motivación

El usuario solicita varios ajustes específicos de UX/UI en la experiencia del comensal:
1. **Nav de Cabecera**: Retirar el botón de retroceso (`⬅️`) del Nav superior en las vistas del cliente para mantener una barra limpia y moderna.
2. **Nav en Mesa Virtual**: Asegurar que la barra de navegación de cliente se mantenga visible y accesible con espacio apropiado.
3. **Cards de la Carta Responsivas**: Ajustar el diseño de las tarjetas de platos en `ClientPage.jsx` para que la imagen HD, el título, la descripción, el precio y los botones de acción (`★ Evaluar` y `Agregar`) no se rompan ni desborden en pantallas móviles.
4. **Filtros Dinámicos de Dieta**: Garantizar que la barra de filtros (`MenuFilterPills.jsx`) tenga scroll horizontal fluido (`whitespace-nowrap overflow-x-auto touch-pan-x`) para que botones como `🌶️ Picante` no se quiebren en pantallas pequeñas.
5. **Sección Alergias en Perfil**: Añadir en `ClientProfilePage.jsx` el checklist de alergias con la opción **"✏️ Otro (Especificar)"** que despliega un campo de entrada para ingresar alergias personalizadas (*ej. mariscos, frutos secos, soya*).

## Alcance del Cambio

- **`src/shared/ui/AppHeader.jsx`**: [ACTUALIZADO] Ocultar o remover el botón retroceder `⬅️` en rutas del cliente o cuando se solicite.
- **`src/features/ClientView/pages/ClientPage.jsx`**: [ACTUALIZADO] Ajustar la maquetación flex/grid responsiva de la tarjeta del plato, garantizando legibilidad de títulos, descripciones y alineación de botones en pantallas móviles.
- **`src/features/ClientView/components/MenuFilterPills.jsx`**: [ACTUALIZADO] Reforzar estilos `shrink-0` y `touch-pan-x` en cada chip de filtro para prevenir quiebres de línea en el último botón (`Picante`).
- **`src/features/ClientView/pages/ClientProfilePage.jsx`**: [ACTUALIZADO] Agregar el checkbox y campo de texto para **"✏️ Otro (Especificar alergia)"** dentro de la sección de preferencias del usuario.
- **`src/features/ClientView/pages/ClientPage.test.jsx`**: [NUEVO/ACTUALIZADO] Pruebas unitarias para validar las tarjetas de platos responsivas y filtros.
