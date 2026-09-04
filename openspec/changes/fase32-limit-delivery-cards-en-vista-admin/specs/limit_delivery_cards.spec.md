# Spec: Limitación de Cards de Delivery (fase32-limit-delivery-cards-en-vista-admin)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Limitación de Cards en Vista Resumen
- **MUST** aceptar prop `limit` en `DeliveryColumn.jsx`.
- **MUST** recortar el arreglo de comandas a `limit` elementos cuando esté definido (ej. `limit={1}` en la vista resumen).
- **MUST** permitir ver la totalidad de pedidos al navegar a la pestaña dedicada `delivery`.
