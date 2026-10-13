import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Play, X, Instagram, Youtube, Ticket, Utensils, Sparkles, Users } from "lucide-react";
import { Button } from "./ui-kit";
import { EventImage } from "./EventImage";
import { WhatsAppAction } from "./WhatsAppAction";
import { useStore } from "@/lib/store";
import { formatDate, type EventItem } from "@/lib/data";
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
        const progress = Math.max(0, Math.min(1, (top - section.getBoundingClientRect().top) / Math.max(range, 1)));
        rail.current.style.transform = `translate3d(${-progress * 80}%,0,0)`;
        section.style.setProperty("--story-progress", String(progress));
        rail.current.querySelectorAll<HTMLElement>(".showcase-scene").forEach((scene, i) => {
          const distance = Math.min(1, Math.abs(progress * 4 - i));
          scene.style.setProperty("--scene-scale", String(1.02 + distance * .12));
          scene.style.setProperty("--copy-offset", `${distance * 60}px`);
        });
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.pause();
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); cancelAnimationFrame(frame); };
  }, []);
  return <section ref={ref} className="scroll-showcase" aria-label="RSVP DXB video and photo stories">
    <div ref={sticky} className="showcase-sticky">
      <div ref={rail} className="showcase-rail">
        {SCENES.map((scene, i) => <div key={scene.title} className="showcase-scene">
          {i === 0 ? <video ref={video} src={videoAsset.url} poster={scene.image} autoPlay muted loop playsInline preload="auto" /> : <img src={scene.image} alt={scene.label} width={1600} height={1000} loading="lazy" />}
          <div className="showcase-veil" />
          <div className="showcase-copy"><p className="text-xs uppercase">{scene.label}</p>{i === 0 ? <h1>{scene.title}</h1> : <h2>{scene.title}</h2>}<Link to="/events"><Button size="lg">Explore the list <ArrowUpRight size={20} /></Button></Link></div>
        </div>)}
      </div>
    </div>
  </section>;
}

export function EventRibbon({ title, reverse = false, events: eventRows }: { title: string; reverse?: boolean; events?: EventItem[] }) {
  const { events: storedEvents } = useStore();
  const events = eventRows?.length ? eventRows : storedEvents;
  const live = events.filter(e => e.status === "published");
  if (!live.length) return null;
  const tiles = Array.from({ length: 15 }, (_, i) => live[i % live.length]).filter((e): e is EventItem => Boolean(e));
  return <section className={`event-ribbon ${reverse ? "ribbon-reverse" : ""}`}>
    <div className="experience-heading"><div><p className="eyebrow">{reverse ? "Selected for the spotlight" : "Fresh on the list"}</p><h2>{title}</h2></div><div className="flex gap-2"><Link to="/events"><Button variant="outline" size="sm">All events <ArrowUpRight size={16} /></Button></Link></div></div>
    <div className="ribbon-window"><div className="ribbon-track">{[0, 1].map(copy => <div key={copy} className="ribbon-set" aria-hidden={copy === 1 ? true : undefined} inert={copy === 1 ? true : undefined}>{tiles.map((event, i) => <article key={`${event.id}-${i}`} className="ribbon-tile"><Link to="/events/$eventId" params={{ eventId: event.id }}><div className="ribbon-photo"><EventImage event={event} className="h-full w-full" /><span className="tile-category">{event.category}</span><ArrowUpRight className="tile-arrow" /></div><p className="mt-4 text-xs text-muted-foreground">{formatDate(event.date)} · {event.area}</p><h3 className="mt-1 text-2xl">{event.title}</h3></Link><div className="mt-3 ribbon-action"><WhatsAppAction event={event} /></div></article>)}</div>)}</div></div>
  </section>;
}

export function EventGallery() {
  const { events } = useStore();
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<EventItem | null>(null);
  const categories = ["All", ...new Set(events.filter(e => e.status === "published").map(e => e.category))];
  const gallery = events.filter(e => e.status === "published" && (category === "All" || e.category === category));
  useEffect(() => { if (!selected) return; const listener = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, [selected]);
  return <section className="experience-section"><div className="experience-heading"><div><p className="eyebrow">Inside the room</p><h2>Latest events gallery</h2></div><div className="flex flex-wrap gap-2">{categories.map(c => <Button key={c} size="sm" variant={category === c ? "primary" : "outline"} onClick={() => setCategory(c)}>{c}</Button>)}</div></div><div className="event-gallery">{gallery.map(e => <div className="gallery-item" key={e.id}><Button variant="ghost" className="gallery-photo" onClick={() => setSelected(e)}><EventImage event={e} className="h-full w-full" /><span className="gallery-label">{e.title}<ArrowUpRight size={20} /></span></Button></div>)}</div>
    {selected ? <div className="gallery-dialog" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}><div className="gallery-dialog-inner" onClick={e => e.stopPropagation()}><Button className="gallery-close" onClick={() => setSelected(null)}><X size={20} /><span className="sr-only">Close photo</span></Button><EventImage event={selected} className="max-h-[65vh] w-full" /><h3 className="mt-4 text-3xl">{selected.title}</h3><Link to="/events/$eventId" params={{ eventId: selected.id }}><Button className="mt-4">View event <ArrowUpRight size={18} /></Button></Link></div></div> : null}
  </section>;
}

