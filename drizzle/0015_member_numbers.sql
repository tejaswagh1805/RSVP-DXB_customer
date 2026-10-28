CREATE SEQUENCE IF NOT EXISTS rsvp_member_number_seq START WITH 4;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS member_number INTEGER;

WITH numbered_members AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) + 3 AS member_number
  FROM members
)
UPDATE members AS member
SET member_number = numbered_members.member_number::INTEGER
FROM numbered_members
WHERE member.id = numbered_members.id
  AND member.member_number IS NULL;

SELECT setval(
  'rsvp_member_number_seq',
  GREATEST(COALESCE((SELECT MAX(member_number) FROM members), 3), 3),
  TRUE
);

ALTER TABLE members
  ALTER COLUMN member_number SET DEFAULT nextval('rsvp_member_number_seq'),
  ALTER COLUMN member_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS members_member_number_uidx
  ON members (member_number);
