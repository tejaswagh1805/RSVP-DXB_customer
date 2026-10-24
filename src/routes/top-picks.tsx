import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { VenueDirectory } from "@/components/CustomerVenues";
import { listVenues } from "@/lib/database";

export const Route = createFileRoute("/top-picks")({
  loader: () => listVenues(),
  head: () => ({ meta: [{ title: "Dubai venue guide & RSVP Top Picks" }, { name: "description", content: "Explore RSVP DXB's curated Dubai venue guide: dining, nightlife, coffee and more." }] }),
  component: TopPicksPage,
});

function TopPicksPage() {
  const venues = Route.useLoaderData();
  const detailRouteActive = useRouterState({ select: (state) => state.matches.some((match) => match.routeId === "/top-picks/$venueSlug") });
  return detailRouteActive ? <Outlet /> : <VenueDirectory venues={venues} />;
}
