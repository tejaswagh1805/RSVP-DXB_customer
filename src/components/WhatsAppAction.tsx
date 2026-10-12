import { MessageCircle } from "lucide-react";
import { Button } from "./ui-kit";
import type { EventItem } from "@/lib/data";

export function WhatsAppAction({ event }: { event: EventItem }) {
  return <Button size="sm" variant="outline" onClick={() => {
    const url = new URL(`/events/${event.id}`, window.location.origin).href;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${event.title} · ${event.venue}\n${url}`)}`, "_blank", "noopener,noreferrer");
  }}><MessageCircle size={15} /> WhatsApp</Button>;
}