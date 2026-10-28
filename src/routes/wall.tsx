import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { EventImage } from "@/components/EventImage";
import { formatDate, type EventItem, type WallPost } from "@/lib/data";
import { listLiveWallPosts, listPublishedEvents } from "@/lib/database";

export const Route = createFileRoute("/wall")({
  loader: async () => {
    const [events, posts] = await Promise.all([listPublishedEvents(), listLiveWallPosts()]);
    return { events, posts };
  },
  head: () => ({
    meta: [
      { title: "Events Wall — RSVP DXB" },
      {
        name: "description",
        content:
          "Last-minute places, new events, recaps and member offers posted by Dubai brands in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Events Wall — RSVP DXB" },
      {
        property: "og:description",
        content: "Last-minute places, new events, recaps and member offers from Dubai brands.",
      },
    ],
  }),
  component: WallPage,
});

const TABS = ["Everything", "Last-minute", "New Events", "Recaps", "Offers", "Saved"];

function WallPage() {
  const { saved, toggleSave } = useStore();
  const { events: databaseEvents, posts: databasePosts } = Route.useLoaderData();
  const [tab, setTab] = useState("Everything");

  const todayDubai = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const events = databaseEvents.filter((event) => event.status === "published" && event.date >= todayDubai);
  const linkedEventIds = new Set(databasePosts.flatMap((post) => post.eventId ? [post.eventId] : []));
  const eventPosts: WallPost[] = events
    .filter((event) => !linkedEventIds.has(event.id))
    .map((event: EventItem) => ({
      id: `event-${event.id}`,
      brand: event.brand,
      type: "New Event",
      body: `${event.title} · ${formatDate(event.date)}${event.time ? ` at ${event.time}` : ""}${event.venue ? ` · ${event.venue}` : ""}${event.area ? `, ${event.area}` : ""}`,
      posted: `Upcoming · ${formatDate(event.date)}`,
      boosted: false,
      status: "live",
      eventId: event.id,
    }));
  const live = [...eventPosts, ...databasePosts];
  const filtered = live.filter((p) => {
    if (tab === "Everything") return true;
    if (tab === "Last-minute") return p.type === "Places Just Opened" || p.type === "Tonight";
    if (tab === "New Events") return p.type === "New Event";
    if (tab === "Recaps") return p.type === "Recap";
    if (tab === "Offers") return p.type === "Member Offer" || p.type === "Sponsored";
    return p.eventId ? saved.includes(p.eventId) : false;
  });

  return (
    <SitePage>
      <PageHero
        eyebrow="Events Wall"
        title="Live from the city"
        intro="The latest published events and updates from brands across Dubai. Open an event for details and RSVP options."
      />

      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
              {t}
            </Button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {filtered.map((p) => {
            const event = p.eventId ? databaseEvents.find((e) => e.id === p.eventId) : undefined;
            return (
              <Card key={p.id} className={p.boosted ? "border-primary/50" : ""}>
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-primary/15" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{p.brand}</span>
                      <Badge tone={p.boosted ? "gold" : "muted"}>{p.type}</Badge>
                      {p.boosted ? <Badge tone="amber">Boosted</Badge> : null}
                      <span className="text-xs text-muted-foreground">{p.posted}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>

                    {event ? (
                      <div className="mt-4 flex items-center gap-4 rounded-md border border-border bg-surface p-3">
                        <EventImage event={event} className="h-12 w-16 shrink-0 rounded" />
                        <div className="flex-1">
                          <p className="text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.area} · {event.capacity - event.confirmed} places left
                          </p>
                        </div>
                        <Link to="/events/$eventId" params={{ eventId: event.id }}>
                          <Button size="sm">View event</Button>
                        </Link>
                      </div>
                    ) : null}

                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                      <button
                        className="hover:text-primary"
                        onClick={() => (p.eventId ? toggleSave(p.eventId) : undefined)}
                      >
                        {p.eventId && saved.includes(p.eventId) ? "Saved" : "Save"}
                      </button>
                      <button className="hover:text-primary">Share</button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>
          ) : null}
        </div>
      </div>
    </SitePage>
  );
}
