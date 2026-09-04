# Spec: tip-history — Historial de propinas derivado de PAYMENT

## Purpose

Reemplaza el historial DTE hardcodeado de ClientProfilePage con un read-model derivado de PAYMENT (ER v2): para un person_id, muestra los pagos completados con propina, con fecha, método, monto, porcentaje y referencia a boleta. No crea tabla nueva: el historial se computa al leer.

## Requirements

### Requirement: Origen derivado de PAYMENT [CLI-TIP-001]

El historial de propinas MUST derivarse de PAYMENT con status=completed y tip_amount>0, sin tabla nueva ni almacenamiento propio. Una cuenta pagada en varios PAYMENTs con propina en cada uno MUST generar una entrada por pago.

#### Scenario: Solo pagos completados con propina

- GIVEN PAYMENTs con estados y tips variados
- WHEN se computa el historial
- THEN solo entran completed con tip_amount>0

#### Scenario: Propina en múltiples pagos de una cuenta

- GIVEN una misma cuenta pagada en dos PAYMENTs, ambos completed y con tip
- WHEN se computa el historial
- THEN cada PAYMENT genera su propia entrada

### Requirement: Filtro por pagador [CLI-TIP-002]

El historial MUST filtrarse por person_id del pagador. Los pagos anónimos (person_id null) MUST NOT aparecer en el historial de ninguna persona.

#### Scenario: Pagador anónimo invisible

- GIVEN un PAYMENT completed con tip y person_id null
- WHEN un usuario consulta su historial
- THEN ese pago no aparece

### Requirement: Campos de cada entrada [CLI-TIP-003]

Cada entrada MUST mostrar: fecha (paid_at), método (method), monto de propina (tip_amount), porcentaje (tip_amount/total_amount) y referencia a la boleta (bill_id).

#### Scenario: Entrada completa

- GIVEN un PAYMENT completed con tip 2000 y total 20000
- WHEN se renderiza la entrada
- THEN muestra fecha, método, 2000, 10% y su boleta

### Requirement: Orden descendente [CLI-TIP-004]

El historial MUST ordenarse por paid_at descendente.

#### Scenario: Más reciente primero

- GIVEN pagos con propina en T1 y T2 (T2 posterior)
- WHEN se lista el historial
- THEN T2 aparece antes que T1

### Requirement: Exclusiones [CLI-TIP-005]

PAYMENT con status pending, failed o refunded, o con tip_amount=0 MUST quedar excluidos del historial.

#### Scenario: Pagos sin propina excluidos

- GIVEN un completed con tip_amount=0
- WHEN se computa el historial
- THEN no aparece

#### Scenario: Pagos fallidos excluidos

- GIVEN un PAYMENT refunded con tip_amount>0
- WHEN se computa el historial
- THEN no aparece

### Requirement: Porcentaje consistente [CLI-TIP-006]

El porcentaje MUST calcularse como tip_amount/total_amount y redondearse de forma consistente y documentada (default 2 decimales). Con total_amount=0, el porcentaje SHOULD mostrarse como 0 o no mostrarse, sin error.

#### Scenario: Redondeo a 2 decimales

- GIVEN tip 1500 y total 21500
- WHEN se calcula el porcentaje
- THEN se muestra 6.98% de forma consistente

#### Scenario: Total cero no rompe

- GIVEN un PAYMENT completed con tip>0 y total_amount=0
- WHEN se calcula el porcentaje
- THEN no se produce error y se muestra 0% (o se omite el %)

### Requirement: Cálculo en lectura [CLI-TIP-007]

El read-model SHOULD computarse al leer (derivado), sin cachear en una tabla de historial.

#### Scenario: Refleja cambios del pago

- GIVEN un PAYMENT pending con tip que pasa a completed
- WHEN se consulta el historial tras el cambio
- THEN el pago aparece (sin migración extra)

## Comment

- ER v2: PAYMENT (person_id null si anónimo, tip_amount, total_amount, method, status, paid_at, bill_id). BILL.tip_total es el agregado de la cuenta; no se usa para el historial por persona.
- Reemplaza el historial hardcodeado (ClientProfilePage.jsx:521-593, ids ficticios b-101…).
- Riesgo: fixtures de PAYMENT sin tip_amount → historial vacío; el slice incluye seed demo con tip_amount.
- Implementación: función pura front (filtro+orden+porcentaje) testeable con vitest (RED primero); el query derivado del backend Java queda como requisito de testabilidad pendiente.