-- Supabase Storage Setup
-- Run this after creating the schema

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('prototype-images', 'prototype-images', true),
  ('gallery-images', 'gallery-images', true),
  ('profile-images', 'profile-images', true),
  ('feedback-audio', 'feedback-audio', true),
  ('other-media', 'other-media', true);

-- Storage policies for public read access
CREATE POLICY "Public can view prototype images" ON storage.objects
  FOR SELECT USING (bucket_id = 'prototype-images');

CREATE POLICY "Public can view gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Public can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Public can view feedback audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'feedback-audio');

CREATE POLICY "Public can view other media" ON storage.objects
  FOR SELECT USING (bucket_id = 'other-media');

-- Admin upload policies (authenticated admin users)
CREATE POLICY "Admins can upload prototype images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prototype-images' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery-images' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can upload feedback audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'feedback-audio' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can upload other media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'other-media' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin delete policies
CREATE POLICY "Admins can delete prototype images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prototype-images' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete gallery images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery-images' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete feedback audio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'feedback-audio' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete other media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'other-media' AND
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_admin = true)
  );
