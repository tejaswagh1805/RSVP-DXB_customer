import { useState } from "react";
import type { EventItem } from "@/lib/data";
import fallbackImage from "@/assets/hero.jpg";

export function EventImage({ event, className = "", fit = "cover" }: { event: EventItem; className?: string; fit?: "cover" | "contain" }) {
  const [src, setSrc] = useState(event.image);
  const [fallbackTried, setFallbackTried] = useState(false);
  return event.image.startsWith("linear-gradient") ? (
    <div className={`bg-surface-2 ${className}`} style={{ backgroundImage: event.image }} role="img" aria-label={event.title} />
  ) : (
    src ? <img src={src} alt={`Atmosphere for ${event.title}`} loading="lazy" decoding="async" width={1200} height={800} onError={() => {
      const alternate = event.images?.find((image) => image && image !== src);
      if (alternate) setSrc(alternate);
      else if (!fallbackTried && src !== fallbackImage) { setFallbackTried(true); setSrc(fallbackImage); }
      else setSrc("");
    }} className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`} /> : <div className={`flex items-center justify-center bg-surface-2 px-4 text-center text-xs text-muted-foreground ${className}`} role="img" aria-label={`${event.title} image unavailable`}>Image unavailable</div>
  );
}
