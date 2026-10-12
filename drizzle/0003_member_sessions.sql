CREATE TABLE IF NOT EXISTS member_sessions (
  token_hash text PRIMARY KEY,
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS member_sessions_member_id_idx ON member_sessions (member_id);
