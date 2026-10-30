ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- Addresses collected before explicit marketing consent was added must opt in again.
UPDATE newsletter_subscribers
SET active = FALSE
WHERE consented_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_unsubscribe_token_idx
  ON newsletter_subscribers(unsubscribe_token)
  WHERE unsubscribe_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sending', 'sent', 'partial', 'failed')),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS newsletter_campaign_deliveries (
  campaign_id TEXT NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'failed')),
  error TEXT NOT NULL DEFAULT '',
  sent_at TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS newsletter_campaigns_created_idx
  ON newsletter_campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS newsletter_campaign_deliveries_queue_idx
  ON newsletter_campaign_deliveries(campaign_id, status);
