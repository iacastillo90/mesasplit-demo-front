# Spec: Tarjetas Delivery Omnicanal y Estados (fase29-tarjetas-delivery-omnicanal-uber-pedidosya-justo-y-estados)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Soporte de Plataformas Omnicanal (Uber Eats, PedidosYa, Rappi, Justo)
- **MUST** incluir identificador, badge distintivo y branding para las 4 plataformas: Uber Eats (verde), PedidosYa (rojo), Rappi (naranjo) y Justo App (púrpura).

### REQUIREMENT 2: Estados Operacionales de Entrega
- **MUST** clasificar los pedidos en los estados:
  - 🍳 `in_prep` / `preparacion`: **En Preparación**
  - 🛵 `on_way` / `en_camino`: **En Camino**
  - ✅ `delivered` / `entregado`: **Entregado Recientemente**
- **MUST** permitir filtrar las tarjetas por estado operacional mediante pestañas.
