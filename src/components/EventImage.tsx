import type { EventItem } from "@/lib/data";

export function EventImage({ event, className = "" }: { event: EventItem; className?: string }) {
  return event.image.startsWith("linear-gradient") ? (
    <div className={`bg-surface-2 ${className}`} style={{ backgroundImage: event.image }} role="img" aria-label={event.title} />
  ) : (
    <img src={event.image} alt={`Atmosphere for ${event.title}`} loading="lazy" width={1200} height={800} className={`object-cover ${className}`} />
  );
}