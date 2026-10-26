import { MessageCircle } from "lucide-react";
import type { EventItem } from "@/lib/data";

export function WhatsAppAction({ event, purpose }: { event: EventItem; purpose?: string }) {
  const phoneNumber = String(import.meta.env["VITE_RSVP_WHATSAPP_NUMBER"] || "").replace(/\D/g, "");
  const today = new Date().toISOString().slice(0, 10);
  const ticketRequestOpen = event.status === "published" && event.date >= today && (!event.applicationDeadline || event.applicationDeadline >= today);

  if (!purpose && event.ticketUrl && ticketRequestOpen) {
    return (
      <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-3 text-xs font-medium text-primary-foreground">
        {event.actionLabel || "Buy tickets"}
      </a>
    );
  }
  if (!purpose && !event.ticketUrl && /ticket link (to add|coming soon)/i.test(event.actionLabel || "")) {
    return <span className="inline-flex h-8 items-center px-1 text-xs text-muted-foreground">{event.actionLabel}</span>;
  }
  if (!ticketRequestOpen) {
    return <span className="inline-flex h-8 items-center px-1 text-xs text-muted-foreground">{event.applicationDeadline && event.applicationDeadline < today ? "Applications closed" : "Event closed"}</span>;
  }
  if (!phoneNumber) {
    return <span className="inline-flex h-8 items-center px-1 text-xs text-muted-foreground">Contact RSVP DXB to request</span>;
  }

  const requestUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(`RSVPDXB ${purpose || "event ticket"} ${event.title}`)}`;
  const label = purpose || (event.actionLabel && !/ticket link (to add|coming soon)/i.test(event.actionLabel) ? event.actionLabel : "Request ticket");
  return (
    <a
      href={requestUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} for ${event.title} on WhatsApp`}
      className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3 text-xs font-medium tracking-wide text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle size={15} /> {label}
    </a>
  );
}
