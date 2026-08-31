-- Add document and graph support to surveys
-- Run this in Supabase SQL Editor

-- Add document_url column for PDF/DOCX files
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS document_url TEXT;

-- Add graph_data column for chart configuration (JSONB)
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS graph_data JSONB DEFAULT '{}';

-- Add documents column for multiple file attachments
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

-- Add videos column for multiple video URLs
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';

-- Add audios column for multiple audio files
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS audios JSONB DEFAULT '[]';

-- Grant permissions
GRANT ALL ON surveys TO anon;
GRANT ALL ON surveys TO authenticated;
