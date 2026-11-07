import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EventGallery } from "@/components/CustomerExperience";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { listHomepageMedia, listPublishedEvents, type HomepageMediaItem } from "@/lib/database";
import type { EventItem } from "@/lib/data";

export const Route = createFileRoute("/gallery")({
  loader: async () => {
    const [media, events] = await Promise.all([listHomepageMedia(), listPublishedEvents()]);
    return {
      media: media.filter((item) => item.slot === "gallery"),
      events: events.filter((event) => event.status === "published" || event.status === "closed"),
    };
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
  const { media, events } = Route.useLoaderData();
  const [selectedEventId, setSelectedEventId] = useState("all");
  const eventAlbums = useMemo(() => events.map((event) => ({
    event,
    media: eventMedia(event),
  })), [events]);
  const visibleMedia = selectedEventId === "all"
    ? [...media, ...eventAlbums.flatMap((album) => album.media)]
    : eventAlbums.find((album) => album.event.id === selectedEventId)?.media ?? [];
  const selectedAlbum = eventAlbums.find((album) => album.event.id === selectedEventId);

  return (
    <SitePage>
      <PageHero eyebrow="Inside the room" title="Event gallery" intro="Browse photos and videos by event." />
      <div className="gallery-event-tabs mx-auto w-full max-w-6xl px-5 pt-8" role="tablist" aria-label="Filter gallery by event">
        <button type="button" role="tab" aria-selected={selectedEventId === "all"} className={`gallery-filter-tab${selectedEventId === "all" ? " is-active" : ""}`} onClick={() => setSelectedEventId("all")}>
          <span className="gallery-event-tab-title">All events</span><span className="gallery-event-tab-count">{events.length}</span>
        </button>
        {eventAlbums.map(({ event, media: albumMedia }) => (
          <button key={event.id} type="button" role="tab" aria-selected={selectedEventId === event.id} className={`gallery-filter-tab${selectedEventId === event.id ? " is-active" : ""}`} onClick={() => setSelectedEventId(event.id)}>
            <span className="gallery-event-tab-title">{event.title}</span><span className="gallery-event-tab-count">{albumMedia.length}</span>
          </button>
        ))}
      </div>
      <section className="gallery-album-intro mx-auto w-full max-w-6xl px-5" aria-live="polite">
        <div>
          <p className="gallery-album-kicker">{selectedAlbum ? "Event collection" : "The RSVP DXB archive"}</p>
          <h2>{selectedAlbum?.event.title ?? "Moments from the room"}</h2>
          <p>{selectedAlbum
            ? [selectedAlbum.event.venue, `${selectedAlbum.media.length} ${selectedAlbum.media.length === 1 ? "moment" : "moments"}`].filter(Boolean).join(" · ")
            : `${visibleMedia.length} ${visibleMedia.length === 1 ? "photo or video" : "photos and videos"} across our events`}</p>
        </div>
        <span className="gallery-album-count">{String(visibleMedia.length).padStart(2, "0")} <span>media</span></span>
      </section>
      <EventGallery media={visibleMedia} className="gallery-route-content" showMediaTabs heading="Event media" />
    </SitePage>
  );
}

function eventMedia(event: EventItem): HomepageMediaItem[] {
  const images = event.images?.length ? event.images : event.image ? [event.image] : [];
  const videos = event.videos?.length ? event.videos : event.video ? [event.video] : [];
  return [
    ...images.map((imageUrl, index) => ({
      id: `${event.id}-image-${index}`,
      slot: "gallery" as const,
      title: event.title,
      caption: `${event.title}${event.venue ? ` · ${event.venue}` : ""}`,
      imageUrl,
      mediaType: "image" as const,
      linkUrl: `/events/${encodeURIComponent(event.id)}`,
      displayOrder: index,
    })),
    ...videos.map((videoUrl, index) => ({
      id: `${event.id}-video-${index}`,
      slot: "gallery" as const,
      title: event.title,
      caption: `${event.title} video${event.venue ? ` · ${event.venue}` : ""}`,
      imageUrl: videoUrl,
      mediaType: "video" as const,
      linkUrl: `/events/${encodeURIComponent(event.id)}`,
      displayOrder: images.length + index,
    })),
  ];
}
