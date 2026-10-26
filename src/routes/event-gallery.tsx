import { createFileRoute } from "@tanstack/react-router";
import { EventGallery } from "@/components/CustomerExperience";
import { SitePage } from "@/components/SiteLayout";
import { listHomepageMedia, listPublishedEvents } from "@/lib/database";

export const Route = createFileRoute("/event-gallery")({
  loader: async () => {
    const [events, media] = await Promise.all([listPublishedEvents(), listHomepageMedia()]);
    return { events, media: media.filter((item) => item.slot === "gallery") };
  },
  head: () => ({ meta: [{ title: "Event Gallery — RSVP DXB" }, { name: "description", content: "Explore the RSVP DXB event gallery: dining, fashion, property, music and art." }] }),
  component: EventGalleryPage,
});

function EventGalleryPage() {
  const { events, media } = Route.useLoaderData();
  return <SitePage><EventGallery events={events} media={media} fullPage /></SitePage>;
}
