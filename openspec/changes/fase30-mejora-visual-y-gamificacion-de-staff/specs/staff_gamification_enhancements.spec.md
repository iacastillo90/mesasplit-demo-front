# Spec: Mejora Visual y Gamificación de Staff (fase30-mejora-visual-y-gamificacion-de-staff)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Podio Visual Top 3 (Oro, Plata, Bronce)
- **MUST** destacar a los 3 empleados con mayor puntaje en tarjetas del podio con insignias 🥇, 🥈 y 🥉.
- **MUST** mostrar puntaje total, calificación promedio ⭐, propina acumulada en CLP ($) y barra de progreso hacia la meta del turno.

### REQUIREMENT 2: Métricas Detalladas, Reconocimientos y Filtros
- **MUST** permitir filtrar la clasificación por rol (Garzón, Cocina, Caja, Todos) y periodo.
- **MUST** proveer un botón interactivable **"🎁 Otorgar Bono"** que despliegue confirmación de reconocimiento enviada al colaborador.
- **MUST** adaptarse a temas Claro ☀️ y Oscuro 🌙 mediante `useThemeStore`.
