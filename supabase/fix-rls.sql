-- Fix RLS Policies for Admin Write Operations
-- Run this in Supabase SQL Editor if you get "permission denied" errors

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can do everything on pages" ON pages;
DROP POLICY IF EXISTS "Admins can do everything on sections" ON sections;
DROP POLICY IF EXISTS "Admins can do everything on content_blocks" ON content_blocks;
DROP POLICY IF EXISTS "Admins can do everything on prototype_screens" ON prototype_screens;
DROP POLICY IF EXISTS "Admins can do everything on gallery" ON gallery;
DROP POLICY IF EXISTS "Admins can do everything on videos" ON videos;
DROP POLICY IF EXISTS "Admins can do everything on surveys" ON surveys;
DROP POLICY IF EXISTS "Admins can do everything on feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can do everything on contributors" ON contributors;
DROP POLICY IF EXISTS "Admins can do everything on footer_links" ON footer_links;

-- New policies: Allow ALL operations for authenticated users
-- (auth.uid() IS NOT NULL means the user is logged in)

CREATE POLICY "Authenticated users can manage pages" ON pages
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage sections" ON sections
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage content_blocks" ON content_blocks
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage prototype_screens" ON prototype_screens
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage gallery" ON gallery
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage videos" ON videos
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage surveys" ON surveys
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage feedback" ON feedback
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage contributors" ON contributors
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage footer_links" ON footer_links
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Also make sure the admin_profiles table allows reading
DROP POLICY IF EXISTS "Public can view admin profiles" ON admin_profiles;
CREATE POLICY "Authenticated users can view admin profiles" ON admin_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Verify: This should show all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
