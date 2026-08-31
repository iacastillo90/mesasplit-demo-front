-- =====================================================================
-- Migración: V6__create_bill_bill_line_payment_exception_log.sql
-- Entidades: BILL, BILL_LINE, PAYMENT, EXCEPTION_LOG
-- Diagrama_V3.mmd líneas: 269-320, 408-419 · Doc 06b §4 y §6
-- Autor: LabTab Backend Team
--
-- Nota: EXCEPTION_LOG es tabla de auditoría append-only — NO lleva
-- updated_at (Doc 06b §6). Su conjunto de campos (authorized_by, order_id)
-- sigue la definición completa del Doc 06b §6, no la variante del Diagrama.
-- =====================================================================

CREATE TABLE bill (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dine_session_id      UUID NOT NULL REFERENCES dine_session(id),
    branch_id            UUID NOT NULL REFERENCES branch(id),
    status               VARCHAR(50) NOT NULL DEFAULT 'OPEN'
                             CHECK (status IN ('OPEN', 'PAID', 'VOID')),
    subtotal             NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    service_charge_pct   NUMERIC(12,2) NOT NULL DEFAULT 10.00
                             CHECK (service_charge_pct >= 0 AND service_charge_pct <= 100),
    service_charge_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    tip_total            NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance_due >= 0),
    version              BIGINT NOT NULL DEFAULT 0,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE bill_line (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id        UUID NOT NULL REFERENCES bill(id),
    branch_id      UUID NOT NULL REFERENCES branch(id),
    order_line_id  UUID NOT NULL REFERENCES order_line(id),
    dish_id        UUID NOT NULL REFERENCES dish(id),
    dine_guest_id  UUID REFERENCES dine_guest(id),
    name           VARCHAR(255) NOT NULL,
    quantity       INTEGER NOT NULL,
    unit_price     NUMERIC(12,2) NOT NULL,
    line_total     NUMERIC(12,2) NOT NULL,
    paid_qty       NUMERIC(12,4) NOT NULL DEFAULT 0,
    paid_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    status         VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
                       CHECK (status IN ('ACTIVE', 'VOID')),
    modifiers      JSONB,
    notes          TEXT,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE payment (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id                 UUID NOT NULL REFERENCES bill(id),
    branch_id               UUID NOT NULL REFERENCES branch(id),
    person_id               UUID REFERENCES person(id),
    amount                  NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    tip_amount              NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tip_amount >= 0),
    total_amount            NUMERIC(12,2) NOT NULL,
    method                  VARCHAR(50) NOT NULL
                                CHECK (method IN ('WEBPAY', 'MERCADO_PAGO', 'APPLE_PAY', 'GOOGLE_PAY', 'CARD', 'CASH', 'TRANSFER')),
    status                  VARCHAR(50) NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    provider                VARCHAR(50),
    buy_order               VARCHAR(100),
    authorization_code      VARCHAR(100),
    external_transaction_id VARCHAR(255) UNIQUE,
    gateway_response_json   JSONB,
    currency                VARCHAR(10) NOT NULL DEFAULT 'CLP',
    paid_at                 TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE exception_log (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id      UUID NOT NULL REFERENCES branch(id),
    person_id      UUID REFERENCES person(id),
    authorized_by  UUID REFERENCES person(id),
    event_type     VARCHAR(50) NOT NULL
                       CHECK (event_type IN ('ITEM_VOID_AFTER_KITCHEN', 'MANUAL_DISCOUNT', 'DRAWER_OPENED_NO_SALE', 'REFUND_ISSUED', 'PIN_AUTH_FAILED')),
    reason         VARCHAR(100),
    order_id       UUID REFERENCES "order"(id),
    order_line_id  UUID REFERENCES order_line(id),
    amount         NUMERIC(12,2),
    metadata       JSONB,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bill_session ON bill(dine_session_id);
CREATE INDEX idx_bill_branch ON bill(branch_id);
CREATE INDEX idx_bill_line_bill ON bill_line(bill_id);
CREATE INDEX idx_bill_line_branch ON bill_line(branch_id);
CREATE INDEX idx_payment_bill ON payment(bill_id, status);
CREATE INDEX idx_payment_branch ON payment(branch_id);
CREATE INDEX idx_exception_log_branch ON exception_log(branch_id, created_at DESC);
