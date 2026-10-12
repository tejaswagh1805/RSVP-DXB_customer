import diningImage from "@/assets/event-dining.jpg";
import fashionImage from "@/assets/event-fashion.jpg";
import nightlifeImage from "@/assets/event-nightlife.jpg";
import propertyImage from "@/assets/event-property.jpg";

export type Track = "Media" | "Creators" | "Tastemakers" | "Private Circle";

export type RsvpState = "none" | "going" | "waitlist";

export interface EventItem {
  id: string;
  title: string;
  brand: string;
  date: string; // ISO date
  time: string;
  venue: string;
  area: string;
  category: string;
  tracks: Track[];
  capacity: number;
  confirmed: number;
  dressCode: string;
  about: string;
  included: string[];
  whoIsInvited: string;
  hostNote: string;
  status: "published" | "pending" | "closed";
  image: string;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  track: Track;
  city: string;
  detail: string;
  followers: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
}

export interface Member {
  id: string;
  name: string;
  track: Track;
  rank: "Bronze" | "Silver" | "Gold" | "Diamond" | "Platinum";
  points: number;
  events: number;
  city: string;
}

export interface WallPost {
  id: string;
  brand: string;
  type: "New Event" | "Places Just Opened" | "Tonight" | "Recap" | "Member Offer" | "Sponsored";
  body: string;
  posted: string;
  boosted: boolean;
  status: "live" | "pending";
  eventId?: string;
}

export interface BrandAccount {
  id: string;
  name: string;
  package: string;
  credits: number;
  events: number;
  status: "active" | "trial";
}

export interface Guest {
  id: string;
  name: string;
  track: Track;
  eventId: string;
  plusOnes: number;
  code: string;
  checkedInAt?: string;
}

export const POINT_RULES: { label: string; points: number }[] = [
  { label: "Referral approved", points: 100 },
  { label: "Google review", points: 30 },
  { label: "Reel / video", points: 25 },
  { label: "Complete profile", points: 25 },
  { label: "Check-in", points: 20 },
  { label: "Story screenshot", points: 15 },
  { label: "Social account added", points: 15 },
  { label: "RSVP", points: 10 },
];

export const RANKS = [
  { name: "Bronze", at: 0 },
  { name: "Silver", at: 200 },
  { name: "Gold", at: 500 },
  { name: "Diamond", at: 1000 },
  { name: "Platinum", at: 2500 },
] as const;

export const TRACKS: { name: Track; blurb: string; detail: string }[] = [
  {
    name: "Media",
    blurb: "Journalists & editors",
    detail: "Select your beat, receive relevant invitations, press releases and interview slots.",
  },
  {
    name: "Creators",
    blurb: "Influencers & content creators",
    detail: "Get matched by niche and reach, see the content brief before you attend, earn points.",
  },
  {
    name: "Tastemakers",
    blurb: "Chefs, buyers, stylists, hoteliers",
    detail: "Industry professionals invited to tastings, previews and openings across the city.",
  },
  {
    name: "Private Circle",
    blurb: "By invitation only",
    detail: "A private profile visible only to the RSVP DXB team. No points, no posting, no public lists.",
  },
];

