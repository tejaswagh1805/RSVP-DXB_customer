import { MessageCircle } from "lucide-react";
import type { EventItem } from "@/lib/data";

export function WhatsAppAction({ event }: { event: EventItem }) {
  const phoneNumber = import.meta.env.VITE_RSVP_WHATSAPP_NUMBER;
  const ticketRequestOpen = event.status === "published" && event.date >= new Date().toISOString().slice(0, 10);

  if (!ticketRequestOpen) {
    return <span className="inline-flex h-8 items-center px-1 text-xs text-muted-foreground">Ticket requests closed</span>;
  }
  if (!phoneNumber) return null;

  const requestUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(`RSVPDXB event ${event.id}`)}`;
  return (
    <a
      href={requestUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Request a ticket for ${event.title} on WhatsApp`}
      className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3 text-xs font-medium tracking-wide text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle size={15} /> Request ticket
    </a>
  );
}
