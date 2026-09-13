-- ============================================================
-- Add title customization to sections
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add title_color column
ALTER TABLE sections ADD COLUMN IF NOT EXISTS title_color TEXT;

-- Add title_alignment column
ALTER TABLE sections ADD COLUMN IF NOT EXISTS title_alignment TEXT DEFAULT 'center';

-- Done! Section titles can now be customized with colors and alignment.
