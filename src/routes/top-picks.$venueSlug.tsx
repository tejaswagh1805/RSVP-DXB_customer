import { createFileRoute } from "@tanstack/react-router";
import { VenueDetails } from "@/components/CustomerVenues";
import { getVenueBySlug } from "@/lib/database";

export const Route = createFileRoute("/top-picks/$venueSlug")({
  loader: ({ params }) => getVenueBySlug({ data: params.venueSlug }),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.name} · RSVP DXB Venue Guide` : "Venue · RSVP DXB" }, { name: "description", content: loaderData?.description || "Explore this curated RSVP DXB venue." }] }),
  component: VenuePage,
});

function VenuePage() {
  return <VenueDetails venue={Route.useLoaderData()} />;
}
