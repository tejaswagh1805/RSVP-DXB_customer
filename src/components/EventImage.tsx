import type { EventItem } from "@/lib/data";

export function EventImage({ event, className = "", fit = "cover" }: { event: EventItem; className?: string; fit?: "cover" | "contain" }) {
  return event.image.startsWith("linear-gradient") ? (
    <div className={`bg-surface-2 ${className}`} style={{ backgroundImage: event.image }} role="img" aria-label={event.title} />
  ) : (
    <img src={event.image} alt={`Atmosphere for ${event.title}`} loading="lazy" width={1200} height={800} className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`} />
  );
}
