-- FIX ENUM Types
-- Add missing status values to membership_status enum

-- We use IF NOT EXISTS logic via exception handling block because 
-- Postgres doesn't support "ADD VALUE IF NOT EXISTS" natively straightforwardly in all versions

DO $$
BEGIN
    ALTER TYPE membership_status ADD VALUE 'pending_verification';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE membership_status ADD VALUE 'rejected';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
