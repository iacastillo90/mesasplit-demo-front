-- =====================================================================
-- Seed de demo: V13__seed_demo_data.sql
-- Solo se ejecuta en perfil 'dev' (application-dev.yml: db/seed)
-- Datos: 1 empresa, 1 sucursal, 3 usuarios, 1 piso, 8 mesas, 4 secciones, 15 platos
--
-- Credenciales demo (password: LabTab2026!):
--   admin@labtab.cl  -> SUPERADMIN + MANAGER (PIN 1234)
--   mozo@labtab.cl   -> STAFF
--   cocina@labtab.cl -> KITCHEN
-- =====================================================================

-- Empresa y sucursal
INSERT INTO company (id, name, slug, plan, is_active) VALUES
    ('00000000-0000-0000-0000-000000000001', 'LabTab SpA', 'labtab-demo', 'STARTER', TRUE);

INSERT INTO branch (id, company_id, name, district, city, address, phone, service_charge_pct, timezone, table_grid_rows, table_grid_cols) VALUES
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
     'LabTab Vitacura', 'Vitacura', 'Santiago', 'Av. Vitacura 4500', '+56 2 2345 6789',
     10.00, 'America/Santiago', 4, 4);

-- Personas (password_hash = BCrypt de 'LabTab2026!')
INSERT INTO person (id, email, password_hash, is_active) VALUES
    ('00000000-0000-0000-0000-000000000011', 'admin@labtab.cl',  '$2a$12$0GwJsFX2WGkDGzDZAqJxmeS7Njgbba0NtfnV3IimqN8YRkkcaRjX6', TRUE),
    ('00000000-0000-0000-0000-000000000012', 'mozo@labtab.cl',   '$2a$12$0GwJsFX2WGkDGzDZAqJxmeS7Njgbba0NtfnV3IimqN8YRkkcaRjX6', TRUE),
    ('00000000-0000-0000-0000-000000000013', 'cocina@labtab.cl', '$2a$12$0GwJsFX2WGkDGzDZAqJxmeS7Njgbba0NtfnV3IimqN8YRkkcaRjX6', TRUE);

INSERT INTO person_profile (id, person_id, full_name) VALUES
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011', 'Admin LabTab'),
    ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000012', 'Mozo Demo'),
    ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000013', 'Cocina Demo');

-- Roles
INSERT INTO company_role (id, company_id, person_id, role, status) VALUES
    ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'ADMIN', 'ACTIVE');

INSERT INTO branch_role (id, branch_id, person_id, role, status, pin_code) VALUES
    ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'MANAGER', 'ACTIVE', '$2a$12$Tk/KDuLX3rmlvprAZMesvOYydmJ5cAgEmJsgoa.V3rtpIlz0fAS3y'),
    ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', 'STAFF',   'ACTIVE', NULL),
    ('00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013', 'KITCHEN', 'ACTIVE', NULL);

-- Piso y mesas
INSERT INTO dining_floor (id, branch_id, name, display_order) VALUES
    ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000002', 'Principal', 0);

INSERT INTO dining_table (id, branch_id, floor_id, name, capacity, status, qr_token, position_x, position_y, shape) VALUES
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 1', 4, 'AVAILABLE', 'tok_mesa_1', 100, 100, 'rect'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 2', 4, 'AVAILABLE', 'tok_mesa_2', 280, 100, 'rect'),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 3', 4, 'AVAILABLE', 'tok_mesa_3', 460, 100, 'rect'),
    ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 4', 6, 'AVAILABLE', 'tok_mesa_4', 100, 280, 'rect'),
    ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 5', 6, 'AVAILABLE', 'tok_mesa_5', 280, 280, 'rect'),
    ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 6', 6, 'AVAILABLE', 'tok_mesa_6', 460, 280, 'rect'),
    ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 7', 2, 'AVAILABLE', 'tok_mesa_7', 100, 460, 'circle'),
    ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000051', 'Mesa 8', 2, 'AVAILABLE', 'tok_mesa_8', 280, 460, 'circle');

-- Menú
INSERT INTO menu_section (id, branch_id, name, description, display_order, is_active) VALUES
    ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 'Entradas', 'Para comenzar', 1, TRUE),
    ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 'Fondos', 'Platos principales', 2, TRUE),
    ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000002', 'Postres', 'Dulce final', 3, TRUE),
    ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', 'Bebidas', 'Para acompañar', 4, TRUE);

INSERT INTO dish (id, section_id, branch_id, name, description, price, is_available, tags, allergens, display_order) VALUES
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 'Empanadas de Pino', 'Masa casera, pino tradicional.', 3500, TRUE, ARRAY['tradicional'], ARRAY['gluten','huevo'], 1),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 'Ensalada César', 'Lechuga, pollo, parmesano.', 4500, TRUE, ARRAY['liviano'], ARRAY['lacteos','huevo'], 2),
    ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 'Ceviche', 'Pescado fresco, limón, cilantro.', 5500, TRUE, ARRAY['marino'], ARRAY['pescado'], 3),
    ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 'Lomo Vetado', 'Corte premium a la parrilla.', 8900, TRUE, ARRAY['parrilla'], ARRAY[]::text[], 1),
    ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 'Salmón a la Plancha', 'Con puré de coliflor.', 9500, TRUE, ARRAY['saludable'], ARRAY['pescado'], 2),
    ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 'Pastel de Choclo', 'Receta chilena de la casa.', 6500, TRUE, ARRAY['tradicional'], ARRAY['gluten','lacteos'], 3),
    ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 'Ravioles', 'Rellenos de ricota y espinaca.', 7200, TRUE, ARRAY['pasta'], ARRAY['gluten','lacteos','huevo'], 4),
    ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000002', 'Tiramisú', 'Clásico italiano.', 4200, TRUE, ARRAY['clasico'], ARRAY['lacteos','huevo'], 1),
    ('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000002', 'Crème Brûlée', 'Con caramelo crocante.', 3800, TRUE, ARRAY['clasico'], ARRAY['lacteos','huevo'], 2),
    ('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000002', 'Torta Tres Leches', 'Esponjosa y húmeda.', 4500, TRUE, ARRAY['clasico'], ARRAY['lacteos','gluten','huevo'], 3),
    ('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', 'Coca-Cola', 'Botella 350 ml.', 1500, TRUE, ARRAY[]::text[], ARRAY[]::text[], 1),
    ('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', 'Agua Mineral', 'Con y sin gas.', 1200, TRUE, ARRAY[]::text[], ARRAY[]::text[], 2),
    ('00000000-0000-0000-0000-000000000313', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', 'Limonada', 'Menta y jengibre.', 1800, TRUE, ARRAY[]::text[], ARRAY[]::text[], 3),
    ('00000000-0000-0000-0000-000000000314', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', 'Cerveza Artesanal', 'IPA local.', 3200, TRUE, ARRAY['alcohol'], ARRAY['gluten'], 4),
    ('00000000-0000-0000-0000-000000000315', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', 'Copa de Vino', 'Carmenere reserva.', 3500, TRUE, ARRAY['alcohol'], ARRAY['sulfitos'], 5);
