ALTER TABLE people_profiles ADD COLUMN IF NOT EXISTS subtitle text NOT NULL DEFAULT '';

UPDATE people_profiles
SET subtitle = btrim(split_part(bio, E'\n', 1)),
    bio = ltrim(regexp_replace(bio, '^[^\n]*\n[[:space:]]*\n?', ''))
WHERE subtitle = ''
  AND position('|' IN split_part(bio, E'\n', 1)) > 0;
