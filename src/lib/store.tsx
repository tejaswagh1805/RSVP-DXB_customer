import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { EVENTS, WALL_POSTS, type EventItem, type RsvpState, type Track, type WallPost } from "./data";

interface Profile {
  memberId: string | null;
  name: string;
  email: string;
  track: Track;
  points: number;
  signedIn: boolean;
  approved: boolean;
}

interface StoreValue {
  events: EventItem[];
  wall: WallPost[];
  profile: Profile;
  rsvps: Record<string, RsvpState>;
  saved: string[];
  signIn: () => void;
  signOut: () => void;
  hydrateMember: (member: { id: string; name: string; email: string; track: Track; points: number; approved: boolean } | null) => void;
  toggleRsvp: (eventId: string) => void;
  toggleSave: (eventId: string) => void;
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
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [rsvps, setRsvps] = useState<Record<string, RsvpState>>({
    "marina-sunset-session": "going",
  });
  const [saved, setSaved] = useState<string[]>(["difc-art-night"]);

  const hydrateMember = useCallback((member: { id: string; name: string; email: string; track: Track; points: number; approved: boolean } | null) => {
    setProfile((profile) => member ? {
      ...profile,
      memberId: member.id,
      name: member.name,
      email: member.email,
      track: member.track,
      points: member.points,
      approved: member.approved,
      signedIn: true,
    } : { ...profile, memberId: null, signedIn: false });
  }, []);

  const value = useMemo<StoreValue>(() => ({
    events,
    wall: WALL_POSTS,
    profile,
    rsvps,
    saved,
    signIn: () => setProfile((current) => ({ ...current, signedIn: true })),
    signOut: () => setProfile((current) => ({ ...current, memberId: null, signedIn: false })),
    hydrateMember,
    toggleRsvp: (eventId) => {
      const event = events.find((item) => item.id === eventId);
      if (!event) return;
      const current = rsvps[eventId] ?? "none";
      const full = event.confirmed >= event.capacity;
      const next: RsvpState = current === "none" ? (full ? "waitlist" : "going") : "none";
      setRsvps((items) => ({ ...items, [eventId]: next }));
      setEvents((items) => items.map((item) => {
        if (item.id !== eventId) return item;
        if (current === "going") return { ...item, confirmed: item.confirmed - 1 };
        if (next === "going") return { ...item, confirmed: item.confirmed + 1 };
        return item;
      }));
      setProfile((currentProfile) => ({ ...currentProfile, points: next === "going" ? currentProfile.points + 10 : currentProfile.points }));
    },
    toggleSave: (eventId) => setSaved((items) => items.includes(eventId) ? items.filter((id) => id !== eventId) : [...items, eventId]),
  }), [events, profile, rsvps, saved, hydrateMember]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
