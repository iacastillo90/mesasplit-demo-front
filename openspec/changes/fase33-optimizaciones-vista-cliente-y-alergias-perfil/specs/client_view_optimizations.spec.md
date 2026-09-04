# Spec: Optimizaciones Vista Cliente y Alergias en Perfil (fase33-optimizaciones-vista-cliente-y-alergias-perfil)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Remoción del Botón Retroceder en Nav de Cliente
- **MUST** ocultar el botón retroceder `⬅️` en la cabecera cuando el usuario navegue en la sección `/cliente`.

### REQUIREMENT 2: Tarjetas de Plato y Filtros Responsivos en Móvil
- **MUST** maquetar las tarjetas de platos en `ClientPage.jsx` con layout responsivo flex/grid en móvil sin solapamiento de textos o botones desalineados.
- **MUST** asegurar que la barra de filtros `MenuFilterPills.jsx` sea desplazable horizontalmente con `shrink-0` sin romper botones como `🌶️ Picante`.

### REQUIREMENT 3: Alergias Personalizadas con Opción "Otro" en Perfil
- **MUST** incluir un checkbox **"✏️ Otro (Especificar)"** en `ClientProfilePage.jsx`.
- **MUST** desplegar un input de texto al activar "Otro" para permitir al comensal registrar alergias o condiciones personalizadas.
