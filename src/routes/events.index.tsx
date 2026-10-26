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

const CATEGORIES = ["All", "Dining", "Fashion", "Property", "Music", "Comedy", "Awards", "Campaign", "Art", "Nightlife", "Other"];
const SORTS = ["Soonest", "Newest", "Few places left"];

function EventsPage() {
  const { events: demoEvents } = useStore();
  const databaseEvents = Route.useLoaderData();
  const events = databaseEvents.length ? databaseEvents : demoEvents;
  const [category, setCategory] = useState("All");
  const [area, setArea] = useState("All areas");
  const [sort, setSort] = useState("Soonest");

  const areas = useMemo(
    () => ["All areas", ...Array.from(new Set(events.map((e) => e.area)))],
    [events],
  );

  const list = useMemo(() => {
    let out = events.filter((e) => e.status === "published");
    if (category !== "All") out = out.filter((e) => e.category === category);
    if (area !== "All areas") out = out.filter((e) => e.area === area);
    if (sort === "Few places left") {
      out = [...out].sort(
        (a, b) => {
          if (!a.capacity || !b.capacity) return Number(Boolean(a.capacity)) - Number(Boolean(b.capacity));
          return a.capacity - a.confirmed - (b.capacity - b.confirmed);
        },
      );
    } else if (sort === "Newest") {
      out = [...out].reverse();
    } else {
      out = [...out].sort((a, b) => a.date.localeCompare(b.date));
    }
    return out;
  }, [events, category, area, sort]);

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

        <p className="mt-6 text-xs text-muted-foreground">{list.length} events</p>

        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {list.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </div>
    </SitePage>
  );
}
