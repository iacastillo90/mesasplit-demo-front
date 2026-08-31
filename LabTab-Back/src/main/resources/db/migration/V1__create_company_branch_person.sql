-- =====================================================================
-- Migración: V1__create_company_branch_person.sql
-- Entidades: COMPANY, COMPANY_ROLE, BRANCH, BRANCH_ROLE, PERSON, PERSON_PROFILE
-- Diagrama_V3.mmd líneas: 81-142
-- Autor: LabTab Backend Team
--
-- Notas de decisión:
--  * Los enums (plan, role, status) se almacenan en UPPER_SNAKE_CASE vía
--    @Enumerated(EnumType.STRING) — los CHECK usan valores en MAYÚSCULA para
--    coincidir con lo que escribe Hibernate (ver 06-arquitectura-backend.md §8).
--  * PERSON_PROFILE no tiene columna `role` (Sección 8 del brief): el rol se
--    deriva de COMPANY_ROLE / BRANCH_ROLE.
--  * Todas las tablas incluyen created_at + updated_at (BaseEntity, Doc 06b §5);
--    el ejemplo de PERSON en el doc omitía updated_at — se normaliza acá.
-- =====================================================================

CREATE TABLE company (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    logo_url   TEXT,
    plan       VARCHAR(20) NOT NULL DEFAULT 'STARTER'
                   CHECK (plan IN ('STARTER', 'GROWTH', 'CHAIN')),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE person (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE company_role (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company(id),
    person_id  UUID NOT NULL REFERENCES person(id),
    role       VARCHAR(50) NOT NULL
                   CHECK (role IN ('OWNER', 'ADMIN')),
    status     VARCHAR(50) NOT NULL DEFAULT 'INVITED'
                   CHECK (status IN ('INVITED', 'ACTIVE', 'DISABLED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE branch (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id         UUID NOT NULL REFERENCES company(id),
    name               VARCHAR(255) NOT NULL,
    district           VARCHAR(100),
    city               VARCHAR(100) NOT NULL DEFAULT 'Santiago',
    address            TEXT,
    phone              VARCHAR(50),
    cuisine_tags       TEXT[],
    cover_image_url    TEXT,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    service_charge_pct NUMERIC(12,2) NOT NULL DEFAULT 10.00,
    timezone           VARCHAR(50) NOT NULL DEFAULT 'America/Santiago',
    opening_hours      JSONB,
    table_grid_rows    INTEGER NOT NULL DEFAULT 4,
    table_grid_cols    INTEGER NOT NULL DEFAULT 4,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE branch_role (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id  UUID NOT NULL REFERENCES branch(id),
    person_id  UUID NOT NULL REFERENCES person(id),
    role       VARCHAR(50) NOT NULL
                   CHECK (role IN ('OWNER', 'MANAGER', 'STAFF', 'KITCHEN')),
    status     VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE', 'INACTIVE')),
    pin_code   VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE person_profile (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id         UUID NOT NULL UNIQUE REFERENCES person(id),
    full_name         VARCHAR(255),
    phone             VARCHAR(50),
    avatar_url        TEXT,
    birthday          DATE,
    allergies         TEXT[],
    preferred_payment VARCHAR(50),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_role_company ON company_role(company_id);
CREATE INDEX idx_company_role_person ON company_role(person_id);
CREATE INDEX idx_branch_company ON branch(company_id);
CREATE INDEX idx_branch_role_branch ON branch_role(branch_id);
CREATE INDEX idx_branch_role_person ON branch_role(person_id);
