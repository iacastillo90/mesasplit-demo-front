# pos-cashier Specification

## Purpose

Define the capability requirements for the POS Cashier terminal (`PosView`). The terminal manages cashier PIN session authentication, multi-method payment settlement, automatic change calculation, Chilean DTE electronic tax document emission (Boleta and Factura Electrónica with RUT completion), CAF folio tracking, Blind Close cash drawer auditing ("Cierre Ciego" arqueo), and realtime table QR payment sync (`payment.qr_received`).

## Requirements

### Requirement: Cashier Session PIN Lock Screen

The POS MUST require cashier PIN authentication (`"9921"`) before accessing billing and settlement controls.
- Entering PIN `"9921"` unlocks cashier mode and displays open table bills.

#### Scenario: Cashier unlocks session with valid PIN

- GIVEN the POS cashier lock screen
- WHEN the cashier enters PIN `"9921"` and submits
- THEN the session unlocks to active cashier status
- AND displays open table bills for settlement

---

### Requirement: Multi-Method Payment Settlement & Change Calculator

The POS MUST support flexible payment methods for settling table accounts:
- **Cash (`Efectivo`)**: Input tendered amount, automatically calculates change (`vuelto = recibido - total`).
- **Card (`Tarjeta`)**: Debit/Credit POS terminal selection.
- **Transfer (`Transferencia`)**: Bank transfer confirmation.
- **Mixed (`Mixto`)**: Split payment across multiple tenders (e.g. 50% Cash + 50% Card).

#### Scenario: Cash payment calculates exact change

- GIVEN a table bill of `$20.000`
- WHEN the cashier selects Cash and enters `$25.000` tendered
- THEN the change calculator displays `$5.000` change (`vuelto`)
- AND enables the "Confirmar Pago" button

---

### Requirement: Chilean DTE Tax Document Emission (Boleta / Factura & Folio)

The POS MUST support emitting Chilean SII electronic tax documents:
- **Boleta Electrónica**: Default consumer receipt with automatic CAF folio assignment.
- **Factura Electrónica**: Business invoice requiring RUT validation and company name/address auto-fill.
- Submitting payment emits the DTE document, consumes a CAF folio, and publishes a `payment.completed` event via `useRealtimeBus`.

#### Scenario: Emitting Factura Electrónica validates RUT and assigns folio

- GIVEN a table bill settlement
- WHEN the cashier selects "Factura Electrónica" and enters RUT `"76.123.456-7"`
- THEN company details auto-fill (`"Gastronomía Demo SpA"`)
- AND clicking "Emitir DTE" assigns folio `1042` and emits the DTE document

---

### Requirement: Blind Cash Drawer Close ("Cierre Ciego" Arqueo)

The POS MUST provide a **"Cierre Ciego"** shift closing modal for cash drawer auditing:
- Hides the expected system cash total until the cashier enters the physical counted cash (`efectivo contado`).
- Once entered, computes variance (`diferencia arqueo = contado - esperado`).
- Publishes a `shift.closed` event over `useRealtimeBus`.

#### Scenario: Cashier completes Cierre Ciego and views variance

- GIVEN the cashier initiating shift close
- WHEN the cashier enters physical cash count `$150.000`
- THEN the system reveals expected total `$150.000` and calculates `$0` variance
- AND publishes a `shift.closed` event

---

### Requirement: Realtime Table QR Payment Sync

The POS MUST listen for `payment.qr_received` events published over `useRealtimeBus`:
- When a customer pays via QR at the table, the table's bill status in POS automatically updates to `paid` with a green checkmark badge.

#### Scenario: QR payment at table updates POS bill status

- GIVEN the POS open on Table 1 bill
- WHEN a `payment.qr_received` event arrives for Table 1
- THEN Table 1 bill status updates to `paid` in real time
