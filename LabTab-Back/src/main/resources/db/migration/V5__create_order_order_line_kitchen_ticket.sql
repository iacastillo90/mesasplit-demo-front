-- =====================================================================
-- Migración: V5__create_order_order_line_kitchen_ticket.sql
-- Entidades: ORDER, ORDER_LINE, KITCHEN_TICKET
-- Diagrama_V3.mmd líneas: 202-213, 238-267
-- Autor: LabTab Backend Team
--
-- Nota: "order" es palabra reservada en PostgreSQL — se cita como "order".
-- branch_id denormalizado en las tres tablas (RLS). quantity > 0 y
-- line_total >= 0 según Doc 06b §4.1.
-- =====================================================================

CREATE TABLE "order" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branch(id),
    dine_session_id UUID NOT NULL REFERENCES dine_session(id),
    person_id       UUID REFERENCES person(id),
    status          VARCHAR(50) NOT NULL DEFAULT 'PLACED'
                        CHECK (status IN ('PLACED', 'ACCEPTED', 'IN_PREPARATION', 'READY', 'SERVED', 'CANCELLED')),
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    item_count      INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    channel         VARCHAR(20) NOT NULL DEFAULT 'staff',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE order_line (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES "order"(id),
    branch_id     UUID NOT NULL REFERENCES branch(id),
    dish_id       UUID NOT NULL REFERENCES dish(id),
    name          VARCHAR(255) NOT NULL,
    unit_price    NUMERIC(12,2) NOT NULL,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    line_total    NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
    item_notes    TEXT,
    modifiers     JSONB,
    status        VARCHAR(50) NOT NULL DEFAULT 'QUEUED'
                      CHECK (status IN ('QUEUED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED')),
    dine_guest_id UUID REFERENCES dine_guest(id),
    paid          BOOLEAN NOT NULL DEFAULT FALSE,
    course_type   VARCHAR(20),
    course_status VARCHAR(20),
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE kitchen_ticket (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES "order"(id),
    branch_id     UUID NOT NULL REFERENCES branch(id),
    table_name    VARCHAR(100) NOT NULL,
    status        VARCHAR(50) NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    priority      VARCHAR(20) NOT NULL DEFAULT 'normal',
    items_summary TEXT NOT NULL,
    notes         TEXT,
    started_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_session ON "order"(dine_session_id, branch_id);
CREATE INDEX idx_order_branch ON "order"(branch_id);
CREATE INDEX idx_order_line_order ON order_line(order_id, branch_id);
CREATE INDEX idx_order_line_branch ON order_line(branch_id);
CREATE INDEX idx_kitchen_ticket_order ON kitchen_ticket(order_id);
CREATE INDEX idx_kitchen_ticket_branch ON kitchen_ticket(branch_id);
