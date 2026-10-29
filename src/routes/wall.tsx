import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { EventImage } from "@/components/EventImage";
import { formatDate, type EventItem, type WallPost } from "@/lib/data";
import { listLiveWallPosts, listPublishedEvents } from "@/lib/database";
import { ArrowUpRight, Bookmark, Share2 } from "lucide-react";

export const Route = createFileRoute("/wall")({
  loader: async () => {
    const [events, posts] = await Promise.all([listPublishedEvents(), listLiveWallPosts()]);
    return { events, posts };
  },
  head: () => ({
    meta: [
      { title: "Events Wall â€” RSVP DXB" },
      {
        name: "description",
        content:
          "Last-minute places, new events, recaps and member offers posted by Dubai brands in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Events Wall â€” RSVP DXB" },
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
      body: `${formatDate(event.date)}${event.time ? ` at ${event.time}` : ""}${event.venue ? ` - ${event.venue}` : ""}${event.area ? `, ${event.area}` : ""}`,
      posted: `Upcoming - ${formatDate(event.date)}`,
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

      <div className="wall-feed customer-content-section mx-auto w-full max-w-4xl px-5 py-10">
        <div className="wall-filter-bar flex flex-wrap gap-2" aria-label="Filter wall posts">
          {TABS.map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
              {t}
            </Button>
          ))}
        </div>

        <div className="wall-post-list mt-7">
          {filtered.map((p) => {
            const event = p.eventId ? databaseEvents.find((e) => e.id === p.eventId) : undefined;
            return (
              <Card key={p.id} className={`wall-post-card${p.boosted ? " is-boosted" : ""}`}>
                <div className="wall-post-header">
                  <span className="wall-brand-mark" aria-hidden="true">{(event?.title || p.brand).trim().charAt(0).toUpperCase() || "R"}</span>
                  <div className="wall-post-identity">
                    <strong className="wall-post-brand">{event?.title || p.brand}</strong>
                    <div className="wall-post-brand-row">
                      <Badge tone={p.boosted ? "gold" : "muted"}>{p.type}</Badge>
                      {p.boosted ? <Badge tone="amber">Boosted</Badge> : null}
                    </div>
                    <span className="wall-post-time">{p.posted}</span>
                  </div>
                </div>
                <p className="wall-post-body">{p.body}</p>
                {event ? (
                  <div className="wall-event-preview">
                    <EventImage event={event} className="wall-event-image" />
                    <div className="wall-event-info">
                      <strong>{event.venue || event.area || "Event details"}</strong>
                      <span>{[event.area, `${Math.max(0, event.capacity - event.confirmed)} places left`].filter(Boolean).join(" | ")}</span>
                    </div>
                    <Link to="/events/$eventId" params={{ eventId: event.id }} className="wall-event-link">
                      View event <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                ) : <div className="wall-post-accent" aria-hidden="true"><span>{p.type}</span></div>}
                <div className="wall-post-actions">
                  {p.eventId ? (
                    <button type="button" className={saved.includes(p.eventId) ? "is-saved" : ""} onClick={() => toggleSave(p.eventId!)}>
                      <Bookmark size={15} aria-hidden="true" />{saved.includes(p.eventId) ? "Saved" : "Save event"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={async () => {
                      const shareUrl = p.eventId
                        ? `${window.location.origin}/events/${encodeURIComponent(p.eventId)}`
                        : `${window.location.origin}/wall`;
                      try {
                        if (navigator.share) await navigator.share({ title: event?.title || p.brand, text: p.body, url: shareUrl });
                        else if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl);
                        else window.prompt("Copy this link", shareUrl);
                      } catch {
                        // Closing the native share sheet is not an error.
                      }
                    }}
                  ><Share2 size={15} aria-hidden="true" />Share</button>
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
