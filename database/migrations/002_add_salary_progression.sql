-- Add salary_progression JSONB column to profiles
-- Run this if you already created tables with 001_create_tables.sql
-- Format: [{"age": 22, "salary": 82000, "label": "Junior/SWE I"}, ...]

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary_progression JSONB DEFAULT NULL;
