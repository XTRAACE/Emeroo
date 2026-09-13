-- ============================================================
-- Add default contact settings
-- Run this in Supabase SQL Editor
-- ============================================================

INSERT INTO site_settings (id, value) VALUES
  ('contact', '{
    "instagram_url": "https://instagram.com/krishnabhadran",
    "instagram_username": "@krishnabhadran",
    "contact_name": "Krishnabhadran",
    "contact_title": "Developer & Creator",
    "welcome_message": "Found a bug or have suggestions?",
    "feedback_placeholder": "Tell us what you think, report bugs, or suggest features...",
    "show_contact": true
  }')
ON CONFLICT (id) DO NOTHING;

-- Done! Contact settings are now editable from admin.
