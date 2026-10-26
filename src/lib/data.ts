import diningImage from "@/assets/event-dining.jpg";
import fashionImage from "@/assets/event-fashion.jpg";
import nightlifeImage from "@/assets/event-nightlife.jpg";
import propertyImage from "@/assets/event-property.jpg";

export type Track = "Media" | "Creators" | "Tastemakers" | "Private Circle";

export type RsvpState = "none" | "going" | "waitlist" | "pending" | "accepted" | "waitlisted" | "declined";

export interface EventItem {
  id: string;
  title: string;
  brand: string;
  date: string; // ISO date
  endDate?: string;
  time: string;
  endTime?: string;
  gatesOpenTime?: string;
  ticketUrl?: string;
  reservationPhone?: string;
  creatorPassNote?: string;
  ageRestriction?: string;
  hashtag?: string;
  venue: string;
  area: string;
  category: string;
  tracks: Track[];
  trackCapacities?: Partial<Record<Track, number>>;
  influencerDeliverables?: string;
  mapUrl?: string;
  capacity: number;
  confirmed: number;
  dressCode: string;
  about: string;
  included: string[];
  whoIsInvited: string;
  hostNote: string;
  status: "published" | "pending" | "closed";
  image: string;
  images?: string[];
  video?: string;
}

export const profileSlug = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "talent";

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
