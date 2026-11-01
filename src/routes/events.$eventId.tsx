import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SitePage } from "@/components/SiteLayout";
import { EventImage } from "@/components/EventImage";
import { Badge, Button, Card } from "@/components/ui-kit";
import { formatDate, internationalPhoneHref } from "@/lib/data";
import { useStore } from "@/lib/store";
import { WhatsAppAction } from "@/components/WhatsAppAction";
import { creatorPassFormUrl } from "@/lib/creator-pass-form";
import { getEventById, getMemberRsvps, submitEventRsvpRequest } from "@/lib/database";

export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }) => {
    const [event, rsvps] = await Promise.all([
      getEventById({ data: params.eventId }),
      getMemberRsvps(),
    ]);
    return { event, rsvps };
  },
  head: ({ loaderData }) => {
    const event = loaderData?.event;
    const title = event ? `${event.title} \u2014 RSVP DXB` : 'Event \u2014 RSVP DXB';
    const description = event
      ? [formatDate(event.date), event.venue, event.area, event.about].filter(Boolean).join('. ').slice(0, 300)
      : 'Event details, dress code and RSVP for RSVP DXB members.';
    const image = event?.image
      ? new URL(event.image, 'https://www.rsvpdxb.com').toString()
      : 'https://www.rsvpdxb.com/icon-512.png';
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: image },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: image },
      ],
      links: event ? [{ rel: 'canonical', href: `https://www.rsvpdxb.com/events/${encodeURIComponent(event.id)}` }] : [],
    };
  },
  component: EventDetail,
});

