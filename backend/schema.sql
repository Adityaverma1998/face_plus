-- ============================================================
-- FacePulse: Multi-Tenant Attendance Database Schema
-- Client-side Biometrics / Offline-First Attendance Sync
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. System Admins (Super Admins)
CREATE TABLE IF NOT EXISTS system_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Companies (Tenants)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Company Users (Company Admins & Terminal Devices)
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('company_admin', 'terminal')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_company_username UNIQUE (company_id, username)
);

-- 5. Employees Master
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL,
    display_name TEXT NOT NULL,
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_company_employee_code UNIQUE (company_id, employee_code)
);

-- 6. Attendance Events (Punches synced from mobile clients)
CREATE TABLE IF NOT EXISTS attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('check_in', 'check_out')),
    punch_time TIMESTAMPTZ NOT NULL,
    device_id TEXT,
    match_score FLOAT, -- Match confidence from client-side face recognition
    sync_idempotency_key TEXT UNIQUE NOT NULL, -- UUID generated on mobile device to prevent duplicate punches
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for Fast Querying & Idempotency
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(company_code);
CREATE INDEX IF NOT EXISTS idx_company_users_tenant ON company_users(company_id, username);
CREATE INDEX IF NOT EXISTS idx_employees_tenant_code ON employees(company_id, employee_code);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_punch ON attendance_events(company_id, punch_time DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_idempotency ON attendance_events(sync_idempotency_key);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON companies FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON company_users FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON employees FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON attendance_events FOR ALL USING (true);

-- ============================================================
-- Initial Seed: Default Super Admin
-- Username: superadmin
-- Password: AdminPassword@123 (hashed with bcrypt)
-- ============================================================
INSERT INTO system_admins (username, email, password_hash)
VALUES (
    'superadmin',
    'admin@facepulse.io',
    '$2b$12$DUeeCRWyI6gedPz21kJf/OCxkFtex8LJ4kFfuXcSGDfEshEe39BgO'
)
ON CONFLICT (username) DO NOTHING;

