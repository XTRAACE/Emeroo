-- ============================================================
-- EMERO Database Permission Fix
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- Step 1: Disable RLS on all tables
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE prototype_screens DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE contributors DISABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant full permissions to both roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 3: Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 4: Create site_settings table for editable website text
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON site_settings TO anon;
GRANT ALL ON site_settings TO authenticated;

-- Step 5: Seed default site settings (hero text, navbar colors, theme)
INSERT INTO site_settings (id, value) VALUES
  ('hero', '{"title":"When Every Second Matters, EMERO Connects the Response.","subtitle":"EMERO is an intelligent emergency-response platform designed to connect people, emergency vehicles, hospitals and responders through real-time coordination, location intelligence and AI-assisted decision support.","badge":"Emergency Response Technology","cta_primary":"Explore EMERO","cta_secondary":"See How It Works","video_url":""}'),
  ('navbar', '{"bg_color":"#dc2626","text_color":"#ffffff","accent_color":"#fca5a5","style":"solid","logo_text":"EMERO"}'),
  ('theme', '{"primary":"#dc2626","primary_light":"#fca5a5","primary_dark":"#991b1b","gradient":"linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)"}'),
  ('footer', '{"copyright":"© 2025 EMERO. All rights reserved.","tagline":"Intelligent Emergency Response Technology"}')
ON CONFLICT (id) DO NOTHING;
