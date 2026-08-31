-- EMERO Website Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  published BOOLEAN DEFAULT true,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  section_type TEXT DEFAULT 'custom',
  content JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  show_in_navbar BOOLEAN DEFAULT false,
  navbar_label TEXT DEFAULT '',
  navbar_order INTEGER DEFAULT 0,
  navbar_enabled BOOLEAN DEFAULT true,
  navbar_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL DEFAULT 'paragraph',
  content JSONB DEFAULT '{}',
  media_url TEXT,
  youtube_url TEXT,
  display_order INTEGER DEFAULT 0,
  width TEXT DEFAULT 'full',
  alignment TEXT DEFAULT 'left',
  padding TEXT DEFAULT 'default',
  metadata JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prototype screens table
CREATE TABLE IF NOT EXISTS prototype_screens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  detailed_description TEXT DEFAULT '',
  image_url TEXT,
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  youtube_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  response TEXT DEFAULT '',
  image_url TEXT,
  audio_url TEXT,
  youtube_url TEXT,
  category TEXT DEFAULT 'general',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  person_name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT DEFAULT '',
  description TEXT DEFAULT '',
  feedback_text TEXT NOT NULL,
  audio_url TEXT,
  youtube_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contributors table
CREATE TABLE IF NOT EXISTS contributors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  contribution TEXT DEFAULT '',
  description TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Footer links table
CREATE TABLE IF NOT EXISTS footer_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  group_name TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true
);

-- Admin profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_display_order ON sections(display_order);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section_id ON content_blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_display_order ON content_blocks(display_order);
CREATE INDEX IF NOT EXISTS idx_prototype_screens_category ON prototype_screens(category);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_feedback_display_order ON feedback(display_order);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_prototype_screens_updated_at BEFORE UPDATE ON prototype_screens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS policies
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prototype_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view published pages" ON pages FOR SELECT USING (published = true);
CREATE POLICY "Public can view published sections" ON sections FOR SELECT USING (published = true);
CREATE POLICY "Public can view published content blocks" ON content_blocks FOR SELECT USING (published = true);
CREATE POLICY "Public can view published prototype screens" ON prototype_screens FOR SELECT USING (published = true);
CREATE POLICY "Public can view published gallery" ON gallery FOR SELECT USING (published = true);
CREATE POLICY "Public can view published videos" ON videos FOR SELECT USING (published = true);
CREATE POLICY "Public can view published surveys" ON surveys FOR SELECT USING (published = true);
CREATE POLICY "Public can view published feedback" ON feedback FOR SELECT USING (published = true);
CREATE POLICY "Public can view published contributors" ON contributors FOR SELECT USING (published = true);
CREATE POLICY "Public can view enabled footer links" ON footer_links FOR SELECT USING (enabled = true);

-- Admin policies (authenticated users who are admins)
CREATE POLICY "Admins can do everything on pages" ON pages FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on sections" ON sections FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on content_blocks" ON content_blocks FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on prototype_screens" ON prototype_screens FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on gallery" ON gallery FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on surveys" ON surveys FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on feedback" ON feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on contributors" ON contributors FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on footer_links" ON footer_links FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
);
