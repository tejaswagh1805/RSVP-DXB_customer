import { Link } from "@tanstack/react-router";
import { formatDate, type EventItem } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Badge, Button } from "./ui-kit";
import { EventImage } from "./EventImage";
import { WhatsAppAction } from "./WhatsAppAction";

export function EventCard({ event }: { event: EventItem }) {
  const { saved, toggleSave, profile } = useStore();
  const full = event.capacity > 0 && event.confirmed >= event.capacity;
  const left = Math.max(event.capacity - event.confirmed, 0);
  const eligible = event.tracks.includes(profile.track);
  const ticketRequestOpen = event.status === "published" && event.date >= new Date().toISOString().slice(0, 10);

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50">
      <Link to="/events/$eventId" params={{ eventId: event.id }}>
        <div className="relative h-48 overflow-hidden">
          <EventImage event={event} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge tone="gold">{event.category}</Badge>
            {event.tracks.length > 0 && left <= 10 && !full ? <Badge tone="amber">{left} places left</Badge> : null}
            {event.tracks.length > 0 && full ? <Badge tone="red">Full</Badge> : null}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">
          {formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}{event.area ? ` · ${event.area}` : ""}
        </p>
        <Link to="/events/$eventId" params={{ eventId: event.id }}>
          <h3 className="mt-2 text-xl leading-snug hover:text-primary">{event.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{event.brand}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {event.ageRestriction ? `${event.ageRestriction} · ` : ""}{event.hashtag || (event.tracks.length ? `Open to ${event.tracks.join(", ")}` : "Event details and booking information")}
        </p>

        <div className="mt-5 flex items-center gap-2">
          {event.tracks.length && !eligible ? (
            <Button size="sm" variant="outline" disabled>
              Not on your list
            </Button>
          ) : event.tracks.length ? (
            <Link to="/events/$eventId" params={{ eventId: event.id }}>
              <Button size="sm" variant="primary">Request RSVP</Button>
            </Link>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => toggleSave(event.id)}>
            {saved.includes(event.id) ? "Saved" : "Save"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">{ticketRequestOpen ? <WhatsAppAction event={event} /> : <span className="text-xs text-muted-foreground">Ticket requests closed</span>}</div>
      </div>
    </article>
  );
}
