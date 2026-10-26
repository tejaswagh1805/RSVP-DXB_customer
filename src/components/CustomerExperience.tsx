import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Instagram,
  Youtube,
  Ticket,
  Utensils,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "./ui-kit";
import { EventImage } from "./EventImage";
import { WhatsAppAction } from "./WhatsAppAction";
import { useStore } from "@/lib/store";
import { formatDate, profileSlug, type EventItem } from "@/lib/data";
import type { HomepageMediaItem } from "@/lib/database";
import type { PeopleProfile } from "@/lib/database";
import videoUrl from "@/assets/banner-clip.webm";
const videoAsset = { url: videoUrl };
import creators from "@/assets/community-creators.jpg";
import mixer from "@/assets/community-mixer.jpg";
import sessions from "@/assets/community-sessions.jpg";
import fashion from "@/assets/event-fashion.jpg";
import dj from "@/assets/artist-dj.jpg";
import musician from "@/assets/artist-musician.jpg";
import creator from "@/assets/artist-creator.jpg";
import influencerLifestyle from "@/assets/influencer-lifestyle.jpg";
import influencerTravel from "@/assets/influencer-travel.jpg";
import influencerBeauty from "@/assets/influencer-beauty.jpg";

const SCENES = [
  { title: "GOOD PEOPLE. GREAT ROOMS.", label: "The RSVP DXB edit", image: sessions },
  { title: "MAKE YOUR NEXT CONNECTION.", label: "People worth knowing", image: mixer },
  { title: "NOT JUST ANOTHER INVITE.", label: "Creators. Culture. Community.", image: creators },
  { title: "FRONT ROW. YOUR WAY.", label: "A different point of view", image: fashion },
  { title: "THIS IS YOUR KIND OF CITY.", label: "Meet us in the room", image: sessions },
];

