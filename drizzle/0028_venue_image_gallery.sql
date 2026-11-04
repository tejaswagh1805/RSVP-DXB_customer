ALTER TABLE venues ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT '{}';
