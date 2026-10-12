import { neon } from "@neondatabase/serverless";

process.loadEnvFile?.();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Add DATABASE_URL=... to the project .env file.");
}

const sql = neon(databaseUrl);
const events = [
  {
    id: "atlantis-chef-table", title: "Chef's Table at Ossiano", brand: "Atlantis The Royal",
    date: "2026-10-03", time: "19:30", venue: "Ossiano, Atlantis The Royal", area: "Palm Jumeirah",
    category: "Dining", tracks: ["Media", "Tastemakers"], capacity: 24, confirmed: 21,
    dressCode: "Smart elegant", about: "An eight-course underwater tasting menu hosted by the executive chef, with a short kitchen walkthrough before service.",
    included: ["Eight-course menu", "Wine pairing", "Kitchen tour", "Valet parking"],
    whoIsInvited: "Media and Tastemakers covering food, hospitality and luxury travel.",
    hostNote: "Please arrive 15 minutes early — service starts promptly at 19:45.", status: "published",
  },
  {
    id: "jumeirah-spring-launch", title: "Spring Collection Launch", brand: "Maison Dalia",
    date: "2026-10-04", time: "20:00", venue: "Alserkal Avenue, Warehouse 42", area: "Al Quoz",
    category: "Fashion", tracks: ["Creators", "Media"], capacity: 120, confirmed: 120,
    dressCode: "Creative black tie", about: "The regional debut of the Spring collection with a live styling studio and a short runway presentation.",
    included: ["Welcome cocktail", "Runway seat", "Gift bag", "Photo studio"],
    whoIsInvited: "Creators with a fashion or lifestyle niche, plus fashion press.",
    hostNote: "Content brief shared on RSVP. One story and one reel requested within 48 hours.", status: "published",
  },
  {
    id: "dubai-hills-preview", title: "Private Residence Preview", brand: "Vantage Developments",
    date: "2026-10-08", time: "18:00", venue: "Dubai Hills Estate", area: "Dubai Hills",
    category: "Property", tracks: ["Private Circle"], capacity: 16, confirmed: 9,
    dressCode: "Business", about: "A quiet first look at four penthouse residences ahead of public release, hosted with the design team.",
    included: ["Guided preview", "Canapés & champagne", "Private consultation"],
    whoIsInvited: "Private Circle members only. Personal invitation required.",
    hostNote: "Discretion requested. No photography inside the residences.", status: "published",
  },
  {
    id: "marina-sunset-session", title: "Sunset Listening Session", brand: "Nuvo Audio",
    date: "2026-10-11", time: "17:30", venue: "Bluewaters Terrace", area: "Bluewaters",
    category: "Music", tracks: ["Creators", "Tastemakers"], capacity: 80, confirmed: 54,
    dressCode: "Relaxed smart", about: "A golden-hour listening session on the terrace with a short artist Q&A.",
    included: ["Open bar (2 hours)", "Grazing menu", "Artist Q&A"],
    whoIsInvited: "Creators and Tastemakers in music, nightlife and lifestyle.",
    hostNote: "Plus-one allowed for Gold rank and above.", status: "published",
  },
  {
    id: "difc-art-night", title: "Collectors Night", brand: "Gallery Seventeen",
    date: "2026-10-16", time: "19:00", venue: "DIFC Gate Village 9", area: "DIFC",
    category: "Art", tracks: ["Private Circle", "Tastemakers"], capacity: 40, confirmed: 28,
    dressCode: "Evening", about: "A curator-led walkthrough of the autumn show with the artists present.",
    included: ["Curator walkthrough", "Champagne reception", "Catalogue"],
    whoIsInvited: "Collectors, Private Circle and design tastemakers.",
    hostNote: "Works are available for private viewing after the walkthrough.", status: "published",
  },
  {
    id: "beach-club-opening", title: "Season Opening Brunch", brand: "Sirene Beach Club",
    date: "2026-10-18", time: "13:00", venue: "Jumeirah Beach Road", area: "Jumeirah",
    category: "Nightlife", tracks: ["Creators", "Media", "Tastemakers"], capacity: 200, confirmed: 142,
    dressCode: "Resort chic", about: "The season opener with a live set, pool access and a full brunch service.",
    included: ["Brunch package", "Pool access", "Sun bed", "Live set"],
    whoIsInvited: "All public tracks. Limited places per track.",
    hostNote: "Please check in at the member desk, not the main gate.", status: "pending",
  },
];

for (const event of events) {
  await sql`
    INSERT INTO events (
      id, title, brand, date, time, venue, area, category, tracks, capacity,
      confirmed, dress_code, about, included, who_is_invited, host_note, status, image_key
    ) VALUES (
      ${event.id}, ${event.title}, ${event.brand}, ${event.date}, ${event.time},
      ${event.venue}, ${event.area}, ${event.category}, ${event.tracks}, ${event.capacity},
      ${event.confirmed}, ${event.dressCode}, ${event.about}, ${event.included},
      ${event.whoIsInvited}, ${event.hostNote}, ${event.status}, ${event.id}
    ) ON CONFLICT (id) DO NOTHING
  `;
}
console.info(`Seeded ${events.length} demo events (existing event IDs were preserved).`);
