import { Ticket } from "lucide-react";
import type { EventItem } from "@/lib/data";

export function WhatsAppAction({ event, purpose }: { event: EventItem; purpose?: string }) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
  const ticketRequestOpen = event.status === "published" && event.date >= today && (!event.applicationDeadline || event.applicationDeadline >= today);
  if (!ticketRequestOpen) {
    return <span className="inline-flex h-8 items-center px-1 text-xs text-muted-foreground">{event.applicationDeadline && event.applicationDeadline < today ? "Applications closed" : "Event closed"}</span>;
  }
  const label = purpose || "Request ticket";
  const ticketUrl = event.ticketUrl?.trim();
  const contactUrl = event.reservationPhone
    ? `https://wa.me/${event.reservationPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi RSVP DXB, I would like to request a ticket for ${event.title}.`)}`
    : "";
  const href = purpose ? event.creatorPassFormUrl : ticketUrl || contactUrl;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} for ${event.title}`}
      className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3 text-xs font-medium tracking-wide text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Ticket size={15} /> {label}
    </a>
  );
}
