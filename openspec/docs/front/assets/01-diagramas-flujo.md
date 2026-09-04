1. Mapa Topológico del Ecosistema (Arquitectura)
Este diagrama muestra cómo fluye la información desde la capa operativa hasta la estratégica.

graph TD
    %% Definición de Estilos (Colores del Sistema)
    classDef operativo fill:#011623,stroke:#04A0FB,stroke-width:2px,color:#E6F6FF;
    classDef admin fill:#024064,stroke:#CDECFE,stroke-width:2px,color:#FFFFFF;
    classDef super fill:#E6F6FF,stroke:#012032,stroke-width:2px,color:#012032;

    %% Nodos
    subgraph Capa Operativa [Capa Operativa - Fricción Cero]
        C[Cliente / Mesa Virtual]:::operativo
        M[Mozo / PWA]:::operativo
        K[Cocina / KDS]:::operativo
        P[Caja / POS]:::operativo
    end

    subgraph Capa de Supervisión [Capa Supervisión - Táctica]
        LA[Local Admin / Radar de Turno]:::admin
    end

    subgraph Capa Estratégica [Capa Estratégica - Financiera]
        SA[Super Admin / Corporate]:::super
    end

    %% Relaciones Operativas (WebSockets)
    C <-->|Pedidos, Alergias, S.O.S| M
    M -->|Course Control (Marchar)| K
    C -->|Envía Comanda Directa| K
    K -->|Push: Plato Listo| M
    C <-->|Pago QR (Sincronía Híbrida)| P
    
    %% Relaciones de Supervisión
    C -.->|Estado de Mesa en Vivo| LA
    M -.->|Excepciones y Anulaciones| LA
    K -.->|Tiempos de Preparación| LA
    P -.->|Cierre Ciego y Arqueo| LA

    %% Relaciones Estratégicas
    LA ==>|Rentabilidad y Fuga de Capital| SA
    P ==>|DTE y Consumo Folios CAF| SA
    M ==>|Asistencia (Ley 40h)| SA

2. Diagrama de Secuencia: El Flujo "Magia" (Pedido a Pago)
Este diagrama muestra el paso a paso en el tiempo. Es ideal para que un desarrollador entienda en qué orden se disparan los eventos WebSocket (table.status_changed, course.fire, etc.).

sequenceDiagram
    autonumber
    actor C as Cliente (Mesa 4)
    participant M as Mozo (PWA)
    participant K as Cocina (KDS)
    participant P as Caja (POS)
    participant SA as Super Admin

    C->>C: Escanea QR (Onboarding)
    C->>M: Declara Alergia (Alerta Rojo Puro)
    
    rect rgb(1, 22, 35)
        note right of C: Fase de Pedido y Cocina
        C->>K: Agrega Plato (Evento: order.item_added)
        K-->>M: Notifica nueva comanda en KDS
        M->>K: Course Control (Marchar Fondo en 15m)
        K->>K: Cocinero presiona "LISTO"
        K-->>M: Push (Evento: kds.item_ready)
        K-->>C: Tracking actualiza "En camino a mesa"
    end
    
    rect rgb(230, 246, 255)
        note right of C: Fase de Pago y Cierre
        C->>C: Pide Cuenta (Factura / Boleta)
        C->>P: Paga $15.000 vía QR (Webpay)
        P-->>P: Radar QR (Baja saldo en caja automáticamente)
        P->>SA: Emite DTE y descuenta Folio CAF (SII)
        C->>C: Califica 5 Estrellas (Alimenta Gamificación)
        P-->>M: Libera Mesa (Estado: Libre)
    end