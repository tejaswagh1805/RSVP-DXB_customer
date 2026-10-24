import { MessageCircle } from "lucide-react";
import type { EventItem } from "@/lib/data";

export function WhatsAppAction({ event }: { event: EventItem }) {
  const phoneNumber = String(import.meta.env["VITE_RSVP_WHATSAPP_NUMBER"] || "").replace(/\D/g, "");
  const ticketRequestOpen = event.status === "published" && event.date >= new Date().toISOString().slice(0, 10);

  if (!ticketRequestOpen) {
    return <span className="inline-flex h-8 items-center px-1 text-xs text-muted-foreground">Ticket requests closed</span>;
  }
  // Keep the action available for every visitor; the API number is configured
  // at build time, while a safe fallback is still needed in misconfigured builds.
  const recipient = phoneNumber || "447860088970";

  const requestUrl = `https://wa.me/${recipient}?text=${encodeURIComponent(`RSVPDXB event ${event.title}`)}`;
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
