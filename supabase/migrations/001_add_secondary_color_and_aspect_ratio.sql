-- Migration: Add secondary_color and aspect_ratio to campaigns
-- Run this in Supabase SQL Editor if you already have the campaigns table

-- Create aspect_ratio enum (if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE aspect_ratio AS ENUM ('portrait', 'square', 'landscape');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add secondary_color column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1E293B';

-- Add aspect_ratio column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS aspect_ratio aspect_ratio DEFAULT 'portrait';
