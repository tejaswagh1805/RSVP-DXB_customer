import { createFileRoute } from "@tanstack/react-router";
import { EventCard } from "@/components/EventCard";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { listPublishedEvents } from "@/lib/database";

export const Route = createFileRoute("/rsvp-top-picks")({
  loader: () => listPublishedEvents(),
  head: () => ({
    meta: [
      { title: "RSVP Top Picks — RSVP DXB" },
      { name: "description", content: "Explore the events selected by RSVP DXB." },
    ],
  }),
  component: RsvpTopPicksPage,
});

function RsvpTopPicksPage() {
  const events = Route.useLoaderData().filter((event) => event.status === "published" && event.topPick);

  return (
    <SitePage>
      <PageHero
        eyebrow="Selected for the spotlight"
        title="RSVP Top Picks"
        intro="Explore the events hand-picked by RSVP DXB."
      />
      <section className="customer-content-section mx-auto w-full max-w-6xl px-5 py-10">
        {events.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <p className="rounded-md border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
            No RSVP Top Picks are available right now.
          </p>
        )}
      </section>
    </SitePage>
  );
}
