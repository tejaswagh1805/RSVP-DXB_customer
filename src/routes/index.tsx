import { createFileRoute } from "@tanstack/react-router";
import { SitePage } from "@/components/SiteLayout";
import { listFeaturedVenues, listHomepageMedia, listPeopleProfiles, listPublishedEvents } from "@/lib/database";
import {
  ScrollShowcase,
  EventRibbon,
  EventGallery,
  SiteMediaRibbon,
  ArtistGallery,
  TicketOffers,
} from "@/components/CustomerExperience";
import { VenueTopPicks } from "@/components/CustomerVenues";

async function loadHomepageSection<T>(name: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    // One unavailable homepage data source should not take down the entire site.
    console.error(`Homepage ${name} could not be loaded`, error);
    return fallback;
  }
}

export const Route = createFileRoute("/")({
  loader: async () => {
    const [events, media, profiles, venues] = await Promise.all([
      loadHomepageSection("events", listPublishedEvents, []),
      loadHomepageSection("media", listHomepageMedia, []),
      loadHomepageSection("profiles", listPeopleProfiles, []),
      loadHomepageSection("venues", listFeaturedVenues, []),
    ]);
    return { events, media, profiles, venues };
  },
  head: () => ({
    meta: [
      { title: "RSVP DXB — Good people. Great rooms." },
      {
        name: "description",
        content:
          "Dubai's invitation-only guest list. Media, creators, tastemakers and the private circle get invited to the city's openings, dinners and launches.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.rsvpdxb.com/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "RSVP DXB — Good people. Great rooms." },
      {
        property: "og:description",
        content: "Dubai's invitation-only guest list for media, creators and tastemakers.",
      },
      { name: "twitter:image", content: "https://www.rsvpdxb.com/icon-512.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.rsvpdxb.com/" }],
  }),
  component: Home,
});

function Home() {
  const { events: databaseEvents, media, profiles, venues } = Route.useLoaderData();
  return (
    <SitePage overlayHeader>
      <div className="customer-home">
        <ScrollShowcase />
        <EventRibbon title="Latest events" events={databaseEvents} />
        <EventRibbon title="RSVP TOP Pick" reverse events={databaseEvents} />
        {venues.length ? <VenueTopPicks venues={venues} /> : media.some((item) => item.slot === "top_pick") ? <SiteMediaRibbon media={media.filter((item) => item.slot === "top_pick")} /> : null}
        <EventGallery media={media.filter((item) => item.slot === "gallery")} previewLimit={5} />
        <ArtistGallery profiles={profiles} />
        <TicketOffers />
      </div>
    </SitePage>
  );
}