export const EVENTS: EventItem[] = [
  {
    id: "atlantis-chef-table",
    title: "Chef's Table at Ossiano",
    brand: "Atlantis The Royal",
    date: "2026-10-03",
    time: "19:30",
    venue: "Ossiano, Atlantis The Royal",
    area: "Palm Jumeirah",
    category: "Dining",
    tracks: ["Media", "Tastemakers"],
    capacity: 24,
    confirmed: 21,
    dressCode: "Smart elegant",
    about:
      "An eight-course underwater tasting menu hosted by the executive chef, with a short kitchen walkthrough before service.",
    included: ["Eight-course menu", "Wine pairing", "Kitchen tour", "Valet parking"],
    whoIsInvited: "Media and Tastemakers covering food, hospitality and luxury travel.",
    hostNote: "Please arrive 15 minutes early — service starts promptly at 19:45.",
    status: "published",
    image: diningImage,
  },
  {
    id: "jumeirah-spring-launch",
    title: "Spring Collection Launch",
    brand: "Maison Dalia",
    date: "2026-10-04",
    time: "20:00",
    venue: "Alserkal Avenue, Warehouse 42",
    area: "Al Quoz",
    category: "Fashion",
    tracks: ["Creators", "Media"],
    capacity: 120,
    confirmed: 120,
    dressCode: "Creative black tie",
    about:
      "The regional debut of the Spring collection with a live styling studio and a short runway presentation.",
    included: ["Welcome cocktail", "Runway seat", "Gift bag", "Photo studio"],
    whoIsInvited: "Creators with a fashion or lifestyle niche, plus fashion press.",
    hostNote: "Content brief shared on RSVP. One story and one reel requested within 48 hours.",
    status: "published",
    image: fashionImage,
  },
  {
    id: "dubai-hills-preview",
    title: "Private Residence Preview",
    brand: "Vantage Developments",
    date: "2026-10-08",
    time: "18:00",
    venue: "Dubai Hills Estate",
    area: "Dubai Hills",
    category: "Property",
    tracks: ["Private Circle"],
    capacity: 16,
    confirmed: 9,
    dressCode: "Business",
    about:
      "A quiet first look at four penthouse residences ahead of public release, hosted with the design team.",
    included: ["Guided preview", "Canapés & champagne", "Private consultation"],
    whoIsInvited: "Private Circle members only. Personal invitation required.",
    hostNote: "Discretion requested. No photography inside the residences.",
    status: "published",
    image: propertyImage,
  },
  {
    id: "marina-sunset-session",
    title: "Sunset Listening Session",
    brand: "Nuvo Audio",
    date: "2026-10-11",
    time: "17:30",
    venue: "Bluewaters Terrace",
    area: "Bluewaters",
    category: "Music",
    tracks: ["Creators", "Tastemakers"],
    capacity: 80,
    confirmed: 54,
    dressCode: "Relaxed smart",
    about: "A golden-hour listening session on the terrace with a short artist Q&A.",
    included: ["Open bar (2 hours)", "Grazing menu", "Artist Q&A"],
    whoIsInvited: "Creators and Tastemakers in music, nightlife and lifestyle.",
    hostNote: "Plus-one allowed for Gold rank and above.",
    status: "published",
    image: nightlifeImage,
  },
  {
    id: "difc-art-night",
    title: "Collectors Night",
    brand: "Gallery Seventeen",
    date: "2026-10-16",
    time: "19:00",
    venue: "DIFC Gate Village 9",
    area: "DIFC",
    category: "Art",
    tracks: ["Private Circle", "Tastemakers"],
    capacity: 40,
    confirmed: 28,
    dressCode: "Evening",
    about: "A curator-led walkthrough of the autumn show with the artists present.",
    included: ["Curator walkthrough", "Champagne reception", "Catalogue"],
    whoIsInvited: "Collectors, Private Circle and design tastemakers.",
    hostNote: "Works are available for private viewing after the walkthrough.",
    status: "published",
    image: fashionImage,
  },
  {
    id: "beach-club-opening",
    title: "Season Opening Brunch",
    brand: "Sirene Beach Club",
    date: "2026-10-18",
    time: "13:00",
    venue: "Jumeirah Beach Road",
    area: "Jumeirah",
    category: "Nightlife",
    tracks: ["Creators", "Media", "Tastemakers"],
    capacity: 200,
    confirmed: 142,
    dressCode: "Resort chic",
    about: "The season opener with a live set, pool access and a full brunch service.",
    included: ["Brunch package", "Pool access", "Sun bed", "Live set"],
    whoIsInvited: "All public tracks. Limited places per track.",
    hostNote: "Please check in at the member desk, not the main gate.",
    status: "pending",
    image: nightlifeImage,
  },
];

export const APPLICATIONS: Application[] = [
  {
    id: "app-1",
    name: "Layla Haddad",
    email: "layla@thegulfedit.com",
    track: "Media",
    city: "Dubai",
    detail: "Senior editor, The Gulf Edit — food & travel",
    followers: "—",
    submitted: "2026-09-29",
    status: "pending",
  },
  {
    id: "app-2",
    name: "Omar Rashid",
    email: "omar.creates@gmail.com",
    track: "Creators",
    city: "Dubai",
    detail: "Lifestyle & fashion, IG + TikTok",
    followers: "128k",
    submitted: "2026-09-29",
    status: "pending",
  },
  {
    id: "app-3",
    name: "Chef Marco Vitale",
    email: "marco@casavitale.ae",
    track: "Tastemakers",
    city: "Dubai",
    detail: "Executive chef, Casa Vitale",
    followers: "22k",
    submitted: "2026-09-28",
    status: "pending",
  },
  {
    id: "app-4",
    name: "A. Al Suwaidi",
    email: "office@alsuwaidi-group.ae",
    track: "Private Circle",
    city: "Abu Dhabi",
    detail: "Referred by member #0142 — assistant contact on file",
    followers: "Private",
    submitted: "2026-09-27",
    status: "pending",
  },
  {
    id: "app-5",
    name: "Sofia Mendes",
    email: "sofia@luxereport.co",
    track: "Creators",
    city: "Dubai",
    detail: "Beauty creator — YouTube + IG",
    followers: "41k",
    submitted: "2026-09-26",
    status: "pending",
  },
];

