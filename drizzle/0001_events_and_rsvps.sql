CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  title text NOT NULL,
  brand text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  venue text NOT NULL,
  area text NOT NULL,
  category text NOT NULL,
  tracks text[] NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  confirmed integer NOT NULL DEFAULT 0 CHECK (confirmed >= 0),
  dress_code text NOT NULL,
  about text NOT NULL,
  included text[] NOT NULL DEFAULT '{}',
  who_is_invited text NOT NULL,
  host_note text NOT NULL,
  status text NOT NULL CHECK (status IN ('published', 'pending', 'closed')),
  image_key text NOT NULL,
  image_data text NOT NULL DEFAULT ''
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS dress_code text NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS about text NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS included text[] NOT NULL DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS who_is_invited text NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_note text NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_key text NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_data text NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check CHECK (status IN ('draft', 'published', 'pending', 'closed'));

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_key text NOT NULL,
  state text NOT NULL CHECK (state IN ('going', 'waitlist')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, guest_key)
);

CREATE TABLE IF NOT EXISTS app_metadata (
  key text PRIMARY KEY,
  value text NOT NULL
);
