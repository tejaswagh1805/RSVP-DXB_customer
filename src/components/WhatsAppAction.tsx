import { MessageCircle } from "lucide-react";
import { Button } from "./ui-kit";
import type { EventItem } from "@/lib/data";

export function WhatsAppAction({ event }: { event: EventItem }) {
  const url = `https://rsvpdxb.com/events/${event.id}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${event.title} · ${event.venue}\n${url}`)}`;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share ${event.title} on WhatsApp`}
      className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3 text-xs font-medium tracking-wide text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle size={15} /> WhatsApp
    </a>
  );
}