export const ARTISTS = [{ name: "The selector", genre: "DJ / Sound & culture", image: dj }, { name: "The storyteller", genre: "Artist / Live sessions", image: musician }, { name: "The creator", genre: "Fashion / Digital culture", image: creator }];

export const INFLUENCERS = [{ name: "The tastemaker", genre: "Lifestyle / City guides", image: influencerLifestyle }, { name: "The mover", genre: "Fitness / Travel", image: influencerTravel }, { name: "The muse", genre: "Beauty / Fashion", image: influencerBeauty }];

export function ArtistCard({ artist }: { artist: typeof ARTISTS[number] }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [error, setError] = useState("");
  const embed = () => {
    try { const parsed = new URL(url); const id = parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : ["www.youtube.com", "youtube.com", "m.youtube.com"].includes(parsed.hostname) ? parsed.searchParams.get("v") ?? parsed.pathname.split("/").pop() : "";
      if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error(); setVideoId(id); setError("");
    } catch { setError("Enter a valid YouTube video link."); }
  };
  return <article className="artist-card"><div className="artist-photo"><img src={artist.image} alt={artist.name} width={768} height={1024} loading="lazy" />{videoId ? <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={`${artist.name} video`} allow="fullscreen; picture-in-picture" allowFullScreen /> : null}<Button className="artist-play" size="sm" onClick={() => { setOpen(!open); if (videoId) setVideoId(""); }}><Play size={16} /> {videoId ? "Change video" : "Video spotlight"}</Button></div><div className="flex items-start justify-between gap-3 pt-5"><div><p className="text-xs text-muted-foreground">{artist.genre}</p><h3 className="mt-1 text-3xl">{artist.name}</h3></div><div className="flex gap-3 pt-2"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label={`${artist.name} Instagram`}><Instagram size={18} /></a><a href="https://x.com/" target="_blank" rel="noreferrer" aria-label={`${artist.name} Twitter`}>𝕏</a><a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label={`${artist.name} YouTube`}><Youtube size={20} /></a></div></div>{open ? <div className="mt-4 flex flex-wrap gap-2"><input aria-label={`${artist.name} YouTube video link`} className="min-w-0 flex-1 border border-input bg-surface px-3 py-2 text-sm" placeholder="Paste YouTube video link" value={url} onChange={e => setUrl(e.target.value)} /><Button size="sm" onClick={embed}>Embed video</Button>{error ? <p role="alert" className="w-full text-xs text-destructive">{error}</p> : null}</div> : null}</article>;
}
export function ArtistGallery() { return <section className="experience-section"><div className="experience-heading"><div><p className="eyebrow">The people behind the energy</p><h2>Artist's & Influencers</h2></div><Link to="/artists"><Button variant="outline">View artists & influencers <ArrowUpRight size={16} /></Button></Link></div><div className="artist-grid">{ARTISTS.map(a => <ArtistCard key={a.name} artist={a} />)}</div></section>; }

const OFFERS = [
  { name: "Tickets & More", icon: Ticket, title: "Your next great night.", body: "Explore the guest list, see what’s included and claim a place in the room.", category: "All" },
  { name: "FOOD N DRINKS", icon: Utensils, title: "A seat worth taking.", body: "Chef-led tables, tasting experiences and a little something unexpected.", category: "Dining" },
  { name: "Exclusive Invite", icon: Sparkles, title: "Some doors open quietly.", body: "Private previews and curated invitations, matched to your member track.", category: "Property" },
  { name: "Corporate connect & networking", icon: Users, title: "Good connections start here.", body: "Bring your brand, your ideas and your people. We’ll bring the room.", category: "All" },
];
export function TicketOffers() {
  const [tab, setTab] = useState(0);
  const { events } = useStore();
  const offer = OFFERS[tab];
  if (!offer) return null;
  const event = events.find(e => e.status === "published" && (offer.category === "All" || e.category === offer.category));
  return <section className="offers-section"><div className="experience-heading"><div><p className="eyebrow">Access looks good on you</p><h2>Tickets & Offers</h2></div><Link to="/tickets"><Button className="last-minute-button"><Ticket size={18} /> Last minute ticket <ArrowUpRight size={18} /></Button></Link></div><div className="offer-tabs" role="tablist" aria-label="Ticket and offer categories">{OFFERS.map((o, i) => <Button key={o.name} variant={tab === i ? "primary" : "outline"} onClick={() => setTab(i)}><o.icon size={18} />{o.name}</Button>)}</div><div className="offer-body" key={tab}>{event ? <EventImage event={event} className="offer-image" /> : null}<div><offer.icon className="offer-star" size={48} /><h3>{offer.title}</h3><p className="mt-4 max-w-md text-muted-foreground">{offer.body}</p><div className="mt-6 flex flex-wrap gap-3"><Link to={tab === 3 ? "/host" : "/events"}><Button>{tab === 3 ? "Connect with us" : "Explore events"}<ArrowUpRight size={18} /></Button></Link>{event ? <WhatsAppAction event={event} /> : null}</div></div></div></section>;
}
