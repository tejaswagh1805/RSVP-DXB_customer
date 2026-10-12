import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  APPLICATIONS,
  BRANDS,
  EVENTS,
  GUESTS,
  MEMBERS,
  WALL_POSTS,
  type Application,
  type BrandAccount,
  type EventItem,
  type Guest,
  type Member,
  type RsvpState,
  type Track,
  type WallPost,
} from "./data";

interface Profile {
  memberId: string | null;
  name: string;
  email: string;
  track: Track;
  points: number;
  signedIn: boolean;
  approved: boolean;
}

interface ScanResult {
  tone: "green" | "amber" | "red";
  title: string;
  detail: string;
}

interface StoreValue {
  events: EventItem[];
  applications: Application[];
  members: Member[];
  wall: WallPost[];
  brands: BrandAccount[];
  guests: Guest[];
  profile: Profile;
  rsvps: Record<string, RsvpState>;
  saved: string[];
  signIn: () => void;
  signOut: () => void;
  hydrateMember: (member: { id: string; name: string; email: string; track: Track; points: number; approved: boolean } | null) => void;
  applyAs: (data: { name: string; email: string; track: Track }) => void;
  toggleRsvp: (eventId: string) => void;
  toggleSave: (eventId: string) => void;
  decideApplication: (id: string, decision: "approved" | "rejected") => void;
  decideEvent: (id: string, decision: "published" | "closed") => void;
  moderatePost: (id: string, action: "approve" | "boost" | "remove") => void;
  addCredits: (brandId: string, amount: number) => void;
  scan: (code: string) => ScanResult;
}

const StoreContext = createContext<StoreValue | null>(null);

const DEFAULT_PROFILE: Profile = {
  memberId: null,
  name: "Tejas Nair",
  email: "tejas@creators.ae",
  track: "Creators",
  points: 640,
  signedIn: false,
  approved: true,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(EVENTS);
  const [applications, setApplications] = useState<Application[]>(APPLICATIONS);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [wall, setWall] = useState<WallPost[]>(WALL_POSTS);
  const [brands, setBrands] = useState<BrandAccount[]>(BRANDS);
  const [guests, setGuests] = useState<Guest[]>(GUESTS);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [rsvps, setRsvps] = useState<Record<string, RsvpState>>({
    "marina-sunset-session": "going",
  });
  const [saved, setSaved] = useState<string[]>(["difc-art-night"]);
  const hydrateMember = useCallback((member: { id: string; name: string; email: string; track: Track; points: number; approved: boolean } | null) => {
    setProfile((p) => member ? {
      ...p,
      memberId: member.id,
      name: member.name,
      email: member.email,
      track: member.track,
      points: member.points,
      approved: member.approved,
      signedIn: true,
    } : { ...p, memberId: null, signedIn: false });
  }, []);

  const value = useMemo<StoreValue>(() => {
    return {
      events,
      applications,
      members,
      wall,
      brands,
      guests,
      profile,
      rsvps,
      saved,
      signIn: () => setProfile((p) => ({ ...p, signedIn: true })),
      signOut: () => setProfile((p) => ({ ...p, memberId: null, signedIn: false })),
      hydrateMember,
      applyAs: ({ name, email, track }) => {
        setProfile((p) => ({ ...p, name, email, track, signedIn: true, approved: false }));
        setApplications((list) => [
          {
            id: `app-${list.length + 1}-new`,
            name,
            email,
            track,
            city: "Dubai",
            detail: "Submitted from the website registration form",
            followers: "—",
            submitted: "Just now",
            status: "pending",
          },
          ...list,
        ]);
      },
      toggleRsvp: (eventId) => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return;
        const current = rsvps[eventId] ?? "none";
        const full = event.confirmed >= event.capacity;
        const next: RsvpState = current === "none" ? (full ? "waitlist" : "going") : "none";
        setRsvps((r) => ({ ...r, [eventId]: next }));
        setEvents((list) =>
          list.map((e) => {
            if (e.id !== eventId) return e;
            if (current === "going") return { ...e, confirmed: e.confirmed - 1 };
            if (next === "going") return { ...e, confirmed: e.confirmed + 1 };
            return e;
          }),
        );
        setProfile((p) => ({ ...p, points: next === "going" ? p.points + 10 : p.points }));
      },
      toggleSave: (eventId) =>
        setSaved((s) => (s.includes(eventId) ? s.filter((i) => i !== eventId) : [...s, eventId])),
      decideApplication: (id, decision) => {
        setApplications((list) =>
          list.map((a) => (a.id === id ? { ...a, status: decision } : a)),
        );
        if (decision === "approved") {
          const app = applications.find((a) => a.id === id);
          if (app) {
            setMembers((list) => [
              {
                id: `m-${app.id}`,
                name: app.name,
                track: app.track,
                rank: "Bronze",
                points: 25,
                events: 0,
                city: app.city,
              },
              ...list,
            ]);
          }
        }
      },
      decideEvent: (id, decision) =>
        setEvents((list) => list.map((e) => (e.id === id ? { ...e, status: decision } : e))),
      moderatePost: (id, action) =>
        setWall((list) =>
          action === "remove"
            ? list.filter((p) => p.id !== id)
            : list.map((p) =>
                p.id === id
                  ? action === "approve"
                    ? { ...p, status: "live", posted: "Just now" }
                    : { ...p, boosted: !p.boosted }
                  : p,
              ),
        ),
      addCredits: (brandId, amount) =>
        setBrands((list) =>
          list.map((b) => (b.id === brandId ? { ...b, credits: b.credits + amount } : b)),
        ),
      scan: (code) => {
        const normalized = code.trim().toUpperCase();
        const guest = guests.find((g) => g.code.toUpperCase() === normalized);
        if (!guest) {
          return { tone: "red", title: "Not on list", detail: `No guest found for ${normalized || "—"}` };
        }
        if (guest.checkedInAt) {
          return {
            tone: "amber",
            title: "Already scanned",
            detail: `${guest.name} checked in at ${guest.checkedInAt}`,
          };
        }
        const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        setGuests((list) =>
          list.map((g) => (g.id === guest.id ? { ...g, checkedInAt: now } : g)),
        );
        return {
          tone: "green",
          title: `Welcome ${guest.name.split(" ")[0]}`,
          detail: `Entry for ${guest.plusOnes + 1} · ${guest.track} · +20 points`,
        };
      },
    };
  }, [events, applications, members, wall, brands, guests, profile, rsvps, saved, hydrateMember]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
