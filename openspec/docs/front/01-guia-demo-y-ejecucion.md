# Guía de Ejecución y Presentación de Demo — LabTab

Este documento sirve como manual táctico para ejecutar y presentar la demo interactiva de **LabTab** ante potenciales clientes (dueños de restaurantes, administradores) o inversionistas.

---

## 1. Modos de Ejecución Técnica

### Escenario A: Demo en un Solo Dispositivo (Pantalla Dividida)
- **Caso de uso**: Presentación en notebook dividiendo la pantalla en 2 o 3 ventanas del navegador.
- **Mecanismo de Tiempo Real**: `BroadcastChannel` (interfaz native de navegador sin internet ni backend).
- **Configuración**: `VITE_DEMO_MODE=same-device`.

### Escenario B: Demo Multidispositivo (Celular + Notebook)
- **Caso de uso**: El cliente escanea el QR en su celular mientras el presentador muestra la pantalla de Cocina (KDS) o Caja en el notebook.
- **Mecanismo de Tiempo Real**: Firebase Realtime DB / Supabase o servidor puente Node.js (`socket.io`).
- **Configuración**: `VITE_DEMO_MODE=cross-device` y ejecutar servidor con `--host`:
  ```bash
  npm run dev -- --host
  ```

---

## 2. Los 4 Momentos "WOW" para la Demostración

### 1. Escudo de Alergias en Tiempo Real 🛡️
1. Desde la PWA Cliente, al entrar a la mesa declarar una alergia (ej: Maní).
2. Agregar un plato al carrito.
3. Mostrar cómo la comanda en la PWA del Mozo y en la pantalla de **Cocina (KDS)** se tiñe inmediatamente de **Rojo Puro (`#EF4444`)** con advertencia parpadeante.

### 2. Sincronización Híbrida de Pago QR 💳
1. En la PWA Cliente, simular el pago de la cuenta con Webpay/Mercado Pago.
2. Mostrar cómo en la pantalla de **Caja (POS)** el saldo pendiente baja automáticamente con un destello verde sin que el cajero toque ningún botón.

### 3. Lista 86 (Quiebre de Stock Inmediato) 🛑
1. En el **KDS de Cocina**, mantener presionado un plato agotado para declararlo en "Lista 86".
2. Mostrar cómo en menos de 100ms ese plato aparece tachado y no clickeable en los celulares de los clientes y del mozo.

### 4. Cierre Ciego y Feed de Excepciones Antifraude 🔒
1. Simular la anulación de un ítem ya cocinado en la PWA del mozo. Exigir PIN de admin.
2. Mostrar cómo el evento se registra instantáneamente en el **Feed de Excepciones del Local Admin** con el nombre y PIN del responsable.

---

## 3. Checklist Pre-Demo
- [ ] Ejecutar el botón **"Reiniciar Demo"** en el Portal para limpiar cualquier estado previo.
- [ ] Verificar conectividad a la red WiFi si se utilizarán celulares reales.
- [ ] Probar el flujo de la boleta/factura con RUT de prueba.
