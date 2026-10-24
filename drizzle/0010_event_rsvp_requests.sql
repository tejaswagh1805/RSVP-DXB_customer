ALTER TABLE events
  ADD COLUMN IF NOT EXISTS track_capacities jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS influencer_deliverables text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS map_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS end_time text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gates_open_time text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS event_rsvp_requests (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  member_email text NOT NULL,
  track text NOT NULL,
  guest_names text[] NOT NULL DEFAULT '{}',
  deliverables_agreed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'waitlisted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, member_id)
);

CREATE INDEX IF NOT EXISTS event_rsvp_requests_event_status_idx
  ON event_rsvp_requests (event_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS event_rsvp_requests_member_idx
  ON event_rsvp_requests (member_id, created_at DESC);

-- Carry forward the old immediate RSVP and waitlist rows without changing
-- their meaning. New requests use the reviewed statuses above.
INSERT INTO event_rsvp_requests (
  id, event_id, member_id, member_email, track, status, created_at, updated_at
)
SELECT
  'legacy-' || r.event_id || '-' || r.guest_key,
  r.event_id,
  m.id,
  COALESCE(m.email, ''),
  m.track,
  CASE WHEN r.state = 'going' THEN 'accepted' ELSE 'waitlisted' END,
  r.created_at,
  r.created_at
FROM event_rsvps r
JOIN members m ON m.id = r.guest_key OR lower(m.email) = lower(r.guest_key)
ON CONFLICT (event_id, member_id) DO NOTHING;
