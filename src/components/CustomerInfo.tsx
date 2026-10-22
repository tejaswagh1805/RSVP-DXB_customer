import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SitePage, PageHero } from "./SiteLayout";
import { Button } from "./ui-kit";
import { EventCard } from "./EventCard";
import { useStore } from "@/lib/store";
import type { EventItem } from "@/lib/data";
import { ArrowUpRight, Smartphone, MapPin, MessageCircle } from "lucide-react";

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
  return <SitePage><PageHero eyebrow="RSVP DXB" title={titles[page]} intro={intros[page]} /><section className="experience-section">
    {page === "tickets" ? <><p className="mb-6 text-sm text-muted-foreground">Choose an event and request a ticket through WhatsApp. For paid events with checkout enabled, the PDF ticket is sent after payment is confirmed.</p><div className="grid gap-6 md:grid-cols-3">{available.map(e => <EventCard key={e.id} event={e} />)}</div>{!available.length ? <p>No places open right now. Check the event waitlists.</p> : null}</> : null}
    {page === "faq" ? <div className="faq-list">{FAQ.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div> : null}
    {page === "apps" ? <div className="max-w-2xl"><Smartphone size={48} className="text-primary" /><div className="my-6 flex gap-2">{["Android", "iOS"].map(p => <Button key={p} variant={platform === p ? "primary" : "outline"} onClick={() => setPlatform(p)}>{p}</Button>)}</div><h2 className="text-3xl">Add RSVP DXB to your home screen</h2><ol className="mt-6 list-decimal space-y-4 pl-5 text-muted-foreground"><li>Open this website on your phone in {platform === "Android" ? "Chrome" : "Safari"}.</li><li>{platform === "Android" ? "Tap the three-dot menu, then Add to Home screen (or Install app, if offered)." : "Tap Share, then Add to Home Screen."}</li><li>Confirm Add. Open RSVP DXB from the new home-screen icon.</li></ol><p className="mt-8 text-sm text-muted-foreground">Browser-installed prototype, not an APK or App Store download. Internet required.</p><Link to="/me"><Button className="mt-6">Open member area <ArrowUpRight size={18} /></Button></Link></div> : null}
    {page === "contact" ? <div className="grid gap-12 md:grid-cols-2"><div><MapPin size={40} className="text-primary" /><h2 className="mt-5 text-4xl">Dubai, UAE</h2><p className="mt-4 text-sm text-muted-foreground">RSVP DXB · A Tickbox UAE company</p><a href="https://www.google.com/maps/search/Dubai+UAE" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 underline">Explore Dubai <ArrowUpRight size={18} /></a><p className="mt-8 text-xs text-muted-foreground">Office address and team contact details to be confirmed.</p></div><form onSubmit={e => { e.preventDefault(); setSent(true); }}><MessageCircle size={32} /><h2 className="my-5 text-3xl">Talk to us</h2><label className="block text-sm">Your name<input required className="contact-input" /></label><label className="mt-4 block text-sm">Email<input required type="email" className="contact-input" /></label><label className="mt-4 block text-sm">What’s on your mind?<textarea required className="contact-input" rows={4} /></label><Button type="submit" className="mt-5">Send enquiry <ArrowUpRight size={18} /></Button>{sent ? <p role="status" className="mt-4 text-sm text-muted-foreground">Demo enquiry received on this screen. No message has been sent to the team.</p> : null}</form></div> : null}
  </section></SitePage>;
}
