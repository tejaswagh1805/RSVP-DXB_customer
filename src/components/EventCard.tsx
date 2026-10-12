import { Link } from "@tanstack/react-router";
import { formatDate, type EventItem } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Badge, Button } from "./ui-kit";
import { EventImage } from "./EventImage";
import { WhatsAppAction } from "./WhatsAppAction";

export function EventCard({ event }: { event: EventItem }) {
  const { rsvps, toggleRsvp, saved, toggleSave, profile } = useStore();
  const state = rsvps[event.id] ?? "none";
  const full = event.confirmed >= event.capacity;
  const left = Math.max(event.capacity - event.confirmed, 0);
  const eligible = event.tracks.includes(profile.track);

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50">
      <Link to="/events/$eventId" params={{ eventId: event.id }}>
        <div className="relative h-48 overflow-hidden">
          <EventImage event={event} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge tone="gold">{event.category}</Badge>
            {left <= 10 && !full ? <Badge tone="amber">{left} places left</Badge> : null}
            {full ? <Badge tone="red">Full</Badge> : null}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">
          {formatDate(event.date)} · {event.time} · {event.area}
        </p>
        <Link to="/events/$eventId" params={{ eventId: event.id }}>
          <h3 className="mt-2 text-xl leading-snug hover:text-primary">{event.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{event.brand}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {event.confirmed}/{event.capacity} confirmed · Open to {event.tracks.join(", ")}
        </p>

        <div className="mt-5 flex items-center gap-2">
          {!eligible ? (
            <Button size="sm" variant="outline" disabled>
              Not on your list
            </Button>
          ) : (
            <Button
              size="sm"
              variant={state === "none" ? "primary" : "outline"}
              onClick={() => toggleRsvp(event.id)}
            >
              {state === "going"
                ? "You are in"
                : state === "waitlist"
                  ? "On waitlist"
                  : full
                    ? "Join waitlist"
                    : "RSVP"}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => toggleSave(event.id)}>
            {saved.includes(event.id) ? "Saved" : "Save"}
          </Button>
        </div>
        <div className="mt-3"><WhatsAppAction event={event} /></div>
      </div>
    </article>
  );
}
