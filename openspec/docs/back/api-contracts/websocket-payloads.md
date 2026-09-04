# Contratos de Eventos WebSocket — LabTab

Este documento define el formato y los payloads exactos para los 11 eventos WebSocket / BroadcastChannel en tiempo real que sincronizan las 6 vistas de **LabTab**.

---

## 1. `table.status_changed`
**Origen**: Mozo / Caja / Cliente -> **Destino**: Local Admin (Radar), Mozo

```json
{
  "event": "table.status_changed",
  "payload": {
    "tableId": "table-04",
    "status": "waiting_food", // free | seated | waiting_food | bill_requested | paying
    "totalAmount": 24500,
    "timestamp": 1692205200000
  }
}
```

---

## 2. `order.item_added`
**Origen**: Cliente / Mozo -> **Destino**: Cocina (KDS), Local Admin

```json
{
  "event": "order.item_added",
  "payload": {
    "orderId": "ord-1049",
    "tableId": "table-04",
    "items": [
      {
        "id": "item-88",
        "productId": "burg-01",
        "productName": "Hamburguesa Doble Queso",
        "quantity": 2,
        "selectedModifiers": ["Término Medio", "Sin Cebolla"],
        "allergyFlags": ["Alergia Maní"],
        "courseType": "FONDO",
        "station": "parrilla"
      }
    ],
    "timestamp": 1692205205000
  }
}
```

---

## 3. `course.fire`
**Origen**: Mozo -> **Destino**: Cocina (KDS)

```json
{
  "event": "course.fire",
  "payload": {
    "tableId": "table-04",
    "orderId": "ord-1049",
    "courseType": "FONDO", // entrada | fondo | postre
    "timestamp": 1692205800000
  }
}
```

---

## 4. `kds.item_ready`
**Origen**: Cocina (KDS) -> **Destino**: Mozo, Cliente, Local Admin

```json
{
  "event": "kds.item_ready",
  "payload": {
    "orderId": "ord-1049",
    "itemId": "item-88",
    "tableId": "table-04",
    "productName": "Hamburguesa Doble Queso",
    "status": "READY",
    "timestamp": 1692206400000
  }
}
```

---

## 5. `kds.stock_86`
**Origen**: Cocina (KDS) -> **Destino**: Mozo, Cliente, Local Admin

```json
{
  "event": "kds.stock_86",
  "payload": {
    "productId": "burg-01",
    "productName": "Hamburguesa Doble Queso",
    "status": "out_of_stock", // out_of_stock | low_stock | available
    "remainingUnits": 0,
    "timestamp": 1692206450000
  }
}
```

---

## 6. `payment.qr_received`
**Origen**: Cliente (Webpay/MP) -> **Destino**: Caja (POS), Local Admin, Super Admin

```json
{
  "event": "payment.qr_received",
  "payload": {
    "paymentId": "pay-9921",
    "tableId": "table-04",
    "orderId": "ord-1049",
    "amountPaid": 24500,
    "method": "qr_webpay",
    "status": "COMPLETED",
    "timestamp": 1692207000000
  }
}
```

---

## 7. `alert.fraud`
**Origen**: Mozo / Caja -> **Destino**: Local Admin (Feed de Excepciones), Super Admin

```json
{
  "event": "alert.fraud",
  "payload": {
    "type": "ITEM_VOID_AFTER_KITCHEN",
    "tableId": "table-04",
    "orderId": "ord-1049",
    "authorizedByPin": "9921",
    "reason": "Cortesía",
    "amount": 8900,
    "timestamp": 1692207100000
  }
}
```

---

## 8. `call.waiter`
**Origen**: Cliente (S.O.S.) -> **Destino**: Mozo, Local Admin

```json
{
  "event": "call.waiter",
  "payload": {
    "tableId": "table-04",
    "reason": "Falta cubierto", // Limpiar mesa | Falta cubierto | Ayuda general
    "customerName": "Ignacio",
    "timestamp": 1692205300000
  }
}
```

---

## 9. `panic.button`
**Origen**: Local Admin / Mozo -> **Destino**: Gerencia, Seguridad Privada

```json
{
  "event": "panic.button",
  "payload": {
    "location": "Caja Principal - Salón 1",
    "triggeredByUserId": "user-02",
    "timestamp": 1692208000000
  }
}
```

---

## 10. `shift.clock_in` / `shift.clock_out`
**Origen**: Mozo / Caja -> **Destino**: Super Admin (Ley 40 Horas)

```json
{
  "event": "shift.clock_in",
  "payload": {
    "employeeId": "emp-12",
    "employeeName": "Rodrigo Silva",
    "role": "waiter",
    "timestamp": 1692198000000
  }
}
```

---

## 11. `dte.folio_used`
**Origen**: Caja (POS) / Cliente -> **Destino**: Super Admin (Compliance Hub)

```json
{
  "event": "dte.folio_used",
  "payload": {
    "documentType": "BOLETA", // boleta | factura
    "folioNumber": 4521,
    "remainingCount": 49, // Alerta naranja cuando cae de 50
    "timestamp": 1692207005000
  }
}
```