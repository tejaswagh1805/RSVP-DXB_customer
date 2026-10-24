import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SitePage } from "@/components/SiteLayout";
import { EventImage } from "@/components/EventImage";
import { Badge, Button, Card } from "@/components/ui-kit";
import { formatDate } from "@/lib/data";
import { useStore } from "@/lib/store";
import { WhatsAppAction } from "@/components/WhatsAppAction";
import { getEventById, getMemberRsvps, submitEventRsvpRequest } from "@/lib/database";

export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }) => {
    const [event, rsvps] = await Promise.all([
      getEventById({ data: params.eventId }),
      getMemberRsvps(),
    ]);
    return { event, rsvps };
  },
  head: () => ({
    meta: [
      { title: "Event — RSVP DXB" },
      { name: "description", content: "Event details, dress code and RSVP for RSVP DXB members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Event — RSVP DXB" },
      { property: "og:description", content: "Event details and RSVP for RSVP DXB members." },
    ],
  }),
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

  const state = data.event ? (databaseRsvps[event.id] ?? "none") : (demoRsvps[event.id] ?? "none");
  const eligible = event.tracks.includes(profile.track);
  const closed = event.status === "closed";
  const hasRequest = state !== "none" && state !== "declined";
  const statusLabel: Record<string, string> = {
    pending: "Pending review",
    accepted: "You're on the list",
    waitlisted: "Waitlisted",
    declined: "Not selected",
    going: "Confirmed",
    waitlist: "Waitlisted",
  };
  const creatorDeliverables = profile.track === "Creators" ? event.influencerDeliverables?.trim() ?? "" : "";
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
      <div className="h-56 w-full overflow-hidden md:h-80"><EventImage event={event} className="h-full w-full" /></div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="eyebrow">{event.brand}</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{event.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}
            {event.time ? ` · ${event.time}${event.endTime ? `–${event.endTime}` : ""}` : ""}
            {event.venue ? ` · ${event.venue}` : ""}{event.area ? `, ${event.area}` : ""}
            {event.gatesOpenTime ? ` · Gates open ${event.gatesOpenTime}` : ""}
          </p>

          <div className="mt-10 space-y-8">
            <Block title="About the evening">{event.about}</Block>
            <div>
              <p className="eyebrow">What is included</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {event.included.map((i) => (
                  <li key={i} className="rounded-md bg-surface px-4 py-2.5 text-sm">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <Block title="Dress code">{event.dressCode}</Block>
            <Block title="Who is invited">{event.whoIsInvited}</Block>
            <Block title="Getting there">
              {event.venue}, {event.area}. Valet available on arrival; member desk is to the left of
              the main entrance.
              {event.mapUrl ? <> <a className="text-primary underline" href={event.mapUrl} target="_blank" rel="noreferrer">Open map and directions</a></> : null}
            </Block>
            <div>
              <p className="eyebrow">Photos</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {(event.images?.length ? event.images : [event.image]).map((image, i) => (
                  <img key={`${i}-${image.slice(-16)}`} src={image} alt={`${event.title} photo ${i + 1}`} loading="lazy" className="h-24 w-full rounded-md object-cover" />
                ))}
              </div>
            </div>
            {event.video ? <video className="w-full rounded-lg" controls playsInline preload="metadata" poster={event.image}><source src={event.video} />Your browser does not support video playback.</video> : null}
            <Card className="border-primary/30">
              <p className="eyebrow">Host note</p>
              <p className="mt-2 text-sm text-muted-foreground">{event.hostNote}</p>
            </Card>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <div className="flex items-center justify-between">
              <Badge tone="gold">{event.category}</Badge>
              <span className="text-xs text-muted-foreground">
                {Math.max(event.capacity - event.confirmed, 0)} of {event.capacity} places available
              </span>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min((event.confirmed / event.capacity) * 100, 100)}%` }}
              />
            </div>

            {!hasRequest || state === "declined" ? <div className="mt-5 space-y-3">
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
            </div>}
            {rsvpError ? <p className="mt-2 text-center text-xs text-destructive">{rsvpError}</p> : null}
            {rsvpMessage ? <p className="mt-2 text-center text-xs text-muted-foreground">{rsvpMessage}</p> : null}
            {state === "pending" ? <p className="mt-2 text-center text-xs text-muted-foreground">Your place is not confirmed until the RSVP DXB team reviews your request.</p> : null}

            <div className="mt-5 grid gap-2">
              <Button variant="outline" size="sm">
                Add to calendar (.ics)
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleSave(event.id)}>
                {saved.includes(event.id) ? "Saved" : "Save"}
              </Button>
              <WhatsAppAction event={event} />
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <p className="eyebrow">Open to</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {event.tracks.map((t) => (
                  <Badge key={t} tone={t === profile.track ? "green" : "muted"}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {state === "accepted" ? <Card className="mt-4 text-center"><p className="eyebrow">REQUEST APPROVED</p><p className="mt-2 text-sm">Your RSVP has been accepted. Please check your email for event entry details.</p></Card> : null}
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
