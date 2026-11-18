import { MessageCircle } from "lucide-react";
import type { EventItem } from "@/lib/data";

export function WhatsAppAction({ event, purpose }: { event: EventItem; purpose?: string }) {
  const phoneNumber = String(import.meta.env["VITE_RSVP_WHATSAPP_NUMBER"] || "").replace(/\D/g, "");
  const today = new Date().toISOString().slice(0, 10);
  const ticketRequestOpen = event.status === "published" && event.date >= today && (!event.applicationDeadline || event.applicationDeadline >= today);
  if (!ticketRequestOpen) {
    return <span className="inline-flex h-8 items-center px-1 text-xs text-muted-foreground">{event.applicationDeadline && event.applicationDeadline < today ? "Applications closed" : "Event closed"}</span>;
  }
  if (!phoneNumber) {
    return null;
  }

  const requestUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(purpose ? `RSVPDXB ${purpose}: ${event.title}` : `Hi RSVP DXB, I'd like to request a place for ${event.title}.`)}`;
  const label = purpose || "Request ticket on WhatsApp";
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
