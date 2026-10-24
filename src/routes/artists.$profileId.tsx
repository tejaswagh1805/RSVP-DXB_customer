import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Instagram, Youtube } from "lucide-react";
import { SitePage } from "@/components/SiteLayout";
import { Button } from "@/components/ui-kit";
import { getPeopleProfileById } from "@/lib/database";

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
      <section className="artist-profile experience-section">
        <Link to="/artists" className="artist-profile-back"><ArrowLeft size={16} /> All artists & influencers</Link>
        <div className="artist-profile-content">
          <img className="artist-profile-image" src={profile.imageUrl} alt={profile.name} />
          <div className="artist-profile-copy">
            <p className="eyebrow">{profile.category === "artist" ? "Artist" : "Influencer"}</p>
            <h1>{profile.name}</h1>
            {profile.role ? <p className="artist-profile-role">{profile.role}</p> : null}
            {profile.bio ? <p className="artist-profile-bio">{profile.bio}</p> : null}
            <div className="artist-profile-socials">
              {profile.instagramUrl ? <a href={profile.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={19} /> Instagram <ArrowUpRight size={15} /></a> : null}
              {profile.tiktokUrl ? <a href={profile.tiktokUrl} target="_blank" rel="noreferrer">TikTok <ArrowUpRight size={15} /></a> : null}
              {profile.youtubeUrl ? <a href={profile.youtubeUrl} target="_blank" rel="noreferrer"><Youtube size={19} /> YouTube <ArrowUpRight size={15} /></a> : null}
              {profile.xUrl ? <a href={profile.xUrl} target="_blank" rel="noreferrer">X <ArrowUpRight size={15} /></a> : null}
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