export function ScrollShowcase() {
  const ref = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = ref.current;
        if (!section || !rail.current || !sticky.current) return;
        const top = parseFloat(getComputedStyle(sticky.current).top) || 0;
        const range = section.offsetHeight - sticky.current.offsetHeight;
        const progress = Math.max(
          0,
          Math.min(1, (top - section.getBoundingClientRect().top) / Math.max(range, 1)),
        );
        // Travel across all scenes, ending with the last one filling the frame.
        const travel = rail.current.scrollWidth - sticky.current.clientWidth;
        rail.current.style.transform = `translate3d(${-progress * travel}px,0,0)`;
        section.style.setProperty("--story-progress", String(progress));
        rail.current.querySelectorAll<HTMLElement>(".showcase-scene").forEach((scene, i) => {
          const distance = Math.min(1, Math.abs(progress * (SCENES.length - 1) - i));
          scene.style.setProperty("--scene-scale", String(1.02 + distance * 0.12));
          scene.style.setProperty("--copy-offset", `${distance * 60}px`);
        });
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.pause();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section ref={ref} className="scroll-showcase" aria-label="RSVP DXB video and photo stories">
      <div ref={sticky} className="showcase-sticky">
        <div ref={rail} className="showcase-rail">
          {SCENES.map((scene, i) => (
            <div key={scene.title} className="showcase-scene">
              {i === 0 ? (
                <video
                  ref={video}
                  src={videoAsset.url}
                  poster={scene.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={scene.image}
                  alt={scene.label}
                  width={1600}
                  height={1000}
                  loading="lazy"
                />
              )}
              <div className="showcase-veil" />
              <div className="showcase-copy">
                <p className="text-xs uppercase">{scene.label}</p>
                {i === 0 ? <h1>{scene.title}</h1> : <h2>{scene.title}</h2>}
                <Link to="/events">
                  <Button size="lg">
                    Explore the list <ArrowUpRight size={20} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EventRibbon({
  title,
  reverse = false,
  events: eventRows,
}: {
  title: string;
  reverse?: boolean;
  events?: EventItem[];
}) {
  const { events: storedEvents } = useStore();
  const events = eventRows?.length ? eventRows : storedEvents;
  const live = events.filter((e) => e.status === "published");
  if (!live.length) return null;
  const tiles = Array.from({ length: 15 }, (_, i) => live[i % live.length]).filter(
    (e): e is EventItem => Boolean(e),
  );
  return (
    <section className={`event-ribbon ${reverse ? "ribbon-reverse" : ""}`}>
      <div className="experience-heading">
        <div>
          <p className="eyebrow">{reverse ? "Selected for the spotlight" : "Fresh on the list"}</p>
          <h2>{title}</h2>
        </div>
        <div className="flex gap-2">
          <Link to="/events">
            <Button variant="outline" size="sm">
              All events <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
      <div className="ribbon-window">
        <div className="ribbon-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="ribbon-set"
              aria-hidden={copy === 1 ? true : undefined}
              inert={copy === 1 ? true : undefined}
            >
              {tiles.map((event, i) => (
                <article key={`${event.id}-${i}`} className="ribbon-tile">
                  <Link to="/events/$eventId" params={{ eventId: event.id }}>
                    <div className="ribbon-photo">
                      <EventImage event={event} className="h-full w-full" />
                      <span className="tile-category">{event.category}</span>
                      <ArrowUpRight className="tile-arrow" />
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {formatDate(event.date)} · {event.area}
                    </p>
                    <h3 className="mt-1 text-2xl">{event.title}</h3>
                  </Link>
                  <div className="mt-3 ribbon-action">
                    <WhatsAppAction event={event} />
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteMediaRibbon({ media }: { media: HomepageMediaItem[] }) {
  if (!media.length) return null;
  const tiles = Array.from({ length: 12 }, (_, i) => media[i % media.length]).filter((item): item is HomepageMediaItem => Boolean(item));
  return <section className="event-ribbon ribbon-reverse"><div className="experience-heading"><div><p className="eyebrow">Selected for the spotlight</p><h2>RSVP TOP Pick</h2></div><Link to="/events"><Button variant="outline" size="sm">Explore events <ArrowUpRight size={16} /></Button></Link></div><div className="ribbon-window"><div className="ribbon-track">{[0, 1].map((copy) => <div key={copy} className="ribbon-set" aria-hidden={copy === 1 ? true : undefined} inert={copy === 1 ? true : undefined}>{tiles.map((item, i) => <article className="ribbon-tile" key={`${copy}-${item.id}-${i}`}><a href={item.linkUrl || "/events"} target={item.linkUrl ? "_blank" : undefined} rel={item.linkUrl ? "noreferrer" : undefined}><div className="ribbon-photo"><img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" /><span className="tile-category">RSVP TOP Pick</span><ArrowUpRight className="tile-arrow" /></div><h3 className="mt-3 text-2xl">{item.title}</h3>{item.caption ? <p className="mt-1 text-sm text-muted-foreground">{item.caption}</p> : null}</a></article>)}</div>)}</div></div></section>;
}

export function EventGallery({ media = [], events: suppliedEvents, fullPage = false }: { media?: HomepageMediaItem[]; events?: EventItem[]; fullPage?: boolean }) {
  const { events: storedEvents } = useStore();
  const events = suppliedEvents ?? storedEvents;
  const [category, setCategory] = useState("All");
  const categories = ["All", "Dining", "Fashion", "Property", "Music", "Art"];
  const gallery = events.filter(
    (e) => e.status === "published" && (category === "All" || e.category === category),
  );
  // Site media has no category field; only classify it when its event is known.
  const filteredMedia = media.filter((item) => category === "All" || events.some((event) =>
    event.category === category && (event.title === item.title || item.linkUrl === `/events/${event.id}`),
  ));
  return (
    <section className="experience-section event-gallery-section">
      <div className="experience-heading event-gallery-heading">
        <div>
          <p className="eyebrow">Inside the room</p>
          {fullPage ? <h1>Event Gallery</h1> : <h2>Latest events gallery</h2>}
        </div>
        <div className="event-gallery-filters" role="group" aria-label="Filter event gallery">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              className={`event-gallery-filter${category === c ? " is-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="event-gallery">
        {media.length ? (fullPage ? filteredMedia : filteredMedia.slice(0, 5)).map((item) => (
          <div className="gallery-item" key={item.id}>
            <div className="gallery-photo rounded-md">
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
              <span className="gallery-label">{item.title}</span>
            </div>
          </div>
        )) : (fullPage ? gallery : gallery.slice(0, 5)).map((e) => (
          <div className="gallery-item" key={e.id}>
            <div className="gallery-photo rounded-md">
              <EventImage event={e} className="h-full w-full" />
              <span className="gallery-label">
                {e.title}
              </span>
            </div>
          </div>
        ))}
      </div>
      {(media.length ? filteredMedia.length === 0 : gallery.length === 0) ? <p className="py-12 text-center text-muted-foreground" role="status">No gallery photos in this category yet.</p> : null}
      {!fullPage ? <div className="event-gallery-more"><Link to="/event-gallery" className="event-gallery-more-link">View more <ArrowUpRight size={18} aria-hidden="true" /></Link></div> : null}
    </section>
  );
}

export const ARTISTS = [
  { name: "The selector", genre: "DJ / Sound & culture", image: dj },
  { name: "The storyteller", genre: "Artist / Live sessions", image: musician },
  { name: "The creator", genre: "Fashion / Digital culture", image: creator },
];

export const INFLUENCERS = [
  { name: "The tastemaker", genre: "Lifestyle / City guides", image: influencerLifestyle },
  { name: "The mover", genre: "Fitness / Travel", image: influencerTravel },
  { name: "The muse", genre: "Beauty / Fashion", image: influencerBeauty },
];

export type ArtistCardData = { id?: string; name: string; genre: string; subtitle?: string; image: string; bio?: string; instagramUrl?: string; tiktokUrl?: string; youtubeUrl?: string; xUrl?: string };
export const peopleProfileCard = (profile: PeopleProfile): ArtistCardData => ({ id: profile.id, name: profile.name, genre: profile.role, subtitle: profile.subtitle, image: profile.imageUrl, bio: profile.bio, instagramUrl: profile.instagramUrl, tiktokUrl: profile.tiktokUrl, youtubeUrl: profile.youtubeUrl, xUrl: profile.xUrl });
export function ArtistCard({ artist, fullBio = false, homeInteractive = false }: { artist: ArtistCardData; fullBio?: boolean; homeInteractive?: boolean }) {
  return (
    <article className="artist-card">
      <div className="artist-photo">
        {artist.id ? (
          <Link
            to="/artists/$profileId"
            params={{ profileId: profileSlug(artist.name) }}
            aria-label={`View ${artist.name}'s profile`}
            className={`artist-photo-link${homeInteractive ? " artist-photo-link-home" : ""}`}
          >
            <img src={artist.image} alt={artist.name} width={768} height={1024} loading="lazy" />
            {homeInteractive ? (
              <span className="artist-home-hover">
                <span className="artist-home-hover-heading">
                  <span className="artist-home-hover-role">{artist.genre}</span>
                  <span className="artist-home-hover-name">{artist.name}</span>
                  {artist.subtitle ? <span className="artist-home-hover-subtitle">{artist.subtitle}</span> : null}
                </span>
                <span className="artist-home-hover-bio">{artist.bio || `Meet ${artist.name}, part of the RSVP DXB community.`}</span>
                <span className="artist-home-hover-action">Explore profile <ArrowUpRight size={16} /></span>
              </span>
            ) : null}
          </Link>
        ) : (
          <img src={artist.image} alt={artist.name} width={768} height={1024} loading="lazy" />
        )}
      </div>
      {!homeInteractive ? <>
      <div className="flex items-start justify-between gap-3 pt-5">
        <div>
          <p className="text-xs text-muted-foreground">{artist.genre}</p>
          {artist.id ? (
            <Link to="/artists/$profileId" params={{ profileId: profileSlug(artist.name) }} className="artist-card-name-link">
              <h3 className="mt-1 text-3xl">{artist.name}</h3>
            </Link>
          ) : <h3 className="mt-1 text-3xl">{artist.name}</h3>}
              {artist.subtitle ? <p className="artist-card-subtitle">{artist.subtitle}</p> : null}
        </div>
        <div className="flex gap-3 pt-2">
          <a
            href={artist.instagramUrl || "#"}
            style={{ display: artist.instagramUrl ? undefined : "none" }}
            target="_blank"
            rel="noreferrer"
            aria-label={`${artist.name} Instagram`}
          >
            <Instagram size={18} />
          </a>
          <a href={artist.tiktokUrl || "#"} target="_blank" rel="noreferrer" aria-label={`${artist.name} TikTok`} style={{ display: artist.tiktokUrl ? undefined : "none" }}>♪</a>
          <a
            href={artist.xUrl || "#"}
            style={{ display: artist.xUrl ? undefined : "none" }}
            target="_blank"
            rel="noreferrer"
            aria-label={`${artist.name} Twitter`}
          >
            𝕏
          </a>
          <a
            href={artist.youtubeUrl || "#"}
            style={{ display: artist.youtubeUrl ? undefined : "none" }}
            target="_blank"
            rel="noreferrer"
            aria-label={`${artist.name} YouTube`}
          >
            <Youtube size={20} />
          </a>
        </div>
      </div>
      {artist.bio ? <p className={`artist-card-bio${fullBio ? " artist-card-bio-full" : ""}`}>{artist.bio}</p> : null}
      </> : null}
    </article>
  );
}
export function ArtistGallery({ profiles = [] }: { profiles?: PeopleProfile[] }) {
  const artists: ArtistCardData[] = profiles.length
    ? profiles.slice(0, 6).map(peopleProfileCard)
    : [...ARTISTS, ...INFLUENCERS];
  return (
    <section className="experience-section">
      <div className="experience-heading">
        <div>
          <p className="eyebrow">The people behind the energy</p>
          <h2>Artist's & Influencers</h2>
        </div>
        <Link to="/artists">
          <Button variant="outline">
            View artists & influencers <ArrowUpRight size={16} />
          </Button>
        </Link>
      </div>
      <div className="artist-grid">
        {artists.map((a) => (
          <ArtistCard key={a.id || a.name} artist={a} homeInteractive />
        ))}
      </div>
    </section>
  );
}

const OFFERS = [
  {
    name: "Tickets & More",
    icon: Ticket,
    title: "Your next great night.",
    body: "Explore the guest list, see what’s included and claim a place in the room.",
    category: "All",
  },
  {
    name: "FOOD N DRINKS",
    icon: Utensils,
    title: "A seat worth taking.",
    body: "Chef-led tables, tasting experiences and a little something unexpected.",
    category: "Dining",
  },
  {
    name: "Exclusive Invite",
    icon: Sparkles,
    title: "Some doors open quietly.",
    body: "Private previews and curated invitations, matched to your member track.",
    category: "Property",
  },
  {
    name: "Corporate connect & networking",
    icon: Users,
    title: "Good connections start here.",
    body: "Bring your brand, your ideas and your people. We’ll bring the room.",
    category: "All",
  },
];
export function TicketOffers() {
  const [tab, setTab] = useState(0);
  const { events } = useStore();
  const offer = OFFERS[tab];
  if (!offer) return null;
  const event = events.find(
    (e) => e.status === "published" && (offer.category === "All" || e.category === offer.category),
  );
  return (
    <section className="offers-section">
      <div className="experience-heading">
        <div>
          <p className="eyebrow">Access looks good on you</p>
          <h2>Tickets & Offers</h2>
        </div>
        <Link to="/tickets">
          <Button className="last-minute-button">
            <Ticket size={18} /> Last minute ticket <ArrowUpRight size={18} />
          </Button>
        </Link>
      </div>
      <div className="offer-tabs" role="tablist" aria-label="Ticket and offer categories">
        {OFFERS.map((o, i) => (
          <Button
            key={o.name}
            variant={tab === i ? "primary" : "outline"}
            onClick={() => setTab(i)}
          >
            <o.icon size={18} />
            {o.name}
          </Button>
        ))}
      </div>
      <div className="offer-body" key={tab}>
        {event ? <EventImage event={event} className="offer-image" /> : null}
        <div>
          <offer.icon className="offer-star" size={48} />
          <h3>{offer.title}</h3>
          <p className="mt-4 max-w-md text-muted-foreground">{offer.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={tab === 3 ? "/host" : "/events"}>
              <Button>
                {tab === 3 ? "Connect with us" : "Explore events"}
                <ArrowUpRight size={18} />
              </Button>
            </Link>
            {event ? <WhatsAppAction event={event} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