export const MEMBERS: Member[] = [
  { id: "m1", name: "Tejas Nair", track: "Creators", rank: "Gold", points: 640, events: 18, city: "Dubai" },
  { id: "m2", name: "Hala Zayed", track: "Media", rank: "Diamond", points: 1180, events: 31, city: "Dubai" },
  { id: "m3", name: "Rami Fawaz", track: "Tastemakers", rank: "Silver", points: 310, events: 9, city: "Sharjah" },
  { id: "m4", name: "Private #0142", track: "Private Circle", rank: "Bronze", points: 0, events: 6, city: "Dubai" },
  { id: "m5", name: "Nadia Khan", track: "Creators", rank: "Platinum", points: 2740, events: 58, city: "Dubai" },
  { id: "m6", name: "Jon Abela", track: "Media", rank: "Silver", points: 220, events: 7, city: "Dubai" },
];

export const WALL_POSTS: WallPost[] = [
  {
    id: "w1",
    brand: "Sirene Beach Club",
    type: "Places Just Opened",
    body: "Six places just opened for Season Opening Brunch this Saturday. First come, first served.",
    posted: "2h ago",
    boosted: true,
    status: "live",
    eventId: "beach-club-opening",
  },
  {
    id: "w2",
    brand: "Maison Dalia",
    type: "New Event",
    body: "Spring Collection Launch — Alserkal Avenue, 4 October. Creators and fashion press only.",
    posted: "5h ago",
    boosted: false,
    status: "live",
    eventId: "jumeirah-spring-launch",
  },
  {
    id: "w3",
    brand: "Nuvo Audio",
    type: "Member Offer",
    body: "20% member discount on the terrace menu all October. Show your digital pass.",
    posted: "Yesterday",
    boosted: false,
    status: "live",
  },
  {
    id: "w4",
    brand: "Atlantis The Royal",
    type: "Recap",
    body: "Thank you to everyone who joined last week's Chef's Table. 41 pieces of content collected.",
    posted: "2 days ago",
    boosted: false,
    status: "live",
  },
  {
    id: "w5",
    brand: "Gallery Seventeen",
    type: "Sponsored",
    body: "Collectors Night at DIFC — a curator-led evening with the artists present.",
    posted: "Pending review",
    boosted: false,
    status: "pending",
    eventId: "difc-art-night",
  },
];

export const BRANDS: BrandAccount[] = [
  { id: "b1", name: "Atlantis The Royal", package: "Signature", credits: 42, events: 11, status: "active" },
  { id: "b2", name: "Maison Dalia", package: "Launch", credits: 8, events: 3, status: "active" },
  { id: "b3", name: "Sirene Beach Club", package: "Season", credits: 26, events: 7, status: "active" },
  { id: "b4", name: "Vantage Developments", package: "Private", credits: 15, events: 2, status: "trial" },
  { id: "b5", name: "Nuvo Audio", package: "Launch", credits: 4, events: 1, status: "active" },
];

export const GUESTS: Guest[] = [
  { id: "g1", name: "Tejas Nair", track: "Creators", eventId: "marina-sunset-session", plusOnes: 1, code: "RSVP-4471" },
  { id: "g2", name: "Hala Zayed", track: "Media", eventId: "marina-sunset-session", plusOnes: 0, code: "RSVP-2208" },
  { id: "g3", name: "Rami Fawaz", track: "Tastemakers", eventId: "marina-sunset-session", plusOnes: 1, code: "RSVP-9014" },
  { id: "g4", name: "Nadia Khan", track: "Creators", eventId: "marina-sunset-session", plusOnes: 2, code: "RSVP-7731" },
  { id: "g5", name: "Jon Abela", track: "Media", eventId: "marina-sunset-session", plusOnes: 0, code: "RSVP-5520" },
];

export const PRESS = [
  { outlet: "Gulf News", title: "How RSVP DXB became the city's quiet gatekeeper", date: "Sep 2026" },
  { outlet: "Esquire Middle East", title: "The invitation economy of Dubai", date: "Aug 2026" },
  { outlet: "Hotelier ME", title: "Inside the guest lists that fill new openings", date: "Jul 2026" },
  { outlet: "Time Out Dubai", title: "The house party service changing private hosting", date: "Jun 2026" },
];

export const PACKAGES = [
  {
    name: "The Guest List",
    from: "AED 6,500",
    detail: "We curate and manage the guest list for your evening.",
    includes: ["Curated guest list", "Invitations & reminders", "RSVP management", "Door check-in"],
  },
  {
    name: "The Full Evening",
    from: "AED 18,000",
    detail: "Guest list plus full production of the evening, end to end.",
    includes: ["Everything in Guest List", "Styling & set-up", "Catering partners", "Photography", "Post-event recap"],
  },
  {
    name: "The Launch at Home",
    from: "AED 32,000",
    detail: "A brand launch hosted in a private residence with media and creators.",
    includes: ["Everything in Full Evening", "Media & creator mix", "Content brief & collection", "Press release", "Full report"],
  },
];

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

export function rankFor(points: number): string {
  let rank = "Bronze";
  for (const r of RANKS) if (points >= r.at) rank = r.name;
  return rank;
}
