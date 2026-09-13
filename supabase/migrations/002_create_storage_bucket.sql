-- ============================================================
-- EMERO Storage Bucket for Content Block Images
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Allow public access to view images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'content-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'content-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'content-images');

-- Done! Images can now be uploaded to the 'content-images' bucket.
