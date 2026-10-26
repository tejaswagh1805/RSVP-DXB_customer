ALTER TABLE events
  ADD COLUMN IF NOT EXISTS application_deadline date,
  ADD COLUMN IF NOT EXISTS action_label text NOT NULL DEFAULT '';

ALTER TABLE events ALTER COLUMN brand SET DEFAULT '';
ALTER TABLE events ALTER COLUMN brand DROP NOT NULL;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_capacity_check;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_capacity_nonnegative;
ALTER TABLE events
  ADD CONSTRAINT events_capacity_nonnegative CHECK (capacity >= 0);

INSERT INTO events (
  id, title, brand, venue, date, time, gates_open_time, area, category,
  tracks, capacity, confirmed, ticket_price, ticket_currency, ticket_url,
  reservation_phone, creator_pass_note, age_restriction, hashtag,
  application_deadline, action_label, about, who_is_invited, status
) VALUES
(
  'client-pataakha-2026', 'PATAAKHA: Pre-Diwali Bash', '', 'Surf Club, West Beach',
  '2026-11-04', '', '', 'Palm Jumeirah', 'Nightlife', '{}', 0, 0, 0, 'AED',
  'https://district.ae/events/pataakha-2026-buy-tickets', '050-8553372',
  'RSVP for limited creator passes.', '21+', '#RoadToPataakha', NULL, 'Buy tickets',
  'PATAAKHA turns Surf Club into one massive firecracker of a night, headlined by AFTERALL live, with G2, Vkram and Rahul Kateja keeping the energy going. Surf Club is allowing desi dress on the beach for the first time. Picture 1,500 people, sand underfoot, sea breeze and bass you feel in your chest.',
  'For ticket reservations and creator-pass requests; age 21+.', 'published'
),
(
  'client-double-trouble-2026', 'Double Trouble: Raunaq Rajani & Gursimran Khamba', '',
  'Emirates Theatre', '2026-11-29', '17:00', '', 'Dubai', 'Comedy', '{}', 0, 0, 0, 'AED',
  'https://dubai.platinumlist.net/event-tickets/109363/double-trouble-ft-gursimran-khamba-and-raunaq-rajani',
  '', 'RSVP for limited creator spots.', '', '', NULL, 'Buy tickets',
  'Two mics, two of India’s sharpest minds in comedy. Raunaq Rajani and Gursimran Khamba bring Double Trouble to Dubai for quick wit, brutally honest observations and jokes for the group chat. Catch them live together on one stage.',
  'Creator spots are limited; request a creator pass through RSVP DXB.', 'published'
),
(
  'client-chai-chandan-2026', 'Chai with Chandan: Chandan Prabhakar', '',
  'Emirates Theatre', '2026-12-19', '', '16:00', 'Dubai', 'Comedy', '{}', 0, 0, 0, 'AED',
  '', '', 'RSVP for limited creator spots.', '', '', NULL, 'Ticket link to add',
  'Chandan Prabhakar brings his signature desi humour to Dubai, with warmth, nostalgia and comedy for the whole family.',
  'Gates open at 4:00 PM. Creator spots are limited; request a creator pass through RSVP DXB.', 'published'
),
(
  'client-kullu-comedy-2026', 'Kullu, Nishant Suri & Kaustubh Aggarwal', '',
  'Emirates Theatre', '2026-12-26', '', '', 'Dubai', 'Comedy', '{}', 0, 0, 0, 'AED',
  '', '', 'RSVP for limited creator spots.', '', '', NULL, 'Ticket link to add',
  'Kullu, Nishant Suri and Kaustubh Aggarwal team up for one night of back-to-back comedy sets and desi energy.',
  'Creator spots are limited; request a creator pass through RSVP DXB.', 'published'
),
(
  'client-global-digital-creator-awards-2027',
  'Global Digital Creator Awards: Asian Film Festival of Dubai',
  'Asian Film Festival of Dubai', '', '2027-02-05', '', '', 'Dubai', 'Awards',
  '{}', 0, 0, 0, 'AED', 'https://www.affdubai.com/awards', '',
  'Post one video in collaboration with @asian.filmfestivalofdubai, then submit the form at affdubai.com/awards. The awards include 20 categories, with winners selected by public vote and jury.',
  '', '', '2026-11-28', 'Get nominated',
  'The Asian Film Festival of Dubai presents the Global Digital Creator Awards, celebrating creators across food, fashion, travel, comedy, lifestyle and more. Nominations close 28 November 2026. Awards night is in Dubai on 5 February 2027.',
  'Open to creators. Nomination requires a collaboration video with @asian.filmfestivalofdubai and the online nomination form.', 'published'
)
ON CONFLICT (id) DO NOTHING;
