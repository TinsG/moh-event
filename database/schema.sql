-- MOH Event Registration System Database Schema
-- This file contains the SQL statements to set up the database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table for event attendees
CREATE TABLE registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    organization TEXT NOT NULL,
    position TEXT NOT NULL,
    qr_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table for tracking daily check-ins
CREATE TABLE attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 3),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scanner_user_id UUID NOT NULL REFERENCES users(id),
    UNIQUE(registration_id, day) -- Prevent duplicate attendance for same day
);

-- Indexes for better performance
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_attendance_registration_id ON attendance(registration_id);
CREATE INDEX idx_attendance_day ON attendance(day);
CREATE INDEX idx_attendance_scanned_at ON attendance(scanned_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on registrations table
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Registrations table policies
CREATE POLICY "Authenticated users can view registrations" ON registrations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert registrations" ON registrations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update registrations" ON registrations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Attendance table policies  
CREATE POLICY "Authenticated users can view attendance" ON attendance
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert attendance" ON attendance
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default admin user (this will need to be done after user signup)
-- You'll need to manually update the role for the first admin user
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- Example: Create a function to promote user to admin (call this from SQL editor)
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users SET role = 'admin' WHERE email = user_email;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (uncomment and modify after first user signup):
-- SELECT promote_user_to_admin('admin@mohevent.com'); 