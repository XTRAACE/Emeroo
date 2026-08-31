-- Seed Data for EMERO Website
-- Run this after creating the schema and storage buckets

-- Create default home page
INSERT INTO pages (id, title, slug, description, published, seo_title, seo_description)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Home',
  '/',
  'EMERO - Emergency Response Ecosystem',
  true,
  'EMERO — Emergency Response Ecosystem',
  'When every second matters, help should know where to go. EMERO connects people in emergencies with the right responders.'
) ON CONFLICT (slug) DO NOTHING;

-- Create about page
INSERT INTO pages (id, title, slug, description, published, seo_title, seo_description)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'About',
  '/about',
  'Learn about EMERO',
  true,
  'About EMERO — Emergency Response Ecosystem',
  'Learn about the EMERO emergency response ecosystem.'
) ON CONFLICT (slug) DO NOTHING;

-- Create journey page
INSERT INTO pages (id, title, slug, description, published)
VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'Journey',
  '/journey',
  'The EMERO story from prototype to ecosystem',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Create feedback page
INSERT INTO pages (id, title, slug, description, published)
VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'Feedback',
  '/feedback',
  'Feedback and reviews from people who explored EMERO',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Default footer links
INSERT INTO footer_links (label, href, group_name, display_order, enabled) VALUES
  ('Home', '/', 'Navigation', 1, true),
  ('Prototype', '#prototype', 'Explore', 2, true),
  ('Research', '#research', 'Explore', 3, true),
  ('Journey', '#journey', 'Explore', 4, true),
  ('Feedback', '#feedback', 'Community', 5, true),
  ('Contributors', '#contributors', 'Community', 6, true);
