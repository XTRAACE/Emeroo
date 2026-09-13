-- ============================================================
-- EMERO Database Migration
-- Creates site_settings and content_blocks tables
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- Step 1: Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create content_blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id TEXT NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'paragraph',
  content JSONB DEFAULT '{}',
  media_url TEXT,
  youtube_url TEXT,
  display_order INTEGER DEFAULT 0,
  width TEXT DEFAULT 'full' CHECK (width IN ('full', 'half', 'third', 'quarter')),
  alignment TEXT DEFAULT 'left' CHECK (alignment IN ('left', 'center', 'right')),
  padding TEXT DEFAULT 'default',
  metadata JSONB,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create index for faster block queries
CREATE INDEX IF NOT EXISTS idx_content_blocks_section_id ON content_blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_display_order ON content_blocks(display_order);

-- Step 4: Disable Row Level Security
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on other tables if they exist
DO $$ BEGIN
  ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE contributors DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE footer_links DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE prototype_screens DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Step 5: Grant permissions
GRANT ALL ON site_settings TO anon;
GRANT ALL ON site_settings TO authenticated;
GRANT ALL ON content_blocks TO anon;
GRANT ALL ON content_blocks TO authenticated;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Seed default site settings
INSERT INTO site_settings (id, value) VALUES
  ('hero', '{"title":"When Every Second Matters, EMERO Connects the Response.","subtitle":"EMERO is an intelligent emergency-response platform designed to connect people, emergency vehicles, hospitals and responders through real-time coordination, location intelligence and AI-assisted decision support.","badge":"Emergency Response Technology","cta_primary":"Explore EMERO","cta_secondary":"See How It Works","video_url":""}'),
  ('navbar', '{"bg_color":"#dc2626","text_color":"#ffffff","accent_color":"#fca5a5","style":"solid","logo_text":"EMERO"}'),
  ('theme', '{"primary":"#dc2626","primary_light":"#fca5a5","primary_dark":"#991b1b","gradient":"linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)"}'),
  ('footer', '{"copyright":"© 2025 EMERO. All rights reserved.","tagline":"Intelligent Emergency Response Technology"}')
ON CONFLICT (id) DO NOTHING;

-- Done! Both tables are now ready to use.
