ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean NOT NULL DEFAULT false;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at timestamptz;
