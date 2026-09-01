# Docs — Evidencia de cierre del Hito Alfa

## `demo-punta-a-punta.py`

Script de evidencia que recorre los **40 endpoints REST** del backend LabTab de
punta a punta en distintos roles (SUPERADMIN/MANAGER, STAFF, KITCHEN y GUEST),
con el flujo operativo completo y los casos de alerta/error.

### Flujo que cubre

1. **Auth**: login de roles, refresh token.
2. **Menú/Sucursal**: secciones, platos, config, pisos y mesas.
3. **Lista 86** (cocina): quiebre y reposición de stock.
4. **Cliente (QR GUEST)**: onboarding y menú.
5. **Mozo**: abrir sesión → agregar comensal → tomar pedido (comanda).
6. **Cocina (KDS)**: ver ticket → marcar listo → recall → marchar curso.
7. **Caja**: crear cuenta → dividir por comensal → descuento con PIN → pagar → reembolsar.
8. **Auditoría**: feed de excepciones.
9. **CRUD de menú** (admin): secciones y platos.
10. **Cierre**: cerrar sesión y liberar mesa.
11. **Alertas/errores**: PIN inválido (422), descuento > subtotal (422), motivo fuera de lista (422), aislamiento por sucursal (404), endpoint sin token (401).

### Requisitos

- Backend levantado: `cd LabTab-Back && docker compose up --build`
- Solo Python 3 stdlib (`urllib` + `json`). No requiere `jq` ni `requests`.

### Uso

```bash
python3 docs/demo-punta-a-punta.py
```

La salida imprime una línea por endpoint con `✅/❌`, el código HTTP y el mensaje
de alerta, y un resumen final por rol. Sale con código 0 si todo pasó, 1 si hubo fallos.

---

## Documentación generada

- `Avances.docx` — informe de la entrega Alfa (fases, reglas, tests, integración, decisiones, gaps).
- `Entidades.docx` — documentación técnica de las 20 entidades y sus capas.
