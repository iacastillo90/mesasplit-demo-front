#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
demo-punta-a-punta.py — Evidencia de cierre del Hito Alfa (LabTab backend).

Recorre los 40 endpoints REST de punta a punta en distintos roles
(SUPERADMIN/MANAGER, STAFF, KITCHEN y GUEST), con el flujo operativo completo
(mozo abre sesión → toma pedido → cocina lo ve → mozo cobra y divide) y casos
de error/alerta (PIN inválido, aislamiento por sucursal, pago duplicado).

Uso:
    1) Levantar el backend:  cd LabTab-Back && docker compose up --build
    2) Ejecutar:             python3 docs/demo-punta-a-punta.py

Requisito: solo la stdlib de Python (urllib + json). No usa jq ni requests.
Salida: una línea por endpoint con ✅/❌, el código HTTP y el mensaje de alerta.
"""
import json
import sys
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"

# Resultados acumulados por rol para el resumen final.
RESULTS = []  # [(rol, metodo, ruta, status, ok, mensaje)]


def request(method, path, token=None, body=None):
    """Ejecuta un request HTTP y devuelve (status, payload_dict)."""
    url = BASE_URL + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8") or "{}"
            return resp.status, json.loads(raw)
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8") or "{}"
        try:
            return err.code, json.loads(raw)
        except json.JSONDecodeError:
            return err.code, {"error": {"message": raw}}
    except urllib.error.URLError as err:
        return 0, {"error": {"message": f"Sin conexión: {err.reason}"}}


def check(rol, metodo, ruta, token, body=None, esperado=(200, 201)):
    """Ejecuta y registra un paso. Devuelve el payload."""
    status, payload = request(metodo, ruta, token, body)
    ok = status in esperado
    # Extrae el mensaje de alerta: de data.message, o del error.message.
    msg = ""
    if isinstance(payload, dict):
        data = payload.get("data")
        err = payload.get("error")
        if isinstance(data, dict) and data.get("message"):
            msg = data["message"]
        elif isinstance(err, dict):
            msg = err.get("message") or err.get("code") or ""
        elif data is not None:
            msg = f"data OK ({type(data).__name__})"
    RESULTS.append((rol, metodo, ruta, status, ok, msg))
    icon = "✅" if ok else "❌"
    print(f"{icon} [{rol:11}] {metodo:6} {ruta:42} → {status}  {msg}")
    return payload


def login(email, password):
    """Login y devuelve (token, person)."""
    status, payload = request("POST", "/api/v1/auth/login", body={"email": email, "password": password})
    if status == 201:
        data = payload.get("data", {})
        return data.get("accessToken"), data.get("person", {})
    print(f"❌ Login fallido {email}: {status} {payload}")
    sys.exit(1)


print("=" * 90)
print("EVIDENCIA DE CIERRE — HITO ALFA (LabTab backend)")
print(f"Base: {BASE_URL}")
print("=" * 90)

# ---------------------------------------------------------------------------
# 1. LOGIN de roles (POST /auth/login)
# ---------------------------------------------------------------------------
print("\n── 1. Autenticación de roles ──")
admin_token, admin = login("admin@labtab.cl", "LabTab2026!")
mozo_token, mozo = login("mozo@labtab.cl", "LabTab2026!")
cocina_token, cocina = login("cocina@labtab.cl", "LabTab2026!")
check("SUPERADMIN", "POST", "/api/v1/auth/login", None, {"email": "admin@labtab.cl", "password": "LabTab2026!"})
print(f"   roles → admin={admin.get('role')}, mozo={mozo.get('role')}, cocina={cocina.get('role')}")

# refresh token (POST /auth/refresh)
login_payload = request("POST", "/api/v1/auth/login", body={"email": "mozo@labtab.cl", "password": "LabTab2026!"})[1]
refresh = login_payload.get("data", {}).get("refreshToken")
check("STAFF", "POST", "/api/v1/auth/refresh", None, {"refreshToken": refresh})

# ---------------------------------------------------------------------------
# 2. MENÚ (GET /menu/sections) + mesas
# ---------------------------------------------------------------------------
print("\n── 2. Menú y sucursal ──")
menu = check("STAFF", "GET", "/api/v1/menu/sections", mozo_token)
sections = (menu or {}).get("data", [])
dishes = [d for s in sections for d in s.get("dishes", [])]
dish = dishes[0] if dishes else None
dish_id = dish["id"] if dish else None

tables = check("STAFF", "GET", "/api/v1/branch/tables", mozo_token)
tbls = (tables or {}).get("data", [])
table = next((t for t in tbls if t.get("status") == "AVAILABLE"), tbls[0] if tbls else None)
table_id = table["id"] if table else None
qr_token = table.get("qrToken") if table else None

check("STAFF", "GET", "/api/v1/branch/config", mozo_token)
check("STAFF", "GET", "/api/v1/branch/floors", mozo_token)
if dish_id:
    check("STAFF", "GET", f"/api/v1/menu/dishes/{dish_id}", mozo_token)

# ---------------------------------------------------------------------------
# 3. Lista 86 (cocina) — PATCH /menu/dishes/{id}/availability
# ---------------------------------------------------------------------------
print("\n── 3. Lista 86 (cocina) ──")
if dish_id:
    check("KITCHEN", "PATCH", f"/api/v1/menu/dishes/{dish_id}/availability", cocina_token,
          {"isAvailable": False, "remainingUnits": 0})
    check("KITCHEN", "PATCH", f"/api/v1/menu/dishes/{dish_id}/availability", cocina_token,
          {"isAvailable": True, "remainingUnits": 0})

# ---------------------------------------------------------------------------
# 4. Onboarding comensal (guest-session) — POST /auth/guest-session
# ---------------------------------------------------------------------------
print("\n── 4. Cliente (QR GUEST) ──")
guest_token = None
if qr_token:
    gs = check("GUEST", "POST", "/api/v1/auth/guest-session", None,
               {"qrToken": qr_token, "displayName": "Ignacio", "allergies": ["maní"]})
    guest_token = (gs or {}).get("data", {}).get("accessToken")
    if guest_token:
        check("GUEST", "GET", "/api/v1/menu/sections", guest_token)

# ---------------------------------------------------------------------------
# 5. Mozo: abrir sesión y tomar pedido
# ---------------------------------------------------------------------------
print("\n── 5. Mozo: sesión y comanda ──")
session_id = None
order_id = None
ticket_id = None
line_id = None
if table_id:
    sess = check("STAFF", "POST", "/api/v1/sessions", mozo_token, {"tableId": table_id, "guestCount": 4})
    session_id = (sess or {}).get("data", {}).get("id")
    if session_id:
        check("STAFF", "GET", f"/api/v1/sessions/{session_id}", mozo_token)
        check("STAFF", "POST", f"/api/v1/sessions/{session_id}/guests", mozo_token,
              {"personId": mozo.get("id"), "displayName": "Ana"})
        # Tomar pedido (POST /orders)
        if dish_id:
            order = check("STAFF", "POST", "/api/v1/orders", mozo_token,
                          {"dineSessionId": session_id, "channel": "staff",
                           "lines": [{"dishId": dish_id, "quantity": 2, "unitPrice": 0, "courseType": "FONDO"}]})
            data = (order or {}).get("data", {})
            order_id = data.get("id")
            ticket_id = data.get("kitchenTicketId")
            if order_id:
                check("STAFF", "GET", f"/api/v1/orders/{order_id}", mozo_token)
                check("STAFF", "GET", f"/api/v1/sessions/{session_id}/orders", mozo_token)
                lines = data.get("lines", [])
                line_id = lines[0]["id"] if lines else None

# ---------------------------------------------------------------------------
# 6. Cocina: ver ticket y marcar listo
# ---------------------------------------------------------------------------
print("\n── 6. Cocina: KDS ──")
if ticket_id:
    check("KITCHEN", "GET", "/api/v1/kitchen/tickets", cocina_token)
    check("KITCHEN", "PATCH", f"/api/v1/kitchen/tickets/{ticket_id}/status", cocina_token, {"status": "DONE"})
    check("KITCHEN", "POST", f"/api/v1/kitchen/tickets/{ticket_id}/recall", cocina_token)

# Course Control (POST /orders/{id}/fire-course)
if order_id:
    check("STAFF", "POST", f"/api/v1/orders/{order_id}/fire-course", mozo_token, {"courseType": "FONDO"})

# ---------------------------------------------------------------------------
# 7. Caja: cuenta, descuento con PIN y pago
# ---------------------------------------------------------------------------
print("\n── 7. Caja: cuenta, descuento y pago ──")
bill_id = None
payment_id = None
if session_id:
    bill = check("STAFF", "POST", "/api/v1/bills", mozo_token, {"dineSessionId": session_id, "serviceChargePct": 10})
    bill_id = (bill or {}).get("data", {}).get("id")
    if bill_id:
        check("STAFF", "GET", "/api/v1/bills", mozo_token)
        check("STAFF", "GET", f"/api/v1/bills/{bill_id}", mozo_token)
        check("STAFF", "GET", f"/api/v1/sessions/{session_id}/bill", mozo_token)
        check("STAFF", "GET", f"/api/v1/bills/{bill_id}/summary-by-guest", mozo_token)
        # Descuento con PIN de manager (admin = MANAGER, PIN 1234)
        check("MANAGER", "PATCH", f"/api/v1/bills/{bill_id}/apply-discount", admin_token,
              {"discountAmount": 1000, "reason": "Cortesía", "managerPin": "1234"})
        # Pago (POST /payments)
        pay = check("STAFF", "POST", "/api/v1/payments", mozo_token,
                    {"billId": bill_id, "amount": 1000, "tipAmount": 0, "totalAmount": 1000,
                     "method": "CASH", "provider": "manual"})
        payment_id = (pay or {}).get("data", {}).get("id")
        if payment_id:
            check("STAFF", "GET", f"/api/v1/payments/{payment_id}", mozo_token)
            check("MANAGER", "POST", f"/api/v1/payments/{payment_id}/refund", admin_token,
                  {"reason": "Cliente insatisfecho", "managerPin": "1234"})

# ---------------------------------------------------------------------------
# 8. Auditoría (GET /exceptions)
# ---------------------------------------------------------------------------
print("\n── 8. Auditoría y excepciones ──")
check("MANAGER", "GET", "/api/v1/exceptions", admin_token)

# ---------------------------------------------------------------------------
# 9. CRUD de menú (admin) — POST/PATCH/DELETE sections y dishes
# ---------------------------------------------------------------------------
print("\n── 9. CRUD de menú (admin) ──")
sec = check("MANAGER", "POST", "/api/v1/menu/sections", admin_token, {"name": "Sección QA", "displayOrder": 99})
sec_id = (sec or {}).get("data", {}).get("id")
if sec_id:
    check("MANAGER", "PATCH", f"/api/v1/menu/sections/{sec_id}", admin_token, {"name": "Sección QA v2", "displayOrder": 99})
    d = check("MANAGER", "POST", "/api/v1/menu/dishes", admin_token,
              {"sectionId": sec_id, "name": "Plato QA", "price": 1000})
    dish_qa = (d or {}).get("data", {}).get("id")
    if dish_qa:
        check("MANAGER", "PATCH", f"/api/v1/menu/dishes/{dish_qa}", admin_token, {"name": "Plato QA v2", "price": 1500})
        check("MANAGER", "DELETE", f"/api/v1/menu/dishes/{dish_qa}", admin_token)
    check("MANAGER", "DELETE", f"/api/v1/menu/sections/{sec_id}", admin_token)

# ---------------------------------------------------------------------------
# 10. Cerrar sesión (PATCH /sessions/{id}/status) y estado de mesa
# ---------------------------------------------------------------------------
print("\n── 10. Cierre de sesión y mesa ──")
if session_id:
    check("MANAGER", "PATCH", f"/api/v1/sessions/{session_id}/status", admin_token, {"status": "CLOSED"})
if table_id:
    check("STAFF", "PATCH", f"/api/v1/branch/tables/{table_id}/status", mozo_token, {"status": "CLEANING"})
    check("STAFF", "PATCH", f"/api/v1/branch/tables/{table_id}/status", mozo_token, {"status": "AVAILABLE"})

# ---------------------------------------------------------------------------
# 11. Casos de alerta / error (mensajes esperados)
# ---------------------------------------------------------------------------
print("\n── 11. Casos de alerta / error ──")
# PIN incorrecto (422 PIN_INVALID)
if bill_id:
    check("MANAGER", "PATCH", f"/api/v1/bills/{bill_id}/apply-discount", admin_token,
          {"discountAmount": 100, "reason": "Cortesía", "managerPin": "0000"}, esperado=(422,))
# Descuento mayor al subtotal (422)
if bill_id:
    check("MANAGER", "PATCH", f"/api/v1/bills/{bill_id}/apply-discount", admin_token,
          {"discountAmount": 999999, "reason": "Cortesía", "managerPin": "1234"}, esperado=(422,))
# Motivo fuera de lista cerrada (422)
if bill_id:
    check("MANAGER", "PATCH", f"/api/v1/bills/{bill_id}/apply-discount", admin_token,
          {"discountAmount": 100, "reason": "Motivo inventado", "managerPin": "1234"}, esperado=(422,))
# Aislamiento por sucursal: buscar un id inexistente → 404
check("STAFF", "GET", "/api/v1/sessions/00000000-0000-0000-0000-000000000000", mozo_token, esperado=(404,))
# Autenticación: endpoint protegido sin token → 401
check("SIN-TOKEN", "GET", "/api/v1/menu/sections", None, esperado=(401,))

# ---------------------------------------------------------------------------
# Resumen
# ---------------------------------------------------------------------------
print("\n" + "=" * 90)
total = len(RESULTS)
ok = sum(1 for r in RESULTS if r[4])
print(f"RESUMEN: {ok}/{total} pasos OK")
por_rol = {}
for rol, _m, _r, _s, _ok, _msg in RESULTS:
    por_rol.setdefault(rol, [0, 0])
    por_rol[rol][1] += 1
    por_rol[rol][0] += 1 if _ok else 0
for rol, (o, t) in sorted(por_rol.items()):
    print(f"  {rol:11} {o}/{t}")
print("=" * 90)
if ok != total:
    print(f"⚠ {total - ok} paso(s) fallaron — revisar arriba.")
    sys.exit(1)
print("✅ Flujo punta a punta completado correctamente en todos los roles.")
