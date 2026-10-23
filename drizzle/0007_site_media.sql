CREATE TABLE IF NOT EXISTS site_media (
  id text PRIMARY KEY,
  slot text NOT NULL CHECK (slot IN ('gallery', 'top_pick')),
  title text NOT NULL,
  caption text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  object_key text NOT NULL,
  link_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_media_slot_order_idx ON site_media (slot, active, display_order, created_at DESC);