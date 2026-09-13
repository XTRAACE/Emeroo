-- ============================================================
-- Add row layout support to content_blocks
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add row_id column for grouping blocks into rows
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS row_id TEXT;

-- Add columns column for row layout (2, 3, or 4 columns)
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS columns INTEGER DEFAULT 2;

-- Create index for faster row queries
CREATE INDEX IF NOT EXISTS idx_content_blocks_row_id ON content_blocks(row_id);

-- Done! Blocks can now be grouped into rows.
