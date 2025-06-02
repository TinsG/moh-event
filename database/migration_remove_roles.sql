-- Migration to remove role-based system and simplify to single user type
-- Run this on existing databases to update the schema

-- Drop existing role-related constraints and policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Remove role column from users table
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Recreate the trigger function without role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate policies without role restrictions
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id); 