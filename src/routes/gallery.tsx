import { createFileRoute } from "@tanstack/react-router";
import { EventGallery } from "@/components/CustomerExperience";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { listHomepageMedia } from "@/lib/database";

export const Route = createFileRoute("/gallery")({
  loader: async () => {
    const media = await listHomepageMedia();
    return media.filter((item) => item.slot === "gallery");
  },
  head: () => ({
    meta: [
      { title: "Event Gallery — RSVP DXB" },
      { name: "description", content: "Explore photos and videos from RSVP DXB events in Dubai." },
      { property: "og:title", content: "Event Gallery — RSVP DXB" },
      { property: "og:description", content: "Photos and videos from RSVP DXB events in Dubai." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const media = Route.useLoaderData();
  return (
    <SitePage>
      <PageHero eyebrow="Inside the room" title="Event gallery" intro="Photos and videos from RSVP DXB events and experiences." />
      <EventGallery media={media} className="gallery-route-content" />
    </SitePage>
  );
}
