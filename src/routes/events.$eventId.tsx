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
import { getEventById, getMemberRsvps, updateEventRsvp } from "@/lib/database";

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
  const persistRsvp = useServerFn(updateEventRsvp);
  const [databaseRsvps, setDatabaseRsvps] = useState(data.rsvps);
  const [rsvpError, setRsvpError] = useState("");
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
  const full = event.confirmed >= event.capacity;
  const eligible = event.tracks.includes(profile.track);
  const closed = event.status === "closed";

  const label = closed
    ? "RSVPs closed"
    : !eligible
      ? "Not on your list"
      : state === "going"
        ? "You are in"
        : state === "waitlist"
          ? "On the waitlist"
          : full
            ? "Join waitlist"
            : "RSVP";

  return (
    <SitePage>
      <div className="h-56 w-full overflow-hidden md:h-80"><EventImage event={event} className="h-full w-full" /></div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="eyebrow">{event.brand}</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{event.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatDate(event.date)} · {event.time} · {event.venue}, {event.area}
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
            </Block>
            <div>
              <p className="eyebrow">Photos</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {(event.images?.length ? event.images : [event.image]).map((image, i) => (
                  <img key={`${i}-${image.slice(-16)}`} src={image} alt={`${event.title} photo ${i + 1}`} loading="lazy" className="h-24 w-full rounded-md object-cover" />
                ))}
              </div>
            </div>
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
                {event.confirmed}/{event.capacity} confirmed
              </span>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min((event.confirmed / event.capacity) * 100, 100)}%` }}
              />
            </div>

            <Button
              className="mt-5 w-full"
              size="lg"
              variant={state === "none" ? "primary" : "outline"}
              disabled={!eligible || closed}
              onClick={() => {
                if (!profile.signedIn) {
                  void navigate({ to: "/signin" });
                  return;
                }
                setRsvpError("");
                void persistRsvp({ data: { eventId: event.id, wantsGoing: state === "none" } })
                  .then((next) => { setDatabaseRsvps(next); void router.invalidate(); })
                  .catch(() => setRsvpError("RSVP could not be saved. Please try again."));
              }}
            >
              {label}
            </Button>
            {rsvpError ? <p className="mt-2 text-center text-xs text-destructive">{rsvpError}</p> : null}

            {state !== "none" ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Confirmation sent by email and WhatsApp. Pass available in your member area.
              </p>
            ) : null}

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

          {state === "going" ? (
            <Card className="mt-4 text-center">
              <p className="eyebrow">Your digital pass</p>
              <div className="mx-auto mt-4 grid h-28 w-28 place-items-center rounded-md bg-foreground text-xs text-background">
                QR
              </div>
              <p className="mt-3 text-sm">{profile.name}</p>
              <p className="text-xs text-muted-foreground">Entry for 1 · RSVP-4471</p>
              <Link to="/me">
                <Button className="mt-4 w-full" size="sm" variant="outline">
                  Open in member area
                </Button>
              </Link>
            </Card>
          ) : null}
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
