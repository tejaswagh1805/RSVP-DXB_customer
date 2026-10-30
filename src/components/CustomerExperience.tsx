import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  X,
  Instagram,
  Youtube,
  Ticket,
  Utensils,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "./ui-kit";
import { EventImage } from "./EventImage";
import { SafeImage } from "./SafeImage";
import { WhatsAppAction } from "./WhatsAppAction";
import { useStore } from "@/lib/store";
import { formatDate, profileSlug, type EventItem } from "@/lib/data";
import type { HomepageMediaItem } from "@/lib/database";
import type { PeopleProfile } from "@/lib/database";
import videoUrl from "@/assets/banner-clip.webm";
const videoAsset = { url: videoUrl };

function consistentGalleryLabel(label: string) {
  const normalized = label.trim().toLocaleLowerCase();
  if (normalized === "event" || normalized === "events") return "Event";
  if (normalized === "today dubai") return "Today Dubai";
  if (normalized === "ha dubai") return "Ha Dubai";
  return label.trim();
}
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
        // Use the visible layout width. window.innerWidth includes the scrollbar,
        // while each scene is sized from the page's content width.
        const viewportWidth = sticky.current.clientWidth;
        const scrollDistance = viewportWidth * (SCENES.length - 1);
        const requiredHeight = sticky.current.offsetHeight + scrollDistance;
        if (Math.abs(section.offsetHeight - requiredHeight) > 1) {
          section.style.height = `${requiredHeight}px`;
        }
        const top = parseFloat(getComputedStyle(sticky.current).top) || 0;
        const range = section.offsetHeight - sticky.current.offsetHeight;
        const progress = Math.max(
          0,
          Math.min(1, (top - section.getBoundingClientRect().top) / Math.max(range, 1)),
        );
        // Five viewport-width scenes need four viewport widths of travel.
        // Move by a percentage of the rail itself so every transition lands on
        // an exact scene boundary, including when a scrollbar changes viewport width.
        rail.current.style.transform = `translate3d(${-progress * (SCENES.length - 1) * 20}%,0,0)`;
        section.style.setProperty("--story-progress", String(progress));
        rail.current.querySelectorAll<HTMLElement>(".showcase-scene").forEach((scene, i) => {
          const distance = Math.min(1, Math.abs(progress * 4 - i));
          // The banner video has a visible rounded edge artifact at its far left.
          // Crop that edge slightly while keeping the still scenes on their usual scale.
          const baseScale = i === 0 ? 1.12 : 1.02;
          scene.style.setProperty("--scene-scale", String(baseScale + distance * 0.12));
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
            >
              {tiles.map((event, i) => (
                <article key={`${copy}-${event.id}-${i}`} className="ribbon-tile">
                  <Link className="ribbon-tile-link" to="/events/$eventId" params={{ eventId: event.id }} aria-label={`View event: ${event.title}`} />
                  <div className="ribbon-tile-content">
                    <div className="ribbon-photo">
                      <EventImage event={event} className="h-full w-full" />
                      <span className="tile-category">{event.category}</span>
                      <ArrowUpRight className="tile-arrow" />
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {formatDate(event.date)} · {event.area}
                    </p>
                    <h3 className="mt-1 text-2xl">{event.title}</h3>
                  </div>
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
  const tiles = Array.from({ length: 12 }, (_, i) => media[i % media.length]).filter(
    (item): item is HomepageMediaItem => Boolean(item),
  );
  return (
    <section className="event-ribbon ribbon-reverse">
      <div className="experience-heading">
        <div>
          <p className="eyebrow">Selected for the spotlight</p>
          <h2>RSVP TOP Pick</h2>
        </div>
        <Link to="/top-picks">
          <Button variant="outline" size="sm">
            Explore the venue guide <ArrowUpRight size={16} />
          </Button>
        </Link>
      </div>
      <div className="ribbon-window">
        <div className="ribbon-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="ribbon-set"
            >
              {tiles.map((item, i) => (
                <article className="ribbon-tile" key={`${copy}-${item.id}-${i}`}>
                  <a
                    className="ribbon-tile-link"
                    href={item.linkUrl || "/top-picks"}
                    target={item.linkUrl ? "_blank" : undefined}
                    rel={item.linkUrl ? "noreferrer" : undefined}
                    aria-label={`Explore: ${item.title}`}
                  />
                  <div className="ribbon-tile-content">
                    <div className="ribbon-photo">
                      {item.mediaType === "video" ? (
                        <video src={item.imageUrl} muted autoPlay loop playsInline preload="metadata" aria-label={item.title} className="h-full w-full object-contain bg-black" />
                      ) : (
                        <SafeImage src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      )}
                      <span className="tile-category">RSVP TOP Pick</span>
                      <ArrowUpRight className="tile-arrow" />
                    </div>
                    <h3 className="mt-3 text-2xl">{item.title}</h3>
                    {item.caption ? (
                      <p className="mt-1 text-sm text-muted-foreground">{item.caption}</p>
                    ) : null}
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

export function EventGallery({ media = [], previewLimit, className = "" }: { media?: HomepageMediaItem[]; previewLimit?: number; className?: string }) {
  const { events } = useStore();
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<EventItem | HomepageMediaItem | null>(null);
  const categories = [
    "All",
    ...new Set(events.filter((e) => e.status === "published").map((e) => e.category)),
  ];
  const gallery = events.filter(
    (e) => e.status === "published" && (category === "All" || e.category === category),
  );
  const visibleMedia = previewLimit ? media.slice(0, previewLimit) : media;
  useEffect(() => {
    if (!selected) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [selected]);
  return (
    <section className={`experience-section ${className}`.trim()}>
      <div className="experience-heading">
        <div>
          <p className="eyebrow">Inside the room</p>
          <h2>Latest events gallery</h2>
        </div>
        {media.length > 0 && previewLimit && media.length > previewLimit ? (
          <Link to="/gallery">
            <Button size="sm" variant="outline">View more <ArrowUpRight size={16} /></Button>
          </Link>
        ) : !media.length ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "primary" : "outline"}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="event-gallery">
        {media.length
          ? visibleMedia.map((item) => (
              <div className="gallery-item" key={item.id}>
                <Button variant="ghost" className="gallery-photo" onClick={() => setSelected(item)}>
                  {item.mediaType === "video" ? (
                    <video src={item.imageUrl} muted playsInline preload="metadata" aria-label={item.title} className="gallery-media gallery-media-video" />
                  ) : (
                    <SafeImage src={item.imageUrl} alt={item.title} className="gallery-media gallery-media-image" />
                  )}
                  <span className="gallery-label">
                    {consistentGalleryLabel(item.title)}
                    <ArrowUpRight size={20} />
                  </span>
                </Button>
              </div>
            ))
          : gallery.map((e) => (
              <div className="gallery-item gallery-event-item" key={e.id}>
                <Button variant="ghost" className="gallery-photo" onClick={() => setSelected(e)}>
                  <EventImage event={e} className="h-full w-full" />
                  <span className="gallery-label">
                    {e.title}
                    <ArrowUpRight size={20} />
                  </span>
                </Button>
              </div>
            ))}
      </div>
      {selected ? (
        <div
          className="gallery-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
        >
          <div className="gallery-dialog-inner" onClick={(e) => e.stopPropagation()}>
            <Button className="gallery-close" onClick={() => setSelected(null)}>
              <X size={20} />
              <span className="sr-only">Close photo</span>
            </Button>
            {"imageUrl" in selected ? (
              selected.mediaType === "video" ? (
                <video src={selected.imageUrl} controls autoPlay playsInline className="max-h-[65vh] w-full object-contain" />
              ) : (
                <SafeImage src={selected.imageUrl} alt={selected.title} loading="eager" className="max-h-[65vh] w-full object-contain" />
              )
            ) : (
              <EventImage event={selected} className="max-h-[65vh] w-full" />
            )}
            <h3 className="mt-4 text-3xl">{consistentGalleryLabel(selected.title)}</h3>
            {"imageUrl" in selected ? (
              selected.caption ? (
                <p className="mt-2 text-muted-foreground">{selected.caption}</p>
              ) : null
            ) : (
              <Link to="/events/$eventId" params={{ eventId: selected.id }}>
                <Button className="mt-4">
                  View event <ArrowUpRight size={18} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : null}
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

export type ArtistCardData = {
  id?: string;
  name: string;
  genre: string;
  subtitle?: string;
  image: string;
  bio?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  xUrl?: string;
};
export const peopleProfileCard = (profile: PeopleProfile): ArtistCardData => ({
  id: profile.id,
  name: profile.name,
  genre: profile.role,
  subtitle: profile.subtitle,
  image: profile.imageUrl,
  bio: profile.bio,
  instagramUrl: profile.instagramUrl,
  tiktokUrl: profile.tiktokUrl,
  youtubeUrl: profile.youtubeUrl,
  xUrl: profile.xUrl,
});
export function ArtistCard({
  artist,
  fullBio = false,
  homeInteractive = false,
}: {
  artist: ArtistCardData;
  fullBio?: boolean;
  homeInteractive?: boolean;
}) {
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
            <SafeImage src={artist.image} alt={artist.name} className="h-full w-full object-cover" />
            {homeInteractive ? (
              <span className="artist-home-hover">
                <span className="artist-home-hover-heading">
                  <span className="artist-home-hover-role">{artist.genre}</span>
                  <span className="artist-home-hover-name">{artist.name}</span>
                  {artist.subtitle ? (
                    <span className="artist-home-hover-subtitle">{artist.subtitle}</span>
                  ) : null}
                </span>
                <span className="artist-home-hover-bio">
                  {artist.bio || `Meet ${artist.name}, part of the RSVP DXB community.`}
                </span>
                <span className="artist-home-hover-action">
                  Explore profile <ArrowUpRight size={16} />
                </span>
              </span>
            ) : null}
          </Link>
        ) : (
          <SafeImage src={artist.image} alt={artist.name} className="h-full w-full object-cover" />
        )}
      </div>
      {!homeInteractive ? (
        <>
          <div className="flex items-start justify-between gap-3 pt-5">
            <div>
              <p className="text-xs text-muted-foreground">{artist.genre}</p>
              {artist.id ? (
                <Link
                  to="/artists/$profileId"
                  params={{ profileId: profileSlug(artist.name) }}
                  className="artist-card-name-link"
                >
                  <h3 className="mt-1 text-3xl">{artist.name}</h3>
                </Link>
              ) : (
                <h3 className="mt-1 text-3xl">{artist.name}</h3>
              )}
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
              <a
                href={artist.tiktokUrl || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={`${artist.name} TikTok`}
                style={{ display: artist.tiktokUrl ? undefined : "none" }}
              >
                ♪
              </a>
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
          {artist.bio ? (
            <p className={`artist-card-bio${fullBio ? " artist-card-bio-full" : ""}`}>
              {artist.bio}
            </p>
          ) : null}
        </>
      ) : null}
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
          <h2>Artists & Influencers</h2>
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
    name: "Food & Drinks",
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
            <Link to={tab === 3 ? "/host" : tab === 0 ? "/tickets" : "/events"}>
              <Button>
                {["View Tickets", "Experience Drinks & Dining", "Exclusive Invitations", "Let’s connect"][tab]}
                <ArrowUpRight size={18} />
              </Button>
            </Link>
            {event && event.date >= new Date().toISOString().slice(0, 10) && (!event.applicationDeadline || event.applicationDeadline >= new Date().toISOString().slice(0, 10)) ? <WhatsAppAction event={event} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