function EventDetail() {
  const { eventId } = Route.useParams();
  const { events: demoEvents, rsvps: demoRsvps, saved, toggleSave, profile } = useStore();
  const data = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const submitRequest = useServerFn(submitEventRsvpRequest);
  const [databaseRsvps, setDatabaseRsvps] = useState(data.rsvps);
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [deliverablesAgreed, setDeliverablesAgreed] = useState(false);
  const event = data.event ?? demoEvents.find((e) => e.id === eventId);

  if (!event) {
    return (
      <SitePage>
        <div className="mx-auto max-w-6xl px-5 py-32 text-center">
          <h1 className="text-3xl">Event not found</h1>
          <Link to="/events" className="mt-6 inline-block text-primary">
            Back to events
          </Link>
        </div>
      </SitePage>
    );
  }

  const isPastEvent = event.status === "closed" || Boolean((event.endDate || event.date) && (event.endDate || event.date) < new Date().toISOString().slice(0, 10));
  const state = data.event ? (databaseRsvps[event.id] ?? "none") : (demoRsvps[event.id] ?? "none");
  const hasMemberRsvp = event.tracks.length > 0;
  const eligible = hasMemberRsvp && event.tracks.includes(profile.track);
  const closed = event.status === "closed";
  const spotsLeft = Math.max(event.capacity - event.confirmed, 0);
  const limitedSpots = event.capacity > 0 && event.confirmed / event.capacity >= 0.8;
  const hasRequest = state !== "none" && state !== "declined";
  const statusLabel: Record<string, string> = {
    pending: "Pending review",
    accepted: "You're on the list",
    waitlisted: "Waitlisted",
    declined: "Not selected",
    going: "Confirmed",
    waitlist: "Waitlisted",
  };
  const creatorDeliverables = hasMemberRsvp && profile.track === "Creators" ? event.influencerDeliverables?.trim() ?? "" : "";
  const shareEvent = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: `Join me at ${event.title}`, url });
      else { await navigator.clipboard.writeText(url); setShareMessage("Event link copied."); }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try { await navigator.clipboard.writeText(url); setShareMessage("Event link copied."); }
      catch { setShareMessage("Copy this event link from your browser address bar."); }
    }
  };
  const submitRsvp = async () => {
    if (!profile.signedIn) {
      void navigate({ to: "/signin" });
      return;
    }
    if (!data.event) {
      setRsvpError("This preview event is not connected to an RSVP record yet.");
      return;
    }
    setRsvpError("");
    setRsvpMessage("");
    setRsvpBusy(true);
    try {
      const result = await submitRequest({ data: {
        eventId: event.id,
        track: profile.track,
        guestNames,
        deliverablesAgreed,
      } });
      setDatabaseRsvps((previous) => ({ ...previous, [event.id]: result.status }));
      setRsvpMessage(result.emailSent ? "Your request is in. We sent you a confirmation email." : "Your request is in. Our team will email you after review.");
      void router.invalidate();
    } catch (error) {
      setRsvpError(error instanceof Error ? error.message : "RSVP request could not be submitted.");
    } finally {
      setRsvpBusy(false);
    }
  };

  return (
    <SitePage>
      <section className="event-detail-hero" aria-label={`${event.title} event image`}>
        <EventImage event={event} className="event-detail-hero-image" />
        <div className="event-detail-hero-shade" />
        <div className="event-detail-hero-content">
          {event.brand ? <p className="event-detail-brand">{event.brand}</p> : <p className="event-detail-brand">RSVP DXB · THE GUEST LIST</p>}
          <h1>{event.title}</h1>
          <p>{formatDate(event.date)}{event.venue ? ` · ${event.venue}` : ""}{event.area ? `, ${event.area}` : ""}</p>
          {event.category ? <Badge tone="gold">{event.category}</Badge> : null}
          {isPastEvent ? <Badge tone="muted">Past event</Badge> : null}
        </div>
        <span className="event-detail-hero-orbit" aria-hidden="true" />
      </section>
      <div className="event-detail-layout">
        <main className="event-detail-main">
          <div className="event-detail-heading">
            {event.brand ? <p className="eyebrow">{event.brand}</p> : null}
            <h2>{event.title}</h2>
            <button type="button" className="mt-2 text-sm text-primary underline" onClick={() => void shareEvent()}>Share event</button>
            {shareMessage ? <span className="ml-3 text-xs text-muted-foreground" role="status">{shareMessage}</span> : null}
            <p className="event-detail-datetime">
            {formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}
            {event.time ? ` · ${event.time}${event.endTime ? `–${event.endTime}` : ""}` : ""}
            {event.venue ? ` · ${event.venue}` : ""}{event.area ? `, ${event.area}` : ""}
            {event.gatesOpenTime ? ` · Gates open ${event.gatesOpenTime}` : ""}
            {event.applicationDeadline ? ` · Nominations close ${formatDate(event.applicationDeadline)}` : ""}
            </p>
            {!isPastEvent && event.date ? <a className="mt-3 inline-flex text-sm text-primary underline" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">Add to calendar</a> : null}
          </div>

          <div className="event-detail-sections">
            {event.about ? <Block title="About this event">{event.about}</Block> : null}
            {event.included.length ? <div>
              <p className="eyebrow">{isPastEvent ? "Event highlights" : "What is included"}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {event.included.map((i) => (
                  <li key={i} className="rounded-md bg-surface px-4 py-2.5 text-sm">
                    {i}
                  </li>
                ))}
              </ul>
            </div> : null}
            {event.dressCode ? <Block title="Dress code">{event.dressCode}</Block> : null}
            {event.whoIsInvited ? <Block title="Who is invited">{event.whoIsInvited}</Block> : null}
            {event.creatorPassNote ? <Block title="Creator passes / nominations">{event.creatorPassNote}</Block> : null}
            {event.ageRestriction ? <Block title="Age restriction">{event.ageRestriction}</Block> : null}
            {event.reservationPhone ? <Block title="Reservations"><a className="text-primary underline" href={`tel:${internationalPhoneHref(event.reservationPhone)}`}>{event.reservationPhone}</a></Block> : null}
            {event.hashtag ? <Block title="Event hashtag">{event.hashtag}</Block> : null}
            {event.venue || event.mapUrl ? <div>
              <Block title="Location">{event.venue}{event.area ? `, ${event.area}` : ""}{event.mapUrl ? <> <a className="text-primary underline" href={event.mapUrl} target="_blank" rel="noreferrer">Open map and directions</a></> : null}</Block>
              {event.venue ? <iframe className="mt-4 h-64 w-full rounded-lg border border-border" title={`Map to ${event.venue}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent([event.venue, event.area].filter(Boolean).join(", "))}&output=embed`} /> : null}
            </div> : null}
            {(event.images?.length || event.image) ? <div>
              <p className="eyebrow">Photos</p>
              <div className="event-detail-photos">
                {(event.images?.length ? event.images : [event.image]).map((image, i) => (
                  <img key={`${i}-${image.slice(-16)}`} src={image} alt={`${event.title} photo ${i + 1}`} loading="lazy" />
                ))}
              </div>
            </div> : null}
            {event.video ? <video className="event-detail-video" controls playsInline preload="metadata" poster={event.image}><source src={event.video} />Your browser does not support video playback.</video> : null}
            {event.hostNote ? <Card className="border-primary/30">
              <p className="eyebrow">{isPastEvent ? "Our role" : "Host note"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{event.hostNote}</p>
            </Card> : null}
          </div>
        </main>

        <aside className="event-detail-aside">
          {isPastEvent ? <Card className="event-detail-booking">
            <p className="event-detail-booking-kicker">EVENT RECAP</p>
            <h2>Part of the story</h2>
            <p className="event-detail-booking-copy">This event has taken place. Explore the highlights and see the photos once they are added.</p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="eyebrow">Event date</p>
              <p className="mt-2 text-sm">{formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}</p>
            </div>
            {event.venue || event.area ? <div className="mt-4">
              <p className="eyebrow">Location</p>
              <p className="mt-2 text-sm">{event.venue}{event.venue && event.area ? ", " : ""}{event.area}</p>
            </div> : null}
            {event.brand ? <div className="mt-4">
              <p className="eyebrow">Presented by</p>
              <p className="mt-2 text-sm">{event.brand}</p>
            </div> : null}
          </Card> : <Card className="event-detail-booking">
            <p className="event-detail-booking-kicker">YOUR NIGHT OUT</p>
            <h2>{hasMemberRsvp ? "Request your place" : "Make it a night to remember"}</h2>
            <p className="event-detail-booking-copy">{event.tracks.length ? "Send your RSVP request and our team will confirm the details." : "Use the event booking details below to reserve your place."}</p>
            <div className="flex items-center justify-between">
            <Badge tone="gold">{event.category}</Badge>
              {hasMemberRsvp && event.capacity > 0 ? <span className="text-xs text-muted-foreground">{limitedSpots ? "Limited spots · " : ""}{spotsLeft} of {event.capacity} places available</span> : null}
            </div>
            {hasMemberRsvp && event.capacity > 0 ? <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min((event.confirmed / event.capacity) * 100, 100)}%` }}
              />
            </div> : null}

            {event.tracks.length ? (!hasRequest ? <div className="event-detail-rsvp-form">
              <label className="block text-xs text-muted-foreground" htmlFor="rsvp-track">Request as</label>
              <select id="rsvp-track" value={profile.track} disabled={!eligible} className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground">
              {event.tracks.map((track) => <option key={track} value={track} disabled={track !== profile.track}>{track}{track !== profile.track ? " · use the matching member profile" : ""}</option>)}
              </select>
              <div>
                <p className="text-xs text-muted-foreground">Additional guests (optional, up to two)</p>
                {guestNames.map((name, index) => <input key={index} className="mt-2 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground" value={name} onChange={(e) => setGuestNames((items) => items.map((item, i) => i === index ? e.target.value : item))} placeholder={`Guest ${index + 1} full name`} />)}
                {guestNames.length < 2 ? <button type="button" className="mt-2 text-xs text-primary underline" onClick={() => setGuestNames((items) => [...items, ""])}>Add a guest</button> : null}
              </div>
              {creatorDeliverables ? <label className="flex gap-2 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" checked={deliverablesAgreed} onChange={(e) => setDeliverablesAgreed(e.target.checked)} /><span>I agree to the creator deliverables: {creatorDeliverables}</span></label> : null}
              <Button className="w-full" size="lg" disabled={!eligible || closed || rsvpBusy || Boolean(creatorDeliverables && !deliverablesAgreed)} onClick={submitRsvp}>
                {rsvpBusy ? "Submitting request…" : state === "declined" ? "Request again" : "Request RSVP"}
              </Button>
            </div> : <div className="mt-5 rounded-md border border-primary/20 bg-surface px-4 py-3 text-center">
              <p className="eyebrow">RSVP STATUS</p>
              <p className="mt-1 text-sm">{statusLabel[state] ?? "Pending review"}</p>
            </div>) : null}
            {rsvpError ? <p className="mt-2 text-center text-xs text-destructive">{rsvpError}</p> : null}
            {rsvpMessage ? <p className="mt-2 text-center text-xs text-muted-foreground">{rsvpMessage}</p> : null}
            {state === "pending" ? <p className="mt-2 text-center text-xs text-muted-foreground">Your place is not confirmed until the RSVP DXB team reviews your request.</p> : null}

            <div className="event-detail-actions">
              {event.reservationPhone ? <a href={`tel:${internationalPhoneHref(event.reservationPhone)}`} className="event-detail-action-link">Call to reserve</a> : null}
              <Button variant="outline" size="sm" onClick={() => toggleSave(event.id)}>
                {saved.includes(event.id) ? "Saved" : "Save"}
              </Button>
              <WhatsAppAction event={event} />
              {event.creatorPassNote && !event.applicationDeadline && creatorPassFormUrl ? <a className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90" href={creatorPassFormUrl} target="_blank" rel="noreferrer">Request a creator pass</a> : null}
            </div>

            {event.tracks.length ? <div className="mt-6 border-t border-border pt-4">
              <p className="eyebrow">Open to</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {event.tracks.map((t) => (
                  <Badge key={t} tone={t === profile.track ? "green" : "muted"}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div> : null}
          </Card>}

          {state === "accepted" ? <Card className="event-detail-confirmed"><p className="eyebrow">REQUEST APPROVED</p><p className="mt-2 text-sm">Your RSVP has been accepted. Please check your email for event entry details.</p></Card> : null}
        </aside>
      </div>
    </SitePage>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function googleCalendarUrl(event: { title: string; date: string; endDate?: string; time?: string; endTime?: string; venue?: string; area?: string; about?: string }) {
  const calendarTime = (value: string | undefined, fallback: string) => {
    const input = (value || fallback).trim();
    const match = input.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!match) return fallback;
    let hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
    if (hour > 23 || minute > 59) return fallback;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };
  const compact = (date: string, time: string) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
  const startTime = calendarTime(event.time, "20:00");
  const endTime = calendarTime(event.endTime, "22:00");
  const dates = `${compact(event.date, startTime)}/${compact(event.endDate || event.date, endTime)}`;
  const location = [event.venue, event.area].filter(Boolean).join(", ");
  const query = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates, ctz: "Asia/Dubai", details: event.about || "RSVP DXB event", location });
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
