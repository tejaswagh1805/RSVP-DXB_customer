CREATE TABLE IF NOT EXISTS applications (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  track text NOT NULL,
  city text NOT NULL DEFAULT 'Dubai',
  detail text NOT NULL DEFAULT '',
  followers text NOT NULL DEFAULT '—',
  submitted date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT 'Dubai';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS detail text NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS followers text NOT NULL DEFAULT '—';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitted date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS applications_status_created_idx ON applications (status, created_at DESC);
