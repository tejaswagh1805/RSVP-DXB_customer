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
  const isPast = event.status === "closed" || (event.endDate || event.date) < new Date().toISOString().slice(0, 10);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
      <Link to="/events/$eventId" params={{ eventId: event.id }}>
        <div className="event-card-media relative h-56 overflow-hidden bg-[#211a14] sm:h-64">
          <EventImage event={event} fit="contain" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2">
            <Badge tone="gold">{event.category}</Badge>
            {isPast ? <Badge tone="muted">Past event</Badge> : null}
            {event.tracks.length > 0 && left <= 10 && !full ? <Badge tone="amber">{left} places left</Badge> : null}
            {event.tracks.length > 0 && full ? <Badge tone="red">Full</Badge> : null}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="eyebrow min-h-4">
          {formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}{event.area ? ` · ${event.area}` : ""}
        </p>
        <Link className="mt-2 block min-h-[5.25rem]" to="/events/$eventId" params={{ eventId: event.id }}>
          <h3 className="line-clamp-3 text-xl leading-snug transition-colors group-hover:text-primary">{event.title}</h3>
        </Link>
        <p className="mt-1 min-h-5 truncate text-sm text-muted-foreground">{event.brand || " "}</p>
        <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-foreground">
          {isPast ? event.about.slice(0, 150) : event.applicationDeadline ? `Nominations close ${formatDate(event.applicationDeadline)}` : event.ageRestriction ? event.ageRestriction : event.hashtag || (event.tracks.length ? `Open to ${event.tracks.join(", ")}` : "Event details and booking information")}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex min-h-8 flex-wrap items-center gap-2">
            {isPast ? <Link to="/events/$eventId" params={{ eventId: event.id }}><Button size="sm" variant="primary">View recap</Button></Link> : event.tracks.length && !eligible ? (
              <Button size="sm" variant="outline" disabled>Not on your list</Button>
            ) : event.tracks.length ? (
              <Link to="/events/$eventId" params={{ eventId: event.id }}><Button size="sm" variant="primary">Request RSVP</Button></Link>
            ) : null}
            {!isPast ? <Button size="sm" variant="outline" onClick={() => toggleSave(event.id)}>
              {saved.includes(event.id) ? "Saved" : "Save event"}
            </Button> : null}
          </div>
          {!isPast ? <div className="mt-3 flex min-h-8 flex-wrap items-center gap-2">
            <WhatsAppAction event={event} />
            {event.creatorPassNote && !event.applicationDeadline ? <WhatsAppAction event={event} purpose="Request creator pass" /> : null}
          </div> : null}
        </div>
      </div>
    </article>
  );
}
