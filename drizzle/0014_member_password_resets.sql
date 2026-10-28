CREATE TABLE IF NOT EXISTS member_password_resets (
  token_hash text PRIMARY KEY,
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS member_password_resets_member_id_idx
  ON member_password_resets (member_id);

CREATE INDEX IF NOT EXISTS member_password_resets_expires_at_idx
  ON member_password_resets (expires_at);
