CREATE TABLE IF NOT EXISTS venues (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('Our partners', 'Desi luxe', 'Dinner to party', 'Bars & night culture', 'Coffee', 'Daytime & alcohol-free')),
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  offer text NOT NULL DEFAULT '',
  featured_date date,
  image_url text NOT NULL,
  object_key text NOT NULL,
  website_url text NOT NULL DEFAULT '',
  more_info_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  content_reviewed boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venues_category_order_idx ON venues (category, active, display_order, name);
