ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
