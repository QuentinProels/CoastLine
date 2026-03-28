-- CoastLine Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_sample BOOLEAN DEFAULT true,
  current_age INTEGER NOT NULL,
  career_path TEXT NOT NULL,
  career_level_index INTEGER NOT NULL,
  annual_salary NUMERIC NOT NULL,
  monthly_take_home NUMERIC NOT NULL,
  employer_match_pct NUMERIC DEFAULT 4,
  retirement_target_age INTEGER DEFAULT 55,
  desired_monthly_retirement_income NUMERIC DEFAULT 5000,
  safe_withdrawal_rate NUMERIC DEFAULT 0.04,
  salary_progression JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_custom BOOLEAN DEFAULT false
);

-- Debts table
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  apr NUMERIC NOT NULL,
  min_payment NUMERIC NOT NULL
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  balance NUMERIC NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_expenses_profile ON expenses(profile_id);
CREATE INDEX idx_debts_profile ON debts(profile_id);
CREATE INDEX idx_assets_profile ON assets(profile_id);
CREATE INDEX idx_profiles_slug ON profiles(slug);

-- Enable Row Level Security (RLS) - permissive for hackathon
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for hackathon (NOT for production)
CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to debts" ON debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to assets" ON assets FOR ALL USING (true) WITH CHECK (true);
