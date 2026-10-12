import { createFileRoute } from "@tanstack/react-router";
import { SitePage } from "@/components/SiteLayout";
import { listPublishedEvents } from "@/lib/database";
import {
  ScrollShowcase,
  EventRibbon,
  EventGallery,
  ArtistGallery,
  TicketOffers,
} from "@/components/CustomerExperience";

export const Route = createFileRoute("/")({
  loader: () => listPublishedEvents(),
  head: () => ({
    meta: [
      { title: "RSVP DXB — Good people. Great rooms." },
      {
        name: "description",
        content:
          "Dubai's invitation-only guest list. Media, creators, tastemakers and the private circle get invited to the city's openings, dinners and launches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "RSVP DXB — Good people. Great rooms." },
      {
        property: "og:description",
        content: "Dubai's invitation-only guest list for media, creators and tastemakers.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const databaseEvents = Route.useLoaderData();
  return (
    <SitePage overlayHeader>
      <ScrollShowcase />
      <EventRibbon title="Latest events" events={databaseEvents} />
      <EventRibbon title="RSVP TOP Pick" reverse events={databaseEvents} />
      <EventGallery />
      <ArtistGallery />
      <TicketOffers />
    </SitePage>
  );
}
