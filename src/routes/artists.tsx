import { createFileRoute } from "@tanstack/react-router";
import { SitePage } from "@/components/SiteLayout";
import { ARTISTS, INFLUENCERS, ArtistCard } from "@/components/CustomerExperience";

export const Route = createFileRoute("/artists")({
  head: () => ({
    meta: [
      { title: "Artists & Influencers — RSVP DXB" },
      { name: "description", content: "Meet the artists and influencers behind the RSVP DXB energy — DJs, live acts, creators and tastemakers shaping the city's rooms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Artists & Influencers — RSVP DXB" },
      { property: "og:description", content: "The artists and influencers shaping RSVP DXB's rooms across Dubai." },
    ],
  }),
  component: ArtistsPage,
});

function ArtistsPage() {
  return (
    <SitePage>
      <section className="experience-section">
        <div className="experience-heading">
          <div>
            <p className="eyebrow">The people behind the energy</p>
            <h1>Artist's & Influencers</h1>
          </div>
          <p className="text-xs text-muted-foreground">Demo spotlight profiles</p>
        </div>

        <p className="eyebrow mt-8">Artists</p>
        <div className="artist-grid mt-4">
          {ARTISTS.map(a => <ArtistCard key={a.name} artist={a} />)}
        </div>

        <p className="eyebrow mt-16">Influencers</p>
        <div className="artist-grid mt-4">
          {INFLUENCERS.map(a => <ArtistCard key={a.name} artist={a} />)}
        </div>
      </section>
    </SitePage>
  );
}
