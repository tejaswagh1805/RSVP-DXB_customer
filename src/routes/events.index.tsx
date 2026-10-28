import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Button } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { listPublishedEvents } from "@/lib/database";

export const Route = createFileRoute("/events/")({
  loader: () => listPublishedEvents(),
  head: () => ({
    meta: [
      { title: "What is on — RSVP DXB" },
      {
        name: "description",
        content:
          "Every openings, dinner, launch and preview open to RSVP DXB members this week and month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "What is on — RSVP DXB" },
      { property: "og:description", content: "Browse Dubai events open to RSVP DXB members." },
    ],
  }),
  component: EventsPage,
});

const CATEGORIES = ["All", "Dining", "Fashion", "Property", "Music", "Sports", "Comedy", "Awards", "Campaign", "Art", "Nightlife", "Other"];
const SORTS = ["Soonest", "Newest", "Few places left"];

function EventsPage() {
  const { events: demoEvents } = useStore();
  const databaseEvents = Route.useLoaderData();
  const events = databaseEvents.length ? databaseEvents : demoEvents;
  const [category, setCategory] = useState("All");
  const [area, setArea] = useState("All areas");
  const [sort, setSort] = useState("Soonest");
  const today = new Date().toISOString().slice(0, 10);

  const areas = useMemo(
    () => ["All areas", ...Array.from(new Set(events.map((e) => e.area)))],
    [events],
  );

  const { list, pastEvents } = useMemo(() => {
    let out = events.filter((e) => e.status === "published" || e.status === "closed");
    if (category !== "All") out = out.filter((e) => e.category === category);
    if (area !== "All areas") out = out.filter((e) => e.area === area);
    const past = out.filter((e) => e.status === "closed" || (e.endDate || e.date) < today);
    const upcoming = out.filter((e) => e.status !== "closed" && (e.endDate || e.date) >= today);
    if (sort === "Few places left") {
      upcoming.sort(
        (a, b) => {
          if (!a.capacity || !b.capacity) return Number(Boolean(a.capacity)) - Number(Boolean(b.capacity));
          return a.capacity - a.confirmed - (b.capacity - b.confirmed);
        },
      );
    } else if (sort === "Newest") {
      upcoming.reverse();
    } else {
      upcoming.sort((a, b) => a.date.localeCompare(b.date));
    }
    past.sort((a, b) => (b.endDate || b.date).localeCompare(a.endDate || a.date));
    return { list: upcoming, pastEvents: past };
  }, [events, category, area, sort, today]);

  return (
    <SitePage>
      <PageHero
        eyebrow="Events"
        title="What is on"
        intro="Browse event details, ticket links, reservation contacts and creator opportunities."
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "primary" : "outline"}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-3 text-xs text-foreground"
          >
            {areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-8 rounded-md border border-border bg-surface px-3 text-xs text-foreground"
          >
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">{list.length} upcoming events</p>

        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {list.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
        {!list.length ? <p className="mt-5 rounded-md border border-border bg-card px-5 py-6 text-sm text-muted-foreground">No upcoming events right now. Browse past event recaps below.</p> : null}
        {pastEvents.length ? <section className="mt-16" aria-labelledby="past-events-title">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="eyebrow">The moments that brought us together</p>
              <h2 id="past-events-title" className="mt-2 text-3xl">Past events</h2>
            </div>
            <p className="text-sm text-muted-foreground">Stories, people and highlights from our recent events.</p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{pastEvents.length} event recaps</p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {pastEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </section> : null}
      </div>
    </SitePage>
  );
}
