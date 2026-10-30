import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Instagram, Youtube, MoveDown } from "lucide-react";
import { SitePage } from "@/components/SiteLayout";
import { Button } from "@/components/ui-kit";
import { getPeopleProfileById } from "@/lib/database";
import { SafeImage } from "@/components/SafeImage";

export const Route = createFileRoute("/artists/$profileId")({
  loader: ({ params }) => getPeopleProfileById({ data: params.profileId }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — RSVP DXB` : "Profile — RSVP DXB" },
      { name: "description", content: loaderData?.bio || "Meet the people behind RSVP DXB." },
    ],
  }),
  component: ArtistProfilePage,
});

function ArtistProfilePage() {
  const profile = Route.useLoaderData();
  if (!profile) {
    return (
      <SitePage>
        <section className="experience-section">
          <p className="eyebrow">Profile unavailable</p>
          <h1>This profile could not be found.</h1>
          <Link to="/artists"><Button className="mt-6"><ArrowLeft size={16} /> Back to artists</Button></Link>
        </section>
      </SitePage>
    );
  }

  return (
    <SitePage>
      <div className="artist-profile-page">
        <section className="artist-profile-split">
          <div className="artist-profile-visual">
            <SafeImage src={profile.imageUrl} alt={profile.name} loading="eager" className="h-full w-full object-cover" />
            <span className="artist-profile-image-caption">RSVP DXB · {profile.category === "artist" ? "Artist" : "Influencer"}</span>
          </div>
          <div className="artist-profile-panel">
            <Link to="/artists" className="artist-profile-back"><ArrowLeft size={16} /> All artists & influencers</Link>
            <div className="artist-profile-copy">
              <p className="artist-profile-kicker">PEOPLE BEHIND THE ENERGY · 01</p>
              <h1>{profile.name}</h1>
              {profile.subtitle ? <p className="artist-profile-subtitle">{profile.subtitle}</p> : null}
              {profile.role ? <p className="artist-profile-role">{profile.role}</p> : null}
              <div className="artist-profile-divider" />
              <p className="artist-profile-label">THE STORY</p>
              <div className="artist-profile-bio">{(profile.bio || `Discover ${profile.name} and the energy they bring to the RSVP DXB community.`).split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
              <div className="artist-profile-socials">
              {profile.instagramUrl ? <a href={profile.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={19} /> Instagram <ArrowUpRight size={15} /></a> : null}
              {profile.tiktokUrl ? <a href={profile.tiktokUrl} target="_blank" rel="noreferrer">TikTok <ArrowUpRight size={15} /></a> : null}
              {profile.youtubeUrl ? <a href={profile.youtubeUrl} target="_blank" rel="noreferrer"><Youtube size={19} /> YouTube <ArrowUpRight size={15} /></a> : null}
              {profile.xUrl ? <a href={profile.xUrl} target="_blank" rel="noreferrer">X <ArrowUpRight size={15} /></a> : null}
              </div>
            </div>
            <a className="artist-profile-scroll" href="#more-people">Meet more people <MoveDown size={16} /></a>
          </div>
        </section>
        <section className="artist-profile-more" id="more-people">
          <span>THE RSVP DXB COMMUNITY</span>
          <Link to="/artists">Explore all artists & influencers <ArrowUpRight size={16} /></Link>
        </section>
      </div>
    </SitePage>
  );
}
