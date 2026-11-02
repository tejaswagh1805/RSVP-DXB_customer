import { Link } from "@tanstack/react-router";
import { ArrowUpRight, TicketCheck } from "lucide-react";
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
  const isPast = event.status === "closed" || Boolean((event.endDate || event.date) && (event.endDate || event.date) < new Date().toISOString().slice(0, 10));

  return (
    <article className="event-listing-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
      <Link className="event-card-whole-link" to="/events/$eventId" params={{ eventId: event.id }} aria-label={`View ${event.title}`} />
      <div className="event-card-media relative h-56 overflow-hidden bg-[#211a14] sm:h-64">
        <EventImage event={event} fit="cover" className="event-card-backdrop" />
        <span className="event-card-media-shade" aria-hidden="true" />
        <EventImage event={event} fit="contain" className="event-card-poster transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className="event-card-badges absolute inset-x-4 top-4 flex flex-wrap gap-2">
          <Badge tone="gold">{event.category}</Badge>
          {isPast ? <Badge tone="muted">Past event</Badge> : null}
          {!isPast && event.tracks.length > 0 && event.capacity > 0 && left <= 10 && !full ? <Badge tone="amber">{left} places left</Badge> : null}
          {!isPast && event.tracks.length > 0 && full ? <Badge tone="red">Full</Badge> : null}
        </div>
      </div>

      <div className="event-listing-content flex flex-1 flex-col p-5 sm:p-6">
        <p className="event-card-date eyebrow">{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}{event.area ? ` · ${event.area}` : ""}</p>
        <h3 className="event-card-title mt-2 block line-clamp-2 text-xl leading-snug transition-colors group-hover:text-primary">{event.title}</h3>
        <p className="event-card-brand mt-2 truncate text-sm text-muted-foreground">{event.brand || event.venue || "RSVP DXB event"}</p>
        <p className="event-card-detail mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {isPast ? event.about.slice(0, 150) : event.applicationDeadline ? `Nominations close ${formatDate(event.applicationDeadline)}` : event.ageRestriction || event.hashtag || (event.tracks.length ? `Open to ${event.tracks.join(", ")}` : event.about)}
        </p>

        <div className="event-card-actions relative z-[2] mt-auto">
          {isPast ? <div className="event-card-action-row"><Link to="/events/$eventId" params={{ eventId: event.id }}><Button size="sm" variant="primary">View recap <ArrowUpRight size={14} /></Button></Link></div> : <>
            <div className="event-card-action-row">
              <Button size="sm" variant="outline" onClick={() => toggleSave(event.id)}>{saved.includes(event.id) ? "Saved" : "Save event"}</Button>
              {event.tracks.length ? eligible
                ? <Link to="/events/$eventId" params={{ eventId: event.id }}><Button size="sm" variant="primary">Request RSVP</Button></Link>
                : <Button size="sm" variant="outline" disabled>Not on your list</Button>
                : <WhatsAppAction event={event} />}
            </div>
            {event.tracks.length ? <div className="event-card-secondary-action"><WhatsAppAction event={event} /></div> : null}
            <a className="event-card-creator-pass" href={`/events/${event.id}#creator-pass-request`}>
              <span className="event-card-creator-icon"><TicketCheck size={17} /></span>
              <span><strong>Request a creator pass</strong><small>Send your details for team review</small></span>
              <ArrowUpRight className="event-card-creator-arrow" size={17} />
            </a>
          </>}
        </div>
      </div>
    </article>
  );
}
