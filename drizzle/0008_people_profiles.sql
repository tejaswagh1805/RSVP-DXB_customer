CREATE TABLE IF NOT EXISTS people_profiles (
  id text PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('artist', 'influencer')),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  object_key text NOT NULL,
  instagram_url text NOT NULL DEFAULT '',
  tiktok_url text NOT NULL DEFAULT '',
  youtube_url text NOT NULL DEFAULT '',
  x_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS people_profiles_category_order_idx ON people_profiles (category, active, display_order, created_at DESC);
