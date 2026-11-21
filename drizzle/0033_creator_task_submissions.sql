ALTER TABLE event_rsvp_requests
  ADD COLUMN IF NOT EXISTS task_token_hash text,
  ADD COLUMN IF NOT EXISTS task_status text NOT NULL DEFAULT 'not_required'
    CHECK (task_status IN ('not_required', 'awaiting_submission', 'submitted')),
  ADD COLUMN IF NOT EXISTS task_submission text,
  ADD COLUMN IF NOT EXISTS task_submitted_at timestamptz;

CREATE INDEX IF NOT EXISTS event_rsvp_requests_task_token_idx
  ON event_rsvp_requests (task_token_hash)
  WHERE task_token_hash IS NOT NULL;
