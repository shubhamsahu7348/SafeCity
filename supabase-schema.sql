-- ==============================================================================
-- SafeCity Supabase Database Setup Script
-- Project ID: hflpnvixueffwbjbmnzh
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/hflpnvixueffwbjbmnzh
-- 2. Click on the "SQL Editor" tab on the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "Run".
-- 4. Your public hazard form data will immediately persist in your Supabase PostgreSQL database!
-- ==============================================================================

-- 1. Create the `complaints` table for storing public hazard reports
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    severity TEXT NOT NULL,
    is_emergency BOOLEAN DEFAULT FALSE,
    description TEXT,
    photo_url TEXT,
    video_url TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Submitted',
    assigned_department TEXT,
    assigned_worker_id TEXT,
    assigned_worker_name TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    before_photo_url TEXT,
    after_photo_url TEXT,
    upvotes INT DEFAULT 1,
    estimated_resolution_hours INT,
    vehicle_plate_number TEXT,
    violation_type TEXT,
    fine_amount NUMERIC,
    fine_status TEXT,
    challan_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for high-speed queries on department, status, and reporting time
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON public.complaints(assigned_department);
CREATE INDEX IF NOT EXISTS idx_complaints_reported_at ON public.complaints(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_emergency ON public.complaints(is_emergency) WHERE is_emergency = TRUE;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Public Citizen Hazard Reporting
-- Citizen can submit (INSERT) reports anonymously or with auth:
DROP POLICY IF EXISTS "Allow public insert to complaints" ON public.complaints;
CREATE POLICY "Allow public insert to complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (true);

-- Anyone can view (SELECT) complaints for transparency and citizen tracking:
DROP POLICY IF EXISTS "Allow public read from complaints" ON public.complaints;
CREATE POLICY "Allow public read from complaints" 
ON public.complaints 
FOR SELECT 
USING (true);

-- Allow updates (UPDATE) for status progression and worker completion:
DROP POLICY IF EXISTS "Allow public update to complaints" ON public.complaints;
CREATE POLICY "Allow public update to complaints" 
ON public.complaints 
FOR UPDATE 
USING (true);

-- 5. Confirmation message
COMMENT ON TABLE public.complaints IS 'SafeCity Public Hazard Reports & Citizen Complaints Table';

-- ==============================================================================
-- PART 2: Officer, Field Worker & Administrator User Accounts Table
-- ==============================================================================

-- 6. Create the `users` table for officers, field workers, and administrators
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'officer', 'worker')),
    department TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    worker_id TEXT,
    joining_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create indexes for fast username lookup and role filtering
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);

-- 8. Enable Row Level Security (RLS) for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 9. Create Policies for User Account Management
-- Allow select for authentication & management:
DROP POLICY IF EXISTS "Allow public read from users" ON public.users;
CREATE POLICY "Allow public read from users" 
ON public.users 
FOR SELECT 
USING (true);

-- Allow insert for account registration & onboarding:
DROP POLICY IF EXISTS "Allow public insert to users" ON public.users;
CREATE POLICY "Allow public insert to users" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Allow update for profile changes, password resets, and details:
DROP POLICY IF EXISTS "Allow public update to users" ON public.users;
CREATE POLICY "Allow public update to users" 
ON public.users 
FOR UPDATE 
USING (true);

-- Allow delete for account removal by administrators:
DROP POLICY IF EXISTS "Allow public delete from users" ON public.users;
CREATE POLICY "Allow public delete from users" 
ON public.users 
FOR DELETE 
USING (true);

-- 10. Pre-seed Default Administrator, Officer, and Field Worker Credentials into Supabase
INSERT INTO public.users (id, name, username, password, role, department, worker_id, email, phone)
VALUES
  -- System Administrator
  ('U-001', 'System Admin', 'admin', 'admin123', 'admin', NULL, NULL, 'admin@safecity.gov', '+1 (555) 000-9900'),
  
  -- Department Officers
  ('U-101', 'Officer Sarah Jenkins', 'officer.jenkins', 'officer123', 'officer', 'Electricity Department', NULL, 's.jenkins@safecity.gov', '+1 (555) 011-8822'),
  ('U-102', 'Officer Robert Chen', 'officer.chen', 'officer123', 'officer', 'Road Department', NULL, 'r.chen@safecity.gov', '+1 (555) 022-7733'),
  ('U-103', 'Inspector Vikram Sharma', 'officer.vikram', 'officer123', 'officer', 'Traffic Police Department', NULL, 'v.sharma@trafficpolice.gov', '+1 (555) 033-6644'),
  
  -- Field Workers
  ('U-W101', 'Marcus Vance', 'marcus.vance', 'worker123', 'worker', 'Electricity Department', 'W-101', 'm.vance@safecity.gov', '+1 (555) 019-2831'),
  ('U-W102', 'David Miller', 'david.miller', 'worker123', 'worker', 'Road Department', 'W-102', 'd.miller@safecity.gov', '+1 (555) 023-9911'),
  ('U-W103', 'Elena Rostova', 'elena.rostova', 'worker123', 'worker', 'Water & Sewerage', 'W-103', 'e.rostova@safecity.gov', '+1 (555) 088-3412'),
  ('U-W104', 'Tom Hanks', 'tom.hanks', 'worker123', 'worker', 'Public Safety & Infrastructure', 'W-104', 't.hanks@safecity.gov', '+1 (555) 091-7788'),
  ('U-W105', 'Carlos Gomez', 'carlos.gomez', 'worker123', 'worker', 'Environmental Protection', 'W-105', 'c.gomez@safecity.gov', '+1 (555) 044-6622'),
  ('U-W106', 'Rohan Patil', 'rohan.patil', 'worker123', 'worker', 'Traffic Police Department', 'W-106', 'r.patil@trafficpolice.gov', '+1 (555) 055-7788')
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  worker_id = EXCLUDED.worker_id,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

COMMENT ON TABLE public.users IS 'SafeCity Officers, Field Workers, and Administrators Credentials Table';
