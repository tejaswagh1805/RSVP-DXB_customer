import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SitePage, PageHero } from "./SiteLayout";
import { Button } from "./ui-kit";
import { EventCard } from "./EventCard";
import { useStore } from "@/lib/store";
import type { EventItem } from "@/lib/data";
import { ArrowUpRight, Smartphone, MapPin, MessageCircle } from "lucide-react";

const whatsappNumber = String(import.meta.env["VITE_RSVP_WHATSAPP_NUMBER"] || "").replace(/\D/g, "");
const whatsappChatUrl = whatsappNumber
  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi RSVP DXB, I'd love to know more.")}`
  : null;

const FAQ = [
  ["How do I join?", "Register, choose your track and complete your profile. The team normally reviews applications within 48 hours."],
  ["Can I RSVP to every event?", "Events are matched to your member track. Full events offer a waitlist; closed RSVPs cannot accept new responses."],
  ["Where is my entry pass?", "Your pass appears under My Pass in your member area after you RSVP."],
  ["Are these App Store apps?", "No. The current prototype can be added to your phone’s home screen from the browser. It needs an internet connection."],
  ["How do ticket payment and delivery work?", "When paid ticket checkout is enabled for an event, request a ticket through WhatsApp, complete secure checkout, and receive the PDF ticket in the same chat after payment is confirmed."],
];

export function CustomerInfo({ page, ticketEvents }: { page: "contact" | "apps" | "faq" | "tickets"; ticketEvents?: EventItem[] }) {
  const { events } = useStore();
  const [platform, setPlatform] = useState("Android");
  const [sent, setSent] = useState(false);
  const titles = { contact: "Find Us. Talk to us.", apps: "RSVP DXB, on your phone.", faq: "A few good questions.", tickets: "Last minute ticket" };
  const intros = { contact: "Good conversations lead to great rooms.", apps: "Your guest list, wherever the night takes you.", faq: "The details before you step inside.", tickets: "The final places on the list. Your next night starts here." };
  // WhatsApp ticket requests are independent of member RSVP capacity. Keep
  // future published events visible here even when the guest list is full.
  const available = (ticketEvents?.length ? ticketEvents : events).filter(e => e.status === "published" && e.date >= new Date().toISOString().slice(0, 10)).sort((a,b) => a.date.localeCompare(b.date));
  return <SitePage><PageHero eyebrow="RSVP DXB" title={titles[page]} intro={intros[page]} className={page === "tickets" ? "tickets-page-hero" : ""} /><section className={`experience-section${page === "tickets" ? " ticket-events-section" : ""}`}>
    {page === "tickets" ? <><p className="mb-8 text-sm text-muted-foreground">Choose an event and request a ticket through WhatsApp. For paid events with checkout enabled, the PDF ticket is sent after payment is confirmed.</p><div className="grid gap-6 md:grid-cols-3">{available.map(e => <EventCard key={e.id} event={e} />)}</div>{!available.length ? <p>No places open right now. Check the event waitlists.</p> : null}</> : null}
    {page === "faq" ? <div className="faq-list">{FAQ.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div> : null}
    {page === "apps" ? <div className="max-w-2xl"><Smartphone size={48} className="text-primary" /><div className="my-6 flex gap-2">{["Android", "iOS"].map(p => <Button key={p} variant={platform === p ? "primary" : "outline"} onClick={() => setPlatform(p)}>{p}</Button>)}</div><h2 className="text-3xl">Add RSVP DXB to your home screen</h2><ol className="mt-6 list-decimal space-y-4 pl-5 text-muted-foreground"><li>Open this website on your phone in {platform === "Android" ? "Chrome" : "Safari"}.</li><li>{platform === "Android" ? "Tap the three-dot menu, then Add to Home screen (or Install app, if offered)." : "Tap Share, then Add to Home Screen."}</li><li>Confirm Add. Open RSVP DXB from the new home-screen icon.</li></ol><p className="mt-8 text-sm text-muted-foreground">Browser-installed prototype, not an APK or App Store download. Internet required.</p><Link to="/me"><Button className="mt-6">Open member area <ArrowUpRight size={18} /></Button></Link></div> : null}
    {page === "contact" ? <div className="grid gap-12 md:grid-cols-2"><div><MapPin size={40} className="text-primary" /><h2 className="mt-5 text-4xl">Dubai, UAE</h2><p className="mt-4 text-sm text-muted-foreground">RSVP DXB · A Tickbox UAE company</p><a href="https://maps.google.com/?q=Diplomat+One+Building+Umm+Hurair+1+Dubai" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex max-w-lg items-start gap-2 text-sm leading-relaxed underline decoration-primary/50 underline-offset-4 hover:text-primary"><MapPin size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><span>303 Diplomat One Building, AWR Properties, 9th Street, Umm Hurair 1, Dubai, UAE</span><ArrowUpRight size={16} className="mt-0.5 shrink-0" aria-hidden="true" /></a></div><div><MessageCircle size={32} /><h2 className="my-5 text-3xl">Talk to us</h2><p className="max-w-md text-sm text-muted-foreground">Questions about events, tickets or partnerships? Message our team on WhatsApp and we’ll be happy to help.</p>{whatsappChatUrl ? <a href={whatsappChatUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"><MessageCircle size={17} />Chat on WhatsApp <ArrowUpRight size={17} /></a> : <p className="mt-5 text-sm text-muted-foreground">WhatsApp chat details will be available soon.</p>}</div></div> : null}
  </section></SitePage>;
}
