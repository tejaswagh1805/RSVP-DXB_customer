CREATE TABLE IF NOT EXISTS guest_invitations (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  guest_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  table_no text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  plus_ones integer NOT NULL DEFAULT 0 CHECK (plus_ones BETWEEN 0 AND 2),
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE INDEX IF NOT EXISTS guest_invitations_event_created_idx
  ON guest_invitations (event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS guest_invitations_event_status_idx
  ON guest_invitations (event_id, status);
