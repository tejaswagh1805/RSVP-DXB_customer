ALTER TABLE public_enquiries DROP CONSTRAINT IF EXISTS public_enquiries_kind_check;
ALTER TABLE public_enquiries ADD CONSTRAINT public_enquiries_kind_check
  CHECK (kind IN ('host', 'press', 'press_asset', 'content'));
