import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SitePage } from "@/components/SiteLayout";
import {
  ARTISTS,
  INFLUENCERS,
  ArtistCard,
  peopleProfileCard,
} from "@/components/CustomerExperience";
import { listPeopleProfiles } from "@/lib/database";

export const Route = createFileRoute("/artists")({
  loader: () => listPeopleProfiles(),
  head: () => ({
    meta: [
      { title: "Artists & Influencers — RSVP DXB" },
      {
        name: "description",
        content:
          "Meet the artists and influencers behind the RSVP DXB energy — DJs, live acts, creators and tastemakers shaping the city's rooms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Artists & Influencers — RSVP DXB" },
      {
        property: "og:description",
        content: "The artists and influencers shaping RSVP DXB's rooms across Dubai.",
      },
    ],
  }),
  component: ArtistsPage,
});

function ArtistsPage() {
  const profiles = Route.useLoaderData();
  const profileRouteActive = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === "/artists/$profileId"),
  });
  if (profileRouteActive) return <Outlet />;
  const artists = profiles.length ? profiles.filter((profile) => profile.category === "artist").map(peopleProfileCard) : ARTISTS;
  const influencers = profiles.length ? profiles.filter((profile) => profile.category === "influencer").map(peopleProfileCard) : INFLUENCERS;
  return (
    <SitePage>
      <section className="experience-section">
        <div className="experience-heading">
          <div>
            <p className="eyebrow">The people behind the energy</p>
            <h1>Artist's & Influencers</h1>
          </div>
          <p className="text-xs text-muted-foreground">Featured RSVP community</p>
        </div>

        <p className="eyebrow mt-8">Artists</p>
        <div className={`artist-grid mt-4${artists.length === 1 ? " artist-grid-single" : ""}`}>
          {artists.map((a) => (
            <ArtistCard key={a.id || a.name} artist={a} homeInteractive />
          ))}
        </div>

        <p className="eyebrow mt-16">Influencers</p>
        <div className={`artist-grid mt-4${influencers.length === 1 ? " artist-grid-single" : ""}`}>
          {influencers.map((a) => (
            <ArtistCard key={a.id || a.name} artist={a} homeInteractive />
          ))}
        </div>
      </section>
    </SitePage>
  );
}
