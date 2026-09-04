# Modelo de Datos — LabTab Demo

Este documento define la estructura de entidades y modelos de datos utilizados en la aplicación LabTab (tanto para el estado global en Zustand como para las fixtures JSON de desarrollo y los futuros DTOs del backend).

---

## 1. Entidades Principales

### 1.1 Mesa (`Table`)
Representa una mesa física o virtual (delivery) en el salón.

```typescript
interface Table {
  id: string; // ej: "table-04" o "ubereats-902"
  number: number | string; // ej: 4 o "UE-902"
  zone: 'salon' | 'terraza' | 'bar' | 'delivery';
  capacity: number;
  status: 'free' | 'seated' | 'waiting_food' | 'bill_requested' | 'paying';
  assignedWaiterId?: string;
  seatedAt?: string; // ISO 8601
  currentOrderId?: string;
  totalAmount: number; // Suma acumulada de la cuenta
}
```

---

### 1.2 Producto / Menú (`Product`)
Ítem del catálogo de alimentos o bebidas.

```typescript
interface Product {
  id: string; // ej: "burg-01"
  name: string; // "Hamburguesa Doble Queso"
  description: string;
  category: 'entradas' | 'fondos' | 'postres' | 'bebidas' | 'cocteles';
  price: number; // ClP, ej: 8900
  imageUrl: string;
  station: 'parrilla' | 'cocina_fria' | 'barra' | 'postres';
  isAlcoholic: boolean;
  stockStatus: 'available' | 'low_stock' | 'out_of_stock'; // Lista 86
  remainingUnits?: number; // Para warning "Quedan 2"
  modifiersGroup?: ModifierGroup[];
  costPrice?: number; // Para Simulador What-If / Super Admin
}

interface ModifierGroup {
  id: string;
  name: string; // ej: "Término de la carne"
  required: boolean;
  options: { id: string; name: string; extraPrice: number }[];
}
```

---

### 1.3 Pedido (`Order`) y Detalle (`OrderItem`)
Orden de consumo asociada a una mesa.

```typescript
interface Order {
  id: string; // ej: "ord-1049"
  tableId: string;
  status: 'open' | 'kitchen_in_progress' | 'ready' | 'closed';
  items: OrderItem[];
  createdAt: string;
  total: number;
  subtotal: number;
  discount: number;
  tipAmount: number;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  selectedModifiers: string[];
  allergyFlags: string[]; // ej: ["Alergia Maní"] -> Borde Rojo Puro #EF4444
  course: 'entrada' | 'fondo' | 'postre';
  courseStatus: 'waiting' | 'fired' | 'preparing' | 'ready' | 'served';
  orderedByCustomerId?: string;
  orderedByCustomerName?: string;
  station: string;
}
```

---

### 1.4 Usuario / Empleado (`User`)
Perfiles de usuario y roles dentro del sistema.

```typescript
interface User {
  id: string;
  pin: string; // PIN de 4 dígitos para autorización rápida
  name: string;
  role: 'super_admin' | 'local_admin' | 'waiter' | 'chef' | 'cashier';
  avatarUrl?: string;
  shiftStatus?: 'clocked_in' | 'clocked_out';
  shiftStartedAt?: string;
  salesCountToday?: number;
  avgRating?: number;
}
```

---

### 1.5 Pago y Tributación (`Payment` / `DTE`)
Registro de transacción financiera y documento tributario electrónico (SII Chile).

```typescript
interface Payment {
  id: string;
  orderId: string;
  tableId: string;
  timestamp: string;
  amountPaid: number;
  tipPaid: number;
  paymentMethod: 'cash' | 'card' | 'qr_webpay' | 'qr_mercadopago' | 'mixed';
  splitType: 'full' | 'equal' | 'by_item' | 'item_fraction';
  customerRut?: string;
  dteType: 'boleta' | 'factura';
  dteFolioNumber?: number; // Ej: Folio CAF #4521
  status: 'completed' | 'failed' | 'contingency';
}

interface FolioCAFPool {
  documentType: 'boleta' | 'factura';
  cafId: string;
  totalAvailable: number;
  remainingCount: number; // Naranja < 50, Rojo < 10
  expirationDate: string;
}
```

---

### 1.6 Registro de Excepciones y Merma (`ExceptionLog` / `Merma`)
Trazabilidad antifraude y control de pérdidas de stock.

```typescript
interface ExceptionLog {
  id: string;
  timestamp: string;
  type: 'item_void_after_kitchen' | 'drawer_opened_no_sale' | 'manual_discount' | 'panic_button';
  authorizedByAdminId: string;
  authorizedByAdminPin: string;
  reason: 'Cortesía' | 'Cliente insatisfecho' | 'Error de carga' | 'Deterioro insumo';
  orderId?: string;
  amount?: number;
}

interface MermaRecord {
  id: string;
  timestamp: string;
  reportedByUserId: string;
  description: string; // ej: "3 kilos de tomate vencido"
  quantity: number;
  unit: 'kg' | 'unidades' | 'litros';
  estimatedCost: number;
}
```
